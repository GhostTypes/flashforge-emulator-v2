/**
 * @fileoverview
 * IPC handlers for printer state and configuration
 *
 * Exposes state store operations to the renderer process via IPC.
 * Follows Command-Query Separation - handlers either query state or mutate it.
 *
 * @packageDocumentation
 */

import { ipcMain } from 'electron';
import type {
  EmulatorConfig,
  MaterialSlotUpdate,
  NetworkInterface,
  PrinterModel,
  PrinterScenario,
  PrinterState,
  ProtocolLogEntry,
  ScenarioPreset,
} from '../../../shared/types/printer';
import { destroyHttpServer, getHttpServer } from '../services/HttpServer';
import { destroyTcpServer, getTcpServer } from '../services/TcpServer';
import { destroyUdpDiscoveryServer, getUdpDiscoveryServer } from '../services/UdpDiscoveryServer';
import { printerStateStore } from '../state/PrinterStateStore';
import { protocolLogStore } from '../state/ProtocolLogStore';
import { getAvailableNetworkInterfaces } from '../utils/NetworkInterfaces';

/**
 * Registers all state-related IPC handlers
 */
export function registerStateHandlers(): void {
  /**
   * Get application version
   */
  ipcMain.handle('get-version', () => {
    return '0.1.0';
  });

  /**
   * Get emulator configuration
   */
  ipcMain.handle('get-config', (): EmulatorConfig => {
    return printerStateStore.config;
  });

  /**
   * Set emulator configuration
   */
  ipcMain.handle('set-config', (_event, config: EmulatorConfig): void => {
    const oldInterface = printerStateStore.config.discoveryInterface;
    const newInterface = config.discoveryInterface;

    printerStateStore.updateConfig(config);

    // Restart UDP discovery server if interface changed
    if (oldInterface !== newInterface) {
      const udpDiscoveryServer = getUdpDiscoveryServer(printerStateStore.state.model);
      udpDiscoveryServer.updateBindAddress(newInterface);
    }
  });

  /**
   * Get available network interfaces
   */
  ipcMain.handle('get-network-interfaces', (): NetworkInterface[] => {
    return getAvailableNetworkInterfaces();
  });

  /**
   * Get current printer state
   */
  ipcMain.handle('get-printer-state', (): PrinterState => {
    return printerStateStore.state;
  });

  /**
   * Initialize with a specific printer model
   */
  ipcMain.handle('initialize-printer', (_event, model: PrinterModel): void => {
    printerStateStore.initialize(model);
  });

  /**
   * Reset printer state
   */
  ipcMain.handle('reset-printer', (): void => {
    printerStateStore.reset();
  });

  /**
   * Set machine status
   */
  ipcMain.handle('set-machine-status', (_event, status: string): void => {
    printerStateStore.setMachineStatus(
      status as Parameters<typeof printerStateStore.setMachineStatus>[0]
    );
  });

  /**
   * Set only the current print job status
   */
  ipcMain.handle('set-print-job-status', (_event, status: string): void => {
    printerStateStore.setPrintJobStatus(
      status as Parameters<typeof printerStateStore.setPrintJobStatus>[0]
    );
  });

  /**
   * Update temperatures
   */
  ipcMain.handle(
    'update-temperature',
    (_event, temps: Partial<typeof printerStateStore.state.temperature>): void => {
      printerStateStore.updateTemperature(temps);
    }
  );

  /**
   * Set target temperatures
   */
  ipcMain.handle(
    'set-target-temperatures',
    (_event, nozzle: number, bed: number, chamber?: number): void => {
      printerStateStore.setTargetTemperatures(nozzle, bed, chamber);
    }
  );

  /**
   * Update position
   */
  ipcMain.handle(
    'update-position',
    (_event, position: { x?: number; y?: number; z?: number; e?: number }): void => {
      printerStateStore.updatePosition(position);
    }
  );

  /**
   * Home axes
   */
  ipcMain.handle('home-axes', (_event, axes?: 'x' | 'y' | 'z' | 'all'): void => {
    printerStateStore.homeAxes(axes);
  });

  /**
   * Start print job
   */
  ipcMain.handle('start-print', (_event, filename: string, estimatedTime?: number): boolean => {
    return printerStateStore.startPrint(filename, estimatedTime);
  });

  /**
   * Pause print job
   */
  ipcMain.handle('pause-print', (): void => {
    printerStateStore.pausePrint();
  });

  /**
   * Resume print job
   */
  ipcMain.handle('resume-print', (): void => {
    printerStateStore.resumePrint();
  });

  /**
   * Cancel print job
   */
  ipcMain.handle('cancel-print', (): void => {
    printerStateStore.cancelPrint();
  });

  /**
   * Stop print job
   */
  ipcMain.handle('stop-print', (): void => {
    printerStateStore.stopPrint();
  });

  /**
   * Clear completed/cancelled/error state back to ready
   */
  ipcMain.handle('clear-completed-state', (): void => {
    printerStateStore.clearCompletedState();
  });

  /**
   * Fast-forward the active job's derived progress fields to a target percent
   */
  ipcMain.handle('jump-print-progress', (_event, percent: number): boolean => {
    return printerStateStore.jumpPrintProgress(percent);
  });

  /**
   * Update LED
   */
  ipcMain.handle('update-led', (_event, enabled: boolean): void => {
    printerStateStore.updateLed(enabled);
  });

  /**
   * Update fan
   */
  ipcMain.handle(
    'update-fan',
    (_event, settings: Partial<typeof printerStateStore.state.fan>): void => {
      printerStateStore.updateFan(settings);
    }
  );

  /**
   * Add file
   */
  ipcMain.handle(
    'add-file',
    (_event, file: Parameters<typeof printerStateStore.addFile>[0]): void => {
      printerStateStore.addFile(file);
    }
  );

  /**
   * Remove file
   */
  ipcMain.handle('remove-file', (_event, filename: string): void => {
    printerStateStore.removeFile(filename);
  });

  /**
   * Clear files
   */
  ipcMain.handle('clear-files', (): void => {
    printerStateStore.clearFiles();
  });

  /**
   * Get files
   */
  ipcMain.handle('get-files', () => {
    return printerStateStore.getFiles();
  });

  /**
   * Update material slot (AD5X)
   */
  ipcMain.handle(
    'update-material-slot',
    (_event, slotId: number, slot: MaterialSlotUpdate): void => {
      printerStateStore.updateMaterialSlot(slotId, slot);
    }
  );

  /**
   * Set current slot (AD5X)
   */
  ipcMain.handle('set-current-slot', (_event, slotId: number): void => {
    printerStateStore.setCurrentSlot(slotId);
  });

  /**
   * Set the current loading slot (AD5X)
   */
  ipcMain.handle('set-current-load-slot', (_event, slotId: number): void => {
    printerStateStore.setCurrentLoadSlot(slotId);
  });

  /**
   * Get scenario presets for the QA console
   */
  ipcMain.handle('get-scenario-presets', (): readonly ScenarioPreset[] => {
    return printerStateStore.getScenarioPresets();
  });

  /**
   * Apply a named scenario preset
   */
  ipcMain.handle('apply-scenario-preset', (_event, presetId: string): void => {
    printerStateStore.applyScenarioPreset(
      presetId as Parameters<typeof printerStateStore.applyScenarioPreset>[0]
    );
  });

  /**
   * Apply an explicit manual scenario/state injection
   */
  ipcMain.handle('apply-scenario', (_event, scenario: PrinterScenario): void => {
    printerStateStore.applyScenario(scenario);
  });

  /**
   * Export the current state as a scenario snapshot
   */
  ipcMain.handle('get-scenario-snapshot', (): PrinterScenario => {
    return printerStateStore.createScenarioSnapshot();
  });

  /**
   * Start TCP server
   */
  ipcMain.handle('start-tcp-server', (): void => {
    const config = printerStateStore.config;
    const tcpServer = getTcpServer(config.tcpPort, printerStateStore.state.model);
    tcpServer.start();
    protocolLogStore.add({
      protocol: 'system',
      direction: 'internal',
      level: 'info',
      summary: `TCP server started on ${config.tcpPort}`,
    });
  });

  /**
   * Stop TCP server
   */
  ipcMain.handle('stop-tcp-server', (): void => {
    destroyTcpServer();
    protocolLogStore.add({
      protocol: 'system',
      direction: 'internal',
      level: 'info',
      summary: 'TCP server stopped',
    });
  });

  /**
   * Start HTTP server
   */
  ipcMain.handle('start-http-server', (): void => {
    const config = printerStateStore.config;
    const httpServer = getHttpServer(config.httpPort, printerStateStore.state.model);
    httpServer.start();
    protocolLogStore.add({
      protocol: 'system',
      direction: 'internal',
      level: 'info',
      summary: `HTTP server started on ${config.httpPort}`,
    });
  });

  /**
   * Stop HTTP server
   */
  ipcMain.handle('stop-http-server', (): void => {
    destroyHttpServer();
    protocolLogStore.add({
      protocol: 'system',
      direction: 'internal',
      level: 'info',
      summary: 'HTTP server stopped',
    });
  });

  /**
   * Start UDP discovery server
   */
  ipcMain.handle('start-discovery-server', (): void => {
    const udpDiscoveryServer = getUdpDiscoveryServer(printerStateStore.state.model);
    udpDiscoveryServer.start();
    protocolLogStore.add({
      protocol: 'system',
      direction: 'internal',
      level: 'info',
      summary: 'Discovery server started',
    });
  });

  /**
   * Stop UDP discovery server
   */
  ipcMain.handle('stop-discovery-server', (): void => {
    destroyUdpDiscoveryServer();
    protocolLogStore.add({
      protocol: 'system',
      direction: 'internal',
      level: 'info',
      summary: 'Discovery server stopped',
    });
  });

  /**
   * Get simulation mode
   */
  ipcMain.handle('get-simulation-mode', (): { mode: 'auto' | 'manual'; speed: number } => {
    return {
      mode: printerStateStore.simulationMode,
      speed: printerStateStore.simulationSpeed,
    };
  });

  /**
   * Set simulation mode
   */
  ipcMain.handle('set-simulation-mode', (_event, mode: 'auto' | 'manual', speed?: number): void => {
    printerStateStore.simulationMode = mode;
    if (speed !== undefined) {
      printerStateStore.simulationSpeed = speed;
    }
  });

  /**
   * Get current protocol logs
   */
  ipcMain.handle('get-protocol-logs', (): readonly ProtocolLogEntry[] => {
    return protocolLogStore.entries;
  });

  /**
   * Clear protocol logs
   */
  ipcMain.handle('clear-protocol-logs', (): void => {
    protocolLogStore.clear();
  });
}

