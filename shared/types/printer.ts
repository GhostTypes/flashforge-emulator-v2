/**
 * @fileoverview
 * Core type definitions for FlashForge printer emulation
 *
 * Defines all printer state models, commands, and responses for both
 * TCP (legacy) and HTTP (modern) protocols.
 *
 * @packageDocumentation
 */

/**
 * Supported printer models with their capabilities
 */
export type PrinterModel =
  | 'adventurer-3'
  | 'adventurer-4'
  | 'adventurer-5m'
  | 'adventurer-5m-pro'
  | 'adventurer-5x'
  | 'creator-5'
  | 'creator-5-pro';

/**
 * Whether the model belongs to the Creator 5 series (Creator 5 / Creator 5 Pro).
 *
 * The series shares HTTP-only transport, the 4-head tool changer, and several
 * firmware quirks (see PrinterProfile fields and the Creator 5 notes in API.md).
 */
export function isCreator5Series(model: PrinterModel): boolean {
  return model === 'creator-5' || model === 'creator-5-pro';
}

/**
 * Protocol mode for the emulator
 */
export type ProtocolMode = 'legacy' | 'modern';

/**
 * Print job states matching FlashForge API
 */
export type PrintJobStatus =
  | 'idle'
  | 'ready'
  | 'busy'
  | 'heating'
  | 'printing'
  | 'pausing'
  | 'paused'
  | 'cancel'
  | 'cancelled'
  | 'calibrate_doing'
  | 'completed'
  | 'error';

/**
 * Status values emitted by the modern HTTP /detail endpoint.
 */
export type HttpDetailStatus =
  | 'ready'
  | 'busy'
  | 'printing'
  | 'paused'
  | 'pausing'
  | 'cancelled'
  | 'completed'
  | 'heating'
  | 'error'
  | 'calibrate_doing';

/**
 * Whether the printer can start a brand-new job from the current machine status.
 *
 * Sticky terminal states intentionally require an explicit clear back to ready.
 */
export function canStartNewPrint(machineStatus: PrintJobStatus): boolean {
  return machineStatus === 'idle' || machineStatus === 'ready';
}

/**
 * Terminal states that should remain visible until explicitly cleared.
 */
export function isStickyTerminalState(machineStatus: PrintJobStatus): boolean {
  return (
    machineStatus === 'completed' || machineStatus === 'cancelled' || machineStatus === 'error'
  );
}

/**
 * Maps internal machine state to the HTTP /detail status field consumed by the app.
 */
export function mapMachineStatusToHttpDetailStatus(
  machineStatus: PrintJobStatus
): HttpDetailStatus {
  switch (machineStatus) {
    case 'idle':
    case 'ready':
      return 'ready';
    case 'busy':
      return 'busy';
    case 'printing':
      return 'printing';
    case 'paused':
      return 'paused';
    case 'pausing':
      return 'pausing';
    case 'cancel':
    case 'cancelled':
      return 'cancelled';
    case 'completed':
      return 'completed';
    case 'heating':
      return 'heating';
    case 'error':
      return 'error';
    case 'calibrate_doing':
      return 'calibrate_doing';
  }
}

/**
 * Temperature data structure
 */
export interface TemperatureState {
  /** Current nozzle temperature in Celsius */
  nozzleCurrent: number;
  /** Target nozzle temperature in Celsius */
  nozzleTarget: number;
  /** Current left nozzle temperature in Celsius (AD5X only) */
  leftNozzleCurrent: number;
  /** Target left nozzle temperature in Celsius (AD5X only) */
  leftNozzleTarget: number;
  /** Current bed temperature in Celsius */
  bedCurrent: number;
  /** Target bed temperature in Celsius */
  bedTarget: number;
  /** Current chamber temperature in Celsius (5M Pro/AD5X only) */
  chamberCurrent: number;
  /** Target chamber temperature in Celsius */
  chamberTarget: number;
}

/**
 * Positioning mode for movement commands
 */
export type PositioningMode = 'absolute' | 'relative';

/**
 * Printer position in 3D space
 */
