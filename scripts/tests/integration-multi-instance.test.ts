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

interface GcodeToolDataPayload {
  toolId: number;
  materialName: string;
  materialColor: string;
  filamentWeight: number;
  slotId: number;
}

interface GcodeListDetailEntry {
  gcodeFileName: string;
  gcodeToolCnt?: number;
  gcodeToolDatas?: GcodeToolDataPayload[];
  useMatlStation?: boolean;
}

interface GcodeListResponse {
  code: number;
  gcodeList?: string[];
  gcodeListDetail?: GcodeListDetailEntry[];
}

interface Creator5DetailPayload {
  [key: string]: unknown;
  pid: number;
  model: string;
  nozzleCnt: number;
  nozzleTemps: number[];
  nozzleTargetTemps: number[];
  measure: string;
  chamberTemp: number;
  chamberTargetTemp: number;
  platTargetTemp: number;
  tvoc: number;
  camera: number;
  lidar: number;
  doorStatus: string;
  internalFanStatus: string;
  externalFanStatus: string;
  printFileName: string;
  printFileThumbUrl: string;
  matlStationInfo: { slotCnt: number };
  hasMatlStation?: unknown;
  leftTemp?: unknown;
  indepMatlInfo?: unknown;
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

async function uploadGcodeWithMappings(params: {
  httpPort: number;
  serial: string;
  checkCode: string;
  fileName: string;
  materialMappings: Array<{
    toolId: number;
    slotId: number;
    materialName: string;
    toolMaterialColor: string;
    slotMaterialColor: string;
  }>;
}): Promise<void> {
  const formData = new FormData();
  formData.set('gcodeFile', new Blob([';E2E MULTI COLOR TEST\nG28\nM84\n']), params.fileName);

  const materialMappingsBase64 = Buffer.from(
    JSON.stringify(params.materialMappings),
    'utf-8'
  ).toString('base64');

  const response = await fetch(`http://127.0.0.1:${params.httpPort}/uploadGcode`, {
    method: 'POST',
    headers: {
      serialNumber: params.serial,
      checkCode: params.checkCode,
      printNow: 'false',
      levelingBeforePrint: 'false',
      flowCalibration: 'false',
      useMatlStation: 'true',
      gcodeToolCnt: String(params.materialMappings.length),
      materialMappings: materialMappingsBase64,
    },
    body: formData,
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as { code: number; message: string };
  assert.equal(body.code, 0, body.message);
}

async function fetchGcodeList(params: {
  httpPort: number;
  serial: string;
  checkCode: string;
}): Promise<GcodeListResponse> {
  const response = await fetch(`http://127.0.0.1:${params.httpPort}/gcodeList`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      serialNumber: params.serial,
      checkCode: params.checkCode,
    }),
  });

