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
  PrinterState,
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
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Initialize printer with model */
  initializePrinter: (model: PrinterModel) => Promise<void>;
  /** Reset printer state */
  resetPrinter: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        const [initialState, initialConfig] = await Promise.all([
          window.api.getPrinterState(),
          window.api.getConfig(),
        ]);

        if (mounted) {
          setState(initialState);
          setConfigState(initialConfig);
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

    return () => {
      mounted = false;
      window.api.removePrinterStateListener();
    };
  }, []);

  // Mutation functions
  const initializePrinter = async (model: PrinterModel): Promise<void> => {
    await window.api.initializePrinter(model);
    const updatedState = await window.api.getPrinterState();
    setState(updatedState);
  };

  const resetPrinter = async (): Promise<void> => {
    await window.api.resetPrinter();
    const updatedState = await window.api.getPrinterState();
    setState(updatedState);
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

  return {
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