export interface PositionState {
  /** X axis position in mm */
  x: number;
  /** Y axis position in mm */
  y: number;
  /** Z axis position in mm */
  z: number;
  /** Extruder position in mm (E axis) */
  e: number;
  /** Current positioning mode (absolute or relative) */
  positioningMode: PositioningMode;
}

/**
 * Print job information
 */
export interface PrintJobState {
  /** Current print state */
  status: PrintJobStatus;
  /** Name of the file being printed (if any) */
  currentFile: string | null;
  /** Print progress from 0.0 to 1.0 */
  progress: number;
  /** Current layer number */
  currentLayer: number;
  /** Total layers in the job */
  totalLayers: number;
  /** Estimated remaining time in minutes */
  remainingTimeMinutes: number;
  /** Total print time in seconds */
  totalPrintTimeSeconds: number;
  /** Time elapsed since print started in seconds */
  elapsedTimeSeconds: number;
  /** Firmware-style ETA string (HH:MM) */
  formattedEta: string;
}

/**
 * Scenario preset IDs for QA / regression testing
 */
export type ScenarioPresetId =
  | 'idle'
  | 'heating'
  | 'printing'
  | 'paused'
  | 'pausing'
  | 'completed'
  | 'cancelled'
  | 'error'
  | 'cooling-after-completion';

/**
 * Explicit state injection payload used by the QA console
 */
export interface PrinterScenario {
  machineStatus?: PrintJobStatus;
  printJobStatus?: PrintJobStatus;
  fileName?: string | null;
  progressPercent?: number;
  currentLayer?: number;
  totalLayers?: number;
  elapsedTimeSeconds?: number;
  remainingTimeMinutes?: number;
  totalPrintTimeSeconds?: number;
  formattedEta?: string;
  temperatures?: Partial<TemperatureState>;
  fan?: Partial<FanState>;
  ledEnabled?: boolean;
  estimatedRightLen?: number;
  estimatedRightWeight?: number;
  estimatedLeftLen?: number;
  estimatedLeftWeight?: number;
  hasLeftFilament?: boolean;
  hasRightFilament?: boolean;
  leftFilamentType?: string;
  rightFilamentType?: string;
  errorCode?: string;
  tvoc?: number;
  materialStation?: {
    currentSlot?: number;
    currentLoadSlot?: number;
    slots?: Array<{
      slotId: number;
      hasFilament?: boolean;
      materialName?: string;
      materialColor?: string;
    }>;
  };
  currentFileMetadata?: Partial<PrinterFile>;
  /** Per-tool nozzle temperatures (Creator 5 series; parallel to the profile toolCount) */
  toolTemps?: number[];
  /** Per-tool nozzle target temperatures (Creator 5 series) */
  toolTargetTemps?: number[];
  /** Door open state (only meaningful on models with a real door sensor) */
  doorOpen?: boolean;
}

/**
 * Named scenario preset definition
 */
export interface ScenarioPreset {
  id: ScenarioPresetId;
  label: string;
  description: string;
  scenario: PrinterScenario;
}

/**
 * Material station slot state (AD5X only)
 */
export interface MaterialSlot {
  /** Slot ID (1-4) */
  slotId: number;
  /** Whether filament is loaded in this slot */
  hasFilament: boolean;
  /** Material name (e.g., "PLA", "PETG") */
  materialName: string;
  /** Material color as hex code */
  materialColor: string;
}

/**
 * Update type for MaterialSlot (all fields optional except slotId which is readonly)
 */
export type MaterialSlotUpdate = {
  hasFilament?: boolean;
  materialName?: string;
  materialColor?: string;
};

/**
 * Independent material info for AD5X /detail response
 * Represents the currently loaded material in the active slot
 */
export interface IndepMatlInfo {
  /** Material color as hex code */
  materialColor: string;
  /** Material name (e.g., "PLA", "PETG") */
  materialName: string;
  /** State action code */
  stateAction: number;
  /** State step code */
  stateStep: number;
}

/**
 * Material station state (AD5X only)
 */
