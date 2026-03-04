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
import { Logs } from './components/Logs';
import { PrintControls } from './components/PrintControls';
import { Settings } from './components/Settings';
import { Sidebar, type SidebarTab } from './components/Sidebar';
import { useEmulatorState } from './hooks/useEmulatorState';

export const App: FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [serversRunning, setServersRunning] = useState({ tcp: false, http: false });

  const {
    state,
    config,
    protocolLogs,
    scenarioPresets,
    loading,
    error,
    initializePrinter,
    resetPrinter,
    cancelPrint,
    clearCompletedState,
    applyScenarioPreset,
    applyScenario,
    getScenarioSnapshot,
    setConfig,
    startTcpServer,
    stopTcpServer,
    startHttpServer,
    stopHttpServer,
    getNetworkInterfaces,
    clearProtocolLogs,
  } = useEmulatorState();

  const handleStartTcp = async () => {
    await startTcpServer();
    setServersRunning((prev) => ({ ...prev, tcp: true }));
  };

  const handleStopTcp = async () => {
    await stopTcpServer();
    setServersRunning((prev) => ({ ...prev, tcp: false }));
  };

  const handleStartHttp = async () => {
    await startHttpServer();
    setServersRunning((prev) => ({ ...prev, http: true }));
  };

  const handleStopHttp = async () => {
    await stopHttpServer();
    setServersRunning((prev) => ({ ...prev, http: false }));
  };

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

  if (!state || !config) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950">
        <p className="text-sm text-neutral-500">Initializing...</p>
      </div>
    );
  }

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
            scenarioPresets={scenarioPresets}
            onCancelPrint={cancelPrint}
            onClearCompletedState={clearCompletedState}
            onApplyScenarioPreset={applyScenarioPreset}
            onApplyScenario={applyScenario}
            onGetScenarioSnapshot={getScenarioSnapshot}
          />
        );
      case 'files':
        return (
          <FileManager
            state={state}
            onAddFile={(file) => {
              void window.api.addFile(file);
            }}
            onRemoveFile={(filename) => {
              void window.api.removeFile(filename);
            }}
            onStartPrint={(filename) => {
              const file = state.files.find((candidate) => candidate.name === filename);
              void window.api.startPrint(filename, file?.printTime);
            }}
          />
        );
      case 'logs':
        return <Logs logs={protocolLogs} onClear={() => void clearProtocolLogs()} />;
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
            }}
            onReset={async () => {
              await resetPrinter();
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
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-auto">
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
            <span className="rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-400">
              {state.model}
            </span>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};
