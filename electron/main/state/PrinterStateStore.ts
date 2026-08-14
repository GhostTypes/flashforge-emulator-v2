/**
 * @fileoverview
 * Printer State Store - single source of truth for emulator state and QA scenarios.
 *
 * The store supports two complementary modes:
 * - realistic auto simulation for end-to-end print lifecycle testing
 * - exact manual state injection for regression reproduction
 *
 * @packageDocumentation
 */

import { EventEmitter } from 'node:events';
import type {
  EmulatorConfig,
  MaterialSlot,
  MaterialSlotUpdate,
  PrintJobState,
  PrintJobStatus,
  PrinterFile,
  PrinterModel,
  PrinterProfile,
  PrinterScenario,
  PrinterState,
  ScenarioPreset,
  ScenarioPresetId,
  SimulationMode,
  TemperatureState,
} from '../../../shared/types/printer';
import {
  DEFAULT_CONFIG,
  PRINTER_PROFILES,
  canStartNewPrint,
  isCreator5Series,
} from '../../../shared/types/printer';

export type StateChangeEvent =
  | 'state-changed'
  | 'temperature-changed'
  | 'position-changed'
  | 'job-changed'
  | 'cumulative-stats-changed';

const AMBIENT_TEMPERATURE = 25;
const DEFAULT_JOB_FILE = 'qa-regression-test.gcode';
const DEFAULT_TOTAL_LAYERS = 240;
const DEFAULT_TOTAL_PRINT_TIME_SECONDS = 3720;
const DEFAULT_ESTIMATED_RIGHT_LEN_MM = 14250;
const DEFAULT_ESTIMATED_RIGHT_WEIGHT_G = 96;
const DEFAULT_PAUSE_DELAY_MS = 500;

const DEFAULT_TEMPERATURE: TemperatureState = {
  nozzleCurrent: AMBIENT_TEMPERATURE,
  nozzleTarget: 0,
  leftNozzleCurrent: 0,
  leftNozzleTarget: 0,
  bedCurrent: AMBIENT_TEMPERATURE,
  bedTarget: 0,
  chamberCurrent: AMBIENT_TEMPERATURE,
  chamberTarget: 0,
} as const;