export interface MaterialStationState {
  /** Whether the material station is enabled */
  hasMatlStation: boolean;
  /** Currently active slot (0 if none) */
  currentSlot: number;
  /** Currently loading slot (0 if none) */
  currentLoadSlot: number;
  /** Total number of slots (typically 4) */
  slotCount: number;
  /** Slot information array */
  slots: MaterialSlot[];
}

/**
 * LED state
 */
export interface LedState {
  /** Whether LEDs are enabled */
  enabled: boolean;
}

/**
 * Fan state
 */
export interface FanState {
  /** Main cooling fan speed (0-100) */
  coolingFanSpeed: number;
  /** Left cooling fan speed (0-100) - AD5X only */
  coolingLeftFanSpeed: number;
  /** Chamber fan speed (0-100) */
  chamberFanSpeed: number;
  /** Whether external fan is on */
  externalFanEnabled: boolean;
  /** Whether internal fan is on */
  internalFanEnabled: boolean;
}

/**
 * Endstop states
 */
export interface EndstopState {
  /** X max endstop (0 = triggered, 1 = open) */
  xMax: number;
  /** Y max endstop (0 = triggered, 1 = open) */
  yMax: number;
  /** Z min endstop (0 = triggered, 1 = open) */
  zMin: number;
}

/**
 * G-code tool data for multi-extruder prints (AD5X)
 */
export interface GcodeToolData {
  /** Logical tool index from slicer metadata (0-based) */
  toolId: number;
  /** Material type used (e.g., "PLA", "PETG") */
  materialName: string;
  /** Material color as hex code */
  materialColor: string;
  /** Estimated filament weight in grams */
  filamentWeight: number;
  /** Material station slot for this tool (1-4 for AD5X, 0 for direct/no slot) */
  slotId: number;
}

/**
 * File entry in printer storage
 */
export interface PrinterFile {
  /** File name */
  name: string;
  /** Full path on printer */
  path: string;
  /** File size in bytes */
  size: number;
  /** Estimated print time in seconds */
  printTime: number;
  /** Whether this is a 3MF file */
  is3mf: boolean;
  /** Number of tools/extruders used in the print (1-2 for AD5X) */
  gcodeToolCnt: number;
  /** Tool-specific data for multi-extruder prints */
  gcodeToolDatas: GcodeToolData[];
  /** Whether this print uses the material station */
  useMatlStation: boolean;
  /** Total filament weight in grams */
  totalFilamentWeight: number;
  /** Base64-encoded thumbnail PNG data */
  thumbnail: string;
}

/**
 * Full printer state - single source of truth
 */
