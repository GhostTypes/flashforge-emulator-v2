import type { PrinterModel, SimulationMode } from '../../shared/types/printer';

const KNOWN_OPTION_NAMES = new Set([
  'instance-id',
  'model',
  'serial',
  'check-code',
  'machine-name',
  'tcp-port',
  'http-port',
  'discovery-enabled',
  'simulation-mode',
  'simulation-speed',
]);

const MODEL_SET: ReadonlySet<PrinterModel> = new Set([
  'adventurer-3',
  'adventurer-4',
  'adventurer-5m',
  'adventurer-5m-pro',
  'adventurer-5x',
]);

const SIMULATION_MODE_SET: ReadonlySet<SimulationMode> = new Set(['auto', 'manual']);

export interface HeadlessInstanceOptions {
  instanceId: string;
  model: PrinterModel;
  serial: string;
  checkCode: string;
  machineName: string;
  tcpPort: number;
  httpPort: number;
  discoveryEnabled: boolean;
  simulationMode: SimulationMode;
  simulationSpeed: number;
}

function parseOptionMap(argv: readonly string[]): Map<string, string | undefined> {
  const options = new Map<string, string | undefined>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${token ?? ''}`);
    }

    const content = token.slice(2);
    const equalsIndex = content.indexOf('=');

    if (equalsIndex >= 0) {
      const key = content.slice(0, equalsIndex);
      const value = content.slice(equalsIndex + 1);
      options.set(key, value);
      continue;
    }

    const key = content;
    const nextToken = argv[index + 1];
    if (nextToken && !nextToken.startsWith('--')) {
      options.set(key, nextToken);
      index += 1;
      continue;
    }

    options.set(key, undefined);
  }

  for (const key of options.keys()) {
    if (!KNOWN_OPTION_NAMES.has(key)) {
      throw new Error(`Unknown option: --${key}`);
    }
  }

  return options;
}

function getRequiredStringOption(
  options: ReadonlyMap<string, string | undefined>,
  key: string
): string {
  const value = options.get(key);
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required option: --${key}`);
  }

  return value.trim();
}

function parsePort(
  options: ReadonlyMap<string, string | undefined>,
  key: 'tcp-port' | 'http-port'
): number {
  const value = getRequiredStringOption(options, key);
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid port for --${key}: ${value}`);
  }

  return parsed;
}

function parseBoolean(value: string, key: string): boolean {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }

  throw new Error(`Invalid boolean value for --${key}: ${value}`);
}

function parseSimulationSpeed(options: ReadonlyMap<string, string | undefined>): number {
  const raw = getRequiredStringOption(options, 'simulation-speed');
  const parsed = Number.parseInt(raw, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) {
    throw new Error(`Invalid simulation speed for --simulation-speed: ${raw}`);
  }

  return parsed;
}

export function parseHeadlessInstanceArgs(argv: readonly string[]): HeadlessInstanceOptions {
  const options = parseOptionMap(argv);

  const modelCandidate = getRequiredStringOption(options, 'model');
  if (!MODEL_SET.has(modelCandidate as PrinterModel)) {
    throw new Error(`Unsupported model: ${modelCandidate}`);
  }

  const simulationModeCandidate = getRequiredStringOption(options, 'simulation-mode');
  if (!SIMULATION_MODE_SET.has(simulationModeCandidate as SimulationMode)) {
    throw new Error(`Invalid simulation mode: ${simulationModeCandidate}`);
  }

  const discoveryOption = options.get('discovery-enabled');
  const discoveryEnabled =
    discoveryOption === undefined ? true : parseBoolean(discoveryOption, 'discovery-enabled');

  const parsed: HeadlessInstanceOptions = {
    instanceId: getRequiredStringOption(options, 'instance-id'),
    model: modelCandidate as PrinterModel,
    serial: getRequiredStringOption(options, 'serial'),
    checkCode: getRequiredStringOption(options, 'check-code'),
    machineName: getRequiredStringOption(options, 'machine-name'),
    tcpPort: parsePort(options, 'tcp-port'),
    httpPort: parsePort(options, 'http-port'),
    discoveryEnabled,
    simulationMode: simulationModeCandidate as SimulationMode,
    simulationSpeed: parseSimulationSpeed(options),
  };

  if (parsed.tcpPort === parsed.httpPort) {
    throw new Error('tcpPort and httpPort must be different for a single instance');
  }

  return parsed;
}

export function buildHeadlessInstanceCliArgs(options: HeadlessInstanceOptions): string[] {
  return [
    '--instance-id',
    options.instanceId,
    '--model',
    options.model,
    '--serial',
    options.serial,
    '--check-code',
    options.checkCode,
    '--machine-name',
    options.machineName,
    '--tcp-port',
    String(options.tcpPort),
    '--http-port',
    String(options.httpPort),
    '--discovery-enabled',
    String(options.discoveryEnabled),
    '--simulation-mode',
    options.simulationMode,
    '--simulation-speed',
    String(options.simulationSpeed),
  ];
}
