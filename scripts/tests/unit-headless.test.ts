import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { printerStateStore } from '../../electron/main/state/PrinterStateStore';
import { parseHeadlessInstanceArgs } from '../headless/instance-config';
import {
  type InstanceRegistryEntry,
  isPidAlive,
  loadInstanceRegistry,
  pruneStaleInstances,
  registerInstance,
  unregisterInstance,
} from '../headless/instance-registry';
import { validateSupervisorInstances } from '../headless/supervisor-config';

test('parseHeadlessInstanceArgs parses required options and defaults discovery to true', () => {
  const parsed = parseHeadlessInstanceArgs([
    '--instance-id',
    'printer-a',
    '--model',
    'adventurer-5m-pro',
    '--serial',
    'SN-A',
    '--check-code',
    'CODE-A',
    '--machine-name',
    'QA Printer A',
    '--tcp-port',
    '19001',
    '--http-port',
    '19002',
    '--simulation-mode',
    'auto',
    '--simulation-speed',
    '150',
  ]);

  assert.equal(parsed.instanceId, 'printer-a');
  assert.equal(parsed.discoveryEnabled, true);
  assert.equal(parsed.simulationMode, 'auto');
  assert.equal(parsed.simulationSpeed, 150);
  assert.equal(parsed.tcpPort, 19001);
  assert.equal(parsed.httpPort, 19002);
});

test('parseHeadlessInstanceArgs rejects missing required args', () => {
  assert.throws(
    () =>
      parseHeadlessInstanceArgs([
        '--instance-id',
        'printer-a',
        '--model',
        'adventurer-5m-pro',
        '--serial',
        'SN-A',
        '--check-code',
        'CODE-A',
        '--machine-name',
        'QA Printer A',
        '--tcp-port',
        '19001',
        '--http-port',
        '19002',
        '--simulation-mode',
        'auto',
      ]),
    /simulation-speed/i
  );
});

test('parseHeadlessInstanceArgs supports --discovery-enabled false', () => {
  const parsed = parseHeadlessInstanceArgs([
    '--instance-id',
    'printer-a',
    '--model',
    'adventurer-5m-pro',
    '--serial',
    'SN-A',
    '--check-code',
    'CODE-A',
    '--machine-name',
    'QA Printer A',
    '--tcp-port',
    '19001',
    '--http-port',
    '19002',
    '--discovery-enabled',
    'false',
    '--simulation-mode',
    'manual',
    '--simulation-speed',
    '10',
  ]);

  assert.equal(parsed.discoveryEnabled, false);
  assert.equal(parsed.simulationMode, 'manual');
});

test('validateSupervisorInstances applies defaults for optional fields', () => {
  const validated = validateSupervisorInstances([
    {
      instanceId: 'one',
      model: 'adventurer-5m-pro',
      serial: 'SN-ONE',
      checkCode: 'CC-ONE',
      machineName: 'One',
      tcpPort: 19101,
      httpPort: 19102,
    },
  ]);

  assert.equal(validated.length, 1);
  assert.equal(validated[0]?.discoveryEnabled, true);
  assert.equal(validated[0]?.simulationMode, 'auto');
  assert.equal(validated[0]?.simulationSpeed, 100);
});

test('validateSupervisorInstances rejects duplicate serials', () => {
  assert.throws(
    () =>
      validateSupervisorInstances([
        {
          instanceId: 'one',
          model: 'adventurer-5m-pro',
          serial: 'SN-DUP',
          checkCode: 'CC-ONE',
          machineName: 'One',
          tcpPort: 19201,
          httpPort: 19202,
        },
        {
          instanceId: 'two',
          model: 'adventurer-5m-pro',
          serial: 'SN-DUP',
          checkCode: 'CC-TWO',
          machineName: 'Two',
          tcpPort: 19301,
          httpPort: 19302,
        },
      ]),
    /duplicate serial/i
  );
});

