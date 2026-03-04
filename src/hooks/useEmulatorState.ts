/**
 * @fileoverview
 * Custom hook for managing emulator state
 *
 * Handles state synchronization with the main process via IPC.
 * Provides real-time updates for printer state, temperatures, position, and jobs.
 *
 * @packageDocumentation
 */

import type {
  EmulatorConfig,
  NetworkInterface,
  PrinterModel,
  PrinterScenario,
  PrinterState,
  ProtocolLogEntry,
  ScenarioPreset,
} from '@shared/types/printer';
import { PRINTER_PROFILES } from '@shared/types/printer';
import { useEffect, useState } from 'react';

/**
 * Hook return type with state and mutators
 */
interface UseEmulatorStateReturn {
  /** Current printer state */
  state: PrinterState | null;
  /** Emulator configuration */
  config: EmulatorConfig | null;
  /** Real protocol logs from the main process */
  protocolLogs: readonly ProtocolLogEntry[];
  /** Available QA scenario presets */
  scenarioPresets: readonly ScenarioPreset[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Initialize printer with model */
  initializePrinter: (model: PrinterModel) => Promise<void>;
  /** Reset printer state */
  resetPrinter: () => Promise<void>;
  /** Set machine status */
  setMachineStatus: (status: Parameters<typeof window.api.setMachineStatus>[0]) => Promise<void>;
  /** Set print job status */
  setPrintJobStatus: (status: Parameters<typeof window.api.setPrintJobStatus>[0]) => Promise<void>;
  /** Cancel the current job */
  cancelPrint: () => Promise<void>;
  /** Clear completed/cancelled/error state */
  clearCompletedState: () => Promise<void>;
  /** Apply a named scenario preset */
  applyScenarioPreset: (presetId: string) => Promise<void>;
  /** Apply an explicit state injection */
  applyScenario: (scenario: PrinterScenario) => Promise<void>;
  /** Export the current live state as a scenario snapshot */
  getScenarioSnapshot: () => Promise<PrinterScenario>;
  /** Update configuration */
  setConfig: (config: EmulatorConfig) => Promise<void>;
  /** Start TCP server */
  startTcpServer: () => Promise<void>;
  /** Stop TCP server */
  stopTcpServer: () => Promise<void>;
  /** Start HTTP server */
  startHttpServer: () => Promise<void>;
  /** Stop HTTP server */
  stopHttpServer: () => Promise<void>;
  /** Get available network interfaces */
  getNetworkInterfaces: () => Promise<NetworkInterface[]>;
  /** Clear protocol logs */
  clearProtocolLogs: () => Promise<void>;
}

/**
 * Custom hook for emulator state management
 *
 * Provides a reactive interface to the emulator's state and configuration.
 * Automatically listens for state updates from the main process.
 */
export function useEmulatorState(): UseEmulatorStateReturn {
  const [state, setState] = useState<PrinterState | null>(null);
  const [config, setConfigState] = useState<EmulatorConfig | null>(null);
  const [protocolLogs, setProtocolLogs] = useState<readonly ProtocolLogEntry[]>([]);
  const [scenarioPresets, setScenarioPresets] = useState<readonly ScenarioPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        const [initialState, initialConfig, initialProtocolLogs, initialScenarioPresets] =
          await Promise.all([
            window.api.getPrinterState(),
            window.api.getConfig(),
            window.api.getProtocolLogs(),
            window.api.getScenarioPresets(),
          ]);

        if (mounted) {
          setState(initialState);
          setConfigState(initialConfig);
          setProtocolLogs(initialProtocolLogs);
          setScenarioPresets(initialScenarioPresets);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Failed to load state';
          setError(message);
          setLoading(false);
        }
      }
    }

    void loadState();

    // Listen for state updates
    window.api.onPrinterStateUpdate((updatedState) => {
      setState(updatedState);
    });
    window.api.onProtocolLogEntry((entry) => {
      setProtocolLogs((previous) => [...previous.slice(-999), entry]);
    });
    window.api.onProtocolLogCleared(() => {
      setProtocolLogs([]);
    });

    return () => {
      mounted = false;
      window.api.removePrinterStateListener();
      window.api.removeProtocolLogListeners();
    };
  }, []);

  // Mutation functions
  const initializePrinter = async (model: PrinterModel): Promise<void> => {
    await window.api.initializePrinter(model);
    const [updatedState, updatedScenarioPresets] = await Promise.all([
      window.api.getPrinterState(),
      window.api.getScenarioPresets(),
    ]);
    setState(updatedState);
    setScenarioPresets(updatedScenarioPresets);
  };

  const resetPrinter = async (): Promise<void> => {
    await window.api.resetPrinter();
    const updatedState = await window.api.getPrinterState();
    setState(updatedState);
  };

  const setMachineStatus = async (
    status: Parameters<typeof window.api.setMachineStatus>[0]
  ): Promise<void> => {
    await window.api.setMachineStatus(status);
  };

  const setPrintJobStatus = async (
    status: Parameters<typeof window.api.setPrintJobStatus>[0]
  ): Promise<void> => {
    await window.api.setPrintJobStatus(status);
  };

  const cancelPrint = async (): Promise<void> => {
    await window.api.cancelPrint();
  };

  const clearCompletedState = async (): Promise<void> => {
    await window.api.clearCompletedState();
  };

  const applyScenarioPreset = async (presetId: string): Promise<void> => {
    await window.api.applyScenarioPreset(presetId);
  };

  const applyScenario = async (scenario: PrinterScenario): Promise<void> => {
    await window.api.applyScenario(scenario);
  };

  const getScenarioSnapshot = async (): Promise<PrinterScenario> => {
    return await window.api.getScenarioSnapshot();
  };

  const setConfig = async (newConfig: EmulatorConfig): Promise<void> => {
    await window.api.setConfig(newConfig);
    setConfigState(newConfig);
  };

  const startTcpServer = async (): Promise<void> => {
    await window.api.startTcpServer();
  };

  const stopTcpServer = async (): Promise<void> => {
    await window.api.stopTcpServer();
  };

  const startHttpServer = async (): Promise<void> => {
    await window.api.startHttpServer();
  };

  const stopHttpServer = async (): Promise<void> => {
    await window.api.stopHttpServer();
  };

  const getNetworkInterfaces = async (): Promise<NetworkInterface[]> => {
    return await window.api.getNetworkInterfaces();
  };

  const clearProtocolLogs = async (): Promise<void> => {
    await window.api.clearProtocolLogs();
  };

  return {
    state,
    config,
    protocolLogs,
    scenarioPresets,
    loading,
    error,
    initializePrinter,
    resetPrinter,
    setMachineStatus,
    setPrintJobStatus,
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
  };
}

/**
 * Get printer profile by model
 */
export function getPrinterProfile(model: PrinterModel) {
  return PRINTER_PROFILES[model];
}

/**
 * Get all available printer models
 */
export function getPrinterModels(): readonly { model: PrinterModel; name: string }[] {
  return Object.values(PRINTER_PROFILES).map((profile) => ({
    model: profile.model,
    name: profile.name,
  }));
}
