/**
 * @fileoverview
 * Electron preload script
 *
 * Exposes safe APIs to the renderer process via context bridge.
 * No Node.js or Electron APIs are directly exposed.
 *
 * @packageDocumentation
 */

import { contextBridge, ipcRenderer } from 'electron';
import type {
  EmulatorConfig,
  MaterialSlotUpdate,
  PrintJobStatus,
  PrinterFile,
  PrinterModel,
  PrinterState,
  TemperatureState,
} from '../../shared/types/printer';

/**
 * API exposed to the renderer process
 */
const emulatorApi = {
  /**
   * Get application version
   */
  getVersion: (): Promise<string> => ipcRenderer.invoke('get-version'),

  /**
   * Get emulator configuration
   */
  getConfig: (): Promise<EmulatorConfig> => ipcRenderer.invoke('get-config'),

  /**
   * Set emulator configuration
   */
  setConfig: (config: EmulatorConfig): Promise<void> => ipcRenderer.invoke('set-config', config),

  /**
   * Get current printer state
   */
  getPrinterState: (): Promise<PrinterState> => ipcRenderer.invoke('get-printer-state'),

  /**
   * Listen for printer state updates
   */
  onPrinterStateUpdate: (callback: (state: PrinterState) => void): void => {
    const listener = (_event: unknown, state: PrinterState) => callback(state);
    ipcRenderer.on('printer-state-update', listener);
  },

  /**
   * Remove printer state update listener
   */
  removePrinterStateListener: (): void => {
    ipcRenderer.removeAllListeners('printer-state-update');
  },

  /**
   * Initialize printer with a specific model
   */
  initializePrinter: (model: PrinterModel): Promise<void> =>
    ipcRenderer.invoke('initialize-printer', model),

  /**
   * Reset printer state
   */
  resetPrinter: (): Promise<void> => ipcRenderer.invoke('reset-printer'),

  /**
   * Set machine status
   */
  setMachineStatus: (status: PrintJobStatus): Promise<void> =>
    ipcRenderer.invoke('set-machine-status', status),

  /**
   * Update temperatures
   */
  updateTemperature: (temps: Partial<TemperatureState>): Promise<void> =>
    ipcRenderer.invoke('update-temperature', temps),

  /**
   * Set target temperatures
   */
  setTargetTemperatures: (nozzle: number, bed: number, chamber?: number): Promise<void> =>
    ipcRenderer.invoke('set-target-temperatures', nozzle, bed, chamber),

  /**
   * Update position
   */
  updatePosition: (position: { x?: number; y?: number; z?: number; e?: number }): Promise<void> =>
    ipcRenderer.invoke('update-position', position),

  /**
   * Home axes
   */
  homeAxes: (axes?: 'x' | 'y' | 'z' | 'all'): Promise<void> =>
    ipcRenderer.invoke('home-axes', axes),

  /**
   * Start print job
   */
  startPrint: (filename: string, estimatedTime?: number): Promise<void> =>
    ipcRenderer.invoke('start-print', filename, estimatedTime),

  /**
   * Pause print job
   */
  pausePrint: (): Promise<void> => ipcRenderer.invoke('pause-print'),

  /**
   * Resume print job
   */
  resumePrint: (): Promise<void> => ipcRenderer.invoke('resume-print'),

  /**
   * Stop print job
   */
  stopPrint: (): Promise<void> => ipcRenderer.invoke('stop-print'),

  /**
   * Update LED
   */
  updateLed: (enabled: boolean, red?: number, green?: number, blue?: number): Promise<void> =>
    ipcRenderer.invoke('update-led', enabled, red, green, blue),

  /**
   * Update fan
   */
  updateFan: (
    settings: Partial<{
      coolingFanSpeed: number;
      chamberFanSpeed: number;
      externalFanEnabled: boolean;
      internalFanEnabled: boolean;
    }>
  ): Promise<void> => ipcRenderer.invoke('update-fan', settings),

  /**
   * Add file
   */
  addFile: (file: PrinterFile): Promise<void> => ipcRenderer.invoke('add-file', file),

  /**
   * Remove file
   */
  removeFile: (filename: string): Promise<void> => ipcRenderer.invoke('remove-file', filename),

  /**
   * Clear files
   */
  clearFiles: (): Promise<void> => ipcRenderer.invoke('clear-files'),

  /**
   * Get files
   */
  getFiles: (): Promise<readonly PrinterFile[]> => ipcRenderer.invoke('get-files'),

  /**
   * Update material slot (AD5X)
   */
  updateMaterialSlot: (slotId: number, slot: MaterialSlotUpdate): Promise<void> =>
    ipcRenderer.invoke('update-material-slot', slotId, slot),

  /**
   * Set current slot (AD5X)
   */
  setCurrentSlot: (slotId: number): Promise<void> => ipcRenderer.invoke('set-current-slot', slotId),

  /**
   * Start TCP server
   */
  startTcpServer: (): Promise<void> => ipcRenderer.invoke('start-tcp-server'),

  /**
   * Stop TCP server
   */
  stopTcpServer: (): Promise<void> => ipcRenderer.invoke('stop-tcp-server'),

  /**
   * Start HTTP server
   */
  startHttpServer: (): Promise<void> => ipcRenderer.invoke('start-http-server'),

  /**
   * Stop HTTP server
   */
  stopHttpServer: (): Promise<void> => ipcRenderer.invoke('stop-http-server'),

  /**
   * Get simulation mode and speed
   */
  getSimulationMode: (): Promise<{ mode: 'auto' | 'manual'; speed: number }> =>
    ipcRenderer.invoke('get-simulation-mode'),

  /**
   * Set simulation mode
   */
  setSimulationMode: (mode: 'auto' | 'manual', speed?: number): Promise<void> =>
    ipcRenderer.invoke('set-simulation-mode', mode, speed),
} as const;

/**
 * Expose the API to renderer via context bridge
 */
void contextBridge.exposeInMainWorld('api', emulatorApi);

/**
 * Type definitions for the exposed API
 */
export type EmulatorApi = typeof emulatorApi;
