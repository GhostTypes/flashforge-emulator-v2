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
  | 'adventurer-5x';

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
  | 'calibrate_doing'
  | 'completed'
  | 'error';

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
  /** Estimated remaining time in seconds */
  estimatedTimeRemaining: number;
  /** Total print time in seconds */
  totalPrintTime: number;
  /** Time elapsed since print started in seconds */
  elapsedTime: number;
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
  /** Red component (0-255) */
  red: number;
  /** Green component (0-255) */
  green: number;
  /** Blue component (0-255) */
  blue: number;
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
  /** Auto shutdown setting */
  autoShutdown: 'open' | 'close';
  /** Auto shutdown time in minutes */
  autoShutdownTime: number;
  /** Cumulative print time across all jobs in seconds */
  cumulativePrintTime: number;
  /** Cumulative filament used across all jobs in meters */
  cumulativeFilament: number;
  /** Estimated right filament length for current job in mm */
  estimatedRightLen: number;
  /** Estimated right filament weight for current job in grams */
  estimatedRightWeight: number;
  /** Estimated left filament length for current job in mm (AD5X only) */
  estimatedLeftLen: number;
  /** Estimated left filament weight for current job in grams (AD5X only) */
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
  /** Whether TCP API is supported */
  supportsTcp: boolean;
  /** Has material station (IFS) */
  hasMaterialStation: boolean;
  /** Has built-in camera */
  hasCamera: boolean;
  /** Has chamber temperature control */
  hasChamberTemp: boolean;
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
    hasCamera: false,
    hasChamberTemp: false,
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
    hasCamera: false,
    hasChamberTemp: false,
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
    hasCamera: false,
    hasChamberTemp: true,
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
    hasCamera: true,
    hasChamberTemp: true,
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
    hasCamera: false,
    hasChamberTemp: true,
    buildVolume: { x: 220, y: 220, z: 220 },
    defaultFirmware: 'v3.1.3',
  },
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
} as const;
