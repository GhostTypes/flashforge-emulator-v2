/**
 * @fileoverview
 * Print control panel component
 *
 * Allows manual control of print job state, temperatures, and printer functions.
 * Includes simulation mode toggle for automatic vs manual control.
 *
 * @packageDocumentation
 */

import type { PrintJobStatus, PrinterState, SimulationMode } from '@shared/types/printer';
import {
  ArrowDownToLine,
  Flame,
  Gauge,
  Home,
  Lightbulb,
  Pause,
  Play,
  Settings2,
  Square,
  Wind,
  XCircle,
  Zap,
} from 'lucide-react';
import { type ElementType, type FunctionComponent, useEffect, useState } from 'react';

interface SimulationState {
  mode: SimulationMode;
  speed: number;
}

interface PrintControlsProps {
  /** Current printer state */
  state: PrinterState;
  /** Callback to set machine status */
  onSetStatus: (status: PrintJobStatus) => void;
  /** Callback to home axes */
  onHome: () => void;
  /** Callback to set temperatures */
  onSetTemperatures: (nozzle: number, bed: number, chamber?: number) => void;
  /** Callback to update LED */
  onSetLed: (enabled: boolean, red?: number, green?: number, blue?: number) => void;
  /** Callback to update fan */
  onSetFan: (settings: {
    coolingFanSpeed?: number;
    chamberFanSpeed?: number;
    externalFanEnabled?: boolean;
    internalFanEnabled?: boolean;
  }) => void;
}

const STATUS_TRANSITIONS: Record<
  string,
  { label: string; icon: ElementType; action: PrintJobStatus; available: readonly string[] }
> = {
  idle: {
    label: 'Start Heating',
    icon: Flame,
    action: 'heating',
    available: ['idle', 'ready', 'completed', 'error'] as const,
  },
  heating: {
    label: 'Start Printing',
    icon: Play,
    action: 'printing',
    available: ['heating'] as const,
  },
  printing: {
    label: 'Pause Print',
    icon: Pause,
    action: 'paused',
    available: ['printing'] as const,
  },
  paused: {
    label: 'Resume Print',
    icon: Play,
    action: 'printing',
    available: ['paused'] as const,
  },
  completed: {
    label: 'Reset to Idle',
    icon: Square,
    action: 'idle',
    available: ['completed'] as const,
  },
  error: {
    label: 'Clear Error',
    icon: XCircle,
    action: 'idle',
    available: ['error'] as const,
  },
};

