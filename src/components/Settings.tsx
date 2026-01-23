/**
 * @fileoverview
 * Settings panel component
 *
 * Allows configuration of printer model, ports, authentication, and simulation settings.
 *
 * @packageDocumentation
 */

import type { EmulatorConfig, NetworkInterface, PrinterModel } from '@shared/types/printer';
import { Check, Loader2, Power, PowerOff, RefreshCw } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import { getPrinterModels, getPrinterProfile } from '../hooks/useEmulatorState';

interface SettingsProps {
  /** Current configuration */
  config: EmulatorConfig;
  /** Current printer model */
  currentModel: PrinterModel;
  /** Callback to update configuration */
  onConfigChange: (config: EmulatorConfig) => void;
  /** Callback to initialize printer */
  onInitialize: (model: PrinterModel) => Promise<void>;
  /** Callback to reset printer */
  onReset: () => Promise<void>;
  /** Callback to start TCP server */
  onStartTcp: () => Promise<void>;
  /** Callback to stop TCP server */
  onStopTcp: () => Promise<void>;
  /** Callback to start HTTP server */
  onStartHttp: () => Promise<void>;
  /** Callback to stop HTTP server */
  onStopHttp: () => Promise<void>;
  /** Whether servers are running */
  serversRunning: { tcp: boolean; http: boolean };
  /** Callback to get network interfaces */
  onGetNetworkInterfaces: () => Promise<NetworkInterface[]>;
}

