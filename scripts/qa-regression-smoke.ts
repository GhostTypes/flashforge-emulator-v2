import assert from 'node:assert/strict';
import net from 'node:net';
import { destroyHttpServer, getHttpServer } from '../electron/main/services/HttpServer';
import { destroyTcpServer, getTcpServer } from '../electron/main/services/TcpServer';
import { printerStateStore } from '../electron/main/state/PrinterStateStore';
import { type HttpDetailPayload, serializeHttpDetail } from '../shared/serializers/httpDetail';
import {
  type PrintJobStatus,
  type PrinterFile,
  type PrinterScenario,
  canStartNewPrint,
  mapMachineStatusToHttpDetailStatus,
} from '../shared/types/printer';

const MODEL = 'adventurer-5m-pro' as const;
const HTTP_PORT = 18998;
const TCP_PORT = 18999;
const TEST_FILE = 'qa-smoke.gcode';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  detail?: T;
}

let assertionCount = 0;
const completedChecks: string[] = [];

function record(label: string): void {
  completedChecks.push(label);
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  assertionCount += 1;
  assert.strictEqual(actual, expected, label);
  record(label);
}

function expectDeepEqual<T>(actual: T, expected: T, label: string): void {
  assertionCount += 1;
  assert.deepStrictEqual(actual, expected, label);
  record(label);
}