export const PrintControls: FunctionComponent<PrintControlsProps> = ({
  state,
  onSetStatus,
  onHome,
  onSetTemperatures,
  onSetLed,
  onSetFan,
}) => {
  const currentTransition = STATUS_TRANSITIONS[state.machineStatus];
  const canTransition = currentTransition?.available.includes(state.machineStatus);

  // Simulation state
  const [simulation, setSimulation] = useState<SimulationState>({
    mode: 'auto',
    speed: 100,
  });

  // Load simulation state on mount
  useEffect(() => {
    const loadSimulationState = async () => {
      try {
        const simState = await window.api.getSimulationMode();
        setSimulation(simState);
      } catch {
        // Use defaults if API call fails
      }
    };
    void loadSimulationState();
  }, []);

  // Temperatures input state
  const [nozzleTarget, setNozzleTarget] = useState(state.temperature.nozzleTarget);
  const [bedTarget, setBedTarget] = useState(state.temperature.bedTarget);

  // LED controls
  const [ledRed, setLedRed] = useState(state.led.red);
  const [ledGreen, setLedGreen] = useState(state.led.green);
  const [ledBlue, setLedBlue] = useState(state.led.blue);

  const handleSetTemperatures = () => {
    onSetTemperatures(nozzleTarget, bedTarget, state.temperature.chamberTarget);
  };

  const handleUpdateLed = () => {
    const enabled = ledRed > 0 || ledGreen > 0 || ledBlue > 0;
    onSetLed(enabled, ledRed, ledGreen, ledBlue);
  };

  const handleSetSimulationMode = async (mode: SimulationMode) => {
    const newSimulation = { ...simulation, mode };
    setSimulation(newSimulation);
    await window.api.setSimulationMode(mode, simulation.speed);
  };

  const handleSetSimulationSpeed = async (speed: number) => {
    const newSimulation = { ...simulation, speed };
    setSimulation(newSimulation);
    await window.api.setSimulationMode(simulation.mode, speed);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-medium text-neutral-100">Print Controls</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Manual control of printer state and functions
        </p>
      </div>

      {/* Simulation Mode Control */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Settings2 className="h-4 w-4" />
          Simulation Mode
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 p-1">
            <button
              type="button"
              onClick={() => handleSetSimulationMode('auto')}
              className={[
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                simulation.mode === 'auto'
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200',
              ].join(' ')}
            >
              <Zap className="h-4 w-4" />
              Auto
            </button>
            <button
              type="button"
              onClick={() => handleSetSimulationMode('manual')}
              className={[
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                simulation.mode === 'manual'
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200',
              ].join(' ')}
            >
              <Gauge className="h-4 w-4" />
              Manual
            </button>
          </div>

          {/* Speed Control (only for auto mode) */}
          {simulation.mode === 'auto' && (
            <div className="flex items-center gap-3 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2">
              <span className="text-xs text-neutral-400">Speed:</span>
              <input
                type="range"
                min="1"
                max="500"
                value={simulation.speed}
                onChange={(e) => handleSetSimulationSpeed(Number.parseInt(e.target.value, 10))}
                className="w-24 accent-primary-500"
              />
              <span className="text-sm font-medium text-neutral-300">{simulation.speed}x</span>
            </div>
          )}

          {/* Description */}
          <p className="flex-1 text-xs text-neutral-500">
            {simulation.mode === 'auto'
              ? 'Automatically simulates print progress and temperature changes'
              : 'Manual control - use status controls below to advance the print job'}
          </p>
        </div>
      </section>

      {/* Status Control */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Square className="h-4 w-4" />
          Print Job Status
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-300">
            Current: <span className="font-medium capitalize">{state.machineStatus}</span>
          </span>
          {canTransition && currentTransition && (
            <button
              type="button"
              onClick={() => onSetStatus(currentTransition.action)}
              className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
            >
              <currentTransition.icon className="h-4 w-4" />
              {currentTransition.label}
            </button>
          )}
          {state.machineStatus === 'printing' && (
            <button
              type="button"
              onClick={() => onSetStatus('idle')}
              className="flex items-center gap-2 rounded-md border border-error/30 bg-error/10 px-4 py-2 text-sm font-medium text-error hover:bg-error/20 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Cancel Print
            </button>
          )}
        </div>
      </section>

      {/* Temperature Controls */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Flame className="h-4 w-4" />
          Temperature Control
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nozzleTemp" className="mb-1.5 block text-sm text-neutral-400">
              Nozzle Target ({nozzleTarget}°C)
            </label>
            <div className="flex gap-2">
              <input
                id="nozzleTemp"
                type="range"
                min="0"
                max="300"
                value={nozzleTarget}
                onChange={(e) => setNozzleTarget(Number.parseInt(e.target.value, 10))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="300"
                value={nozzleTarget}
                onChange={(e) => setNozzleTarget(Number.parseInt(e.target.value, 10) || 0)}
                className="w-20 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 text-center focus:border-primary-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-600">
              Current: {Math.round(state.temperature.nozzleCurrent)}°C
            </p>
          </div>

          <div>
            <label htmlFor="bedTemp" className="mb-1.5 block text-sm text-neutral-400">
              Bed Target ({bedTarget}°C)
            </label>
            <div className="flex gap-2">
              <input
                id="bedTemp"
                type="range"
                min="0"
                max="120"
                value={bedTarget}
                onChange={(e) => setBedTarget(Number.parseInt(e.target.value, 10))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="120"
                value={bedTarget}
                onChange={(e) => setBedTarget(Number.parseInt(e.target.value, 10) || 0)}
                className="w-20 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 text-center focus:border-primary-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-600">
              Current: {Math.round(state.temperature.bedCurrent)}°C
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSetTemperatures}
          className="mt-4 flex items-center gap-2 rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Apply Temperatures
        </button>
      </section>

      {/* Motion Controls */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Home className="h-4 w-4" />
          Motion Control
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onHome()}
            className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home All Axes
          </button>
          <div className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-500">
            <span>Position:</span>
            <span className="font-mono">
              X:{state.position.x.toFixed(1)} Y:{state.position.y.toFixed(1)} Z:
              {state.position.z.toFixed(1)}
            </span>
          </div>
        </div>
      </section>

      {/* LED Control */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Lightbulb className="h-4 w-4" />
          LED Control
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="ledRed" className="text-sm text-neutral-400">
              R
            </label>
            <input
              id="ledRed"
              type="number"
              min="0"
              max="255"
              value={ledRed}
              onChange={(e) => setLedRed(Number.parseInt(e.target.value, 10) || 0)}
              className="w-16 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={ledRed}
              onChange={(e) => setLedRed(Number.parseInt(e.target.value, 10))}
              className="w-20 accent-red-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="ledGreen" className="text-sm text-neutral-400">
              G
            </label>
            <input
              id="ledGreen"
              type="number"
              min="0"
              max="255"
              value={ledGreen}
              onChange={(e) => setLedGreen(Number.parseInt(e.target.value, 10) || 0)}
              className="w-16 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={ledGreen}
              onChange={(e) => setLedGreen(Number.parseInt(e.target.value, 10))}
              className="w-20 accent-green-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="ledBlue" className="text-sm text-neutral-400">
              B
            </label>
            <input
              id="ledBlue"
              type="number"
              min="0"
              max="255"
              value={ledBlue}
              onChange={(e) => setLedBlue(Number.parseInt(e.target.value, 10) || 0)}
              className="w-16 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={ledBlue}
              onChange={(e) => setLedBlue(Number.parseInt(e.target.value, 10))}
              className="w-20 accent-blue-500"
            />
          </div>

          {/* Color preview */}
          <div
            className="ml-4 h-8 w-8 rounded-md border border-neutral-700"
            style={{ backgroundColor: `rgb(${ledRed}, ${ledGreen}, ${ledBlue})` }}
          />

          <button
            type="button"
            onClick={handleUpdateLed}
            className="ml-auto rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </section>

      {/* Fan Control */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Wind className="h-4 w-4" />
          Fan Control
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cooling Fan */}
          <div>
            <label htmlFor="coolingFan" className="mb-1.5 block text-sm text-neutral-400">
              Cooling Fan Speed ({state.fan.coolingFanSpeed}%)
            </label>
            <input
              id="coolingFan"
              type="range"
              min="0"
              max="100"
              value={state.fan.coolingFanSpeed}
              onChange={(e) => onSetFan({ coolingFanSpeed: Number.parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          {/* Chamber Fan */}
          <div>
            <label htmlFor="chamberFan" className="mb-1.5 block text-sm text-neutral-400">
              Chamber Fan Speed ({state.fan.chamberFanSpeed}%)
            </label>
            <input
              id="chamberFan"
              type="range"
              min="0"
              max="100"
              value={state.fan.chamberFanSpeed}
              onChange={(e) => onSetFan({ chamberFanSpeed: Number.parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          {/* Fan Toggles */}
          <div className="flex gap-3 sm:col-span-2">
            <label className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={state.fan.internalFanEnabled}
                onChange={(e) => onSetFan({ internalFanEnabled: e.target.checked })}
                className="rounded border-neutral-600 bg-neutral-700 text-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <span>Internal Fan</span>
            </label>

            <label className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={state.fan.externalFanEnabled}
                onChange={(e) => onSetFan({ externalFanEnabled: e.target.checked })}
                className="rounded border-neutral-600 bg-neutral-700 text-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <span>External Fan</span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};