  assert.equal(response.status, 200);
  return (await response.json()) as GcodeListResponse;
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
}): Promise<{ bytes: number; fromPort: number; packet: Buffer }> {
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

    return await new Promise<{ bytes: number; fromPort: number; packet: Buffer }>(
      (resolve, reject) => {
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
          resolve({ bytes: data.length, fromPort: rinfo.port, packet: data });
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
      }
    );
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
  { timeout: TEST_TIMEOUT_MS, concurrency: false },
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

      const alphaPayload = readyByInstance.get('alpha');
      assert.ok(alphaPayload, 'Missing alpha readiness payload');
      await uploadGcodeWithMappings({
        httpPort: alphaPayload.httpPort,
        serial: alphaPayload.serial,
        checkCode: 'E2E-CODE-ALPHA',
        fileName: 'e2e-multi-material.3mf',
        materialMappings: [
          {
            toolId: 0,
            slotId: 1,
            materialName: 'PLA',
            toolMaterialColor: '#4DA3FF',
            slotMaterialColor: '#4DA3FF',
          },
          {
            toolId: 1,
            slotId: 2,
            materialName: 'PETG',
            toolMaterialColor: '#FF8A3D',
            slotMaterialColor: '#FF8A3D',
          },
        ],
      });

      const gcodeListPayload = await fetchGcodeList({
        httpPort: alphaPayload.httpPort,
        serial: alphaPayload.serial,
        checkCode: 'E2E-CODE-ALPHA',
      });

      const uploadedEntry = gcodeListPayload.gcodeListDetail?.find(
        (entry) => entry.gcodeFileName === 'e2e-multi-material.3mf'
      );
      assert.ok(uploadedEntry, 'Uploaded multi-material file should appear in gcodeListDetail');
      assert.equal(uploadedEntry.gcodeToolCnt, 2);
      assert.equal(uploadedEntry.useMatlStation, true);
      assert.deepEqual(uploadedEntry.gcodeToolDatas, [
        {
          toolId: 0,
          materialName: 'PLA',
          materialColor: '#4DA3FF',
          filamentWeight: 0,
          slotId: 1,
        },
        {
          toolId: 1,
          materialName: 'PETG',
          materialColor: '#FF8A3D',
          filamentWeight: 0,
          slotId: 2,
        },
      ]);

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

test(
  'creator 5 series emulates HTTP-only transport with per-model capabilities and firmware quirks',
  { timeout: TEST_TIMEOUT_MS, concurrency: false },
  async () => {
    const ports = await Promise.all([getFreePort(), getFreePort(), getFreePort(), getFreePort()]);
    const [tcpPortC5, httpPortC5, tcpPortC5P, httpPortC5P] = ports;

    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'ff-emulator-creator5-'));
    const configPath = path.join(tempDir, 'instances.json');

    const config = {
      instances: [
        {
          instanceId: 'creator5',
          model: 'creator-5',
          serial: 'E2E-SN-CREATOR5',
          checkCode: 'E2E-CODE-C5',
          machineName: 'E2E Creator 5',
          tcpPort: tcpPortC5,
          httpPort: httpPortC5,
          discoveryEnabled: true,
          simulationMode: 'manual',
          simulationSpeed: 100,
        },
        {
          instanceId: 'creator5pro',
          model: 'creator-5-pro',
          serial: 'E2E-SN-CREATOR5PRO',
          checkCode: 'E2E-CODE-C5P',
          machineName: 'E2E Creator 5 Pro',
          tcpPort: tcpPortC5P,
          httpPort: httpPortC5P,
          discoveryEnabled: true,
          simulationMode: 'manual',
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
    let expectingReadyJson = false;
    const stdoutReader = readline.createInterface({ input: supervisor.stdout });
    stdoutReader.on('line', (line: string) => {
      if (expectingReadyJson) {
        expectingReadyJson = false;
        const payload = JSON.parse(line) as ReadyPayload;
        readyByInstance.set(payload.instanceId, payload);
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

    async function fetchDetail(
      httpPort: number,
      serial: string,
      checkCode: string
    ): Promise<Creator5DetailPayload> {
      const response = await fetch(`http://127.0.0.1:${httpPort}/detail`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ serialNumber: serial, checkCode }),
      });
      assert.equal(response.status, 200);
      const body = (await response.json()) as { code: number; detail: Creator5DetailPayload };
      assert.equal(body.code, 0);
      return body.detail;
    }

    async function sendControl(
      httpPort: number,
      serial: string,
      checkCode: string,
      cmd: string,
      args: Record<string, unknown>
    ): Promise<{ code: number; message: string }> {
      const response = await fetch(`http://127.0.0.1:${httpPort}/control`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serialNumber: serial,
          checkCode,
          payload: { cmd, args },
        }),
      });
      assert.equal(response.status, 200);
      return (await response.json()) as { code: number; message: string };
    }

    async function assertTcpRefused(port: number): Promise<void> {
      await assert.rejects(
        () =>
          new Promise<net.Socket>((_resolve, reject) => {
            const client = net.createConnection({ host: '127.0.0.1', port });
            client.once('error', reject);
            client.once('connect', () => {
              client.destroy();
              reject(new Error(`TCP port ${port} should be closed (HTTP-only model)`));
            });
          }),
        /ECONNREFUSED|should be closed/
      );
    }

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

      const c5 = readyByInstance.get('creator5');
      const c5p = readyByInstance.get('creator5pro');
      assert.ok(c5, 'Missing creator5 readiness payload');
      assert.ok(c5p, 'Missing creator5pro readiness payload');

      await waitForHealthReady(c5.httpPort, 10_000);
      await waitForHealthReady(c5p.httpPort, 10_000);

      // HTTP-only transport: no TCP service is bound even though a tcp port is
      // configured (real Creator 5 firmware runs no TCP 8899 service).
      await assertTcpRefused(c5.tcpPort);
      await assertTcpRefused(c5p.tcpPort);

      // --- /detail: base Creator 5 ---
      const detailC5 = await fetchDetail(c5.httpPort, c5.serial, 'E2E-CODE-C5');
      assert.equal(detailC5.pid, 40);
      assert.equal(detailC5.model, 'Creator 5');
      assert.equal(detailC5.nozzleCnt, 4);
      assert.deepEqual(detailC5.nozzleTemps, [25, 0, 0, 0]);
      assert.equal(detailC5.nozzleTargetTemps?.length, 4);
      assert.equal(detailC5.measure, '256X256X256');
      // Base model: chamber sensor absent — firmware reports the -108 sentinel.
      assert.equal(detailC5.chamberTemp, -108);
      assert.equal(detailC5.chamberTargetTemp, -108);
      // Material station present but the AD5X-only flag/fields are omitted.
      assert.equal(detailC5.hasMatlStation, undefined);
      assert.equal(detailC5.leftTemp, undefined);
      assert.equal(detailC5.indepMatlInfo, undefined);
      assert.equal((detailC5.matlStationInfo as { slotCnt: number }).slotCnt, 4);
      assert.equal(detailC5.camera, 1);
      assert.equal(detailC5.lidar, 0);
      assert.equal(detailC5.doorStatus, 'close');

      // --- /detail: Creator 5 Pro ---
      const detailC5P = await fetchDetail(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P');
      assert.equal(detailC5P.pid, 41);
      assert.equal(detailC5P.model, 'Creator 5 Pro');
      // Pro: real chamber sensor values (not the sentinel).
      assert.notEqual(detailC5P.chamberTemp, -108);
      assert.equal(typeof detailC5P.tvoc, 'number');
      assert.equal((detailC5P.matlStationInfo as { slotCnt: number }).slotCnt, 4);

      // --- /product: bug-compatible misreporting on both C5 models ---
      for (const [port, serial, code] of [
        [c5.httpPort, c5.serial, 'E2E-CODE-C5'],
        [c5p.httpPort, c5p.serial, 'E2E-CODE-C5P'],
      ] as const) {
        const response = await fetch(`http://127.0.0.1:${port}/product`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ serialNumber: serial, checkCode: code }),
        });
        const body = (await response.json()) as {
          product: Record<string, number>;
        };
        // chamberTempCtrlState over-reports (1 even on the heater-less base);
        // fan control states under-report (0 even on the filtration-equipped Pro).
        assert.equal(body.product['chamberTempCtrlState'], 1);
        assert.equal(body.product['internalFanCtrlState'], 0);
        assert.equal(body.product['externalFanCtrlState'], 0);
      }

      // --- temperatureCtl_cmd: canonical Creator 5 wire format ---
      const setTargets = await sendControl(
        c5p.httpPort,
        c5p.serial,
        'E2E-CODE-C5P',
        'temperatureCtl_cmd',
        {
          nozzles: [200, -200, 0, 60],
          platform: 60,
          chamber: 45,
          rightNozzle: 999,
          leftNozzle: 999,
        }
      );
      assert.equal(setTargets.code, 0);

      let detail = await fetchDetail(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P');
      assert.deepEqual(
        detail.nozzleTargetTemps,
        [200, 0, 0, 60],
        'nozzles array drives per-tool targets'
      );
      assert.equal(detail.platTargetTemp, 60);
      assert.equal(detail.chamberTargetTemp, 45);

      // -100 inside nozzles[] is ignored (firmware quirk: tool keeps heating).
      await sendControl(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P', 'temperatureCtl_cmd', {
        nozzles: [-100, -100, -100, -100],
      });
      detail = await fetchDetail(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P');
      assert.deepEqual(
        detail.nozzleTargetTemps,
        [200, 0, 0, 60],
        '-100 in nozzles[] must be ignored'
      );

      // Wrong-length nozzles array skips the whole per-tool block.
      await sendControl(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P', 'temperatureCtl_cmd', {
        nozzles: [300, 300],
      });
      detail = await fetchDetail(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P');
      assert.deepEqual(
        detail.nozzleTargetTemps,
        [200, 0, 0, 60],
        'wrong-length nozzles[] must be ignored'
      );

      // Chamber clamps at 80 C.
      await sendControl(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P', 'temperatureCtl_cmd', {
        chamber: 120,
      });
      detail = await fetchDetail(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P');
      assert.equal(detail.chamberTargetTemp, 80, 'chamber clamps to 80 C');

      // Base model: chamber control is acknowledged without effect.
      const baseChamber = await sendControl(
        c5.httpPort,
        c5.serial,
        'E2E-CODE-C5',
        'temperatureCtl_cmd',
        {
          nozzles: [150, -200, -200, -200],
          chamber: 70,
        }
      );
      assert.equal(baseChamber.code, 0, 'base chamber command is silently acknowledged');
      detail = await fetchDetail(c5.httpPort, c5.serial, 'E2E-CODE-C5');
      assert.equal(detail.chamberTargetTemp, -108, 'base chamber target stays at the sentinel');
      assert.deepEqual(detail.nozzleTargetTemps, [150, 0, 0, 0]);

      // --- circulateCtl_cmd: acknowledged but never actuated on the Pro ---
      const circulate = await sendControl(
        c5p.httpPort,
        c5p.serial,
        'E2E-CODE-C5P',
        'circulateCtl_cmd',
        {
          internal: 'open',
          external: 'open',
        }
      );
      assert.equal(circulate.code, 0);
      detail = await fetchDetail(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P');
      assert.equal(detail.internalFanStatus, 'close', 'Pro filtration must not actuate');
      assert.equal(detail.externalFanStatus, 'close', 'Pro filtration must not actuate');

      // --- upload + gcodeList: names only (no gcodeListDetail) ---
      const formData = new FormData();
      formData.set('gcodeFile', new Blob([';E2E C5 TEST\nG28\nM84\n']), 'e2e-creator5.3mf');
      const uploadResponse = await fetch(`http://127.0.0.1:${c5p.httpPort}/uploadGcode`, {
        method: 'POST',
        headers: {
          serialNumber: c5p.serial,
          checkCode: 'E2E-CODE-C5P',
          printNow: 'false',
          levelingBeforePrint: 'true',
          useMatlStation: 'true',
          gcodeToolCnt: '2',
        },
        body: formData,
      });
      assert.equal(((await uploadResponse.json()) as { code: number }).code, 0);

      const gcodeList = await fetchGcodeList({
        httpPort: c5p.httpPort,
        serial: c5p.serial,
        checkCode: 'E2E-CODE-C5P',
      });
      assert.ok(gcodeList.gcodeList?.includes('e2e-creator5.3mf'));
      assert.equal(
        gcodeList.gcodeListDetail,
        undefined,
        'Creator 5 must not return gcodeListDetail'
      );

      // --- printGcode: required levelingBeforePrint (firmware -1 error) ---
      const missingLeveling = await fetch(`http://127.0.0.1:${c5p.httpPort}/printGcode`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serialNumber: c5p.serial,
          checkCode: 'E2E-CODE-C5P',
          fileName: 'e2e-creator5.3mf',
        }),
      });
      assert.equal(((await missingLeveling.json()) as { code: number }).code, -1);

      // /__reset to clear the heating status from the temperature tests, then
      // re-upload (reset wipes files) and start the job for real.
      const resetResponse = await fetch(`http://127.0.0.1:${c5p.httpPort}/__reset`, {
        method: 'POST',
      });
      assert.equal(((await resetResponse.json()) as { ok: boolean }).ok, true);

      const formDataAfterReset = new FormData();
      formDataAfterReset.set(
        'gcodeFile',
        new Blob([';E2E C5 TEST\nG28\nM84\n']),
        'e2e-creator5.3mf'
      );
      const reupload = await fetch(`http://127.0.0.1:${c5p.httpPort}/uploadGcode`, {
        method: 'POST',
        headers: {
          serialNumber: c5p.serial,
          checkCode: 'E2E-CODE-C5P',
          printNow: 'false',
          levelingBeforePrint: 'true',
        },
        body: formDataAfterReset,
      });
      assert.equal(((await reupload.json()) as { code: number }).code, 0);

      // --- printGcode: material slot IDs are 1-based on the wire ---
      // The Creator 5 maps materials at print-start rather than at upload, so this is
      // where a client's 0-based slot index has to be caught for this family.
      const c5pReady = c5p;
      async function startWithMappings(
        materialMappings: Array<Record<string, unknown>>
      ): Promise<{ code: number; message: string; detail?: string }> {
        const response = await fetch(`http://127.0.0.1:${c5pReady.httpPort}/printGcode`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            serialNumber: c5pReady.serial,
            checkCode: 'E2E-CODE-C5P',
            fileName: 'e2e-creator5.3mf',
            levelingBeforePrint: true,
            materialMappings,
          }),
        });
        return (await response.json()) as { code: number; message: string; detail?: string };
      }

      const c5SlotZero = await startWithMappings([
        {
          toolId: 0,
          slotId: 0,
          materialName: 'PLA',
          toolMaterialColor: '#4CAAF8',
          slotMaterialColor: '#4CAAF8',
        },
      ]);
      assert.equal(c5SlotZero.code, -1, 'slotId 0 must be rejected');
      assert.equal(c5SlotZero.message, 'Parameter is error.');
      assert.match(String(c5SlotZero.detail), /slotId must be 1-4/);

      // The Creator 5 is a 4-head tool changer, so toolId stays 0-based over 0..3.
      const c5ToolFour = await startWithMappings([
        {
          toolId: 4,
          slotId: 1,
          materialName: 'PLA',
          toolMaterialColor: '#4CAAF8',
          slotMaterialColor: '#4CAAF8',
        },
      ]);
      assert.equal(c5ToolFour.code, -1, 'toolId 4 must be rejected on a 4-tool head');

      const c5DuplicateSlot = await startWithMappings([
        {
          toolId: 0,
          slotId: 2,
          materialName: 'PLA',
          toolMaterialColor: '#4CAAF8',
          slotMaterialColor: '#4CAAF8',
        },
        {
          toolId: 1,
          slotId: 2,
          materialName: 'PLA',
          toolMaterialColor: '#4CAAF8',
          slotMaterialColor: '#4CAAF8',
        },
      ]);
      assert.equal(c5DuplicateSlot.code, -1, 'duplicate slotId must be rejected');
      assert.match(String(c5DuplicateSlot.detail), /Duplicate slotId/);

      // A rejected mapping must not have started anything.
      detail = await fetchDetail(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P');
      assert.equal(detail.printFileName, '', 'rejected mappings must not start a job');

      const printResponse = await fetch(`http://127.0.0.1:${c5p.httpPort}/printGcode`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serialNumber: c5p.serial,
          checkCode: 'E2E-CODE-C5P',
          fileName: 'e2e-creator5.3mf',
          levelingBeforePrint: true,
          materialMappings: [
            {
              toolId: 0,
              slotId: 1,
              materialName: 'PLA',
              toolMaterialColor: '#4CAAF8',
              slotMaterialColor: '#4CAAF8',
            },
          ],
        }),
      });
      assert.equal(((await printResponse.json()) as { code: number }).code, 0);

      detail = await fetchDetail(c5p.httpPort, c5p.serial, 'E2E-CODE-C5P');
      assert.equal(detail.printFileName, 'e2e-creator5.3mf');
      assert.match(String(detail.printFileThumbUrl), /\/getThum$/);
      assert.deepEqual(detail.nozzleTargetTemps, [220, 0, 0, 0], 'tool 0 seeded for the job');

      // --- GET /getThum: unauthenticated PNG ---
      const thumbResponse = await fetch(`http://127.0.0.1:${c5p.httpPort}/getThum`);
      assert.equal(thumbResponse.status, 200);
      assert.equal(thumbResponse.headers.get('content-type'), 'image/png');

      // --- /deleteGcode: not a route on the Creator 5 series ---
      const deleteResponse = await fetch(`http://127.0.0.1:${c5p.httpPort}/deleteGcode`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serialNumber: c5p.serial,
          checkCode: 'E2E-CODE-C5P',
          fileName: 'e2e-creator5.3mf',
        }),
      });
      assert.equal(deleteResponse.status, 404);

      // --- discovery: modern 276-byte packet with a Creator 5 series pid ---
      const discoverySourcePort = await getFreePortExcluding([18007]);
      const discoveryResponse = await probeDiscoveryReply({
        sourcePort: discoverySourcePort,
        targetPort: 48899,
      });
      assert.equal(discoveryResponse.bytes, 276);
      const parsedPid = discoveryResponse.packet.readUInt16BE(0x88);
      assert.ok(
        parsedPid === 0x0028 || parsedPid === 0x0029,
        `expected a Creator 5 series pid, got 0x${parsedPid.toString(16)}`
      );
      assert.equal(discoveryResponse.packet.readUInt16BE(0x86), 0x2b71);
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