/**
 * Sets up state change forwarding to renderer
 */
export function setupStateForwarding(mainWindow: Electron.BrowserWindow): void {
  printerStateStore.on('state-changed', (state: PrinterState) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('printer-state-update', state);
    }
  });

  printerStateStore.on(
    'temperature-changed',
    (temperature: typeof printerStateStore.state.temperature) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('temperature-update', temperature);
      }
    }
  );

  printerStateStore.on('position-changed', (position: typeof printerStateStore.state.position) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('position-update', position);
    }
  });

  printerStateStore.on('job-changed', (job: typeof printerStateStore.state.printJob) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('job-update', job);
    }
  });

  protocolLogStore.on('entry-added', (entry: ProtocolLogEntry) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('protocol-log-entry', entry);
    }
  });

  protocolLogStore.on('cleared', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('protocol-log-cleared');
    }
  });

  // Forward UDP discovery server events to renderer
  const udpDiscoveryServer = getUdpDiscoveryServer(printerStateStore.state.model);
  udpDiscoveryServer.on(
    'discovery-request',
    (data: { remoteAddress: string; remotePort: number }) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('discovery-request', data);
      }
    }
  );

  udpDiscoveryServer.on(
    'discovery-response',
    (data: { remoteAddress: string; printerName: string; serialNumber: string }) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('discovery-response', data);
      }
    }
  );

  udpDiscoveryServer.on('send-error', (data: { remoteAddress: string; error: Error }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('discovery-error', data);
    }
  });
}
