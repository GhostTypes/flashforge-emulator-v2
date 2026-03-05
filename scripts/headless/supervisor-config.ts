import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { PrinterModel, SimulationMode } from '../../shared/types/printer';
import type { HeadlessInstanceOptions } from './instance-config';

const MODEL_SET: ReadonlySet<PrinterModel> = new Set([
  'adventurer-3',
  'adventurer-4',
  'adventurer-5m',
  'adventurer-5m-pro',
  'adventurer-5x',
]);

const SIMULATION_MODE_SET: ReadonlySet<SimulationMode> = new Set(['auto', 'manual']);

interface RawSupervisorConfig {
  instances?: unknown;
}

interface RawInstanceConfig {
  instanceId?: unknown;
  model?: unknown;
  serial?: unknown;
  checkCode?: unknown;
  machineName?: unknown;
  tcpPort?: unknown;
  httpPort?: unknown;
  discoveryEnabled?: unknown;
  simulationMode?: unknown;
  simulationSpeed?: unknown;
}

export interface SupervisorCliOptions {
  configPath: string;
  startupTimeoutMs: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid or missing "${fieldName}"`);
  }
  return value.trim();
}

function expectPort(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Invalid "${fieldName}" port`);
  }
  return value;
}

function expectBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid "${fieldName}" flag`);
  }
  return value;
}

function expectSimulationSpeed(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 1000) {
    throw new Error('Invalid "simulationSpeed" value');
  }
  return value;
}

function normalizeInstanceConfig(raw: unknown, index: number): HeadlessInstanceOptions {
  if (!isRecord(raw)) {
    throw new Error(`Instance at index ${index} must be an object`);
  }

  const candidate = raw as RawInstanceConfig;
  const instanceId = expectString(candidate.instanceId, `instances[${index}].instanceId`);
  const serial = expectString(candidate.serial, `instances[${index}].serial`);
  const checkCode = expectString(candidate.checkCode, `instances[${index}].checkCode`);
  const machineName = expectString(candidate.machineName, `instances[${index}].machineName`);
  const tcpPort = expectPort(candidate.tcpPort, `instances[${index}].tcpPort`);
  const httpPort = expectPort(candidate.httpPort, `instances[${index}].httpPort`);

  const modelCandidate = expectString(candidate.model, `instances[${index}].model`);
  if (!MODEL_SET.has(modelCandidate as PrinterModel)) {
    throw new Error(`Unsupported model in instances[${index}].model: ${modelCandidate}`);
  }

  const simulationModeCandidate =
    candidate.simulationMode === undefined
      ? 'auto'
      : expectString(candidate.simulationMode, `instances[${index}].simulationMode`);
  if (!SIMULATION_MODE_SET.has(simulationModeCandidate as SimulationMode)) {
    throw new Error(
      `Invalid simulation mode in instances[${index}].simulationMode: ${simulationModeCandidate}`
    );
  }

  const discoveryEnabled =
    candidate.discoveryEnabled === undefined
      ? true
      : expectBoolean(candidate.discoveryEnabled, `instances[${index}].discoveryEnabled`);
  const simulationSpeed =
    candidate.simulationSpeed === undefined
      ? 100
      : expectSimulationSpeed(candidate.simulationSpeed);

  if (tcpPort === httpPort) {
    throw new Error(`instances[${index}] tcpPort and httpPort must be different`);
  }

  return {
    instanceId,
    model: modelCandidate as PrinterModel,
    serial,
    checkCode,
    machineName,
    tcpPort,
    httpPort,
    discoveryEnabled,
    simulationMode: simulationModeCandidate as SimulationMode,
    simulationSpeed,
  };
}

export function validateSupervisorInstances(rawInstances: unknown): HeadlessInstanceOptions[] {
  if (!Array.isArray(rawInstances) || rawInstances.length === 0) {
    throw new Error('"instances" must be a non-empty array');
  }

  const instances = rawInstances.map((entry, index) => normalizeInstanceConfig(entry, index));

  const seenInstanceIds = new Set<string>();
  const seenSerials = new Set<string>();
  const usedTcpPorts = new Map<number, string>();

  for (const instance of instances) {
    if (seenInstanceIds.has(instance.instanceId)) {
      throw new Error(`Duplicate instanceId: ${instance.instanceId}`);
    }
    seenInstanceIds.add(instance.instanceId);

    if (seenSerials.has(instance.serial)) {
      throw new Error(`Duplicate serial: ${instance.serial}`);
    }
    seenSerials.add(instance.serial);

    const tcpOwner = usedTcpPorts.get(instance.tcpPort);
    if (tcpOwner) {
      throw new Error(
        `Port collision on ${instance.tcpPort} between ${tcpOwner} and ${instance.instanceId}`
      );
    }
    usedTcpPorts.set(instance.tcpPort, instance.instanceId);

    const httpOwner = usedTcpPorts.get(instance.httpPort);
    if (httpOwner) {
      throw new Error(
        `Port collision on ${instance.httpPort} between ${httpOwner} and ${instance.instanceId}`
      );
    }
    usedTcpPorts.set(instance.httpPort, instance.instanceId);
  }

  return instances;
}

export async function loadSupervisorConfig(configPath: string): Promise<HeadlessInstanceOptions[]> {
  const absolutePath = path.resolve(process.cwd(), configPath);
  const raw = await readFile(absolutePath, 'utf-8');
  const parsed = JSON.parse(raw) as RawSupervisorConfig;

  return validateSupervisorInstances(parsed.instances);
}

function parsePositiveInteger(value: string, key: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid value for --${key}: ${value}`);
  }
  return parsed;
}

export function parseSupervisorCliArgs(argv: readonly string[]): SupervisorCliOptions {
  let configPath: string | null = null;
  let startupTimeoutMs = 15_000;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${token ?? ''}`);
    }

    const content = token.slice(2);
    const [key, inlineValue] = content.split('=', 2);
    const explicitValue =
      inlineValue !== undefined
        ? inlineValue
        : argv[index + 1] && !argv[index + 1]?.startsWith('--')
          ? argv[index + 1]
          : undefined;

    if (
      inlineValue === undefined &&
      explicitValue !== undefined &&
      !explicitValue.startsWith('--')
    ) {
      index += 1;
    }

    if (key === 'config') {
      if (!explicitValue || explicitValue.trim().length === 0) {
        throw new Error('Missing required value for --config');
      }
      configPath = explicitValue;
      continue;
    }

    if (key === 'startup-timeout-ms') {
      if (!explicitValue || explicitValue.trim().length === 0) {
        throw new Error('Missing required value for --startup-timeout-ms');
      }
      startupTimeoutMs = parsePositiveInteger(explicitValue, key);
      continue;
    }

    throw new Error(`Unknown option: --${key}`);
  }

  if (!configPath) {
    throw new Error('Missing required option: --config');
  }

  return { configPath, startupTimeoutMs };
}