test(
  'legacy discovery response uses ff-api-compatible 140-byte layout for Adventurer 4',
  { timeout: TEST_TIMEOUT_MS, concurrency: false },
  async () => {
    const tcpPort = await getFreePort();
    const httpPort = await getFreePort();
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'ff-emulator-legacy-discovery-'));
    const configPath = path.join(tempDir, 'instances.json');

    const config = {
      instances: [
        {
          instanceId: 'legacy-a4',
          model: 'adventurer-4',
          serial: 'E2E-SN-LEGACY-A4',
          checkCode: 'E2E-CODE-LEGACY-A4',
          machineName: 'Adventurer 4 E2E',
          tcpPort,
          httpPort,
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
    let expectingReadyJson = false;
    const stdoutReader = readline.createInterface({ input: supervisor.stdout });
    stdoutReader.on('line', (line: string) => {
      if (expectingReadyJson) {
        expectingReadyJson = false;
        const payload = JSON.parse(line) as ReadyPayload;
        readyByInstance.set(payload.instanceId, payload);
        return;
      }

      if (line.trim() === 'EMULATOR_READY') {
        expectingReadyJson = true;
      }
    });

    try {
      const startupDeadline = Date.now() + 20_000;
      while (readyByInstance.size < 1 && Date.now() < startupDeadline) {
        if (supervisor.exitCode !== null) {
          break;
        }
        await wait(100);
      }

      const ready = readyByInstance.get('legacy-a4');
      assert.ok(ready, 'Expected legacy-a4 readiness payload');
      await waitForHealthReady(ready.httpPort, 10_000);

      const sourcePort = await getFreePortExcluding([18007]);
      const discoveryResponse = await probeDiscoveryReply({
        sourcePort,
        targetPort: 8899,
      });

      assert.equal(discoveryResponse.bytes, 140);
      assert.equal(discoveryResponse.fromPort, 8899);

      const packet = discoveryResponse.packet;
      const machineName = packet.toString('utf8', 0x00, 0x80).replace(/\0.*$/, '');
      const parsedCommandPort = packet.readUInt16BE(0x84);
      const parsedVid = packet.readUInt16BE(0x86);
      const parsedPid = packet.readUInt16BE(0x88);
      const parsedStatus = packet.readUInt16BE(0x8a);

      assert.equal(machineName, 'Adventurer 4 E2E');
      assert.equal(parsedCommandPort, ready.tcpPort);
      assert.equal(parsedVid, 0x2b71);
      assert.equal(parsedPid, 0x001e);
      assert.equal(parsedStatus, 0);
    } finally {
      if (supervisor.exitCode === null) {
        supervisor.kill('SIGTERM');
      }
      await waitForSupervisorExit(supervisor);
      stdoutReader.close();
    }
  }
);

test(
  'AD5X /uploadGcode rejects off-by-one material slot IDs',
  { timeout: TEST_TIMEOUT_MS, concurrency: false },
  async () => {
    const tcpPort = await getFreePort();
    const httpPort = await getFreePort();
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'ff-emulator-slot-base-'));
    const configPath = path.join(tempDir, 'instances.json');

    const config = {
      instances: [
        {
          instanceId: 'slot-base-ad5x',
          model: 'adventurer-5x',
          serial: 'E2E-SN-SLOTBASE',
          checkCode: 'E2E-CODE-SLOTBASE',
          machineName: 'AD5X Slot Base E2E',
          tcpPort,
          httpPort,
          discoveryEnabled: false,
          simulationMode: 'manual',
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
    let expectingReadyJson = false;
    const stdoutReader = readline.createInterface({ input: supervisor.stdout });
    stdoutReader.on('line', (line: string) => {
      if (expectingReadyJson) {
        expectingReadyJson = false;
        const payload = JSON.parse(line) as ReadyPayload;
        readyByInstance.set(payload.instanceId, payload);
        return;
      }

      if (line.trim() === 'EMULATOR_READY') {
        expectingReadyJson = true;
      }
    });

    interface SlotBaseMapping {
      toolId: number;
      slotId: number;
      materialName: string;
      toolMaterialColor: string;
      slotMaterialColor: string;
    }

    async function uploadWith(
      port: number,
      serial: string,
      fileName: string,
      mappings: SlotBaseMapping[] | null
    ): Promise<{ code: number; message: string; detail?: string }> {
      const formData = new FormData();
      formData.set('gcodeFile', new Blob([';E2E SLOT BASE\nG28\nM84\n']), fileName);

      const headers: Record<string, string> = {
        serialNumber: serial,
        checkCode: 'E2E-CODE-SLOTBASE',
        printNow: 'false',
        levelingBeforePrint: 'false',
        useMatlStation: 'true',
        gcodeToolCnt: String(mappings?.length ?? 2),
      };
      if (mappings) {
        headers['materialMappings'] = Buffer.from(JSON.stringify(mappings), 'utf-8').toString(
          'base64'
        );
      }

      const response = await fetch(`http://127.0.0.1:${port}/uploadGcode`, {
        method: 'POST',
        headers,
        body: formData,
      });
      assert.equal(response.status, 200);
      return (await response.json()) as { code: number; message: string; detail?: string };
    }

    const mapping = (toolId: number, slotId: number, materialName = 'PLA'): SlotBaseMapping => ({
      toolId,
      slotId,
      materialName,
      toolMaterialColor: '#4DA3FF',
      slotMaterialColor: '#4DA3FF',
    });

    try {
      const startupDeadline = Date.now() + 20_000;
      while (readyByInstance.size < 1 && Date.now() < startupDeadline) {
        if (supervisor.exitCode !== null) {
          break;
        }
        await wait(100);
      }

      const ready = readyByInstance.get('slot-base-ad5x');
      assert.ok(ready, 'Expected slot-base-ad5x readiness payload');
      await waitForHealthReady(ready.httpPort, 10_000);

      // Slots are 1-based on the wire. A client that forgot to convert its 0-based
      // UI index sends slotId 0, and that has to fail here the way it fails on
      // hardware — otherwise the emulator hides the bug.
      const slotZero = await uploadWith(ready.httpPort, ready.serial, 'slot-zero.3mf', [
        mapping(0, 0),
        mapping(1, 1),
      ]);
      assert.notEqual(slotZero.code, 0, 'slotId 0 must be rejected');
      assert.match(String(slotZero.detail), /slotId must be 1-4/);

      const slotAbove = await uploadWith(ready.httpPort, ready.serial, 'slot-five.3mf', [
        mapping(0, 5),
      ]);
      assert.notEqual(slotAbove.code, 0, 'slotId above the station slot count must be rejected');

      // Tools stay 0-based: the AD5X has 2, so toolId 2 is out of range.
      const toolAbove = await uploadWith(ready.httpPort, ready.serial, 'tool-two.3mf', [
        mapping(2, 1),
      ]);
      assert.notEqual(toolAbove.code, 0, 'toolId beyond the tool count must be rejected');

      const duplicateSlot = await uploadWith(ready.httpPort, ready.serial, 'dupe.3mf', [
        mapping(0, 1),
        mapping(1, 1),
      ]);
      assert.notEqual(duplicateSlot.code, 0, 'duplicate slotId must be rejected');
      assert.match(String(duplicateSlot.detail), /Duplicate slotId/);

      const valid = await uploadWith(ready.httpPort, ready.serial, 'valid.3mf', [
        mapping(0, 1),
        mapping(1, 2, 'PETG'),
      ]);
      assert.equal(valid.code, 0, valid.message);

      const listing = await fetchGcodeList({
        httpPort: ready.httpPort,
        serial: ready.serial,
        checkCode: 'E2E-CODE-SLOTBASE',
      });
      const validEntry = listing.gcodeListDetail?.find((e) => e.gcodeFileName === 'valid.3mf');
      assert.ok(validEntry, 'Expected the accepted upload in gcodeListDetail');
      assert.deepEqual(
        validEntry.gcodeToolDatas?.map((tool) => tool.slotId),
        [1, 2],
        'accepted mappings round-trip as 1-based slot IDs'
      );

      // With no mappings supplied the emulator synthesizes tool data; on a material
      // station printer those synthesized slot IDs must be 1-based too.
      const synthesized = await uploadWith(ready.httpPort, ready.serial, 'nomap.3mf', null);
      assert.equal(synthesized.code, 0, synthesized.message);

      const listingAfter = await fetchGcodeList({
        httpPort: ready.httpPort,
        serial: ready.serial,
        checkCode: 'E2E-CODE-SLOTBASE',
      });
      const synthEntry = listingAfter.gcodeListDetail?.find((e) => e.gcodeFileName === 'nomap.3mf');
      assert.ok(synthEntry, 'Expected the mapping-less upload in gcodeListDetail');
      assert.deepEqual(
        synthEntry.gcodeToolDatas?.map((tool) => tool.slotId),
        [1, 2],
        'synthesized tool data is 1-based on a material station printer'
      );
    } finally {
      if (supervisor.exitCode === null) {
        supervisor.kill('SIGTERM');
      }
      await waitForSupervisorExit(supervisor);
      stdoutReader.close();
    }
  }
);
