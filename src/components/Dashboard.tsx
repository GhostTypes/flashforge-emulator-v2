/**
 * @fileoverview
 * Dashboard component displaying printer status
 *
 * Shows connection status, temperatures, position, and current job info.
 *
 * @packageDocumentation
 */

import type { PrinterState } from '@shared/types/printer';
import {
  ArrowRight,
  Box,
  Layers,
  Loader,
  Network,
  Pause,
  Play,
  Power,
  PowerOff,
  Printer,
  Thermometer,
  ThermometerSun,
  XCircle,
} from 'lucide-react';
import type { ElementType, FunctionComponent } from 'react';

interface DashboardProps {
  /** Current printer state */
  state: PrinterState;
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
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: ElementType }
> = {
  idle: { label: 'Idle', color: 'text-neutral-400', bg: 'bg-neutral-800', icon: Box },
  ready: { label: 'Ready', color: 'text-success', bg: 'bg-success/10', icon: Play },
  busy: { label: 'Busy', color: 'text-info', bg: 'bg-info/10', icon: Loader },
  heating: { label: 'Heating', color: 'text-warning', bg: 'bg-warning/10', icon: Thermometer },
  printing: {
    label: 'Printing',
    color: 'text-primary-500',
    bg: 'bg-primary-500/10',
    icon: Printer,
  },
  paused: { label: 'Paused', color: 'text-warning', bg: 'bg-warning/10', icon: Pause },
  pausing: { label: 'Pausing', color: 'text-warning', bg: 'bg-warning/10', icon: Pause },
  cancel: { label: 'Canceling', color: 'text-error', bg: 'bg-error/10', icon: XCircle },
  cancelled: {
    label: 'Cancelled',
    color: 'text-error',
    bg: 'bg-error/10',
    icon: XCircle,
  },
  completed: {
    label: 'Completed',
    color: 'text-success',
    bg: 'bg-success/10',
    icon: Play,
  },
  error: { label: 'Error', color: 'text-error', bg: 'bg-error/10', icon: XCircle },
  calibrate_doing: {
    label: 'Calibrating',
    color: 'text-info',
    bg: 'bg-info/10',
    icon: Loader,
  },
};

