import assert from 'node:assert/strict';
import test from 'node:test';
import { printerStateStore } from '../../electron/main/state/PrinterStateStore';
import { parseHeadlessInstanceArgs } from '../headless/instance-config';
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