export interface PrinterState {
  /** Selected printer model */
  model: PrinterModel;
  /** Current protocol mode */
  protocolMode: ProtocolMode;
  /** Machine status/state */
  machineStatus: PrintJobStatus;
  /** Temperature states */
  temperature: TemperatureState;
  /** Current position */
  position: PositionState;
  /** Print job information */
  printJob: PrintJobState;
  /** Material station state (AD5X only) */
  materialStation: MaterialStationState;
  /** LED state */
  led: LedState;
  /** Fan state */
  fan: FanState;
  /** Endstop states */
  endstops: EndstopState;
  /** Files stored on printer */
  files: PrinterFile[];
  /** Whether TCP control is active */
  tcpControlActive: boolean;
  /** Serial number for HTTP authentication */
  serialNumber: string;
  /** Check code for HTTP authentication */
  checkCode: string;
  /** Machine name */
  machineName: string;
  /** Firmware version */
  firmwareVersion: string;
  /** MAC address */
  macAddress: string;
  /** IP address */
  ipAddress: string;
  /** Nozzle count */
  nozzleCount: number;
  /** Nozzle model (e.g., "0.4mm") */
  nozzleModel: string;
  /** Whether door is open */
  doorOpen: boolean;
  /** Per-tool nozzle temperatures for multi-head models (Creator 5 series; index 0..toolCount-1) */
  toolTemps: number[];
  /** Per-tool nozzle target temperatures (Creator 5 series) */
  toolTargetTemps: number[];
  /** Auto shutdown setting */
  autoShutdown: 'open' | 'close';
  /** Auto shutdown time in minutes */
  autoShutdownTime: number;
  /** Cumulative print time across all jobs in seconds */
  cumulativePrintTime: number;
  /** Cumulative filament used across all jobs in meters */
  cumulativeFilament: number;
  /** Total estimated right filament length for the current job in mm */
  estimatedRightLen: number;
  /** Total estimated right filament weight for the current job in grams */
  estimatedRightWeight: number;
  /** Total estimated left filament length for the current job in mm (AD5X only) */
  estimatedLeftLen: number;
  /** Total estimated left filament weight for the current job in grams (AD5X only) */
  estimatedLeftWeight: number;
  /** Whether filament is detected in left extruder (AD5X only) */
  hasLeftFilament: boolean;
  /** Whether filament is detected in right extruder */
  hasRightFilament: boolean;
  /** Left filament material type (e.g., "PLA", "PETG") */
  leftFilamentType: string;
  /** Right filament material type (e.g., "PLA", "PETG") */
  rightFilamentType: string;
  /** Current print speed percentage */
  currentPrintSpeed: number;
  /** Print speed adjustment percentage */
  printSpeedAdjust: number;
  /** Fill amount for infill (0-100) */
  fillAmount: number;
  /** Error code (empty string if no error) */
  errorCode: string;
  /** TVOC sensor reading */
  tvoc: number;
  /** Z-axis compensation value */
  zAxisCompensation: number;
  /** Remaining disk space in MB */
  remainingDiskSpace: number;
  /** Whether filament runout sensor is enabled (5M Pro only) */
  runoutSensorEnabled: boolean;
}

/**
 * Printer profile with default configurations
 */
export interface PrinterProfile {
  /** Printer model identifier */
  model: PrinterModel;
  /** Display name */
  name: string;
  /** Supported protocol mode */
  protocolMode: ProtocolMode;
  /** Whether HTTP API is supported */
  supportsHttp: boolean;
  /** Whether TCP API is supported (Creator 5 series real hardware runs HTTP only) */
  supportsTcp: boolean;
  /** Has material station (IFS on AD5X; 4-slot station on the Creator 5 series) */
  hasMaterialStation: boolean;
  /** Has independent dual nozzle reported via leftTemp/indepMatlInfo (AD5X only) */
  hasIndependentDualNozzle: boolean;
  /** Has built-in camera */
  hasCamera: boolean;
  /** Has chamber temperature control (heater + sensor; base Creator 5 has neither) */
  hasChamberTemp: boolean;
  /** /detail reports the out-of-band -108 "no sensor" sentinel for chamber temps (base Creator 5) */
  emitsChamberSentinel?: boolean;
  /** Has built-in filtration system with TVOC sensor */
  hasFiltration: boolean;
  /** Whether circulateCtl_cmd actuates the fans (5M Pro yes; Creator 5 series firmware ACKs without actuating) */
  filtrationControllable: boolean;
  /** Whether doorStatus is backed by a real sensor (Creator 5 Pro) */
  hasDoorSensor: boolean;
  /** Number of independently controllable tool heads */
  toolCount: number;
  /** Whether /gcodeList includes gcodeListDetail (real Creator 5 firmware returns names only) */
  gcodeListIncludesDetail: boolean;
  /** Build volume in mm */
  buildVolume: {
    x: number;
    y: number;
    z: number;
  };
  /** Default firmware version */
  defaultFirmware: string;
}

/**
 * Pre-configured printer profiles
 */