const EMPTY_SLOT: MaterialSlot = {
  slotId: 0,
  hasFilament: false,
  materialName: '',
  materialColor: '#000000',
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToWholeNumber(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function buildMachineName(profile: PrinterProfile): string {
  return profile.model === 'adventurer-5x' ? 'AD5X' : `${profile.name} Emulator`;
}

function createIdlePrintJob(): PrintJobState {
  return {
    status: 'idle',
    currentFile: null,
    progress: 0,
    currentLayer: 0,
    totalLayers: 0,
    remainingTimeMinutes: 0,
    totalPrintTimeSeconds: 0,
    elapsedTimeSeconds: 0,
    formattedEta: '',
  };
}

function createSyntheticFile(filename: string, totalPrintTimeSeconds: number): PrinterFile {
  return {
    name: filename,
    path: `/data/${filename}`,
    size: 2_500_000,
    printTime: totalPrintTimeSeconds,
    is3mf: filename.toLowerCase().endsWith('.3mf'),
    gcodeToolCnt: 1,
    gcodeToolDatas: [],
    useMatlStation: false,
    totalFilamentWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
    thumbnail: '',
  };
}

function buildDefaultTargets(profile: PrinterProfile): {
  nozzle: number;
  leftNozzle: number;
  bed: number;
  chamber: number;
} {
  return {
    nozzle: 220,
    leftNozzle: profile.hasMaterialStation ? 220 : 0,
    bed: 60,
    chamber: profile.hasChamberTemp ? 35 : 0,
  };
}

function formatEtaFromMinutes(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function formatEtaFromSeconds(seconds: number): string {
  return formatEtaFromMinutes(seconds / 60);
}

function roundRemainingMinutesFromSeconds(seconds: number): number {
  const safeSeconds = Math.max(0, seconds);
  return safeSeconds === 0 ? 0 : Math.round(safeSeconds / 60);
}

function isJobStateVisible(status: PrintJobStatus): boolean {
  return (
    status === 'heating' ||
    status === 'printing' ||
    status === 'paused' ||
    status === 'pausing' ||
    status === 'completed' ||
    status === 'cancel' ||
    status === 'cancelled' ||
    status === 'error'
  );
}

function createDefaultState(model: PrinterModel): PrinterState {
  const profile = PRINTER_PROFILES[model];

  return {
    model,
    protocolMode: profile.protocolMode,
    machineStatus: 'idle',
    temperature: { ...DEFAULT_TEMPERATURE },
    position: { x: 0, y: 0, z: 0, e: 0, positioningMode: 'absolute' },
    printJob: createIdlePrintJob(),
    materialStation: {
      hasMatlStation: profile.hasMaterialStation,
      currentSlot: profile.hasMaterialStation ? 1 : 0,
      currentLoadSlot: 0,
      slotCount: profile.hasMaterialStation ? 4 : 0,
      slots: profile.hasMaterialStation
        ? [1, 2, 3, 4].map((id) => ({
            ...EMPTY_SLOT,
            slotId: id,
            // Keep two loaded slots by default so AD5X single-color and multi-color E2E flows are both testable.
            hasFilament: id === 1 || id === 2,
            materialName: id === 1 ? 'PLA' : id === 2 ? 'PETG' : '',
            materialColor: id === 1 ? '#4DA3FF' : id === 2 ? '#FF8A3D' : EMPTY_SLOT.materialColor,
          }))
        : [],
    },
    led: {
      enabled: false,
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
    machineName: buildMachineName(profile),
    firmwareVersion: profile.defaultFirmware,
    macAddress: '00:11:22:33:44:55',
    ipAddress: '192.168.1.100',
    nozzleCount: profile.toolCount,
    nozzleModel: '0.4mm',
    doorOpen: false,
    // Per-tool temps (Creator 5 series). Tool 0 starts at ambient like the
    // single-nozzle field; unused on models that report legacy scalars only.
    toolTemps: Array.from({ length: profile.toolCount }, (_, index) =>
      index === 0 ? AMBIENT_TEMPERATURE : 0
    ),
    toolTargetTemps: new Array<number>(profile.toolCount).fill(0),
    autoShutdown: 'close',
    autoShutdownTime: 30,
    cumulativePrintTime: 0,
    cumulativeFilament: 0,
    estimatedRightLen: 0,
    estimatedRightWeight: 0,
    estimatedLeftLen: 0,
    estimatedLeftWeight: 0,
    hasLeftFilament: false,
    hasRightFilament: true,
    leftFilamentType: '',
    rightFilamentType: 'PLA',
    currentPrintSpeed: 100,
    printSpeedAdjust: 100,
    fillAmount: 0,
    errorCode: '',
    tvoc: 0,
    zAxisCompensation: 0,
    remainingDiskSpace: 1024,
    runoutSensorEnabled: false,
  };
}

function getDiscoveryIdentityDefaultsForModel(model: PrinterModel): {
  vid: number;
  pid: number;
  productType: number;
  legacyPort2: number;
} {
  switch (model) {
    case 'adventurer-3':
      return {
        vid: 0x2b71,
        pid: 0x0008,
        productType: 0,
        legacyPort2: 8,
      };
    case 'adventurer-4':
      return {
        vid: 0x2b71,
        pid: 0x001e,
        productType: 0,
        legacyPort2: 8,
      };
    case 'adventurer-5x':
      return {
        vid: 0x2b71,
        pid: 0x0026,
        productType: 0x5a02,
        legacyPort2: 8,
      };
    case 'adventurer-5m':
    case 'adventurer-5m-pro':
      return {
        vid: 0x2b71,
        pid: 0x0024,
        productType: 0x5a02,
        legacyPort2: 8,
      };
    case 'creator-5':
      return {
        vid: 0x2b71,
        pid: 0x0028,
        productType: 0x5a02,
        legacyPort2: 8,
      };
    case 'creator-5-pro':
      return {
        vid: 0x2b71,
        pid: 0x0029,
        productType: 0x5a02,
        legacyPort2: 8,
      };
  }
}

export class PrinterStateStore extends EventEmitter {
  #state: PrinterState;
  #simulationMode: SimulationMode = DEFAULT_CONFIG.simulationMode;
  #simulationSpeed = DEFAULT_CONFIG.simulationSpeed;
  #config: EmulatorConfig = { ...DEFAULT_CONFIG };
  #pauseTimeoutId: ReturnType<typeof setTimeout> | null = null;

  get state(): Readonly<PrinterState> {
    return this.#state;
  }

  get simulationMode(): SimulationMode {
    return this.#simulationMode;
  }

  set simulationMode(mode: SimulationMode) {
    this.#simulationMode = mode;
  }

  get simulationSpeed(): number {
    return this.#simulationSpeed;
  }

  set simulationSpeed(speed: number) {
    this.#simulationSpeed = Math.max(1, Math.min(1000, Math.round(speed)));
  }

  get config(): Readonly<EmulatorConfig> {
    return this.#config;
  }

  constructor() {
    super();
    this.#state = createDefaultState(DEFAULT_CONFIG.selectedModel);
  }

  initialize(model: PrinterModel): void {
    this.#clearPauseTimeout();
    this.#state = createDefaultState(model);
    this.#config.selectedModel = model;
    const discoveryIdentityDefaults = getDiscoveryIdentityDefaultsForModel(model);
    this.#config.discoveryConfig = {
      ...this.#config.discoveryConfig,
      ...discoveryIdentityDefaults,
      machineName: this.#state.machineName,
    };
    this.#state.serialNumber = this.#config.serialNumber;
    this.#state.checkCode = this.#config.checkCode;
    this.#state.cumulativePrintTime = this.#config.cumulativePrintTime;
    this.#state.cumulativeFilament = this.#config.cumulativeFilament;
    this.emit('state-changed', this.#state);
  }

  reset(): void {
    this.initialize(this.#state.model);
  }

  updateConfig(config: Partial<EmulatorConfig>): void {
    const nextTcpPort = config.tcpPort ?? this.#config.tcpPort;
    const nextHttpPort = config.httpPort ?? this.#config.httpPort;
    const nextDiscoveryConfig =
      config.discoveryConfig !== undefined
        ? {
            ...this.#config.discoveryConfig,
            ...config.discoveryConfig,
          }
        : {
            ...this.#config.discoveryConfig,
          };

    // Discovery advertisements must always reflect the runtime command/http ports.
    nextDiscoveryConfig.commandPort = nextTcpPort;
    nextDiscoveryConfig.httpPort = nextHttpPort;

    this.#config = {
      ...this.#config,
      ...config,
      tcpPort: nextTcpPort,
      httpPort: nextHttpPort,
      discoveryConfig: nextDiscoveryConfig,
    };

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
      this.#simulationSpeed = Math.max(1, Math.min(1000, Math.round(config.simulationSpeed)));
    }
    if (config.cumulativePrintTime !== undefined) {
      this.#state.cumulativePrintTime = config.cumulativePrintTime;
    }
    if (config.cumulativeFilament !== undefined) {
      this.#state.cumulativeFilament = config.cumulativeFilament;
    }

    this.emit('state-changed', this.#state);
  }

  setMachineIdentity(identity: {
    serialNumber?: string;
    checkCode?: string;
    machineName?: string;
    ipAddress?: string;
  }): void {
    if (identity.serialNumber !== undefined) {
      this.#state.serialNumber = identity.serialNumber;
      this.#config.serialNumber = identity.serialNumber;
    }

    if (identity.checkCode !== undefined) {
      this.#state.checkCode = identity.checkCode;
      this.#config.checkCode = identity.checkCode;
    }

    if (identity.machineName !== undefined) {
      this.#state.machineName = identity.machineName;
      this.#config.discoveryConfig.machineName = identity.machineName;
    }

    if (identity.ipAddress !== undefined) {
      this.#state.ipAddress = identity.ipAddress;
    }

    this.emit('state-changed', this.#state);
  }

  getProfile(): PrinterProfile {
    return PRINTER_PROFILES[this.#state.model];
  }

  getScenarioPresets(): readonly ScenarioPreset[] {
    const profile = this.getProfile();
    const fileName =
      this.#state.printJob.currentFile ?? this.#state.files[0]?.name ?? DEFAULT_JOB_FILE;
    const totalPrintTimeSeconds =
      this.#state.printJob.totalPrintTimeSeconds > 0
        ? this.#state.printJob.totalPrintTimeSeconds
        : DEFAULT_TOTAL_PRINT_TIME_SECONDS;
    const totalLayers =
      this.#state.printJob.totalLayers > 0
        ? this.#state.printJob.totalLayers
        : DEFAULT_TOTAL_LAYERS;
    const defaultTargets = buildDefaultTargets(profile);

    return [
      {
        id: 'idle',
        label: 'Idle',
        description: 'Clear active job state and return the machine to an idle baseline.',
        scenario: {
          machineStatus: 'idle',
          printJobStatus: 'idle',
          fileName: null,
          progressPercent: 0,
          currentLayer: 0,
          totalLayers: 0,
          elapsedTimeSeconds: 0,
          remainingTimeMinutes: 0,
          totalPrintTimeSeconds: 0,
          formattedEta: '',
          temperatures: {
            nozzleCurrent: AMBIENT_TEMPERATURE,
            nozzleTarget: 0,
            leftNozzleCurrent: profile.hasMaterialStation ? AMBIENT_TEMPERATURE : 0,
            leftNozzleTarget: 0,
            bedCurrent: AMBIENT_TEMPERATURE,
            bedTarget: 0,
            chamberCurrent: profile.hasChamberTemp ? AMBIENT_TEMPERATURE : 0,
            chamberTarget: 0,
          },
          fan: {
            coolingFanSpeed: 0,
            coolingLeftFanSpeed: 0,
            chamberFanSpeed: 0,
            externalFanEnabled: false,
            internalFanEnabled: false,
          },
          ledEnabled: false,
          estimatedRightLen: 0,
          estimatedRightWeight: 0,
          estimatedLeftLen: 0,
          estimatedLeftWeight: 0,
          errorCode: '',
        },
      },
      {
        id: 'heating',
        label: 'Heating',
        description: 'Printer is preparing a job and ramping temperatures toward targets.',
        scenario: {
          machineStatus: 'heating',
          printJobStatus: 'heating',
          fileName,
          progressPercent: 0,
          currentLayer: 0,
          totalLayers,
          elapsedTimeSeconds: 0,
          remainingTimeMinutes: roundRemainingMinutesFromSeconds(totalPrintTimeSeconds),
          totalPrintTimeSeconds,
          formattedEta: formatEtaFromSeconds(totalPrintTimeSeconds),
          temperatures: {
            nozzleCurrent: 45,
            nozzleTarget: defaultTargets.nozzle,
            leftNozzleCurrent: profile.hasMaterialStation ? 42 : 0,
            leftNozzleTarget: defaultTargets.leftNozzle,
            bedCurrent: 35,
            bedTarget: defaultTargets.bed,
            chamberCurrent: profile.hasChamberTemp ? 28 : AMBIENT_TEMPERATURE,
            chamberTarget: defaultTargets.chamber,
          },
          fan: {
            coolingFanSpeed: 0,
            coolingLeftFanSpeed: 0,
            chamberFanSpeed: 0,
          },
          estimatedRightLen: DEFAULT_ESTIMATED_RIGHT_LEN_MM,
          estimatedRightWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
        },
      },
      {
        id: 'printing',
        label: 'Printing',
        description: 'Actively printing with non-zero elapsed time, ETA, layers, and fans.',
        scenario: {
          machineStatus: 'printing',
          printJobStatus: 'printing',
          fileName,
          progressPercent: 47,
          currentLayer: Math.round(totalLayers * 0.47),
          totalLayers,
          elapsedTimeSeconds: 1_980,
          remainingTimeMinutes: 29,
          totalPrintTimeSeconds,
          formattedEta: '00:29',
          temperatures: {
            nozzleCurrent: defaultTargets.nozzle,
            nozzleTarget: defaultTargets.nozzle,
            leftNozzleCurrent: profile.hasMaterialStation ? defaultTargets.leftNozzle : 0,
            leftNozzleTarget: defaultTargets.leftNozzle,
            bedCurrent: defaultTargets.bed,
            bedTarget: defaultTargets.bed,
            chamberCurrent: profile.hasChamberTemp ? defaultTargets.chamber : AMBIENT_TEMPERATURE,
            chamberTarget: defaultTargets.chamber,
          },
          fan: {
            coolingFanSpeed: 85,
            coolingLeftFanSpeed: profile.hasMaterialStation ? 70 : 0,
            chamberFanSpeed: profile.hasChamberTemp ? 45 : 0,
          },
          ledEnabled: true,
          estimatedRightLen: DEFAULT_ESTIMATED_RIGHT_LEN_MM,
          estimatedRightWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
        },
      },
      {
        id: 'paused',
        label: 'Paused',
        description: 'Paused mid-print with job metadata preserved for resume testing.',
        scenario: {
          machineStatus: 'paused',
          printJobStatus: 'paused',
          fileName,
          progressPercent: 52,
          currentLayer: Math.round(totalLayers * 0.52),
          totalLayers,
          elapsedTimeSeconds: 2_160,
          remainingTimeMinutes: 26,
          totalPrintTimeSeconds,
          formattedEta: '00:26',
          temperatures: {
            nozzleCurrent: defaultTargets.nozzle,
            nozzleTarget: defaultTargets.nozzle,
            leftNozzleCurrent: profile.hasMaterialStation ? defaultTargets.leftNozzle : 0,
            leftNozzleTarget: defaultTargets.leftNozzle,
            bedCurrent: defaultTargets.bed,
            bedTarget: defaultTargets.bed,
            chamberCurrent: profile.hasChamberTemp ? defaultTargets.chamber : AMBIENT_TEMPERATURE,
            chamberTarget: defaultTargets.chamber,
          },
          fan: {
            coolingFanSpeed: 25,
            coolingLeftFanSpeed: profile.hasMaterialStation ? 20 : 0,
            chamberFanSpeed: profile.hasChamberTemp ? 20 : 0,
          },
          estimatedRightLen: DEFAULT_ESTIMATED_RIGHT_LEN_MM,
          estimatedRightWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
        },
      },
      {
        id: 'pausing',
        label: 'Pausing',
        description:
          'Transient pause transition for state-change and notification regression tests.',
        scenario: {
          machineStatus: 'pausing',
          printJobStatus: 'pausing',
          fileName,
          progressPercent: 52,
          currentLayer: Math.round(totalLayers * 0.52),
          totalLayers,
          elapsedTimeSeconds: 2_160,
          remainingTimeMinutes: 26,
          totalPrintTimeSeconds,
          formattedEta: '00:26',
          temperatures: {
            nozzleCurrent: defaultTargets.nozzle,
            nozzleTarget: defaultTargets.nozzle,
            leftNozzleCurrent: profile.hasMaterialStation ? defaultTargets.leftNozzle : 0,
            leftNozzleTarget: defaultTargets.leftNozzle,
            bedCurrent: defaultTargets.bed,
            bedTarget: defaultTargets.bed,
            chamberCurrent: profile.hasChamberTemp ? defaultTargets.chamber : AMBIENT_TEMPERATURE,
            chamberTarget: defaultTargets.chamber,
          },
          fan: {
            coolingFanSpeed: 40,
            coolingLeftFanSpeed: profile.hasMaterialStation ? 30 : 0,
            chamberFanSpeed: profile.hasChamberTemp ? 20 : 0,
          },
          estimatedRightLen: DEFAULT_ESTIMATED_RIGHT_LEN_MM,
          estimatedRightWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
        },
      },
      {
        id: 'completed',
        label: 'Completed',
        description: 'A true completed state that remains visible until explicitly cleared.',
        scenario: {
          machineStatus: 'completed',
          printJobStatus: 'completed',
          fileName,
          progressPercent: 100,
          currentLayer: totalLayers,
          totalLayers,
          elapsedTimeSeconds: totalPrintTimeSeconds,
          remainingTimeMinutes: 0,
          totalPrintTimeSeconds,
          formattedEta: '00:00',
          temperatures: {
            nozzleCurrent: 90,
            nozzleTarget: 0,
            leftNozzleCurrent: profile.hasMaterialStation ? 88 : 0,
            leftNozzleTarget: 0,
            bedCurrent: 55,
            bedTarget: 0,
            chamberCurrent: profile.hasChamberTemp ? 34 : AMBIENT_TEMPERATURE,
            chamberTarget: 0,
          },
          fan: {
            coolingFanSpeed: 10,
            coolingLeftFanSpeed: profile.hasMaterialStation ? 10 : 0,
            chamberFanSpeed: profile.hasChamberTemp ? 15 : 0,
          },
          ledEnabled: true,
          estimatedRightLen: DEFAULT_ESTIMATED_RIGHT_LEN_MM,
          estimatedRightWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
        },
      },
      {
        id: 'cancelled',
        label: 'Cancelled',
        description:
          'Cancelled print with the previous job still visible for transition validation.',
        scenario: {
          machineStatus: 'cancelled',
          printJobStatus: 'cancelled',
          fileName,
          progressPercent: 31,
          currentLayer: Math.round(totalLayers * 0.31),
          totalLayers,
          elapsedTimeSeconds: 1_140,
          remainingTimeMinutes: 0,
          totalPrintTimeSeconds,
          formattedEta: '',
          temperatures: {
            nozzleCurrent: 70,
            nozzleTarget: 0,
            leftNozzleCurrent: profile.hasMaterialStation ? 66 : 0,
            leftNozzleTarget: 0,
            bedCurrent: 40,
            bedTarget: 0,
            chamberCurrent: profile.hasChamberTemp ? 30 : AMBIENT_TEMPERATURE,
            chamberTarget: 0,
          },
          fan: {
            coolingFanSpeed: 0,
            coolingLeftFanSpeed: 0,
            chamberFanSpeed: 0,
          },
          estimatedRightLen: DEFAULT_ESTIMATED_RIGHT_LEN_MM,
          estimatedRightWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
          errorCode: '',
        },
      },
      {
        id: 'error',
        label: 'Error',
        description: 'Job failure scenario with an explicit error code and preserved job context.',
        scenario: {
          machineStatus: 'error',
          printJobStatus: 'error',
          fileName,
          progressPercent: 67,
          currentLayer: Math.round(totalLayers * 0.67),
          totalLayers,
          elapsedTimeSeconds: 2_520,
          remainingTimeMinutes: 20,
          totalPrintTimeSeconds,
          formattedEta: '00:20',
          temperatures: {
            nozzleCurrent: 205,
            nozzleTarget: 205,
            leftNozzleCurrent: profile.hasMaterialStation ? 205 : 0,
            leftNozzleTarget: defaultTargets.leftNozzle,
            bedCurrent: 58,
            bedTarget: 60,
            chamberCurrent: profile.hasChamberTemp ? 33 : AMBIENT_TEMPERATURE,
            chamberTarget: defaultTargets.chamber,
          },
          fan: {
            coolingFanSpeed: 90,
            coolingLeftFanSpeed: profile.hasMaterialStation ? 90 : 0,
            chamberFanSpeed: profile.hasChamberTemp ? 40 : 0,
          },
          estimatedRightLen: DEFAULT_ESTIMATED_RIGHT_LEN_MM,
          estimatedRightWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
          errorCode: 'EMULATED_PRINT_ERROR',
        },
      },
      {
        id: 'cooling-after-completion',
        label: 'Cooling',
        description: 'Completed print that is still hot, for printer-cooled notification testing.',
        scenario: {
          machineStatus: 'completed',
          printJobStatus: 'completed',
          fileName,
          progressPercent: 100,
          currentLayer: totalLayers,
          totalLayers,
          elapsedTimeSeconds: totalPrintTimeSeconds,
          remainingTimeMinutes: 0,
          totalPrintTimeSeconds,
          formattedEta: '00:00',
          temperatures: {
            nozzleCurrent: 120,
            nozzleTarget: 0,
            leftNozzleCurrent: profile.hasMaterialStation ? 118 : 0,
            leftNozzleTarget: 0,
            bedCurrent: 48,
            bedTarget: 0,
            chamberCurrent: profile.hasChamberTemp ? 36 : AMBIENT_TEMPERATURE,
            chamberTarget: 0,
          },
          fan: {
            coolingFanSpeed: 60,
            coolingLeftFanSpeed: profile.hasMaterialStation ? 45 : 0,
            chamberFanSpeed: profile.hasChamberTemp ? 30 : 0,
          },
          estimatedRightLen: DEFAULT_ESTIMATED_RIGHT_LEN_MM,
          estimatedRightWeight: DEFAULT_ESTIMATED_RIGHT_WEIGHT_G,
        },
      },
    ] as const;
  }

  setMachineStatus(status: PrintJobStatus): void {
    if (this.#state.machineStatus === status) {
      return;
    }

    this.#clearPauseTimeout();
    this.#state.machineStatus = status;
    this.emit('state-changed', this.#state);
  }

  setPrintJobStatus(status: PrintJobStatus): void {
    if (this.#state.printJob.status === status) {
      return;
    }

    this.#clearPauseTimeout();
    this.#state.printJob.status = status;
    this.emit('job-changed', this.#state.printJob);
    this.emit('state-changed', this.#state);
  }

  updateTemperature(temps: Partial<TemperatureState>): void {
    this.#state.temperature = { ...this.#state.temperature, ...temps };
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
  }

  setTargetTemperatures(nozzle: number, bed: number, chamber?: number): void {
    this.#state.temperature.nozzleTarget = nozzle;
    this.#state.temperature.bedTarget = bed;
    if (this.getProfile().hasMaterialStation) {
      this.#state.temperature.leftNozzleTarget = nozzle;
    }
    if (chamber !== undefined) {
      this.#state.temperature.chamberTarget = chamber;
    }
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
  }

  /**
   * Replaces the per-tool nozzle target temperatures (Creator 5 series).
   *
   * The caller is responsible for sentinel handling (-200 no-change must be
   * resolved against current targets before calling); values are stored as-is.
   */
  setToolTargetTemps(targets: number[]): void {
    const toolCount = this.getProfile().toolCount;
    this.#state.toolTargetTemps = targets
      .slice(0, toolCount)
      .map((value) => (Number.isFinite(value) ? value : 0));
    while (this.#state.toolTargetTemps.length < toolCount) {
      this.#state.toolTargetTemps.push(0);
    }
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
  }

  simulateTemperatures(): void {
    const temp = this.#state.temperature;
    const profile = this.getProfile();
    let changed = false;

    if (temp.nozzleCurrent < temp.nozzleTarget) {
      temp.nozzleCurrent = Math.min(temp.nozzleTarget, temp.nozzleCurrent + 2);
      changed = true;
    } else if (temp.nozzleCurrent > temp.nozzleTarget) {
      temp.nozzleCurrent = Math.max(temp.nozzleTarget, temp.nozzleCurrent - 1);
      changed = true;
    }

    if (profile.hasMaterialStation) {
      if (temp.leftNozzleCurrent < temp.leftNozzleTarget) {
        temp.leftNozzleCurrent = Math.min(temp.leftNozzleTarget, temp.leftNozzleCurrent + 2);
        changed = true;
      } else if (temp.leftNozzleCurrent > temp.leftNozzleTarget) {
        temp.leftNozzleCurrent = Math.max(temp.leftNozzleTarget, temp.leftNozzleCurrent - 1);
        changed = true;
      }
    }

    // Creator 5 series: converge each of the four tool heads toward its target.
    if (isCreator5Series(this.#state.model)) {
      for (let index = 0; index < this.#state.toolTemps.length; index += 1) {
        const current = this.#state.toolTemps[index] ?? 0;
        const target = this.#state.toolTargetTemps[index] ?? 0;
        if (current < target) {
          this.#state.toolTemps[index] = Math.min(target, current + 2);
          changed = true;
        } else if (current > target) {
          this.#state.toolTemps[index] = Math.max(target, current - 1);
          changed = true;
        }
      }
    }

    if (temp.bedCurrent < temp.bedTarget) {
      temp.bedCurrent = Math.min(temp.bedTarget, temp.bedCurrent + 1);
      changed = true;
    } else if (temp.bedCurrent > temp.bedTarget) {
      temp.bedCurrent = Math.max(temp.bedTarget, temp.bedCurrent - 0.5);
      changed = true;
    }

    if (profile.hasChamberTemp) {
      if (temp.chamberCurrent < temp.chamberTarget) {
        temp.chamberCurrent = Math.min(temp.chamberTarget, temp.chamberCurrent + 0.5);
        changed = true;
      } else if (temp.chamberCurrent > temp.chamberTarget) {
        temp.chamberCurrent = Math.max(temp.chamberTarget, temp.chamberCurrent - 0.3);
        changed = true;
      }
    }

    if (changed) {
      this.emit('temperature-changed', temp);
      this.emit('state-changed', this.#state);
    }
  }

  updatePosition(position: Partial<{ x: number; y: number; z: number; e: number }>): void {
    Object.assign(this.#state.position, position);
    this.emit('position-changed', this.#state.position);
    this.emit('state-changed', this.#state);
  }

  homeAxes(axes?: 'x' | 'y' | 'z' | 'all'): void {
    const currentMode = this.#state.position.positioningMode;
    if (!axes || axes === 'all') {
      this.#state.position = {
        x: 0,
        y: 0,
        z: 0,
        e: this.#state.position.e,
        positioningMode: currentMode,
      };
    } else {
      this.#state.position[axes] = 0;
    }
    this.#state.endstops = { xMax: 1, yMax: 1, zMin: 1 };
    this.emit('position-changed', this.#state.position);
    this.emit('state-changed', this.#state);
  }

  setPositioningMode(mode: 'absolute' | 'relative'): void {
    this.#state.position.positioningMode = mode;
    this.emit('position-changed', this.#state.position);
    this.emit('state-changed', this.#state);
  }

  startPrint(filename: string, totalPrintTimeSeconds = DEFAULT_TOTAL_PRINT_TIME_SECONDS): boolean {
    if (!canStartNewPrint(this.#state.machineStatus)) {
      return false;
    }

    this.#clearPauseTimeout();
    this.#ensureFileExists(filename, totalPrintTimeSeconds);

    const profile = this.getProfile();
    const defaultTargets = buildDefaultTargets(profile);
    const totalLayers =
      this.#state.printJob.totalLayers > 0
        ? this.#state.printJob.totalLayers
        : DEFAULT_TOTAL_LAYERS;
    const safeTotalPrintTimeSeconds = Math.max(60, roundToWholeNumber(totalPrintTimeSeconds));

    this.#state.printJob = {
      status: 'heating',
      currentFile: filename,
      progress: 0,
      currentLayer: 0,
      totalLayers,
      remainingTimeMinutes: roundRemainingMinutesFromSeconds(safeTotalPrintTimeSeconds),
      totalPrintTimeSeconds: safeTotalPrintTimeSeconds,
      elapsedTimeSeconds: 0,
      formattedEta: formatEtaFromSeconds(safeTotalPrintTimeSeconds),
    };

    this.#state.machineStatus = 'heating';
    this.#state.errorCode = '';
    this.#state.estimatedRightLen = this.#state.estimatedRightLen || DEFAULT_ESTIMATED_RIGHT_LEN_MM;
    this.#state.estimatedRightWeight =
      this.#state.estimatedRightWeight || DEFAULT_ESTIMATED_RIGHT_WEIGHT_G;

    if (this.#state.temperature.nozzleTarget <= 0) {
      this.#state.temperature.nozzleTarget = defaultTargets.nozzle;
    }
    if (profile.hasMaterialStation && this.#state.temperature.leftNozzleTarget <= 0) {
      this.#state.temperature.leftNozzleTarget = defaultTargets.leftNozzle;
    }
    // Creator 5 series: heat tool 0 (the first active head) for the job.
    if (isCreator5Series(profile.model) && (this.#state.toolTargetTemps[0] ?? 0) <= 0) {
      this.#state.toolTargetTemps[0] = defaultTargets.nozzle;
    }
    if (this.#state.temperature.bedTarget <= 0) {
      this.#state.temperature.bedTarget = defaultTargets.bed;
    }
    if (profile.hasChamberTemp && this.#state.temperature.chamberTarget <= 0) {
      this.#state.temperature.chamberTarget = defaultTargets.chamber;
    }

    this.emit('job-changed', this.#state.printJob);
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
    return true;
  }

  pausePrint(): void {
    if (this.#state.printJob.status !== 'printing') {
      return;
    }

    this.#clearPauseTimeout();
    this.#setLifecycleStatuses('pausing', 'pausing');

    this.#pauseTimeoutId = setTimeout(() => {
      this.#pauseTimeoutId = null;
      if (this.#state.printJob.status === 'pausing') {
        this.#setLifecycleStatuses('paused', 'paused');
      }
    }, DEFAULT_PAUSE_DELAY_MS);
  }

  resumePrint(): void {
    if (this.#state.printJob.status !== 'paused') {
      return;
    }

    this.#clearPauseTimeout();
    this.#setLifecycleStatuses('printing', 'printing');
  }

  cancelPrint(): void {
    if (!this.#state.printJob.currentFile) {
      return;
    }

    this.#clearPauseTimeout();
    this.#state.printJob.status = 'cancelled';
    this.#state.machineStatus = 'cancelled';
    this.#state.printJob.remainingTimeMinutes = 0;
    this.#state.printJob.formattedEta = '';
    this.#state.temperature.nozzleTarget = 0;
    this.#state.temperature.leftNozzleTarget = 0;
    this.#state.temperature.bedTarget = 0;
    this.#state.temperature.chamberTarget = 0;
    this.#state.toolTargetTemps = this.#state.toolTargetTemps.map(() => 0);
    this.#state.fan.coolingFanSpeed = 0;
    this.#state.fan.coolingLeftFanSpeed = 0;
    this.emit('job-changed', this.#state.printJob);
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
  }

  stopPrint(): void {
    this.#clearPauseTimeout();
    this.#state.printJob = createIdlePrintJob();
    this.#state.machineStatus = 'idle';
    this.#state.temperature.nozzleTarget = 0;
    this.#state.temperature.leftNozzleTarget = 0;
    this.#state.temperature.bedTarget = 0;
    this.#state.temperature.chamberTarget = 0;
    this.#state.toolTargetTemps = this.#state.toolTargetTemps.map(() => 0);
    this.#state.fan.coolingFanSpeed = 0;
    this.#state.fan.coolingLeftFanSpeed = 0;
    this.#state.errorCode = '';
    this.emit('job-changed', this.#state.printJob);
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
  }

  clearCompletedState(): void {
    this.#clearPauseTimeout();
    this.#state.printJob = createIdlePrintJob();
    this.#state.machineStatus = 'ready';
    this.#state.errorCode = '';
    this.emit('job-changed', this.#state.printJob);
    this.emit('state-changed', this.#state);
  }

  completePrint(options?: { recordCumulative?: boolean }): void {
    if (!this.#state.printJob.currentFile) {
      this.#ensureFileExists(DEFAULT_JOB_FILE, DEFAULT_TOTAL_PRINT_TIME_SECONDS);
      this.#state.printJob.currentFile = DEFAULT_JOB_FILE;
    }

    this.#clearPauseTimeout();

    const wasCompleted = this.#state.printJob.status === 'completed';
    this.#state.printJob.status = 'completed';
    this.#state.machineStatus = 'completed';
    this.#state.printJob.progress = 1;
    this.#state.printJob.currentLayer = this.#state.printJob.totalLayers;
    this.#state.printJob.remainingTimeMinutes = 0;
    this.#state.printJob.formattedEta = '00:00';
    this.#state.printJob.elapsedTimeSeconds = Math.max(
      this.#state.printJob.elapsedTimeSeconds,
      this.#state.printJob.totalPrintTimeSeconds
    );
    this.#state.temperature.nozzleTarget = 0;
    this.#state.temperature.leftNozzleTarget = 0;
    this.#state.temperature.bedTarget = 0;
    this.#state.temperature.chamberTarget = 0;
    this.#state.toolTargetTemps = this.#state.toolTargetTemps.map(() => 0);

    if (options?.recordCumulative && !wasCompleted) {
      this.#state.cumulativePrintTime += this.#state.printJob.elapsedTimeSeconds;
      this.#state.cumulativeFilament += this.#state.estimatedRightWeight;
      this.emit('cumulative-stats-changed', {
        cumulativePrintTime: this.#state.cumulativePrintTime,
        cumulativeFilament: this.#state.cumulativeFilament,
      });
    }

    this.emit('job-changed', this.#state.printJob);
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('state-changed', this.#state);
  }

  simulatePrintProgress(): void {
    const job = this.#state.printJob;
    if (job.status !== 'printing' && job.status !== 'heating') {
      return;
    }

    const tempsReady =
      this.#state.temperature.nozzleCurrent >= this.#state.temperature.nozzleTarget - 2 &&
      this.#state.temperature.bedCurrent >= this.#state.temperature.bedTarget - 2;

    if (job.status === 'heating' && tempsReady) {
      this.#setLifecycleStatuses('printing', 'printing');
      this.#state.fan.coolingFanSpeed = Math.max(this.#state.fan.coolingFanSpeed, 100);
    }

    if (this.#state.printJob.status !== 'printing') {
      return;
    }

    const elapsedIncrementSeconds = 0.1 * this.#simulationSpeed;
    const nextElapsedSeconds = Math.min(
      job.totalPrintTimeSeconds,
      job.elapsedTimeSeconds + elapsedIncrementSeconds
    );
    const remainingSeconds = Math.max(job.totalPrintTimeSeconds - nextElapsedSeconds, 0);

    job.elapsedTimeSeconds = nextElapsedSeconds;
    job.progress =
      job.totalPrintTimeSeconds > 0
        ? clamp(nextElapsedSeconds / job.totalPrintTimeSeconds, 0, 1)
        : 0;
    job.remainingTimeMinutes = roundRemainingMinutesFromSeconds(remainingSeconds);
    job.formattedEta = remainingSeconds > 0 ? formatEtaFromSeconds(remainingSeconds) : '00:00';

    if (job.totalLayers > 0) {
      job.currentLayer =
        job.progress >= 1
          ? job.totalLayers
          : Math.max(0, Math.floor(job.progress * job.totalLayers));
    }

    const maxHeight = 220;
    this.#state.position.z =
      job.totalLayers > 0 ? (job.currentLayer / job.totalLayers) * maxHeight : 0;
    this.#state.position.e = job.progress * 1_000;

    if (job.progress >= 1) {
      this.completePrint({ recordCumulative: true });
      return;
    }

    this.emit('job-changed', job);
    this.emit('position-changed', this.#state.position);
    this.emit('state-changed', this.#state);
  }

  applyScenarioPreset(presetId: ScenarioPresetId): void {
    const preset = this.getScenarioPresets().find((candidate) => candidate.id === presetId);
    if (!preset) {
      return;
    }
    this.applyScenario(preset.scenario);
  }

  applyScenario(scenario: PrinterScenario): void {
    this.#clearPauseTimeout();

    const hadJobBefore = Boolean(this.#state.printJob.currentFile);
    const incomingFileName =
      scenario.fileName !== undefined
        ? scenario.fileName?.trim() || null
        : this.#state.printJob.currentFile;
    const nextJobFile =
      incomingFileName ??
      (scenario.printJobStatus && isJobStateVisible(scenario.printJobStatus)
        ? DEFAULT_JOB_FILE
        : null) ??
      (scenario.machineStatus && isJobStateVisible(scenario.machineStatus)
        ? DEFAULT_JOB_FILE
        : null);

    if (scenario.currentFileMetadata || nextJobFile) {
      const totalPrintTimeSeconds =
        scenario.totalPrintTimeSeconds ??
        this.#state.printJob.totalPrintTimeSeconds ??
        DEFAULT_TOTAL_PRINT_TIME_SECONDS;
      this.#ensureFileExists(
        nextJobFile ?? DEFAULT_JOB_FILE,
        totalPrintTimeSeconds,
        scenario.currentFileMetadata
      );
    }

    if (scenario.machineStatus !== undefined) {
      this.#state.machineStatus = scenario.machineStatus;
    }

    if (scenario.printJobStatus !== undefined) {
      this.#state.printJob.status = scenario.printJobStatus;
    }

    if (scenario.fileName !== undefined) {
      this.#state.printJob.currentFile = incomingFileName;
    } else if (
      (scenario.machineStatus && isJobStateVisible(scenario.machineStatus)) ||
      (scenario.printJobStatus && isJobStateVisible(scenario.printJobStatus))
    ) {
      this.#state.printJob.currentFile = nextJobFile;
    }

    if (scenario.progressPercent !== undefined) {
      this.#state.printJob.progress = clamp(scenario.progressPercent / 100, 0, 1);
    }
    if (scenario.currentLayer !== undefined) {
      this.#state.printJob.currentLayer = Math.max(0, roundToWholeNumber(scenario.currentLayer));
    }
    if (scenario.totalLayers !== undefined) {
      this.#state.printJob.totalLayers = Math.max(0, roundToWholeNumber(scenario.totalLayers));
    }
    if (scenario.elapsedTimeSeconds !== undefined) {
      this.#state.printJob.elapsedTimeSeconds = Math.max(
        0,
        roundToWholeNumber(scenario.elapsedTimeSeconds)
      );
    }
    if (scenario.remainingTimeMinutes !== undefined) {
      this.#state.printJob.remainingTimeMinutes = Math.max(
        0,
        roundToWholeNumber(scenario.remainingTimeMinutes)
      );
    }
    if (scenario.totalPrintTimeSeconds !== undefined) {
      this.#state.printJob.totalPrintTimeSeconds = Math.max(
        0,
        roundToWholeNumber(scenario.totalPrintTimeSeconds)
      );
    }
    if (scenario.formattedEta !== undefined) {
      this.#state.printJob.formattedEta = scenario.formattedEta.trim();
    }

    if (scenario.temperatures) {
      this.#state.temperature = {
        ...this.#state.temperature,
        ...scenario.temperatures,
      };
    }

    if (scenario.toolTemps) {
      this.#state.toolTemps = scenario.toolTemps
        .slice(0, this.getProfile().toolCount)
        .map((value) => (Number.isFinite(value) ? value : 0));
    }
    if (scenario.toolTargetTemps) {
      this.#state.toolTargetTemps = scenario.toolTargetTemps
        .slice(0, this.getProfile().toolCount)
        .map((value) => (Number.isFinite(value) ? value : 0));
    }
    if (scenario.doorOpen !== undefined) {
      this.#state.doorOpen = scenario.doorOpen;
    }

    if (scenario.fan) {
      Object.assign(this.#state.fan, scenario.fan);
    }

    if (scenario.ledEnabled !== undefined) {
      this.#state.led.enabled = scenario.ledEnabled;
    }
    if (scenario.estimatedRightLen !== undefined) {
      this.#state.estimatedRightLen = Math.max(0, scenario.estimatedRightLen);
    }
    if (scenario.estimatedRightWeight !== undefined) {
      this.#state.estimatedRightWeight = Math.max(0, scenario.estimatedRightWeight);
    }
    if (scenario.estimatedLeftLen !== undefined) {
      this.#state.estimatedLeftLen = Math.max(0, scenario.estimatedLeftLen);
    }
    if (scenario.estimatedLeftWeight !== undefined) {
      this.#state.estimatedLeftWeight = Math.max(0, scenario.estimatedLeftWeight);
    }
    if (scenario.hasLeftFilament !== undefined) {
      this.#state.hasLeftFilament = scenario.hasLeftFilament;
    }
    if (scenario.hasRightFilament !== undefined) {
      this.#state.hasRightFilament = scenario.hasRightFilament;
    }
    if (scenario.leftFilamentType !== undefined) {
      this.#state.leftFilamentType = scenario.leftFilamentType;
    }
    if (scenario.rightFilamentType !== undefined) {
      this.#state.rightFilamentType = scenario.rightFilamentType;
    }
    if (scenario.errorCode !== undefined) {
      this.#state.errorCode = scenario.errorCode;
    }
    if (scenario.tvoc !== undefined) {
      this.#state.tvoc = scenario.tvoc;
    }

    if (scenario.materialStation) {
      if (scenario.materialStation.currentSlot !== undefined) {
        this.#state.materialStation.currentSlot = scenario.materialStation.currentSlot;
      }
      if (scenario.materialStation.currentLoadSlot !== undefined) {
        this.#state.materialStation.currentLoadSlot = scenario.materialStation.currentLoadSlot;
      }
      if (scenario.materialStation.slots) {
        for (const slotUpdate of scenario.materialStation.slots) {
          const slotIndex = this.#state.materialStation.slots.findIndex(
            (slot) => slot.slotId === slotUpdate.slotId
          );
          if (slotIndex >= 0) {
            const existingSlot = this.#state.materialStation.slots[slotIndex];
            if (existingSlot) {
              this.#state.materialStation.slots[slotIndex] = {
                slotId: existingSlot.slotId,
                hasFilament: slotUpdate.hasFilament ?? existingSlot.hasFilament,
                materialName: slotUpdate.materialName ?? existingSlot.materialName,
                materialColor: slotUpdate.materialColor ?? existingSlot.materialColor,
              };
            }
          }
        }
      }
    }

    this.#normalizeJobState();

    if (!hadJobBefore && this.#state.printJob.currentFile) {
      this.#state.position.e = 0;
      this.#state.position.z = 0;
    }

    this.emit('job-changed', this.#state.printJob);
    this.emit('temperature-changed', this.#state.temperature);
    this.emit('position-changed', this.#state.position);
    this.emit('state-changed', this.#state);
  }

  createScenarioSnapshot(): PrinterScenario {
    const currentFileMetadata = this.#state.printJob.currentFile
      ? this.getFile(this.#state.printJob.currentFile)
      : undefined;

    return {
      machineStatus: this.#state.machineStatus,
      printJobStatus: this.#state.printJob.status,
      fileName: this.#state.printJob.currentFile,
      progressPercent: Math.round(this.#state.printJob.progress * 100),
      currentLayer: this.#state.printJob.currentLayer,
      totalLayers: this.#state.printJob.totalLayers,
      elapsedTimeSeconds: Math.round(this.#state.printJob.elapsedTimeSeconds),
      remainingTimeMinutes: this.#state.printJob.remainingTimeMinutes,
      totalPrintTimeSeconds: this.#state.printJob.totalPrintTimeSeconds,
      formattedEta: this.#state.printJob.formattedEta,
      temperatures: { ...this.#state.temperature },
      fan: { ...this.#state.fan },
      ledEnabled: this.#state.led.enabled,
      estimatedRightLen: this.#state.estimatedRightLen,
      estimatedRightWeight: this.#state.estimatedRightWeight,
      estimatedLeftLen: this.#state.estimatedLeftLen,
      estimatedLeftWeight: this.#state.estimatedLeftWeight,
      hasLeftFilament: this.#state.hasLeftFilament,
      hasRightFilament: this.#state.hasRightFilament,
      leftFilamentType: this.#state.leftFilamentType,
      rightFilamentType: this.#state.rightFilamentType,
      errorCode: this.#state.errorCode,
      doorOpen: this.#state.doorOpen,
      toolTemps: [...this.#state.toolTemps],
      toolTargetTemps: [...this.#state.toolTargetTemps],
      materialStation: {
        currentSlot: this.#state.materialStation.currentSlot,
        currentLoadSlot: this.#state.materialStation.currentLoadSlot,
        slots: this.#state.materialStation.slots.map((slot) => ({
          slotId: slot.slotId,
          hasFilament: slot.hasFilament,
          materialName: slot.materialName,
          materialColor: slot.materialColor,
        })),
      },
      ...(currentFileMetadata ? { currentFileMetadata } : {}),
    };
  }

  updateLed(enabled: boolean): void {
    this.#state.led.enabled = enabled;
    this.emit('state-changed', this.#state);
  }

  updateFan(
    settings: Partial<{
      coolingFanSpeed: number;
      chamberFanSpeed: number;
      coolingLeftFanSpeed: number;
      externalFanEnabled: boolean;
      internalFanEnabled: boolean;
    }>
  ): void {
    Object.assign(this.#state.fan, settings);
    this.emit('state-changed', this.#state);
  }

  setTcpControlActive(active: boolean): void {
    this.#state.tcpControlActive = active;
    this.emit('state-changed', this.#state);
  }

  setRunoutSensorEnabled(enabled: boolean): void {
    this.#state.runoutSensorEnabled = enabled;
    this.emit('state-changed', this.#state);
  }

  updateZAxisCompensation(value: number): void {
    this.#state.zAxisCompensation = value;
    this.emit('state-changed', this.#state);
  }

  updatePrintSpeed(speed: number): void {
    this.#state.currentPrintSpeed = speed;
    this.emit('state-changed', this.#state);
  }

  addFile(file: PrinterFile): void {
    this.#state.files = this.#state.files.filter((candidate) => candidate.name !== file.name);
    this.#state.files.push(file);
    this.emit('state-changed', this.#state);
  }

  removeFile(filename: string): void {
    this.#state.files = this.#state.files.filter((file) => file.name !== filename);
    if (this.#state.printJob.currentFile === filename) {
      this.#state.printJob.currentFile = null;
    }
    this.emit('state-changed', this.#state);
  }

  clearFiles(): void {
    this.#state.files = [];
    this.emit('state-changed', this.#state);
  }

  getFile(filename: string): PrinterFile | undefined {
    return this.#state.files.find((file) => file.name === filename);
  }

  getFiles(): ReadonlyArray<PrinterFile> {
    return this.#state.files;
  }

  updateMaterialSlot(slotId: number, slot: MaterialSlotUpdate): void {
    const index = this.#state.materialStation.slots.findIndex(
      (candidate) => candidate.slotId === slotId
    );
    if (index < 0) {
      return;
    }

    const existing = this.#state.materialStation.slots[index];
    if (!existing) {
      return;
    }

    this.#state.materialStation.slots[index] = {
      slotId: existing.slotId,
      hasFilament: slot.hasFilament ?? existing.hasFilament,
      materialName: slot.materialName ?? existing.materialName,
      materialColor: slot.materialColor ?? existing.materialColor,
    };
    this.emit('state-changed', this.#state);
  }

  setCurrentSlot(slotId: number): void {
    this.#state.materialStation.currentSlot = slotId;
    this.emit('state-changed', this.#state);
  }

  setCurrentLoadSlot(slotId: number): void {
    this.#state.materialStation.currentLoadSlot = slotId;
    this.emit('state-changed', this.#state);
  }

  #setLifecycleStatuses(machineStatus: PrintJobStatus, jobStatus: PrintJobStatus): void {
    this.#state.machineStatus = machineStatus;
    this.#state.printJob.status = jobStatus;
    this.emit('job-changed', this.#state.printJob);
    this.emit('state-changed', this.#state);
  }

  #clearPauseTimeout(): void {
    if (this.#pauseTimeoutId) {
      clearTimeout(this.#pauseTimeoutId);
      this.#pauseTimeoutId = null;
    }
  }

  #normalizeJobState(): void {
    const job = this.#state.printJob;

    if (
      (isJobStateVisible(job.status) || isJobStateVisible(this.#state.machineStatus)) &&
      !job.currentFile
    ) {
      job.currentFile = DEFAULT_JOB_FILE;
    }

    job.progress = clamp(Number.isFinite(job.progress) ? job.progress : 0, 0, 1);
    job.totalLayers = Math.max(0, roundToWholeNumber(job.totalLayers));
    job.currentLayer = Math.max(
      0,
      Math.min(job.totalLayers || Number.MAX_SAFE_INTEGER, roundToWholeNumber(job.currentLayer))
    );
    job.totalPrintTimeSeconds = Math.max(0, roundToWholeNumber(job.totalPrintTimeSeconds));
    job.elapsedTimeSeconds = Math.max(0, roundToWholeNumber(job.elapsedTimeSeconds));

    if (job.totalPrintTimeSeconds > 0 && job.elapsedTimeSeconds > job.totalPrintTimeSeconds) {
      job.totalPrintTimeSeconds = job.elapsedTimeSeconds;
    }

    const derivedRemainingSeconds = Math.max(job.totalPrintTimeSeconds - job.elapsedTimeSeconds, 0);
    if (!Number.isFinite(job.remainingTimeMinutes) || job.remainingTimeMinutes < 0) {
      job.remainingTimeMinutes = roundRemainingMinutesFromSeconds(derivedRemainingSeconds);
    }

    if (
      job.currentFile &&
      (job.totalPrintTimeSeconds > 0 || this.#state.files.length === 0) &&
      !this.getFile(job.currentFile)
    ) {
      this.#ensureFileExists(
        job.currentFile,
        job.totalPrintTimeSeconds || DEFAULT_TOTAL_PRINT_TIME_SECONDS
      );
    }

    if (job.progress >= 1 && job.totalLayers > 0) {
      job.currentLayer = job.totalLayers;
    }

    if (job.totalLayers > 0 && job.currentLayer === 0 && job.progress > 0) {
      job.currentLayer = Math.max(1, Math.floor(job.progress * job.totalLayers));
    }

    if (!this.#state.errorCode && this.#state.machineStatus === 'error') {
      this.#state.errorCode = 'EMULATED_ERROR';
    }
    if (
      this.#state.machineStatus !== 'error' &&
      job.status !== 'error' &&
      this.#state.errorCode === 'EMULATED_ERROR'
    ) {
      this.#state.errorCode = '';
    }
  }

  #ensureFileExists(
    filename: string,
    totalPrintTimeSeconds: number,
    metadata?: Partial<PrinterFile>
  ): void {
    const existing = this.getFile(filename);
    if (existing) {
      if (!metadata) {
        return;
      }

      this.addFile({
        ...existing,
        ...metadata,
        name: filename,
        path: metadata.path ?? existing.path,
        printTime: metadata.printTime ?? totalPrintTimeSeconds ?? existing.printTime,
      });
      return;
    }

    const synthetic = createSyntheticFile(
      filename,
      Math.max(60, roundToWholeNumber(totalPrintTimeSeconds || DEFAULT_TOTAL_PRINT_TIME_SECONDS))
    );
    this.addFile({
      ...synthetic,
      ...metadata,
      name: filename,
      path: metadata?.path ?? synthetic.path,
      printTime: metadata?.printTime ?? synthetic.printTime,
    });
  }
}

export const printerStateStore = new PrinterStateStore();
