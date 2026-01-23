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
  PrinterModel,
  PrinterState,
} from '../../../shared/types/printer';
import { destroyHttpServer, getHttpServer } from '../services/HttpServer';
import { destroyTcpServer, getTcpServer } from '../services/TcpServer';
import { printerStateStore } from '../state/PrinterStateStore';

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
    printerStateStore.updateConfig(config);
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
  ipcMain.handle('start-print', (_event, filename: string, estimatedTime?: number): void => {
    printerStateStore.startPrint(filename, estimatedTime);
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
   * Stop print job
   */
  ipcMain.handle('stop-print', (): void => {
    printerStateStore.stopPrint();
  });

  /**
   * Update LED
   */
  ipcMain.handle(
    'update-led',
    (_event, enabled: boolean, red?: number, green?: number, blue?: number): void => {
      printerStateStore.updateLed(enabled, red, green, blue);
    }
  );

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
   * Start TCP server
   */
  ipcMain.handle('start-tcp-server', (): void => {
    const config = printerStateStore.config;
    const tcpServer = getTcpServer(config.tcpPort, printerStateStore.state.model);
    tcpServer.start();
  });

  /**
   * Stop TCP server
   */
  ipcMain.handle('stop-tcp-server', (): void => {
    destroyTcpServer();
  });

  /**
   * Start HTTP server
   */
  ipcMain.handle('start-http-server', (): void => {
    const config = printerStateStore.config;
    const httpServer = getHttpServer(config.httpPort, printerStateStore.state.model);
    httpServer.start();
  });

  /**
   * Stop HTTP server
   */
  ipcMain.handle('stop-http-server', (): void => {
    destroyHttpServer();
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
}
