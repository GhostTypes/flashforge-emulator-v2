/**
 * @fileoverview
 * Root application component
 *
 * Main layout and routing for the emulator UI.
 * Integrates all UI components and manages state synchronization.
 *
 * @packageDocumentation
 */

import { useState } from 'react';
import type { FunctionComponent } from 'react';
import { Dashboard } from './components/Dashboard';
import { FileManager } from './components/FileManager';
import { type LogEntry, Logs, createLogEntry } from './components/Logs';
import { PrintControls } from './components/PrintControls';
import { Settings } from './components/Settings';
import { Sidebar, type SidebarTab } from './components/Sidebar';
import { useEmulatorState } from './hooks/useEmulatorState';

export const App: FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [logs, setLogs] = useState<readonly LogEntry[]>([]);
  const [serversRunning, setServersRunning] = useState({ tcp: false, http: false });

  const {
    state,
    config,
    loading,
    error,
    initializePrinter,
    resetPrinter,
    setConfig,
    startTcpServer,
    stopTcpServer,
    startHttpServer,
    stopHttpServer,
    getNetworkInterfaces,
  } = useEmulatorState();

  // Add a log entry
  const addLog = (
    type: LogEntry['type'],
    level: LogEntry['level'],
    message: string,
    data?: unknown
  ) => {
    setLogs((prev) => [...prev.slice(-500), createLogEntry(type, level, message, data)]);
  };

  // Handle server start/stop with logging
  const handleStartTcp = async () => {
    await startTcpServer();
    setServersRunning((prev) => ({ ...prev, tcp: true }));
    addLog('system', 'info', 'TCP server started on port 8899');
  };

  const handleStopTcp = async () => {
    await stopTcpServer();
    setServersRunning((prev) => ({ ...prev, tcp: false }));
    addLog('system', 'info', 'TCP server stopped');
  };

  const handleStartHttp = async () => {
    await startHttpServer();
    setServersRunning((prev) => ({ ...prev, http: true }));
    addLog('system', 'info', 'HTTP server started on port 8898');
  };

  const handleStopHttp = async () => {
    await stopHttpServer();
    setServersRunning((prev) => ({ ...prev, http: false }));
    addLog('system', 'info', 'HTTP server stopped');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-neutral-500">Loading emulator...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950">
        <div className="max-w-md rounded-lg border border-error/30 bg-error/5 p-6 text-center">
          <p className="text-lg font-medium text-error">Error loading emulator</p>
          <p className="mt-2 text-sm text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  // No state yet
  if (!state || !config) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950">
        <p className="text-sm text-neutral-500">Initializing...</p>
      </div>
    );
  }

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            state={state}
            onStartTcp={handleStartTcp}
            onStopTcp={handleStopTcp}
            onStartHttp={handleStartHttp}
            onStopHttp={handleStopHttp}
            serversRunning={serversRunning}
          />
        );
      case 'controls':
        return (
          <PrintControls
            state={state}
            onSetStatus={(status) => {
              void window.api.setMachineStatus(status);
              addLog('system', 'info', `Status changed to ${status}`);
            }}
            onHome={() => {
              void window.api.homeAxes();
              addLog('system', 'info', 'Axes homed');
            }}
            onSetTemperatures={(nozzle, bed, chamber) => {
              void window.api.setTargetTemperatures(nozzle, bed, chamber);
              addLog('system', 'info', `Temperatures set: N${nozzle}°C B${bed}°C`);
            }}
            onSetLed={(enabled) => {
              void window.api.updateLed(enabled);
              addLog('system', 'info', `LED ${enabled ? 'enabled' : 'disabled'}`);
            }}
            onSetFan={(settings) => {
              void window.api.updateFan(settings);
              addLog('system', 'info', 'Fan settings updated');
            }}
          />
        );
      case 'files':
        return (
          <FileManager
            state={state}
            onAddFile={(file) => {
              void window.api.addFile(file);
              addLog('system', 'info', `File added: ${file.name}`);
            }}
            onRemoveFile={(filename) => {
              void window.api.removeFile(filename);
              addLog('system', 'info', `File removed: ${filename}`);
            }}
            onStartPrint={(filename) => {
              const file = state.files.find((f) => f.name === filename);
              void window.api.startPrint(filename, file?.printTime);
              addLog('system', 'info', `Print started: ${filename}`);
            }}
          />
        );
      case 'logs':
        return <Logs logs={logs} onClear={() => setLogs([])} />;
      case 'settings':
        return (
          <Settings
            config={config}
            currentModel={state.model}
            onConfigChange={(newConfig) => {
              void setConfig(newConfig);
            }}
            onInitialize={async (model) => {
              await initializePrinter(model);
              addLog('system', 'info', `Printer model changed to ${model}`);
            }}
            onReset={async () => {
              await resetPrinter();
              addLog('system', 'info', 'Printer state reset');
            }}
            onGetNetworkInterfaces={getNetworkInterfaces}
          />
        );
      default:
        return (
          <Dashboard
            state={state}
            onStartTcp={handleStartTcp}
            onStopTcp={handleStopTcp}
            onStartHttp={handleStartHttp}
            onStopHttp={handleStopHttp}
            serversRunning={serversRunning}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-neutral-950 text-neutral-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        {/* Header bar with status */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-900/50 px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-medium capitalize text-neutral-100">{activeTab}</h2>
            {state.printJob.currentFile && (
              <span className="rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-400">
                {state.printJob.currentFile}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Server status indicators */}
            <div className="flex items-center gap-2 text-xs">
              <div
                className={[
                  'h-2 w-2 rounded-full',
                  serversRunning.tcp ? 'bg-success' : 'bg-neutral-600',
                ].join(' ')}
              />
              <span className={serversRunning.tcp ? 'text-neutral-300' : 'text-neutral-600'}>
                TCP
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div
                className={[
                  'h-2 w-2 rounded-full',
                  serversRunning.http ? 'bg-success' : 'bg-neutral-600',
                ].join(' ')}
              />
              <span className={serversRunning.http ? 'text-neutral-300' : 'text-neutral-600'}>
                HTTP
              </span>
            </div>
            {/* Printer model */}
            <span className="rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-400">
              {state.model}
            </span>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </main>
    </div>
  );
};
