/**
 * @fileoverview
 * Instance registry for headless emulator instances.
 *
 * Tracks every running headless instance in a shared JSON file
 * (`.emulator/instances.json`, keyed by instanceId) so `kill:all` can find and
 * tree-kill them later. On Windows, killing the parent npm process leaves the
 * tsx grandchild alive holding ports 8898/8899 — the registry plus tree-kill
 * (`taskkill /PID <pid> /T /F`) is the reliable cleanup path.
 *
 * All writes are synchronous on purpose: the unregister call happens on the
 * `process.exit` path of a shutting-down instance, where async I/O can be cut
 * off mid-flush. Concurrent instances do read-modify-write with a best-effort
 * retry loop for Windows file-locking (EBUSY/EPERM/EAGAIN).
 *
 * @packageDocumentation
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/** One running (or recently dead) headless instance. */
export interface InstanceRegistryEntry {
  instanceId: string;
  pid: number;
  tcpPort: number;
  httpPort: number;
  serial: string;
  model: string;
  /** ISO 8601 timestamp of when the instance reached EMULATOR_READY. */
  startedAt: string;
}

const REGISTRY_DIR = '.emulator';
const REGISTRY_FILE = 'instances.json';
const WRITE_ATTEMPTS = 5;
const WRITE_RETRY_DELAY_MS = 25;

const TRANSIENT_WRITE_ERRORS = new Set(['EBUSY', 'EPERM', 'EACCES', 'EAGAIN']);

/**
 * Registry file path. Resolved from the working directory, matching how the
 * supervisor and npm scripts locate `scripts/headless/*` (always repo root).
 */
export function defaultRegistryFilePath(): string {
  return path.resolve(process.cwd(), REGISTRY_DIR, REGISTRY_FILE);
}

function isInstanceRegistryEntry(value: unknown): value is InstanceRegistryEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['instanceId'] === 'string' &&
    candidate['instanceId'].length > 0 &&
    typeof candidate['pid'] === 'number' &&
    Number.isInteger(candidate['pid']) &&
    candidate['pid'] > 0 &&
    typeof candidate['tcpPort'] === 'number' &&
    typeof candidate['httpPort'] === 'number' &&
    typeof candidate['serial'] === 'string' &&
    typeof candidate['model'] === 'string' &&
    typeof candidate['startedAt'] === 'string'
  );
}

/**
 * Loads the registry. A missing, empty, corrupt, or partially malformed file
 * yields an empty/filtered registry rather than throwing — the registry is a
 * best-effort index, never a source of truth about instance liveness (the OS
 * is; see {@link isPidAlive}).
 */
export function loadInstanceRegistry(
  filePath = defaultRegistryFilePath()
): Map<string, InstanceRegistryEntry> {
  if (!existsSync(filePath)) {
    return new Map();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;
  } catch {
    return new Map();
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return new Map();
  }

  const entries = new Map<string, InstanceRegistryEntry>();
  for (const [instanceId, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (isInstanceRegistryEntry(value) && value.instanceId === instanceId) {
      entries.set(instanceId, value);
    }
  }
  return entries;
}

function writeRegistrySync(
  entries: ReadonlyMap<string, InstanceRegistryEntry>,
  filePath: string
): void {
  const serialized: Record<string, InstanceRegistryEntry> = {};
  for (const [instanceId, entry] of entries) {
    serialized[instanceId] = entry;
  }

  const payload = `${JSON.stringify(serialized, null, 2)}\n`;

  mkdirSync(path.dirname(filePath), { recursive: true });

  for (let attempt = 1; attempt <= WRITE_ATTEMPTS; attempt += 1) {
    try {
      writeFileSync(filePath, payload, 'utf-8');
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? '';
      if (!TRANSIENT_WRITE_ERRORS.has(code) || attempt === WRITE_ATTEMPTS) {
        throw error;
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, WRITE_RETRY_DELAY_MS);
    }
  }
}

/**
 * Adds (or replaces) this instance's registry entry. Read-modify-write over the
 * shared file so concurrently starting instances do not clobber each other.
 */
export function registerInstance(
  entry: InstanceRegistryEntry,
  filePath = defaultRegistryFilePath()
): void {
  const entries = loadInstanceRegistry(filePath);
  entries.set(entry.instanceId, entry);
  writeRegistrySync(entries, filePath);
}

/**
 * Removes an instance's registry entry. When `pid` is provided the entry is
 * only removed if it still belongs to that pid, so a restarted instance with
 * the same instanceId is never deregistered by the old process's shutdown.
 */
export function unregisterInstance(
  instanceId: string,
  pid?: number,
  filePath = defaultRegistryFilePath()
): void {
  const entries = loadInstanceRegistry(filePath);
  const existing = entries.get(instanceId);

  if (!existing || (pid !== undefined && existing.pid !== pid)) {
    return;
  }

  entries.delete(instanceId);
  writeRegistrySync(entries, filePath);
}

/**
 * Whether a process with the given pid exists right now. Uses signal 0 (the
 * existence probe); EPERM means alive but owned by someone else.
 */
export function isPidAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
}

/**
 * Drops registry entries whose pid is no longer alive (instances that were
 * hard-killed — e.g. Windows SIGTERM emulation — never reach their clean
 * shutdown hook). Returns the surviving entries and the pruned instance IDs.
 */
export function pruneStaleInstances(filePath = defaultRegistryFilePath()): {
  pruned: string[];
  entries: Map<string, InstanceRegistryEntry>;
} {
  const entries = loadInstanceRegistry(filePath);
  const pruned: string[] = [];

  for (const [instanceId, entry] of entries) {
    if (!isPidAlive(entry.pid)) {
      pruned.push(instanceId);
    }
  }

  if (pruned.length > 0) {
    for (const instanceId of pruned) {
      entries.delete(instanceId);
    }
    writeRegistrySync(entries, filePath);
  }

  return { pruned, entries };
}
