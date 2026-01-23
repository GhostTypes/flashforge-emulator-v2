/**
 * @fileoverview
 * Electron main process entry point
 *
 * Initializes the Electron application, creates the main window,
 * and sets up state management and IPC handlers.
 *
 * @packageDocumentation
 */

import path from 'node:path';
import { BrowserWindow, app } from 'electron';
import { registerStateHandlers, setupStateForwarding } from './ipc/StateHandlers';
import { simulationService } from './services/SimulationService';
import { getUdpDiscoveryServer } from './services/UdpDiscoveryServer';
import { printerStateStore } from './state/PrinterStateStore';

/**
 * Main window reference
 */
let mainWindow: BrowserWindow | null = null;

/**
 * Creates and configures the main browser window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the appropriate URL based on environment
  const devUrl = process.env['VITE_DEV_SERVER_URL'] || process.env['ELECTRON_RENDERER_URL'];
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // Set up state change forwarding to renderer
  setupStateForwarding(mainWindow);
}

/**
 * Application initialization
 */
app.on('ready', () => {
  // Register IPC handlers
  registerStateHandlers();

  // Initialize printer state with default model
  printerStateStore.initialize(printerStateStore.config.selectedModel);

  // Start UDP discovery server (always on for printer discovery)
  const udpDiscoveryServer = getUdpDiscoveryServer(printerStateStore.state.model);
  udpDiscoveryServer.updateBindAddress(printerStateStore.config.discoveryInterface);
  udpDiscoveryServer.start();

  // Start simulation service
  simulationService.start();

  // Create window
  createWindow();
});

/**
 * Clean up when all windows are closed
 */
app.on('window-all-closed', () => {
  // Stop simulation service
  simulationService.stop();

  // On macOS, keep app running when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Re-create window on macOS when dock icon is clicked
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Clean up before app quits
 */
app.on('before-quit', () => {
  simulationService.stop();
});