function expectTruthy(value: unknown, label: string): void {
  assertionCount += 1;
  assert.ok(value, label);
  record(label);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildTestFile(): PrinterFile {
  return {
    name: TEST_FILE,
    path: `/data/${TEST_FILE}`,
    size: 2_400_000,
    printTime: 900,
    is3mf: false,
    gcodeToolCnt: 1,
    gcodeToolDatas: [],
    useMatlStation: false,
    totalFilamentWeight: 42,
    thumbnail: '',
  };
}

function buildAuthBody(): { serialNumber: string; checkCode: string } {
  const { serialNumber, checkCode } = printerStateStore.state;
  return { serialNumber, checkCode };
}

async function postJson<T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const response = await fetch(`http://127.0.0.1:${HTTP_PORT}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  assert.strictEqual(response.status, 200, `POST ${path} should return HTTP 200`);
  return (await response.json()) as ApiResponse<T>;
}

async function fetchDetail(label: string): Promise<HttpDetailPayload> {
  const response = await postJson<HttpDetailPayload>('/detail', buildAuthBody());
  expectEqual(response.code, 0, `${label}: POST /detail succeeds`);
  expectTruthy(response.detail, `${label}: POST /detail returns a detail payload`);
  return response.detail as HttpDetailPayload;
}

async function assertDetailMatchesState(label: string): Promise<HttpDetailPayload> {
  const detail = await fetchDetail(label);
  expectDeepEqual(
    detail,
    serializeHttpDetail(printerStateStore.state),
    `${label}: /detail matches the shared serializer`
  );
  expectEqual(
    detail.status,
    mapMachineStatusToHttpDetailStatus(printerStateStore.state.machineStatus),
    `${label}: /detail status follows the shared mapping`
  );
  return detail;
}

async function clearToReady(label: string): Promise<void> {
  const response = await postJson('/control', {
    ...buildAuthBody(),
    payload: {
      cmd: 'stateCtrl_cmd',
      args: {
        action: 'setClearPlatform',
      },
    },
  });

  expectEqual(response.code, 0, `${label}: clear-to-ready control succeeds`);
}

async function requestPrintOverHttp(label: string): Promise<ApiResponse> {
  const response = await postJson('/printGcode', {
    ...buildAuthBody(),
    fileName: TEST_FILE,
  });
  record(`${label}: POST /printGcode responded`);
  return response;
}

async function startHttpServer(): Promise<void> {
  const server = getHttpServer(HTTP_PORT, MODEL);
  if (server.running) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const handleStarted = () => {
      cleanup();
      resolve();
    };
    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      server.off('started', handleStarted);
      server.off('error', handleError);
    };

    server.on('started', handleStarted);
    server.on('error', handleError);
    server.start();
  });
}

async function startTcpServer(): Promise<void> {
  const server = getTcpServer(TCP_PORT, MODEL);
  if (server.running) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const handleStarted = () => {
      cleanup();
      resolve();
    };
    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      server.off('started', handleStarted);
      server.off('error', handleError);
    };

    server.on('started', handleStarted);
    server.on('error', handleError);
    server.start();
  });
}

async function connectTcp(): Promise<net.Socket> {
  return await new Promise((resolve, reject) => {
    const socket = net.createConnection({
      host: '127.0.0.1',
      port: TCP_PORT,
    });

    const handleError = (error: Error) => {
      socket.destroy();
      reject(error);
    };

    socket.once('error', handleError);
    socket.once('connect', () => {
      socket.off('error', handleError);
      resolve(socket);
    });
  });
}

async function sendTcpCommand(socket: net.Socket, command: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    let output = '';
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(output);
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    const scheduleFinish = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(finish, 250);
    };

    const handleData = (chunk: Buffer) => {
      output += chunk.toString('utf-8');
      scheduleFinish();
    };
    const handleError = (error: Error) => {
      fail(error);
    };
    const handleClose = () => {
      finish();
    };
    const cleanup = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      socket.off('data', handleData);
      socket.off('error', handleError);
      socket.off('close', handleClose);
    };

    socket.on('data', handleData);
    socket.on('error', handleError);
    socket.on('close', handleClose);

    socket.write(`${command}\n`);
    scheduleFinish();
  });
}

async function requestPrintOverTcp(label: string): Promise<string> {
  const socket = await connectTcp();

  try {
    const controlResponse = await sendTcpCommand(socket, 'M601');
    expectTruthy(
      controlResponse.includes('Control Success V2.1.'),
      `${label}: TCP control succeeds`
    );

    const printResponse = await sendTcpCommand(socket, `M23 0:/data/${TEST_FILE}`);
    record(`${label}: M23 returned a response`);

    if (!socket.destroyed) {
      await sendTcpCommand(socket, 'M602');
    }

    return printResponse;
  } finally {
    if (!socket.destroyed) {
      socket.end();
      socket.destroy();
    }
  }
}

function createStatusScenario(status: PrintJobStatus): PrinterScenario {
  const hasVisibleJob = status !== 'idle' && status !== 'ready';
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';
  const isError = status === 'error';

  return {
    machineStatus: status,
    printJobStatus: status === 'ready' ? 'idle' : status,
    fileName: hasVisibleJob ? TEST_FILE : null,
    progressPercent: isCompleted ? 100 : hasVisibleJob ? 42 : 0,
    currentLayer: isCompleted ? 120 : hasVisibleJob ? 42 : 0,
    totalLayers: hasVisibleJob ? 120 : 0,
    elapsedTimeSeconds: isCompleted ? 3600 : hasVisibleJob ? 1800 : 0,
    remainingTimeMinutes: isCompleted || isCancelled ? 0 : hasVisibleJob ? 30 : 0,
    totalPrintTimeSeconds: hasVisibleJob ? 3600 : 0,
    formattedEta: isCompleted ? '00:00' : isCancelled ? '' : hasVisibleJob ? '00:30' : '',
    errorCode: isError ? 'QA_SMOKE_ERROR' : '',
    temperatures: {
      nozzleCurrent: hasVisibleJob ? 205 : 25,
      nozzleTarget: isCompleted || isCancelled ? 0 : hasVisibleJob ? 220 : 0,
      leftNozzleCurrent: 0,
      leftNozzleTarget: 0,
      bedCurrent: hasVisibleJob ? 60 : 25,
      bedTarget: isCompleted || isCancelled ? 0 : hasVisibleJob ? 60 : 0,
      chamberCurrent: hasVisibleJob ? 32 : 25,
      chamberTarget: isCompleted || isCancelled ? 0 : hasVisibleJob ? 35 : 0,
    },
  };
}

async function run(): Promise<void> {
  destroyHttpServer();
  destroyTcpServer();
  await wait(50);

  printerStateStore.initialize(MODEL);
  printerStateStore.updateConfig({
    httpPort: HTTP_PORT,
    tcpPort: TCP_PORT,
  });
  printerStateStore.clearFiles();
  printerStateStore.addFile(buildTestFile());

  await startHttpServer();
  await startTcpServer();

  expectEqual(
    canStartNewPrint('idle'),
    true,
    'Only idle and ready are allowed to start new jobs: idle'
  );
  expectEqual(
    canStartNewPrint('ready'),
    true,
    'Only idle and ready are allowed to start new jobs: ready'
  );
  expectEqual(
    canStartNewPrint('completed'),
    false,
    'Sticky terminal state blocks new jobs: completed'
  );
  expectEqual(
    canStartNewPrint('cancelled'),
    false,
    'Sticky terminal state blocks new jobs: cancelled'
  );
  expectEqual(canStartNewPrint('error'), false, 'Sticky terminal state blocks new jobs: error');

  const mappedStatuses: readonly PrintJobStatus[] = [
    'idle',
    'ready',
    'heating',
    'printing',
    'paused',
    'pausing',
    'completed',
    'cancelled',
    'error',
  ];

  for (const status of mappedStatuses) {
    printerStateStore.applyScenario(createStatusScenario(status));
    const detail = await assertDetailMatchesState(`status ${status}`);
    expectEqual(
      detail.status,
      mapMachineStatusToHttpDetailStatus(status),
      `status ${status}: /detail emits the mapped HTTP status`
    );
  }

  printerStateStore.applyScenario({
    machineStatus: 'printing',
    printJobStatus: 'printing',
    fileName: TEST_FILE,
    progressPercent: 61,
    currentLayer: 61,
    totalLayers: 100,
    elapsedTimeSeconds: 3661,
    remainingTimeMinutes: 17,
    totalPrintTimeSeconds: 4681,
    formattedEta: '04:48',
  });
  const etaDetail = await assertDetailMatchesState('formatted ETA scenario');
  expectEqual(etaDetail.printDuration, 3661, 'printDuration stays in seconds');
  expectEqual(
    etaDetail.estimatedTime,
    4681,
    'estimatedTime stays equal to elapsedTimeSeconds + remainingTimeMinutes * 60'
  );
  expectEqual(etaDetail.printEta, '04:48', 'Firmware ETA string is passed through unchanged');
  expectEqual(
    etaDetail.formattedEta,
    '04:48',
    'formattedEta mirrors the firmware ETA string in /detail'
  );

  printerStateStore.applyScenario({
    machineStatus: 'printing',
    printJobStatus: 'printing',
    fileName: TEST_FILE,
    progressPercent: 61,
    currentLayer: 61,
    totalLayers: 100,
    elapsedTimeSeconds: 3661,
    remainingTimeMinutes: 17,
    totalPrintTimeSeconds: 4681,
    formattedEta: '',
  });
  const blankEtaDetail = await assertDetailMatchesState('blank ETA scenario');
  expectEqual(blankEtaDetail.printEta, '', 'Blank firmware ETA remains blank in /detail');
  expectEqual(blankEtaDetail.formattedEta, '', 'Blank formattedEta remains blank in /detail');
  expectEqual(blankEtaDetail.estimatedTime, 4681, 'Blank ETA does not change estimatedTime');

  for (const status of ['cancelled', 'error'] as const) {
    printerStateStore.applyScenario(createStatusScenario(status));
    expectEqual(
      printerStateStore.startPrint(TEST_FILE, 900),
      false,
      `${status}: state store blocks new prints until clear`
    );

    const httpBlocked = await requestPrintOverHttp(`${status} sticky block`);
    expectEqual(httpBlocked.code, 5, `${status}: HTTP /printGcode returns Busy`);
    expectEqual(
      httpBlocked.message,
      'Clear to ready before starting a new job',
      `${status}: HTTP /printGcode requires clear-to-ready`
    );

    const tcpBlocked = await requestPrintOverTcp(`${status} sticky block`);
    expectTruthy(
      tcpBlocked.includes('Error: Clear to ready before starting a new job'),
      `${status}: TCP M23 requires clear-to-ready`
    );

    await clearToReady(`${status} sticky block`);
    const clearedDetail = await assertDetailMatchesState(`${status} cleared`);
    expectEqual(
      clearedDetail.status,
      'ready',
      `${status}: clear-to-ready returns /detail to ready`
    );
  }

  printerStateStore.clearCompletedState();
  expectEqual(
    printerStateStore.startPrint(TEST_FILE, 900),
    true,
    'PrinterStateStore can start a new job from ready'
  );
  printerStateStore.completePrint();

  const completedDetail = await assertDetailMatchesState('completed lifecycle');
  expectEqual(completedDetail.status, 'completed', 'Completed remains observable on /detail');
  expectEqual(
    printerStateStore.startPrint(TEST_FILE, 900),
    false,
    'Completed blocks a new state-store start until cleared'
  );

  const completedHttpBlocked = await requestPrintOverHttp('completed sticky block');
  expectEqual(completedHttpBlocked.code, 5, 'Completed: HTTP /printGcode returns Busy');
  expectEqual(
    completedHttpBlocked.message,
    'Clear to ready before starting a new job',
    'Completed: HTTP /printGcode requires clear-to-ready'
  );

  const completedTcpBlocked = await requestPrintOverTcp('completed sticky block');
  expectTruthy(
    completedTcpBlocked.includes('Error: Clear to ready before starting a new job'),
    'Completed: TCP M23 requires clear-to-ready'
  );

  await wait(200);
  const stillCompletedDetail = await fetchDetail('completed persists');
  expectEqual(
    stillCompletedDetail.status,
    'completed',
    'Completed remains visible until explicitly cleared'
  );

  await clearToReady('completed lifecycle');
  const readyAfterClear = await assertDetailMatchesState('completed cleared');
  expectEqual(readyAfterClear.status, 'ready', 'Clear-to-ready returns completed state to ready');

  const restarted = await requestPrintOverHttp('restart after clear');
  expectEqual(restarted.code, 0, 'HTTP /printGcode succeeds after clear-to-ready');

  console.log(
    JSON.stringify(
      {
        ok: true,
        assertions: assertionCount,
        checks: completedChecks.length,
        command: 'npm run smoke:qa',
      },
      null,
      2
    )
  );
}

try {
  await run();
} finally {
  destroyHttpServer();
  destroyTcpServer();
  printerStateStore.reset();
}
