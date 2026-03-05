import { type ChildProcessByStdio, spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';
import type { Readable } from 'node:stream';
import { type HeadlessInstanceOptions, buildHeadlessInstanceCliArgs } from './instance-config';
import { loadSupervisorConfig, parseSupervisorCliArgs } from './supervisor-config';

interface ChildRuntimeState {
  instance: HeadlessInstanceOptions;
  child: ChildProcessByStdio<null, Readable, Readable>;
  ready: boolean;
  expectingReadyJson: boolean;
  expectingDiscoveryJson: boolean;
  startupTimeoutId: ReturnType<typeof setTimeout> | null;
}

function getChildCommand(): { command: string; prefixArgs: string[] } {
  return {
    command: process.execPath,
    prefixArgs: ['--import', 'tsx'],
  };
}

function waitForChildExit(
  child: ChildProcessByStdio<null, Readable, Readable>,
  timeoutMs: number
): Promise<void> {
  if (child.exitCode !== null || child.killed) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let settled = false;

    const finish = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      child.off('exit', handleExit);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      resolve();
    };

    const handleExit = (): void => {
      finish();
    };

    child.on('exit', handleExit);
    const timeoutId = setTimeout(() => {
      if (child.exitCode === null) {
        if (process.platform === 'win32' && child.pid) {
          spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F']);
        } else {
          child.kill('SIGKILL');
        }
      }
      finish();
    }, timeoutMs);
  });
}

const cliOptions = parseSupervisorCliArgs(process.argv.slice(2));
const instanceConfigs = await loadSupervisorConfig(cliOptions.configPath);
const states: ChildRuntimeState[] = [];

let shuttingDown = false;
let exitCode = 0;

async function shutdown(nextExitCode: number): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  exitCode = nextExitCode;

  await Promise.all(
    states.map(async (state) => {
      if (state.startupTimeoutId) {
        clearTimeout(state.startupTimeoutId);
        state.startupTimeoutId = null;
      }

      if (state.child.exitCode === null) {
        state.child.kill('SIGTERM');
      }

      await waitForChildExit(state.child, 3_000);
    })
  );

  process.exit(exitCode);
}

function failSupervisor(message: string): void {
  if (shuttingDown) {
    return;
  }
  console.error(message);
  void shutdown(1);
}

process.on('SIGINT', () => {
  void shutdown(0);
});

process.on('SIGTERM', () => {
  void shutdown(0);
});

for (const instance of instanceConfigs) {
  const { command, prefixArgs } = getChildCommand();
  const instanceScript = path.resolve(process.cwd(), 'scripts/headless/run-instance.ts');
  const childArgs = [...prefixArgs, instanceScript, ...buildHeadlessInstanceCliArgs(instance)];

  const child = spawn(command, childArgs, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const state: ChildRuntimeState = {
    instance,
    child,
    ready: false,
    expectingReadyJson: false,
    expectingDiscoveryJson: false,
    startupTimeoutId: setTimeout(() => {
      failSupervisor(`Instance ${instance.instanceId} failed startup within timeout`);
    }, cliOptions.startupTimeoutMs),
  };
  states.push(state);

  const stdoutReader = readline.createInterface({ input: child.stdout });
  stdoutReader.on('line', (line: string) => {
    if (state.expectingDiscoveryJson) {
      state.expectingDiscoveryJson = false;

      try {
        const payload = JSON.parse(line) as {
          instanceId: string;
          serial: string;
          commandPort: number;
          httpPort: number;
          model: string;
        };
        console.log('EMULATOR_DISCOVERY_RESPONSE');
        console.log(JSON.stringify(payload));
      } catch {
        failSupervisor(`Instance ${instance.instanceId} emitted invalid discovery JSON`);
      }
      return;
    }

    if (state.expectingReadyJson) {
      state.expectingReadyJson = false;

      let payload: {
        instanceId: string;
        ip: string;
        tcpPort: number;
        httpPort: number;
        serial: string;
        model: string;
      };

      try {
        payload = JSON.parse(line) as typeof payload;
      } catch {
        failSupervisor(`Instance ${instance.instanceId} emitted invalid readiness JSON`);
        return;
      }

      if (payload.instanceId !== instance.instanceId) {
        failSupervisor(
          `Readiness instanceId mismatch for ${instance.instanceId}: ${payload.instanceId}`
        );
        return;
      }

      state.ready = true;
      if (state.startupTimeoutId) {
        clearTimeout(state.startupTimeoutId);
        state.startupTimeoutId = null;
      }

      console.log('EMULATOR_READY');
      console.log(JSON.stringify(payload));
      return;
    }

    if (line.trim() === 'EMULATOR_DISCOVERY_RESPONSE') {
      state.expectingDiscoveryJson = true;
      return;
    }

    if (line.trim() === 'EMULATOR_READY') {
      state.expectingReadyJson = true;
    }
  });

  const stderrReader = readline.createInterface({ input: child.stderr });
  stderrReader.on('line', (line: string) => {
    if (line.trim().length > 0) {
      console.error(`[${instance.instanceId}] ${line}`);
    }
  });

  child.on('exit', (code, signal) => {
    if (state.startupTimeoutId) {
      clearTimeout(state.startupTimeoutId);
      state.startupTimeoutId = null;
    }

    if (shuttingDown) {
      return;
    }

    if (!state.ready) {
      failSupervisor(
        `Instance ${instance.instanceId} exited before readiness (code=${String(code)}, signal=${String(signal)})`
      );
      return;
    }

    failSupervisor(
      `Instance ${instance.instanceId} exited unexpectedly (code=${String(code)}, signal=${String(signal)})`
    );
  });
}