export const PRINTER_PROFILES: Readonly<Record<PrinterModel, PrinterProfile>> = {
  ['adventurer-3']: {
    model: 'adventurer-3',
    name: 'Adventurer 3',
    protocolMode: 'legacy',
    supportsHttp: false,
    supportsTcp: true,
    hasMaterialStation: false,
    hasIndependentDualNozzle: false,
    hasCamera: false,
    hasChamberTemp: false,
    hasFiltration: false,
    filtrationControllable: true,
    hasDoorSensor: false,
    toolCount: 1,
    gcodeListIncludesDetail: true,
    buildVolume: { x: 150, y: 150, z: 150 },
    defaultFirmware: 'v1.4.0',
  },
  ['adventurer-4']: {
    model: 'adventurer-4',
    name: 'Adventurer 4',
    protocolMode: 'legacy',
    supportsHttp: false,
    supportsTcp: true,
    hasMaterialStation: false,
    hasIndependentDualNozzle: false,
    hasCamera: false,
    hasChamberTemp: false,
    hasFiltration: false,
    filtrationControllable: true,
    hasDoorSensor: false,
    toolCount: 1,
    gcodeListIncludesDetail: true,
    buildVolume: { x: 220, y: 220, z: 250 },
    defaultFirmware: 'v2.0.0',
  },
  ['adventurer-5m']: {
    model: 'adventurer-5m',
    name: 'Adventurer 5M',
    protocolMode: 'modern',
    supportsHttp: true,
    supportsTcp: true,
    hasMaterialStation: false,
    hasIndependentDualNozzle: false,
    hasCamera: false,
    hasChamberTemp: true,
    hasFiltration: false,
    filtrationControllable: true,
    hasDoorSensor: false,
    toolCount: 1,
    gcodeListIncludesDetail: true,
    buildVolume: { x: 220, y: 220, z: 220 },
    defaultFirmware: 'v3.1.3',
  },
  ['adventurer-5m-pro']: {
    model: 'adventurer-5m-pro',
    name: 'Adventurer 5M Pro',
    protocolMode: 'modern',
    supportsHttp: true,
    supportsTcp: true,
    hasMaterialStation: false,
    hasIndependentDualNozzle: false,
    hasCamera: true,
    hasChamberTemp: true,
    hasFiltration: true,
    filtrationControllable: true,
    hasDoorSensor: false,
    toolCount: 1,
    gcodeListIncludesDetail: true,
    buildVolume: { x: 220, y: 220, z: 220 },
    defaultFirmware: 'v3.1.5',
  },
  ['adventurer-5x']: {
    model: 'adventurer-5x',
    name: 'Adventurer 5X (AD5X)',
    protocolMode: 'modern',
    supportsHttp: true,
    supportsTcp: true,
    hasMaterialStation: true,
    hasIndependentDualNozzle: true,
    hasCamera: false,
    hasChamberTemp: true,
    hasFiltration: false,
    filtrationControllable: true,
    hasDoorSensor: false,
    toolCount: 2,
    gcodeListIncludesDetail: true,
    buildVolume: { x: 220, y: 220, z: 220 },
    defaultFirmware: 'v3.1.3',
  },
  // HTTP-only 4-head tool changer. Real hardware runs no TCP service on 8899;
  // the material station is present but /detail omits hasMatlStation and the
  // leftTemp/indepMatlInfo block (those are AD5X IFS fields). The base model
  // has no chamber sensor, so /detail reports the -108 sentinel and chamber
  // control commands are acknowledged without effect, matching real firmware.
  ['creator-5']: {
    model: 'creator-5',
    name: 'Creator 5',
    protocolMode: 'modern',
    supportsHttp: true,
    supportsTcp: false,
    hasMaterialStation: true,
    hasIndependentDualNozzle: false,
    hasCamera: true,
    hasChamberTemp: false,
    emitsChamberSentinel: true,
    hasFiltration: false,
    filtrationControllable: false,
    hasDoorSensor: false,
    toolCount: 4,
    gcodeListIncludesDetail: false,
    buildVolume: { x: 256, y: 256, z: 256 },
    defaultFirmware: '1.7.8-1.1.7',
  },
  // As base, plus: real chamber heater (max 80 C) with sensor, real door
  // sensor, and filtration hardware with TVOC reporting. Filtration is NOT
  // controllable: circulateCtl_cmd is acknowledged but does not actuate, and
  // /product under-reports the fan control states — both match real firmware.
  ['creator-5-pro']: {
    model: 'creator-5-pro',
    name: 'Creator 5 Pro',
    protocolMode: 'modern',
    supportsHttp: true,
    supportsTcp: false,
    hasMaterialStation: true,
    hasIndependentDualNozzle: false,
    hasCamera: true,
    hasChamberTemp: true,
    hasFiltration: true,
    filtrationControllable: false,
    hasDoorSensor: true,
    toolCount: 4,
    gcodeListIncludesDetail: false,
    buildVolume: { x: 256, y: 256, z: 256 },
    defaultFirmware: '1.9.4-1.2.6',
  },
} as const;

