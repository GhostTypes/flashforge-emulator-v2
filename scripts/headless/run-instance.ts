import { getUdpDiscoveryServer } from '../../electron/main/services/UdpDiscoveryServer';
import { parseHeadlessInstanceArgs } from './instance-config';
import { HeadlessEmulatorRuntime } from './runtime';

let runtime: HeadlessEmulatorRuntime | null = null;

let shuttingDown = false;

async function shutdown(exitCode: number): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  try {
    if (runtime) {
      await runtime.stop();
    }
  } finally {
    process.exit(exitCode);
  }
}

process.on('SIGINT', () => {
  void shutdown(0);
});

process.on('SIGTERM', () => {
  void shutdown(0);
});

process.on('uncaughtException', (error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  void shutdown(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(reason instanceof Error ? (reason.stack ?? reason.message) : String(reason));
  void shutdown(1);
});

try {
  const options = parseHeadlessInstanceArgs(process.argv.slice(2));
  runtime = new HeadlessEmulatorRuntime(options);

  const readinessPayload = await runtime.start();
  console.log('EMULATOR_READY');
  console.log(JSON.stringify(readinessPayload));

  if (options.discoveryEnabled) {
    const discoveryServer = getUdpDiscoveryServer(options.model);
    discoveryServer.on('discovery-response', () => {
      console.log('EMULATOR_DISCOVERY_RESPONSE');
      console.log(
        JSON.stringify({
          instanceId: options.instanceId,
          serial: options.serial,
          commandPort: options.tcpPort,
          httpPort: options.httpPort,
          model: options.model,
        })
      );
    });
  }
} catch (error) {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  await shutdown(1);
}