export const Settings: FunctionComponent<SettingsProps> = ({
  config,
  currentModel,
  onConfigChange,
  onInitialize,
  onReset,
  onStartTcp,
  onStopTcp,
  onStartHttp,
  onStopHttp,
  serversRunning,
  onGetNetworkInterfaces,
}) => {
  const printerModels = getPrinterModels();
  const [networkInterfaces, setNetworkInterfaces] = useState<NetworkInterface[]>([]);

  // Load network interfaces on mount
  useEffect(() => {
    void onGetNetworkInterfaces().then(setNetworkInterfaces);
  }, [onGetNetworkInterfaces]);

  const handleModelChange = (model: PrinterModel) => {
    const newConfig = { ...config, selectedModel: model };
    onConfigChange(newConfig);
    void onInitialize(model);
  };

  const handleReset = () => {
    void onReset();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-medium text-neutral-100">Settings</h2>
        <p className="mt-1 text-sm text-neutral-500">Configure emulator and printer settings</p>
      </div>

      {/* Printer Model Selection */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <RefreshCw className="h-4 w-4" />
          Printer Model
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {printerModels.map(({ model, name }) => {
            const profile = getPrinterProfile(model);
            const isSelected = currentModel === model;

            return (
              <button
                key={model}
                type="button"
                onClick={() => handleModelChange(model)}
                className={[
                  'relative rounded-lg border p-4 text-left transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600',
                ].join(' ')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-neutral-100">{name}</p>
                    <p className="mt-1 text-xs text-neutral-500">{model}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary-500" />}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.supportsHttp && (
                    <span className="rounded bg-info/20 px-1.5 py-0.5 text-xs text-info">HTTP</span>
                  )}
                  {profile.supportsTcp && (
                    <span className="rounded bg-success/20 px-1.5 py-0.5 text-xs text-success">
                      TCP
                    </span>
                  )}
                  {profile.hasMaterialStation && (
                    <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs text-warning">
                      IFS
                    </span>
                  )}
                  {profile.hasCamera && (
                    <span className="rounded bg-primary-500/20 px-1.5 py-0.5 text-xs text-primary-500">
                      CAM
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-neutral-600">
                  Build: {profile.buildVolume.x} × {profile.buildVolume.y} × {profile.buildVolume.z}{' '}
                  mm
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Network Settings */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <RefreshCw className="h-4 w-4" />
          Network Configuration
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* TCP Port */}
          <div>
            <label htmlFor="tcpPort" className="mb-1.5 block text-sm text-neutral-400">
              TCP Port
            </label>
            <input
              id="tcpPort"
              type="number"
              value={config.tcpPort}
              onChange={(e) =>
                onConfigChange({ ...config, tcpPort: Number.parseInt(e.target.value, 10) || 8899 })
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* HTTP Port */}
          <div>
            <label htmlFor="httpPort" className="mb-1.5 block text-sm text-neutral-400">
              HTTP Port
            </label>
            <input
              id="httpPort"
              type="number"
              value={config.httpPort}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  httpPort: Number.parseInt(e.target.value, 10) || 8898,
                })
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Serial Number */}
          <div>
            <label htmlFor="serialNumber" className="mb-1.5 block text-sm text-neutral-400">
              Serial Number
            </label>
            <input
              id="serialNumber"
              type="text"
              value={config.serialNumber}
              onChange={(e) => onConfigChange({ ...config, serialNumber: e.target.value })}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Check Code */}
          <div>
            <label htmlFor="checkCode" className="mb-1.5 block text-sm text-neutral-400">
              Check Code
            </label>
            <input
              id="checkCode"
              type="text"
              value={config.checkCode}
              onChange={(e) => onConfigChange({ ...config, checkCode: e.target.value })}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Discovery Interface */}
          <div>
            <label htmlFor="discoveryInterface" className="mb-1.5 block text-sm text-neutral-400">
              Discovery Interface
            </label>
            <select
              id="discoveryInterface"
              value={config.discoveryInterface || ''}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  discoveryInterface: e.target.value,
                })
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Interfaces (default)</option>
              {networkInterfaces.map((iface) => (
                <option key={iface.address} value={iface.address}>
                  {iface.displayName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-600">
              Select network interface for UDP printer discovery. Empty = all interfaces.
            </p>
          </div>
        </div>

        {/* Server Controls */}
        <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-800 pt-4">
          <ServerButton
            label="TCP Server"
            running={serversRunning.tcp}
            onStart={onStartTcp}
            onStop={onStopTcp}
          />
          <ServerButton
            label="HTTP Server"
            running={serversRunning.http}
            onStart={onStartHttp}
            onStop={onStopHttp}
          />
        </div>
      </section>

      {/* Simulation Settings */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Loader2 className="h-4 w-4" />
          Simulation Settings
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Simulation Mode */}
          <div>
            <label htmlFor="simMode" className="mb-1.5 block text-sm text-neutral-400">
              Simulation Mode
            </label>
            <select
              id="simMode"
              value={config.simulationMode}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  simulationMode: e.target.value as 'auto' | 'manual',
                })
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="auto">Auto (automatic progress)</option>
              <option value="manual">Manual (user controlled)</option>
            </select>
          </div>

          {/* Simulation Speed */}
          <div>
            <label htmlFor="simSpeed" className="mb-1.5 block text-sm text-neutral-400">
              Simulation Speed ({config.simulationSpeed}x)
            </label>
            <input
              id="simSpeed"
              type="range"
              min="1"
              max="500"
              value={config.simulationSpeed}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  simulationSpeed: Number.parseInt(e.target.value, 10),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Reset Actions */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <RefreshCw className="h-4 w-4" />
          Reset Actions
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors"
        >
          Reset Printer State
        </button>
      </section>
    </div>
  );
};

interface ServerButtonProps {
  label: string;
  running: boolean;
  onStart: () => void;
  onStop: () => void;
}

function ServerButton({ label, running, onStart, onStop }: ServerButtonProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 p-2">
      {running ? (
        <>
          <div className="flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </div>
          <span className="flex-1 text-sm text-neutral-300">{label} Running</span>
          <button
            type="button"
            onClick={onStop}
            className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 transition-colors"
          >
            Stop
          </button>
        </>
      ) : (
        <>
          <PowerOff className="h-4 w-4 text-neutral-500" />
          <span className="flex-1 text-sm text-neutral-500">{label} Stopped</span>
          <button
            type="button"
            onClick={onStart}
            className="flex items-center gap-1 rounded border border-primary-500/30 bg-primary-500/10 px-2 py-1 text-xs text-primary-500 hover:bg-primary-500/20 transition-colors"
          >
            <Power className="h-3 w-3" />
            Start
          </button>
        </>
      )}
    </div>
  );
}
