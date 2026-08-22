/**
 * @fileoverview
 * `npm run kill:all` — stop every registered headless emulator instance.
 *
 * Loads `.emulator/instances.json`, tree-kills each live instance (Windows:
 * `taskkill /PID <pid> /T /F`, the only reliable way to take down the tsx
 * process tree; POSIX: SIGTERM with a SIGKILL fallback), prunes stale entries
 * whose pid no longer exists, and prints a summary. Exits 0 when nothing is
 * running (the common, healthy case) and only exits non-zero when an entry
 * could not be killed.
 *
 * @packageDocumentation
 */

import { spawnSync } from 'node:child_process';
import {
  defaultRegistryFilePath,
  isPidAlive,
  loadInstanceRegistry,
  pruneStaleInstances,
  unregisterInstance,
} from './instance-registry';

const POSIX_TERM_GRACE_MS = 2_000;
const POLL_INTERVAL_MS = 50;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForPidExit(pid: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isPidAlive(pid)) {
      return true;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return !isPidAlive(pid);
}

/**
 * Windows tree-kill. Killing only the numeric pid leaves the tsx grandchild
 * alive holding ports 8898/8899 etc. — /T walks the whole process tree, /F
 * forces termination.
 */
function treeKillWindows(pid: number): boolean {
  const result = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return result.status === 0;
}

async function killEntryUnix(pid: number): Promise<boolean> {
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    // Already gone — treat as stopped.
    return true;
  }

  if (await waitForPidExit(pid, POSIX_TERM_GRACE_MS)) {
    return true;
  }

  try {
    process.kill(pid, 'SIGKILL');
  } catch {
    return true;
  }

  return waitForPidExit(pid, POSIX_TERM_GRACE_MS);
}

async function killEntry(pid: number): Promise<boolean> {
  if (process.platform === 'win32') {
    return treeKillWindows(pid);
  }
  return killEntryUnix(pid);
}

async function main(): Promise<number> {
  const registryPath = defaultRegistryFilePath();

  // Drop entries from instances that were hard-killed before we try anything.
  const { pruned, entries } = pruneStaleInstances(registryPath);
  for (const instanceId of pruned) {
    console.log(`[kill-all] pruned stale instance ${instanceId} (process no longer running)`);
  }

  if (entries.size === 0) {
    console.log('[kill-all] no emulator instances are running.');
    return 0;
  }

  let stopped = 0;
  let failed = 0;

  for (const [instanceId, entry] of entries) {
    if (!isPidAlive(entry.pid)) {
      // Died between the prune pass and now; nothing to kill.
      continue;
    }

    console.log(
      `[kill-all] stopping ${instanceId} (pid ${entry.pid}, ${entry.model}, http ${entry.httpPort}, tcp ${entry.tcpPort})`
    );

    if (await killEntry(entry.pid)) {
      stopped += 1;
      try {
        unregisterInstance(instanceId, entry.pid, registryPath);
      } catch (error) {
        console.error(
          `[kill-all] could not update the registry for ${instanceId}: ${String(error)}`
        );
      }
    } else {
      failed += 1;
      console.error(
        `[kill-all] failed to stop ${instanceId} (pid ${entry.pid}); entry left in the registry`
      );
    }
  }

  const remaining = loadInstanceRegistry(registryPath);
  console.log(
    `[kill-all] ${stopped} stopped, ${failed} failed, ${pruned.length} stale pruned; ` +
      `registry now has ${remaining.size} ${remaining.size === 1 ? 'entry' : 'entries'}.`
  );

  return failed > 0 ? 1 : 0;
}

process.exit(await main());