test('validateSupervisorInstances rejects cross-instance port collisions', () => {
  assert.throws(
    () =>
      validateSupervisorInstances([
        {
          instanceId: 'one',
          model: 'adventurer-5m-pro',
          serial: 'SN-ONE',
          checkCode: 'CC-ONE',
          machineName: 'One',
          tcpPort: 19401,
          httpPort: 19402,
        },
        {
          instanceId: 'two',
          model: 'adventurer-5m-pro',
          serial: 'SN-TWO',
          checkCode: 'CC-TWO',
          machineName: 'Two',
          tcpPort: 19402,
          httpPort: 19403,
        },
      ]),
    /port collision/i
  );
});

test('parseHeadlessInstanceArgs accepts the Creator 5 series models', () => {
  for (const model of ['creator-5', 'creator-5-pro']) {
    const parsed = parseHeadlessInstanceArgs([
      '--instance-id',
      'printer-c5',
      '--model',
      model,
      '--serial',
      'SN-C5',
      '--check-code',
      'CODE-C5',
      '--machine-name',
      'Creator 5 E2E',
      '--tcp-port',
      '19501',
      '--http-port',
      '19502',
      '--simulation-mode',
      'auto',
      '--simulation-speed',
      '100',
    ]);

    assert.equal(parsed.model, model);
  }
});

test('PrinterStateStore syncs discovery command/http ports with runtime ports', () => {
  printerStateStore.initialize('adventurer-5m-pro');

  printerStateStore.updateConfig({
    tcpPort: 19601,
    httpPort: 19602,
    discoveryConfig: {
      commandPort: 10,
      httpPort: 11,
      machineName: 'Synced',
      legacyPort2: 8,
      pid: 0x24,
      productType: 0x5a02,
      status: 0,
      vid: 0x2b71,
    },
  });

  assert.equal(printerStateStore.config.discoveryConfig.commandPort, 19601);
  assert.equal(printerStateStore.config.discoveryConfig.httpPort, 19602);
});

test('jumpPrintProgress recomputes derived job fields with explicit time units', () => {
  printerStateStore.initialize('adventurer-5m-pro');
  printerStateStore.applyScenario({
    machineStatus: 'printing',
    printJobStatus: 'printing',
    fileName: 'jump-unit.gcode',
    progressPercent: 0,
    currentLayer: 0,
    totalLayers: 200,
    elapsedTimeSeconds: 0,
    remainingTimeMinutes: 60,
    totalPrintTimeSeconds: 3600,
    formattedEta: '01:00',
  });

  assert.equal(printerStateStore.jumpPrintProgress(75), true);
  const job = printerStateStore.state.printJob;
  assert.equal(job.progress, 0.75);
  assert.equal(job.status, 'printing', 'jump must not change the job status');
  assert.equal(job.elapsedTimeSeconds, 2700, 'elapsed stays in seconds');
  assert.equal(job.remainingTimeMinutes, 15, 'remaining stays in minutes');
  assert.equal(job.formattedEta, '00:15', 'ETA keeps the firmware HH:MM format');
  assert.equal(job.currentLayer, 150, 'layer is derived from totalLayers');
  assert.equal(printerStateStore.state.position.z, (150 / 200) * 220);
});

test('jumpPrintProgress completes at 100 percent and respects sticky terminal states', () => {
  assert.equal(printerStateStore.jumpPrintProgress(100), true);
  assert.equal(printerStateStore.state.machineStatus, 'completed');
  const job = printerStateStore.state.printJob;
  assert.equal(job.progress, 1);
  assert.equal(job.elapsedTimeSeconds, 3600);
  assert.equal(job.formattedEta, '00:00');
  assert.equal(job.currentLayer, 200);

  assert.equal(printerStateStore.jumpPrintProgress(30), false, 'completed is sticky');
  assert.equal(printerStateStore.state.machineStatus, 'completed');
  assert.equal(printerStateStore.state.printJob.progress, 1, 'a refused jump changes nothing');

  printerStateStore.clearCompletedState();
  assert.equal(printerStateStore.state.machineStatus, 'ready');
  assert.equal(
    printerStateStore.jumpPrintProgress(30),
    false,
    'no active job after clear — jump is refused'
  );
});

