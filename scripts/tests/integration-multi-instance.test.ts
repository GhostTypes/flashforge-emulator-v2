import assert from 'node:assert/strict';
import { type ChildProcessByStdio, spawn, spawnSync } from 'node:child_process';
import * as dgram from 'node:dgram';
import { mkdtemp, writeFile } from 'node:fs/promises';
import * as net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import type { Readable } from 'node:stream';
import test from 'node:test';

const TEST_TIMEOUT_MS = 90_000;

interface ReadyPayload {
  instanceId: string;
  ip: string;
  tcpPort: number;
  httpPort: number;
  serial: string;
  model: string;
}

interface HealthPayload {
  ok: boolean;
  instanceId: string;
  model: string;
  serial: string;
  tcpPort: number;
  httpPort: number;
  uptimeMs: number;
}

function getRunnerCommand(): { command: string; prefixArgs: string[] } {
  return {
    command: process.execPath,
    prefixArgs: ['--import', 'tsx'],
  };
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to acquire a free port')));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(port);
        }
      });
    });
  });
}

async function getFreePortExcluding(excluded: readonly number[]): Promise<number> {
  const excludedSet = new Set(excluded);
  while (true) {
    const port = await getFreePort();
    if (!excludedSet.has(port)) {
      return port;
    }
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function postDetail(httpPort: number, serial: string, checkCode: string): Promise<number> {
  const response = await fetch(`http://127.0.0.1:${httpPort}/detail`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ serialNumber: serial, checkCode }),
  });
  assert.equal(response.status, 200);
  const body = (await response.json()) as { code: number };
  return body.code;
}

