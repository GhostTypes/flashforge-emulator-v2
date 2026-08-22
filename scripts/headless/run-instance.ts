import { getHttpServer } from '../../electron/main/services/HttpServer';
import { getUdpDiscoveryServer } from '../../electron/main/services/UdpDiscoveryServer';
import { type HeadlessInstanceOptions, parseHeadlessInstanceArgs } from './instance-config';
import { registerInstance, unregisterInstance } from './instance-registry';
import { HeadlessEmulatorRuntime } from './runtime';

let runtime: HeadlessEmulatorRuntime | null = null;
let registeredOptions: HeadlessInstanceOptions | null = null;

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
    // Registry writes are synchronous on purpose: this runs on the process-exit
    // path, where pending async I/O can be cut off mid-flush.
    if (registeredOptions) {
      try {
        unregisterInstance(registeredOptions.instanceId, process.pid);
      } catch {
        // A failed unregister only leaves a stale entry for kill-all to prune.
      }
    }
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
  registeredOptions = options;
  runtime = new HeadlessEmulatorRuntime(options);

  const readinessPayload = await runtime.start();

  // Register only once startup fully succeeded, right where readiness is
  // announced, so the registry never advertises an instance that never bound
  // its ports. A hard kill (Windows SIGTERM emulation) skips the unregister —
  // kill-all prunes those stale entries by pid liveness.
  registerInstance({
    instanceId: options.instanceId,
    pid: process.pid,
    tcpPort: options.tcpPort,
    httpPort: options.httpPort,
    serial: options.serial,
    model: options.model,
    startedAt: new Date().toISOString(),
  });

  // POST /__shutdown reuses this exact graceful path (same as SIGTERM).
  const httpServer = getHttpServer(options.httpPort, options.model);
  httpServer.on('shutdown-requested', () => {
    void shutdown(0);
  });

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