/**
 * Product ID values returned by the HTTP `/detail` endpoint.
 *
 * The Android app uses `pid` as the primary model-detection mechanism via
 * `PrinterModel.fromDetail()`. Legacy TCP-only models (Adventurer 3/4) have
 * no PID in the Android app and default to `0`.
 */
export const PRINTER_PID: Readonly<Partial<Record<PrinterModel, number>>> = {
  'adventurer-5m': 35,
  'adventurer-5m-pro': 36,
  'adventurer-5x': 38,
  'creator-5': 40,
  'creator-5-pro': 41,
} as const;

/**
 * Simulation mode for print jobs
 */
export type SimulationMode = 'auto' | 'manual';

/**
 * Network interface information for discovery configuration
 */
export interface NetworkInterface {
  /** Interface IP address */
  address: string;
  /** Display name (e.g., "Wi-Fi (192.168.1.131)") */
  displayName: string;
  /** Interface type */
  type: 'physical' | 'virtual' | 'loopback';
  /** Internal technical name */
  name: string;
}

/**
 * Discovery connection settings
 */
export interface DiscoveryConfig {
  machineName: string;
  commandPort: number;
  vid: number;
  pid: number;
  productType: number;
  httpPort: number;
  legacyPort2: number;
  status: number;
}

/**
 * Emulator configuration
 */
export interface EmulatorConfig {
  /** Selected printer model */
  selectedModel: PrinterModel;
  /** TCP port (default 8899) */
  tcpPort: number;
  /** HTTP port (default 8898) */
  httpPort: number;
  /** Serial number for authentication */
  serialNumber: string;
  /** Check code for authentication */
  checkCode: string;
  /** Print simulation mode */
  simulationMode: SimulationMode;
  /** Auto-simulation speed multiplier */
  simulationSpeed: number;
  /** Whether to start servers on app launch */
  autoStart: boolean;
  /** Network interface for UDP discovery (empty = all interfaces) */
  discoveryInterface: string;
  /** Cumulative print time in seconds (persists across sessions) */
  cumulativePrintTime: number;
  /** Cumulative filament used in meters (persists across sessions) */
  cumulativeFilament: number;
  /** Custom discovery overriding options */
  discoveryConfig: DiscoveryConfig;
}

/**
 * Real protocol log entry emitted by the main process
 */
export interface ProtocolLogEntry {
  id: string;
  timestamp: string;
  protocol: 'http' | 'tcp' | 'discovery' | 'system';
  direction: 'incoming' | 'outgoing' | 'internal';
  level: 'info' | 'warning' | 'error';
  summary: string;
  payload?: unknown;
}

/**
 * Default emulator configuration
 */
export const DEFAULT_CONFIG: EmulatorConfig = {
  selectedModel: 'adventurer-5m-pro',
  tcpPort: 8899,
  httpPort: 8898,
  serialNumber: 'SNEMULATOR001',
  checkCode: '12345',
  simulationMode: 'auto',
  simulationSpeed: 100,
  autoStart: false,
  discoveryInterface: '',
  cumulativePrintTime: 0,
  cumulativeFilament: 0,
  discoveryConfig: {
    machineName: '',
    commandPort: 8899,
    vid: 0x2b71,
    pid: 0x0024,
    productType: 0x5a02,
    httpPort: 8898,
    legacyPort2: 8,
    status: 0,
  },
} as const;
