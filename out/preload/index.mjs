import { contextBridge, ipcRenderer } from "electron";
const emulatorApi = {
  /**
   * Get application version
   */
  getVersion: () => ipcRenderer.invoke("get-version"),
  /**
   * Get emulator configuration
   */
  getConfig: () => ipcRenderer.invoke("get-config"),
  /**
   * Set emulator configuration
   */
  setConfig: (config) => ipcRenderer.invoke("set-config", config),
  /**
   * Get current printer state
   */
  getPrinterState: () => ipcRenderer.invoke("get-printer-state"),
  /**
   * Listen for printer state updates
   */
  onPrinterStateUpdate: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("printer-state-update", listener);
  },
  /**
   * Remove printer state update listener
   */
  removePrinterStateListener: () => {
    ipcRenderer.removeAllListeners("printer-state-update");
  },
  /**
   * Initialize printer with a specific model
   */
  initializePrinter: (model) => ipcRenderer.invoke("initialize-printer", model),
  /**
   * Reset printer state
   */
  resetPrinter: () => ipcRenderer.invoke("reset-printer"),
  /**
   * Set machine status
   */
  setMachineStatus: (status) => ipcRenderer.invoke("set-machine-status", status),
  /**
   * Update temperatures
   */
  updateTemperature: (temps) => ipcRenderer.invoke("update-temperature", temps),
  /**
   * Set target temperatures
   */
  setTargetTemperatures: (nozzle, bed, chamber) => ipcRenderer.invoke("set-target-temperatures", nozzle, bed, chamber),
  /**
   * Update position
   */
  updatePosition: (position) => ipcRenderer.invoke("update-position", position),
  /**
   * Home axes
   */
  homeAxes: (axes) => ipcRenderer.invoke("home-axes", axes),
  /**
   * Start print job
   */
  startPrint: (filename, estimatedTime) => ipcRenderer.invoke("start-print", filename, estimatedTime),
  /**
   * Pause print job
   */
  pausePrint: () => ipcRenderer.invoke("pause-print"),
  /**
   * Resume print job
   */
  resumePrint: () => ipcRenderer.invoke("resume-print"),
  /**
   * Stop print job
   */
  stopPrint: () => ipcRenderer.invoke("stop-print"),
  /**
   * Update LED
   */
  updateLed: (enabled, red, green, blue) => ipcRenderer.invoke("update-led", enabled, red, green, blue),
  /**
   * Update fan
   */
  updateFan: (settings) => ipcRenderer.invoke("update-fan", settings),
  /**
   * Add file
   */
  addFile: (file) => ipcRenderer.invoke("add-file", file),
  /**
   * Remove file
   */
  removeFile: (filename) => ipcRenderer.invoke("remove-file", filename),
  /**
   * Clear files
   */
  clearFiles: () => ipcRenderer.invoke("clear-files"),
  /**
   * Get files
   */
  getFiles: () => ipcRenderer.invoke("get-files"),
  /**
   * Update material slot (AD5X)
   */
  updateMaterialSlot: (slotId, slot) => ipcRenderer.invoke("update-material-slot", slotId, slot),
  /**
   * Set current slot (AD5X)
   */
  setCurrentSlot: (slotId) => ipcRenderer.invoke("set-current-slot", slotId),
  /**
   * Start TCP server
   */
  startTcpServer: () => ipcRenderer.invoke("start-tcp-server"),
  /**
   * Stop TCP server
   */
  stopTcpServer: () => ipcRenderer.invoke("stop-tcp-server"),
  /**
   * Start HTTP server
   */
  startHttpServer: () => ipcRenderer.invoke("start-http-server"),
  /**
   * Stop HTTP server
   */
  stopHttpServer: () => ipcRenderer.invoke("stop-http-server"),
  /**
   * Get simulation mode and speed
   */
  getSimulationMode: () => ipcRenderer.invoke("get-simulation-mode"),
  /**
   * Set simulation mode
   */
  setSimulationMode: (mode, speed) => ipcRenderer.invoke("set-simulation-mode", mode, speed)
};
void contextBridge.exposeInMainWorld("api", emulatorApi);
