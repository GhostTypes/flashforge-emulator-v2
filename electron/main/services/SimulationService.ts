/**
 * @fileoverview
 * Print simulation service
 *
 * Handles automatic simulation of print progress and temperatures.
 * Runs on a timer to update state periodically.
 *
 * @packageDocumentation
 */

import { printerStateStore } from '../state/PrinterStateStore';

/**
 * Simulation update interval in milliseconds
 */
const SIMULATION_INTERVAL = 100;

/**
 * Print Simulation Service
 *
 * Manages the auto-simulation loop for print jobs and temperature changes.
 */
export class SimulationService {
  #intervalId: ReturnType<typeof setInterval> | null = null;
  #active = false;

  /**
   * Whether the simulation service is currently running
   */
  get active(): boolean {
    return this.#active;
  }

  /**
   * Starts the simulation service
   */
  start(): void {
    if (this.#active) {
      return;
    }

    this.#active = true;
    this.#intervalId = setInterval(() => {
      this.#tick();
    }, SIMULATION_INTERVAL);
  }

  /**
   * Stops the simulation service
   */
  stop(): void {
    if (!this.#active) {
      return;
    }

    this.#active = false;
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }

  /**
   * Single simulation tick
   * Updates temperatures and print progress
   */
  #tick(): void {
    // Only simulate in auto mode
    if (printerStateStore.simulationMode !== 'auto') {
      return;
    }

    // Simulate temperature changes
    printerStateStore.simulateTemperatures();

    // Simulate print progress
    printerStateStore.simulatePrintProgress();
  }
}

/**
 * Global singleton instance
 */
export const simulationService = new SimulationService();
