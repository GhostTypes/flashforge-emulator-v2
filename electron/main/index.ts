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
      preload: path.join(__dirname, '../preload/index.js'),
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
  if (process.env['VITE_DEV_SERVER_URL']) {
    void mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL']);
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
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