async function waitForHealthReady(httpPort: number, timeoutMs: number): Promise<HealthPayload> {
  const startedAt = Date.now();
  let lastError: unknown = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${httpPort}/__health`);
      if (response.ok) {
        const payload = (await response.json()) as HealthPayload;
        if (payload.ok) {
          return payload;
        }
      }
    } catch (error) {
      lastError = error;
    }

    await wait(200);
  }

  throw new Error(
    `Health check did not become ready on port ${httpPort}. Last error: ${String(lastError)}`
  );
}

async function runTcpHandshake(port: number): Promise<string> {
  const socket = await new Promise<net.Socket>((resolve, reject) => {
    const client = net.createConnection({ host: '127.0.0.1', port });
    client.once('error', reject);
    client.once('connect', () => resolve(client));
  });

  try {
    const response = await new Promise<string>((resolve, reject) => {
      let output = '';
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = (): void => {
        socket.off('data', onData);
        socket.off('error', onError);
        if (timer) {
          clearTimeout(timer);
        }
      };

      const finish = (): void => {
        cleanup();
        resolve(output);
      };

      const onData = (chunk: Buffer): void => {
        output += chunk.toString('utf-8');
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(finish, 200);
      };

      const onError = (error: Error): void => {
        cleanup();
        reject(error);
      };

      socket.on('data', onData);
      socket.on('error', onError);
      socket.write('M601\n');
    });

    if (!socket.destroyed) {
      socket.write('M602\n');
    }

    return response;
  } finally {
    socket.end();
    socket.destroy();
  }
}

function sendTcpCommand(socket: net.Socket, command: string, settleMs = 200): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let output = '';
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = (): void => {
      socket.off('data', onData);
      socket.off('error', onError);
      if (timer) {
        clearTimeout(timer);
      }
    };

    const finish = (): void => {
      cleanup();
      resolve(output);
    };

    const onData = (chunk: Buffer): void => {
      output += chunk.toString('utf-8');
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(finish, settleMs);
    };

    const onError = (error: Error): void => {
      cleanup();
      reject(error);
    };

    socket.on('data', onData);
    socket.on('error', onError);
    socket.write(`${command}\n`);
  });
}

async function runDualControlAndM115Handshake(port: number): Promise<{
  firstLogin: string;
  secondLogin: string;
  firstInfo: string;
  secondInfo: string;
}> {
  const first = await new Promise<net.Socket>((resolve, reject) => {
    const client = net.createConnection({ host: '127.0.0.1', port });
    client.once('error', reject);
    client.once('connect', () => resolve(client));
  });

  const second = await new Promise<net.Socket>((resolve, reject) => {
    const client = net.createConnection({ host: '127.0.0.1', port });
    client.once('error', reject);
    client.once('connect', () => resolve(client));
  });

  try {
    const firstLogin = await sendTcpCommand(first, 'M601');
    const secondLogin = await sendTcpCommand(second, 'M601');
    const firstInfo = await sendTcpCommand(first, 'M115');
    const secondInfo = await sendTcpCommand(second, 'M115');

    await sendTcpCommand(first, 'M602');
    await sendTcpCommand(second, 'M602');

    return {
      firstLogin,
      secondLogin,
      firstInfo,
      secondInfo,
    };
  } finally {
    first.end();
    first.destroy();
    second.end();
    second.destroy();
  }
}

async function sendDiscoveryProbes(attempts = 10): Promise<void> {
  const sender = dgram.createSocket('udp4');

  await new Promise<void>((resolve, reject) => {
    sender.once('error', reject);
    sender.bind(0, '0.0.0.0', () => {
      sender.off('error', reject);
      resolve();
    });
  });

  sender.setMulticastTTL(1);
  sender.setBroadcast(true);
  const payload = Buffer.from('e2e-probe');

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    sender.send(payload, 19000, '225.0.0.9');
    sender.send(payload, 48899, '255.255.255.255');
    await wait(150);
  }

  sender.close();
}

async function probeDiscoveryReply(params: {
  sourcePort: number;
  targetPort: number;
  targetAddress?: string;
  timeoutMs?: number;
  payload?: Buffer;
}): Promise<{ bytes: number; fromPort: number }> {
  const {
    sourcePort,
    targetPort,
    targetAddress = '127.0.0.1',
    timeoutMs = 3_000,
    payload = Buffer.from('e2e-port-probe'),
  } = params;
  const sender = dgram.createSocket('udp4');

  try {
    await new Promise<void>((resolve, reject) => {
      sender.once('error', reject);
      sender.bind(sourcePort, '0.0.0.0', () => {
        sender.off('error', reject);
        resolve();
      });
    });

    sender.setBroadcast(true);

    return await new Promise<{ bytes: number; fromPort: number }>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = (): void => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        sender.off('message', onMessage);
        sender.off('error', onError);
      };

      const onMessage = (data: Buffer, rinfo: dgram.RemoteInfo): void => {
        cleanup();
        resolve({ bytes: data.length, fromPort: rinfo.port });
      };

      const onError = (error: Error): void => {
        cleanup();
        reject(error);
      };

      sender.on('message', onMessage);
      sender.on('error', onError);

      sender.send(payload, targetPort, targetAddress, (error) => {
        if (error) {
          cleanup();
          reject(error);
          return;
        }

        timeoutId = setTimeout(() => {
          cleanup();
          reject(
            new Error(
              `Timed out waiting for discovery response on source port ${sourcePort} after probing ${targetAddress}:${targetPort}`
            )
          );
        }, timeoutMs);
      });
    });
  } finally {
    sender.close();
  }
}

function waitForSupervisorExit(
  supervisor: ChildProcessByStdio<null, Readable, Readable>,
  timeoutMs = 5_000
): Promise<void> {
  if (supervisor.exitCode !== null) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const timeoutId = setTimeout(() => {
      if (supervisor.exitCode === null) {
        if (process.platform === 'win32' && supervisor.pid) {
          spawnSync('taskkill', ['/PID', String(supervisor.pid), '/T', '/F']);
        } else {
          supervisor.kill('SIGKILL');
        }
      }
      resolve();
    }, timeoutMs);

    supervisor.once('exit', () => {
      clearTimeout(timeoutId);
      resolve();
    });
  });
}

test(
  'multi-instance supervisor launches deterministic headless instances for E2E',
  { timeout: TEST_TIMEOUT_MS },
  async () => {
    const ports = await Promise.all([getFreePort(), getFreePort(), getFreePort(), getFreePort()]);
    const [tcpPortA, httpPortA, tcpPortB, httpPortB] = ports;

    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'ff-emulator-e2e-'));
    const configPath = path.join(tempDir, 'instances.json');

    const config = {
      instances: [
        {
          instanceId: 'alpha',
          model: 'adventurer-5m-pro',
          serial: 'E2E-SN-ALPHA',
          checkCode: 'E2E-CODE-ALPHA',
          machineName: 'E2E Alpha',
          tcpPort: tcpPortA,
          httpPort: httpPortA,
          discoveryEnabled: true,
          simulationMode: 'auto',
          simulationSpeed: 100,
        },
        {
          instanceId: 'beta',
          model: 'adventurer-5m',
          serial: 'E2E-SN-BETA',
          checkCode: 'E2E-CODE-BETA',
          machineName: 'E2E Beta',
          tcpPort: tcpPortB,
          httpPort: httpPortB,
          discoveryEnabled: true,
          simulationMode: 'auto',
          simulationSpeed: 100,
        },
      ],
    };
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    const { command, prefixArgs } = getRunnerCommand();
    const supervisorScript = path.resolve(process.cwd(), 'scripts/headless/run-supervisor.ts');
    const supervisorArgs = [...prefixArgs, supervisorScript, '--config', configPath];
    const supervisor = spawn(command, supervisorArgs, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const readyByInstance = new Map<string, ReadyPayload>();
    const discoveryIdentities = new Set<string>();
    let expectingReadyJson = false;
    let expectingDiscoveryJson = false;

    const stdoutReader = readline.createInterface({ input: supervisor.stdout });
    stdoutReader.on('line', (line: string) => {
      if (expectingDiscoveryJson) {
        expectingDiscoveryJson = false;

        try {
          const payload = JSON.parse(line) as {
            instanceId: string;
            serial: string;
            commandPort: number;
          };
          discoveryIdentities.add(`${payload.serial}:${payload.commandPort}`);
        } catch {
          // Ignore malformed non-JSON lines from child logs
        }
        return;
      }

      if (expectingReadyJson) {
        expectingReadyJson = false;
        const payload = JSON.parse(line) as ReadyPayload;
        readyByInstance.set(payload.instanceId, payload);
        return;
      }

      if (line.trim() === 'EMULATOR_DISCOVERY_RESPONSE') {
        expectingDiscoveryJson = true;
        return;
      }

      if (line.trim() === 'EMULATOR_READY') {
        expectingReadyJson = true;
      }
    });

    const stderrLines: string[] = [];
    const stderrReader = readline.createInterface({ input: supervisor.stderr });
    stderrReader.on('line', (line: string) => {
      stderrLines.push(line);
    });

    try {
      const startupDeadline = Date.now() + 20_000;
      while (readyByInstance.size < 2 && Date.now() < startupDeadline) {
        if (supervisor.exitCode !== null) {
          break;
        }
        await wait(100);
      }

      assert.equal(
        readyByInstance.size,
        2,
        `Expected 2 readiness payloads. stderr:\n${stderrLines.join('\n')}`
      );

      const readyPayloads = Array.from(readyByInstance.values());
      const healthChecks = await Promise.all(
        readyPayloads.map((payload) => waitForHealthReady(payload.httpPort, 10_000))
      );

      for (const health of healthChecks) {
        assert.equal(health.ok, true);
        assert.ok(health.instanceId === 'alpha' || health.instanceId === 'beta');
        assert.ok(health.uptimeMs >= 0);
      }

      for (const payload of readyPayloads) {
        const tcpResponse = await runTcpHandshake(payload.tcpPort);
        assert.match(tcpResponse, /Control Success V2\.1\./);
      }

      for (const payload of readyPayloads) {
        const dualSession = await runDualControlAndM115Handshake(payload.tcpPort);
        assert.match(dualSession.firstLogin, /Control Success V2\.1\./);
        assert.match(dualSession.secondLogin, /Control Success V2\.1\./);
        assert.match(dualSession.firstInfo, /Machine Type:/);
        assert.match(dualSession.secondInfo, /Machine Type:/);
      }

      for (const payload of readyPayloads) {
        const successCode = await postDetail(
          payload.httpPort,
          payload.serial,
          payload.instanceId === 'alpha' ? 'E2E-CODE-ALPHA' : 'E2E-CODE-BETA'
        );
        assert.equal(successCode, 0);

        const unauthorizedCode = await postDetail(payload.httpPort, payload.serial, 'WRONG-CODE');
        assert.equal(unauthorizedCode, 3);
      }

      // Discovery responses must return to the probe sender port (not a fixed port).
      const broadcastProbeSourcePort = await getFreePortExcluding([18007]);
      const broadcastProbeResponse = await probeDiscoveryReply({
        sourcePort: broadcastProbeSourcePort,
        targetPort: 48899,
      });
      assert.equal(broadcastProbeResponse.bytes, 276);
      assert.equal(broadcastProbeResponse.fromPort, 48899);

      const multicastProbeSourcePort = await getFreePortExcluding([
        18007,
        broadcastProbeSourcePort,
      ]);
      const multicastProbeResponse = await probeDiscoveryReply({
        sourcePort: multicastProbeSourcePort,
        targetPort: 19000,
      });
      assert.equal(multicastProbeResponse.bytes, 276);
      assert.equal(multicastProbeResponse.fromPort, 19000);

      const emptyProbeSourcePort = await getFreePortExcluding([
        18007,
        broadcastProbeSourcePort,
        multicastProbeSourcePort,
      ]);
      const emptyProbeResponse = await probeDiscoveryReply({
        sourcePort: emptyProbeSourcePort,
        targetPort: 48899,
        payload: Buffer.alloc(0),
      });
      assert.equal(emptyProbeResponse.bytes, 276);
      assert.equal(emptyProbeResponse.fromPort, 48899);

      await sendDiscoveryProbes();
      const discoveryDeadline = Date.now() + 5_000;
      while (discoveryIdentities.size < 2 && Date.now() < discoveryDeadline) {
        await wait(100);
      }

      assert.equal(
        discoveryIdentities.size,
        2,
        `Expected discovery to report two unique serial+command identities, got: ${Array.from(discoveryIdentities).join(', ')}`
      );
    } finally {
      if (supervisor.exitCode === null) {
        supervisor.kill('SIGTERM');
      }
      await waitForSupervisorExit(supervisor);
      stdoutReader.close();
      stderrReader.close();
    }
  }
);
