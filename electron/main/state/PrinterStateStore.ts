/**
 * @fileoverview
 * Printer State Store - Single source of truth for all printer state
 *
 * Implements SSOT (Single Source of Truth) principle.
 * All state mutations go through this store.
 * Emits events when state changes for subscribers.
 *
 * @packageDocumentation
 */

import { EventEmitter } from 'node:events';
import type {
  EmulatorConfig,
  MaterialSlot,
  MaterialSlotUpdate,
  PrintJobStatus,
  PrinterFile,
  PrinterModel,
  PrinterProfile,
  PrinterState,
  SimulationMode,
  TemperatureState,
} from '../../../shared/types/printer';
import { DEFAULT_CONFIG, PRINTER_PROFILES } from '../../../shared/types/printer';

/**
 * State change event types
 */
export type StateChangeEvent =
  | 'state-changed'
  | 'temperature-changed'
  | 'position-changed'
  | 'job-changed'
  | 'cumulative-stats-changed';

/**
 * Default temperature state
 */
const DEFAULT_TEMPERATURE: TemperatureState = {
  nozzleCurrent: 25,
  nozzleTarget: 0,
  bedCurrent: 25,
  bedTarget: 0,
  chamberCurrent: 25,
  chamberTarget: 0,
} as const;

/**
 * Default material slot (empty)
 */
const EMPTY_SLOT: MaterialSlot = {
  slotId: 0,
  hasFilament: false,
  materialName: '',
  materialColor: '#000000',
} as const;

/**
 * Creates default printer state for a given model
 */
function createDefaultState(model: PrinterModel): PrinterState {
  const profile = PRINTER_PROFILES[model];

  return {
    model,
    protocolMode: profile.protocolMode,
    machineStatus: 'idle',
    temperature: { ...DEFAULT_TEMPERATURE },
    position: { x: 0, y: 0, z: 0, e: 0 },
    printJob: {
      status: 'idle',
      currentFile: null,
      progress: 0,
      currentLayer: 0,
      totalLayers: 0,
      estimatedTimeRemaining: 0,
      totalPrintTime: 0,
      elapsedTime: 0,
    },
    materialStation: {
      hasMatlStation: profile.hasMaterialStation,
      currentSlot: 0,
      currentLoadSlot: 0,
      slotCount: profile.hasMaterialStation ? 4 : 0,
      slots: profile.hasMaterialStation
        ? [1, 2, 3, 4].map((id) => ({
            ...EMPTY_SLOT,
            slotId: id,
          }))
        : [],
    },
    led: {
      enabled: false,
      red: 255,
      green: 255,
      blue: 255,
    },
    fan: {
      coolingFanSpeed: 0,
      coolingLeftFanSpeed: 0,
      chamberFanSpeed: 0,
      externalFanEnabled: false,
      internalFanEnabled: false,
    },
    endstops: {
      xMax: 1,
      yMax: 1,
      zMin: 1,
    },
    files: [],
    tcpControlActive: false,
    serialNumber: DEFAULT_CONFIG.serialNumber,
    checkCode: DEFAULT_CONFIG.checkCode,
    machineName: `${profile.name} Emulator`,
    firmwareVersion: profile.defaultFirmware,
    macAddress: '00:11:22:33:44:55',
    ipAddress: '192.168.1.100',
    nozzleCount: 1,
    nozzleModel: '0.4mm',
    doorOpen: false,
    autoShutdown: 'close',
    autoShutdownTime: 30,
    cumulativePrintTime: 0,
    cumulativeFilament: 0,
    estimatedRightLen: 0,
    estimatedRightWeight: 0,
    estimatedLeftLen: 0,
    estimatedLeftWeight: 0,
  };
}

/**
 * Printer State Store
 *
 * Single source of truth for all printer state.
 * Uses EventEmitter for state change notifications.
 */
export class PrinterStateStore extends EventEmitter {
  #state: PrinterState;
  #simulationMode: SimulationMode = DEFAULT_CONFIG.simulationMode;
  #simulationSpeed: number = DEFAULT_CONFIG.simulationSpeed;
  #config: EmulatorConfig = { ...DEFAULT_CONFIG };

  /**
   * Gets the current printer state (readonly)
   */
  get state(): Readonly<PrinterState> {
    return this.#state;
  }

