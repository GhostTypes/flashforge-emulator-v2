import type { EventEmitter } from 'node:events';
import { destroyHttpServer, getHttpServer } from '../../electron/main/services/HttpServer';
import { simulationService } from '../../electron/main/services/SimulationService';
import { destroyTcpServer, getTcpServer } from '../../electron/main/services/TcpServer';
import {
  destroyUdpDiscoveryServer,
  getUdpDiscoveryServer,
} from '../../electron/main/services/UdpDiscoveryServer';
import { printerStateStore } from '../../electron/main/state/PrinterStateStore';
import { getFirstPhysicalInterface } from '../../electron/main/utils/NetworkInterfaces';
import type { HeadlessInstanceOptions } from './instance-config';

const STARTUP_TIMEOUT_MS = 10_000;

interface ReadinessPayload {
  instanceId: string;
  ip: string;
  tcpPort: number;
  httpPort: number;
  serial: string;
  model: string;
}

function waitForStartedEvent(options: {
  emitter: EventEmitter;
  label: string;
  start: () => boolean;
  isRunning: () => boolean;
  timeoutMs?: number;
}): Promise<void> {
  const { emitter, label, start, isRunning, timeoutMs = STARTUP_TIMEOUT_MS } = options;

  if (isRunning()) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      emitter.off('started', handleStarted);
      emitter.off('error', handleError);
    };

    const finish = (callback: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      callback();
    };

    const handleStarted = (): void => {
      finish(resolve);
    };

    const handleError = (error: Error): void => {
      finish(() => {
        reject(new Error(`${label} failed to start: ${error.message}`));
      });
    };

    emitter.on('started', handleStarted);
    emitter.on('error', handleError);

    timeoutId = setTimeout(() => {
      finish(() => {
        reject(new Error(`${label} did not start within ${timeoutMs}ms`));
      });
    }, timeoutMs);

    const started = start();
    if (!started) {
      finish(() => {
        reject(new Error(`${label} failed to start`));
      });
      return;
    }

    if (isRunning()) {
      finish(resolve);
    }
  });
}

export class HeadlessEmulatorRuntime {
  #options: HeadlessInstanceOptions;
  #started = false;
  #stopping = false;
  #ipAddress = '127.0.0.1';
  #startedAtMs = Date.now();

  constructor(options: HeadlessInstanceOptions) {
    this.#options = options;
  }

  async start(): Promise<ReadinessPayload> {
    if (this.#started) {
      return this.getReadinessPayload();
    }

    this.#startedAtMs = Date.now();

    destroyUdpDiscoveryServer();
    destroyTcpServer();
    destroyHttpServer();
    printerStateStore.reset();

    printerStateStore.initialize(this.#options.model);
    const currentDiscoveryConfig = printerStateStore.config.discoveryConfig;
    printerStateStore.updateConfig({
      selectedModel: this.#options.model,
      serialNumber: this.#options.serial,
      checkCode: this.#options.checkCode,
      tcpPort: this.#options.tcpPort,
      httpPort: this.#options.httpPort,
      simulationMode: this.#options.simulationMode,
      simulationSpeed: this.#options.simulationSpeed,
      discoveryConfig: {
        ...currentDiscoveryConfig,
        machineName: this.#options.machineName,
        commandPort: this.#options.tcpPort,
        httpPort: this.#options.httpPort,
      },
    });

    this.#ipAddress = this.#resolveIpAddress();
    printerStateStore.setMachineIdentity({
      serialNumber: this.#options.serial,
      checkCode: this.#options.checkCode,
      machineName: this.#options.machineName,
      ipAddress: this.#ipAddress,
    });
    printerStateStore.simulationMode = this.#options.simulationMode;
    printerStateStore.simulationSpeed = this.#options.simulationSpeed;

    const httpServer = getHttpServer(this.#options.httpPort, this.#options.model);
    httpServer.configureHealthState({
      instanceId: this.#options.instanceId,
      tcpPort: this.#options.tcpPort,
      ready: false,
      startedAtMs: this.#startedAtMs,
    });

    const tcpServer = getTcpServer(this.#options.tcpPort, this.#options.model);
    const udpServer = getUdpDiscoveryServer(this.#options.model);

    try {
      simulationService.start();

      await waitForStartedEvent({
        emitter: httpServer,
        label: 'HTTP server',
        start: () => httpServer.start(),
        isRunning: () => httpServer.running,
      });

      await waitForStartedEvent({
        emitter: tcpServer,
        label: 'TCP server',
        start: () => tcpServer.start(),
        isRunning: () => tcpServer.running,
      });

      if (this.#options.discoveryEnabled) {
        await waitForStartedEvent({
          emitter: udpServer,
          label: 'UDP discovery server',
          start: () => udpServer.start(),
          isRunning: () => udpServer.running,
        });
      } else {
        destroyUdpDiscoveryServer();
      }
    } catch (error) {
      await this.stop();
      throw error;
    }

    httpServer.configureHealthState({ ready: true });
    this.#started = true;
    return this.getReadinessPayload();
  }

  async stop(): Promise<void> {
    if (!this.#started && !this.#stopping) {
      simulationService.stop();
      destroyUdpDiscoveryServer();
      destroyTcpServer();
      destroyHttpServer();
      return;
    }
    if (this.#stopping) {
      return;
    }

    this.#stopping = true;

    try {
      const httpServer = getHttpServer(this.#options.httpPort, this.#options.model);
      httpServer.configureHealthState({ ready: false });
      simulationService.stop();
      destroyUdpDiscoveryServer();
      destroyTcpServer();
      destroyHttpServer();
      this.#started = false;
    } finally {
      this.#stopping = false;
    }
  }

  getReadinessPayload(): ReadinessPayload {
    return {
      instanceId: this.#options.instanceId,
      ip: this.#ipAddress,
      tcpPort: this.#options.tcpPort,
      httpPort: this.#options.httpPort,
      serial: this.#options.serial,
      model: this.#options.model,
    };
  }

  #resolveIpAddress(): string {
    const boundInterface = printerStateStore.config.discoveryInterface.trim();
    if (boundInterface.length > 0) {
      return boundInterface;
    }

    const firstPhysicalInterface = getFirstPhysicalInterface();
    return firstPhysicalInterface?.address ?? '127.0.0.1';
  }
}