test('jumpPrintProgress rejects invalid percents and jobs without a duration', () => {
  printerStateStore.initialize('adventurer-5m-pro');
  assert.equal(printerStateStore.jumpPrintProgress(-1), false);
  assert.equal(printerStateStore.jumpPrintProgress(101), false);
  assert.equal(printerStateStore.jumpPrintProgress(Number.NaN), false);
  assert.equal(printerStateStore.jumpPrintProgress(50), false, 'no job — jump is refused');

  printerStateStore.applyScenario({
    machineStatus: 'printing',
    printJobStatus: 'printing',
    fileName: 'jump-noduration.gcode',
    progressPercent: 0,
    totalLayers: 10,
    totalPrintTimeSeconds: 0,
  });

  assert.equal(printerStateStore.jumpPrintProgress(50), true);
  const job = printerStateStore.state.printJob;
  assert.equal(job.elapsedTimeSeconds, 0);
  assert.equal(job.remainingTimeMinutes, 0);
  assert.equal(job.formattedEta, '', 'unknown duration keeps the ETA intentionally blank');
  assert.equal(job.currentLayer, 5, 'layer is still derived from progress');
});

function buildRegistryEntry(overrides: Partial<InstanceRegistryEntry>): InstanceRegistryEntry {
  return {
    instanceId: 'unit',
    pid: 111,
    tcpPort: 19001,
    httpPort: 19002,
    serial: 'SN-UNIT',
    model: 'adventurer-5m',
    startedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('instance registry registers, unregisters, and guards pid ownership', () => {
  const registryPath = path.join(
    mkdtempSync(path.join(os.tmpdir(), 'ff-emulator-registry-')),
    'instances.json'
  );

  registerInstance(buildRegistryEntry({ instanceId: 'a', pid: 111 }), registryPath);
  registerInstance(buildRegistryEntry({ instanceId: 'b', pid: 222 }), registryPath);
  const loaded = loadInstanceRegistry(registryPath);
  assert.equal(loaded.size, 2);
  assert.equal(loaded.get('a')?.pid, 111);
  assert.equal(loaded.get('b')?.httpPort, 19002);

  unregisterInstance('a', 999, registryPath);
  assert.ok(
    loadInstanceRegistry(registryPath).has('a'),
    'unregister with a foreign pid must not touch a restarted instance entry'
  );

  unregisterInstance('a', 111, registryPath);
  const afterUnregister = loadInstanceRegistry(registryPath);
  assert.ok(!afterUnregister.has('a'));
  assert.ok(afterUnregister.has('b'));
});

test('instance registry survives corrupt files and prunes stale pids', () => {
  const registryPath = path.join(
    mkdtempSync(path.join(os.tmpdir(), 'ff-emulator-registry-stale-')),
    'instances.json'
  );

  writeFileSync(registryPath, '{not valid json', 'utf-8');
  assert.equal(loadInstanceRegistry(registryPath).size, 0, 'corrupt registry reads as empty');

  const exited = spawnSync(process.execPath, ['-e', '']);
  const deadPid = exited.pid ?? -1;
  assert.ok(deadPid > 0);
  assert.equal(isPidAlive(deadPid), false, 'an exited pid is not alive');
  assert.equal(isPidAlive(process.pid), true, 'the current process is alive');

  registerInstance(buildRegistryEntry({ instanceId: 'stale', pid: deadPid }), registryPath);
  registerInstance(buildRegistryEntry({ instanceId: 'live', pid: process.pid }), registryPath);

  const { pruned, entries } = pruneStaleInstances(registryPath);
  assert.deepEqual(pruned, ['stale']);
  assert.deepEqual([...entries.keys()], ['live']);
  assert.ok(!loadInstanceRegistry(registryPath).has('stale'));
});