  /**
   * Gets the current simulation mode
   */
  get simulationMode(): SimulationMode {
    return this.#simulationMode;
  }

  /**
   * Sets the simulation mode
   */
  set simulationMode(mode: SimulationMode) {
    this.#simulationMode = mode;
  }

  /**
   * Gets the simulation speed multiplier
   */
  get simulationSpeed(): number {
    return this.#simulationSpeed;
  }

  /**
   * Sets the simulation speed multiplier
   */
  set simulationSpeed(speed: number) {
    this.#simulationSpeed = Math.max(1, Math.min(1000, speed));
  }

  /**
   * Gets the emulator config
   */
  get config(): Readonly<EmulatorConfig> {
    return this.#config;
  }

  constructor() {
    super();
    this.#state = createDefaultState(DEFAULT_CONFIG.selectedModel);
  }

  /**
   * Initializes the store with a specific printer model
   */
  initialize(model: PrinterModel): void {
    this.#state = createDefaultState(model);
    this.#config.selectedModel = model;
    const profile = PRINTER_PROFILES[model];
    this.#state.serialNumber = this.#config.serialNumber;
    this.#state.checkCode = this.#config.checkCode;
    this.#state.machineName = `${profile.name} Emulator`;
    // Load cumulative stats from config for persistence
    this.#state.cumulativePrintTime = this.#config.cumulativePrintTime;
    this.#state.cumulativeFilament = this.#config.cumulativeFilament;
    this.emit('state-changed', this.#state);
  }

  /**
   * Resets the state to default for the current model
   */
  reset(): void {
    this.initialize(this.#state.model);
  }

  /**
   * Updates the emulator configuration
   */
  updateConfig(config: Partial<EmulatorConfig>): void {
    this.#config = { ...this.#config, ...config };

    // Update state items that depend on config
    if (config.serialNumber !== undefined) {
      this.#state.serialNumber = config.serialNumber;
    }
    if (config.checkCode !== undefined) {
      this.#state.checkCode = config.checkCode;
    }
    if (config.simulationMode !== undefined) {
      this.#simulationMode = config.simulationMode;
    }
    if (config.simulationSpeed !== undefined) {
      this.#simulationSpeed = config.simulationSpeed;
    }
    if (config.cumulativePrintTime !== undefined) {
      this.#state.cumulativePrintTime = config.cumulativePrintTime;
    }
    if (config.cumulativeFilament !== undefined) {
      this.#state.cumulativeFilament = config.cumulativeFilament;
    }

    this.emit('state-changed', this.#state);
  }

  /**
   * Sets the machine status
   */
  setMachineStatus(status: PrintJobStatus): void {
    if (this.#state.machineStatus !== status) {
      this.#state.machineStatus = status;
      this.#state.printJob.status = status;
      this.emit('state-changed', this.#state);
    }
  }

  /**
   * Updates temperature values
   */
  updateTemperature(temps: Partial<TemperatureState>): void {
    this.#state.temperature = { ...this.#state.temperature, ...temps };
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
  }

  /**
   * Sets target temperatures for heating
   */
  setTargetTemperatures(nozzle: number, bed: number, chamber?: number): void {
    this.#state.temperature.nozzleTarget = nozzle;
    this.#state.temperature.bedTarget = bed;
    if (chamber !== undefined) {
      this.#state.temperature.chamberTarget = chamber;
    }
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
  }

  /**
   * Simulates temperature changes (for auto-simulation mode)
   */
  simulateTemperatures(): void {
    const temp = this.#state.temperature;
    let changed = false;

    // Nozzle heating/cooling
    if (temp.nozzleCurrent < temp.nozzleTarget) {
      temp.nozzleCurrent = Math.min(temp.nozzleTarget, temp.nozzleCurrent + 2);
      changed = true;
    } else if (temp.nozzleCurrent > temp.nozzleTarget) {
      temp.nozzleCurrent = Math.max(temp.nozzleTarget, temp.nozzleCurrent - 1);
      changed = true;
    }

    // Bed heating/cooling
    if (temp.bedCurrent < temp.bedTarget) {
      temp.bedCurrent = Math.min(temp.bedTarget, temp.bedCurrent + 1);
      changed = true;
    } else if (temp.bedCurrent > temp.bedTarget) {
      temp.bedCurrent = Math.max(temp.bedTarget, temp.bedCurrent - 0.5);
      changed = true;
    }

    // Chamber heating/cooling
    if (temp.chamberCurrent < temp.chamberTarget) {
      temp.chamberCurrent = Math.min(temp.chamberTarget, temp.chamberCurrent + 0.5);
      changed = true;
    } else if (temp.chamberCurrent > temp.chamberTarget) {
      temp.chamberCurrent = Math.max(temp.chamberTarget, temp.chamberCurrent - 0.3);
      changed = true;
    }

    if (changed) {
      this.emit('temperature-changed', temp);
      this.emit('state-changed', this.#state);
    }
  }

  /**
   * Updates position values
   */
  updatePosition(position: Partial<{ x: number; y: number; z: number; e: number }>): void {
    Object.assign(this.#state.position, position);
    this.emit('position-changed', this.#state.position);
    this.emit('state-changed', this.#state);
  }

  /**
   * Homes all axes (resets position to zero)
   */
  homeAxes(axes?: 'x' | 'y' | 'z' | 'all'): void {
    if (!axes || axes === 'all') {
      this.#state.position = { x: 0, y: 0, z: 0, e: this.#state.position.e };
    } else {
      this.#state.position[axes] = 0;
    }
    this.#state.endstops = { xMax: 1, yMax: 1, zMin: 1 };
    this.emit('position-changed', this.#state.position);
    this.emit('state-changed', this.#state);
  }

  /**
   * Starts a print job
   */
  startPrint(filename: string, estimatedTime?: number): void {
    this.#state.printJob = {
      status: 'heating',
      currentFile: filename,
      progress: 0,
      currentLayer: 0,
      totalLayers: estimatedTime ? Math.floor(estimatedTime / 60) : 100,
      estimatedTimeRemaining: estimatedTime ?? 3600,
      totalPrintTime: estimatedTime ?? 3600,
      elapsedTime: 0,
    };
    this.#state.machineStatus = 'heating';
    this.emit('job-changed', this.#state.printJob);
    this.emit('state-changed', this.#state);
  }

  /**
   * Pauses the current print job
   */
  pausePrint(): void {
    if (this.#state.printJob.status === 'printing') {
      this.#state.printJob.status = 'paused';
      this.#state.machineStatus = 'paused';
      this.emit('job-changed', this.#state.printJob);
      this.emit('state-changed', this.#state);
    }
  }

  /**
   * Resumes the current print job
   */
  resumePrint(): void {
    if (this.#state.printJob.status === 'paused') {
      this.#state.printJob.status = 'printing';
      this.#state.machineStatus = 'busy';
      this.emit('job-changed', this.#state.printJob);
      this.emit('state-changed', this.#state);
    }
  }

  /**
   * Stops the current print job
   */
  stopPrint(): void {
    this.#state.printJob = {
      status: 'idle',
      currentFile: null,
      progress: 0,
      currentLayer: 0,
      totalLayers: 0,
      estimatedTimeRemaining: 0,
      totalPrintTime: 0,
      elapsedTime: 0,
    };
    this.#state.machineStatus = 'idle';
    // Cool down
    this.#state.temperature.nozzleTarget = 0;
    this.#state.temperature.bedTarget = 0;
    this.emit('job-changed', this.#state.printJob);
    this.emit('state-changed', this.#state);
  }

  /**
   * Simulates print progress (for auto-simulation mode)
   */
  simulatePrintProgress(): void {
    const job = this.#state.printJob;
    if (job.status !== 'printing' && job.status !== 'heating') {
      return;
    }

    // Check if temperatures are ready
    const tempsReady =
      this.#state.temperature.nozzleCurrent >= this.#state.temperature.nozzleTarget - 2 &&
      this.#state.temperature.bedCurrent >= this.#state.temperature.bedTarget - 2;

    if (job.status === 'heating' && tempsReady) {
      job.status = 'printing';
      this.#state.machineStatus = 'busy';
    }

    if (job.status === 'printing') {
      // Increment progress based on simulation speed
      const increment = 0.001 * (this.#simulationSpeed / 100);
      job.progress = Math.min(1, job.progress + increment);
      job.elapsedTime += 1;
      job.estimatedTimeRemaining = Math.max(0, job.totalPrintTime - job.elapsedTime);
      job.currentLayer = Math.floor(job.progress * job.totalLayers);

      // Update filament estimates based on progress
      // Crude estimate: 100g total, ~1000mm length per job (will be refined later)
      const progressPercent = job.progress * 100;
      this.#state.estimatedRightWeight = (progressPercent / 100) * 100; // 100g total
      this.#state.estimatedRightLen = (progressPercent / 100) * 1000; // 1000mm total

      // Check if print is complete
      if (job.progress >= 1) {
        job.status = 'completed';
        this.#state.machineStatus = 'idle';
        // Cool down
        this.#state.temperature.nozzleTarget = 0;
        this.#state.temperature.bedTarget = 0;

        // Increment cumulative stats
        this.#state.cumulativePrintTime += job.elapsedTime;
        // Use crude estimate for filament: 100g per job (will be refined later)
        this.#state.cumulativeFilament += 100;
        // Emit cumulative stats changed event
        this.emit('cumulative-stats-changed', {
          cumulativePrintTime: this.#state.cumulativePrintTime,
          cumulativeFilament: this.#state.cumulativeFilament,
        });
      }

      this.emit('job-changed', job);
      this.emit('state-changed', this.#state);
    }
  }

  /**
   * Updates LED state
   */
  updateLed(enabled: boolean, red?: number, green?: number, blue?: number): void {
    this.#state.led.enabled = enabled;
    if (red !== undefined) this.#state.led.red = red;
    if (green !== undefined) this.#state.led.green = green;
    if (blue !== undefined) this.#state.led.blue = blue;
    this.emit('state-changed', this.#state);
  }

  /**
   * Updates fan state
   */
  updateFan(
    settings: Partial<{
      coolingFanSpeed: number;
      chamberFanSpeed: number;
      externalFanEnabled: boolean;
      internalFanEnabled: boolean;
    }>
  ): void {
    Object.assign(this.#state.fan, settings);
    this.emit('state-changed', this.#state);
  }

  /**
   * Sets TCP control active state
   */
  setTcpControlActive(active: boolean): void {
    this.#state.tcpControlActive = active;
    this.emit('state-changed', this.#state);
  }

  /**
   * Adds a file to the file list
   */
  addFile(file: PrinterFile): void {
    // Remove existing file with same name
    this.#state.files = this.#state.files.filter((f) => f.name !== file.name);
    this.#state.files.push(file);
    this.emit('state-changed', this.#state);
  }

  /**
   * Removes a file from the file list
   */
  removeFile(filename: string): void {
    this.#state.files = this.#state.files.filter((f) => f.name !== filename);
    this.emit('state-changed', this.#state);
  }

  /**
   * Clears all files
   */
  clearFiles(): void {
    this.#state.files = [];
    this.emit('state-changed', this.#state);
  }

  /**
   * Gets a file by name
   */
  getFile(filename: string): PrinterFile | undefined {
    return this.#state.files.find((f) => f.name === filename);
  }

  /**
   * Gets all files
   */
  getFiles(): ReadonlyArray<PrinterFile> {
    return this.#state.files;
  }

  /**
   * Updates material slot information (AD5X only)
   */
  updateMaterialSlot(slotId: number, slot: MaterialSlotUpdate): void {
    const index = this.#state.materialStation.slots.findIndex((s) => s.slotId === slotId);
    if (index >= 0) {
      const existing = this.#state.materialStation.slots[index];
      if (existing) {
        this.#state.materialStation.slots[index] = {
          slotId: existing.slotId,
          hasFilament: slot.hasFilament ?? existing.hasFilament,
          materialName: slot.materialName ?? existing.materialName,
          materialColor: slot.materialColor ?? existing.materialColor,
        };
        this.emit('state-changed', this.#state);
      }
    }
  }

  /**
   * Sets the current active material slot (AD5X only)
   */
  setCurrentSlot(slotId: number): void {
    this.#state.materialStation.currentSlot = slotId;
    this.emit('state-changed', this.#state);
  }

  /**
   * Gets the printer profile for the current model
   */
  getProfile(): PrinterProfile {
    return PRINTER_PROFILES[this.#state.model];
  }
}

/**
 * Global singleton instance of the printer state store
 */
export const printerStateStore = new PrinterStateStore();