export const Dashboard: FunctionComponent<DashboardProps> = ({
  state,
  onStartTcp,
  onStopTcp,
  onStartHttp,
  onStopHttp,
  serversRunning,
}) => {
  const statusKey: keyof typeof STATUS_CONFIG = state.machineStatus as keyof typeof STATUS_CONFIG;
  const statusConfig = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG['idle'];
  if (!statusConfig) {
    return null;
  }
  const StatusIcon = statusConfig.icon;

  const progressPercent = Math.round(state.printJob.progress * 100);
  const printTimeFormatted = formatTime(state.printJob.elapsedTimeSeconds);
  const remainingTimeFormatted =
    state.printJob.formattedEta || formatMinutes(state.printJob.remainingTimeMinutes);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-medium text-neutral-100">Dashboard</h2>
        <p className="mt-1 text-sm text-neutral-500">Real-time printer status and monitoring</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Machine Status */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Status
            </h3>
            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
          </div>
          <p className={`text-2xl font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
          <p className="mt-1 text-xs text-neutral-500">{state.machineName}</p>
        </div>

        {/* Nozzle Temperature */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Nozzle
            </h3>
            <Thermometer className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-semibold text-neutral-100">
            {Math.round(state.temperature.nozzleCurrent)}
            <span className="text-base text-neutral-500">°C</span>
          </p>
          {state.temperature.nozzleTarget > 0 && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (state.temperature.nozzleCurrent / state.temperature.nozzleTarget) * 100
                  )}%`,
                }}
              />
            </div>
          )}
          {state.temperature.nozzleTarget > 0 && (
            <p className="mt-1 text-xs text-neutral-500">
              Target: {state.temperature.nozzleTarget}°C
            </p>
          )}
        </div>

        {/* Bed Temperature */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">Bed</h3>
            <ThermometerSun className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-semibold text-neutral-100">
            {Math.round(state.temperature.bedCurrent)}
            <span className="text-base text-neutral-500">°C</span>
          </p>
          {state.temperature.bedTarget > 0 && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (state.temperature.bedCurrent / state.temperature.bedTarget) * 100
                  )}%`,
                }}
              />
            </div>
          )}
          {state.temperature.bedTarget > 0 && (
            <p className="mt-1 text-xs text-neutral-500">Target: {state.temperature.bedTarget}°C</p>
          )}
        </div>

        {/* Position */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Position
            </h3>
            <ArrowRight className="h-4 w-4 text-primary-500" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-lg font-semibold text-neutral-100">
                {state.position.x.toFixed(1)}
              </p>
              <p className="text-xs text-neutral-500">X</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-100">
                {state.position.y.toFixed(1)}
              </p>
              <p className="text-xs text-neutral-500">Y</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-100">
                {state.position.z.toFixed(1)}
              </p>
              <p className="text-xs text-neutral-500">Z</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Job Section */}
      {(state.printJob.status === 'printing' ||
        state.printJob.status === 'paused' ||
        state.printJob.status === 'heating' ||
        state.printJob.status === 'completed' ||
        state.printJob.currentFile) && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-4 flex items-center gap-3">
            <Printer className="h-5 w-5 text-primary-500" />
            <div>
              <h3 className="font-medium text-neutral-100">Current Print Job</h3>
              {state.printJob.currentFile && (
                <p className="text-sm text-neutral-500">{state.printJob.currentFile}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Progress */}
            <div>
              <p className="mb-2 text-xs text-neutral-500">Progress</p>
              <p className="text-2xl font-semibold text-neutral-100">{progressPercent}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Layer */}
            <div>
              <p className="mb-2 text-xs text-neutral-500">Layer</p>
              <p className="text-2xl font-semibold text-neutral-100">
                {state.printJob.currentLayer}
                <span className="text-base text-neutral-500"> / {state.printJob.totalLayers}</span>
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                <Layers className="h-3 w-3" />
                <span>
                  {state.printJob.totalLayers > 0 &&
                    Math.round((state.printJob.currentLayer / state.printJob.totalLayers) * 100)}
                  % complete
                </span>
              </div>
            </div>

            {/* Time */}
            <div>
              <p className="mb-2 text-xs text-neutral-500">Print Time</p>
              <p className="text-2xl font-semibold text-neutral-100">{printTimeFormatted}</p>
              <p className="mt-2 text-xs text-neutral-500">
                {state.printJob.status === 'printing' || state.printJob.status === 'paused'
                  ? `Est. remaining: ${remainingTimeFormatted}`
                  : 'Total time'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Info */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Network className="h-4 w-4 text-neutral-500" />
            <span className="text-neutral-500">Connection:</span>
            <span className="font-medium text-neutral-100">
              TCP: 8899 {state.tcpControlActive && '(Connected)'}
            </span>
            <span className="mx-1 text-neutral-700">|</span>
            <span className="font-medium text-neutral-100">HTTP: 8898</span>
            <span className="mx-1 text-neutral-700">|</span>
            <span className="font-mono text-xs text-neutral-500">{state.ipAddress}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <ServerButton
              label="TCP"
              running={serversRunning.tcp}
              onStart={() => {
                void onStartTcp();
              }}
              onStop={() => {
                void onStopTcp();
              }}
            />
            <ServerButton
              label="HTTP"
              running={serversRunning.http}
              onStart={() => {
                void onStartHttp();
              }}
              onStop={() => {
                void onStopHttp();
              }}
            />
          </div>
        </div>
      </div>
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
    <div className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5">
      {running ? (
        <>
          <div className="flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </div>
          <span className="flex-1 text-xs font-medium text-neutral-300">{label} Running</span>
          <button
            type="button"
            onClick={onStop}
            className="rounded border border-neutral-600 px-2 py-0.5 text-[10px] text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 transition-colors"
          >
            Stop
          </button>
        </>
      ) : (
        <>
          <PowerOff className="h-3 w-3 text-neutral-500" />
          <span className="flex-1 text-xs font-medium text-neutral-500">{label} Stopped</span>
          <button
            type="button"
            onClick={onStart}
            className="flex items-center gap-1 rounded border border-primary-500/30 bg-primary-500/10 px-2 py-0.5 text-[10px] font-medium text-primary-500 hover:bg-primary-500/20 transition-colors"
          >
            <Power className="h-2.5 w-2.5" />
            Start
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Format seconds to human-readable time string
 */
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatMinutes(minutes: number): string {
  if (minutes <= 0) {
    return '0m';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
