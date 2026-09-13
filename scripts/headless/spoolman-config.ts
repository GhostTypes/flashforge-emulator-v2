/**
 * @fileoverview
 * CLI argument parsing and seed loading for the mocked Spoolman sidecar.
 *
 * Mirrors the conventions of instance-config.ts / supervisor-config.ts:
 * hand-rolled type guards at trust boundaries, unknown options and invalid
 * seeds fail loudly with descriptive messages, and everything is
 * deterministic so test fixtures behave identically on every run.
 *
 * @packageDocumentation
 */

import { readFileSync } from 'node:fs';
import type { SpoolmanSpoolRecord, SpoolmanVendorRecord } from './spoolman-store';
import { lengthFromWeight } from './spoolman-store';

/** Options the sidecar entrypoint needs after parsing CLI args + seed. */
export interface SpoolmanSidecarOptions {
  readonly port: number;
  readonly seedSpools: readonly SpoolmanSpoolRecord[];
  /** Human-readable description of where the seed came from (READY payload). */
  readonly seedSource: string;
}

export const DEFAULT_SPOOLMAN_PORT = 7912;

/**
 * Fixed fallback registration timestamp so seeds without an explicit
 * `registered` field are deterministic across runs (test fixtures must not
 * depend on wall-clock values they did not seed themselves).
 */
const DEFAULT_REGISTERED = '2026-01-01T00:00:00.000Z';

const SPOOL_KEYS = new Set([
  'id',
  'registered',
  'archived',
  'price',
  'initial_weight',
  'remaining_weight',
  'used_weight',
  'remaining_length',
  'used_length',
  'first_used',
  'last_used',
  'location',
  'lot_nr',
  'comment',
  'filament',
]);

const FILAMENT_KEYS = new Set([
  'id',
  'registered',
  'name',
  'vendor',
  'material',
  'density',
  'diameter',
  'weight',
  'spool_weight',
  'color_hex',
  'multi_color_hexes',
  'multi_color_direction',
  'article_number',
  'settings_extruder_temp',
  'settings_bed_temp',
  'price',
  'comment',
  'external_id',
]);

const VENDOR_KEYS = new Set(['id', 'registered', 'name', 'empty_spool_weight', 'external_id']);

/**
 * Default seed: six spools across four vendors/materials, one archived, so
 * filter/sort/archived paths all have something to hit without --seed.
 */
const DEFAULT_SEED_JSON = `
[
  {
    "id": 1,
    "filament": {
      "name": "FlashForge PLA Black",
      "material": "PLA",
      "density": 1.24,
      "diameter": 1.75,
      "weight": 1000,
      "spool_weight": 245,
      "color_hex": "#000000",
      "settings_extruder_temp": 210,
      "settings_bed_temp": 50,
      "vendor": "FlashForge"
    },
    "remaining_weight": 850,
    "used_weight": 150,
    "location": "Shelf A",
    "registered": "2026-01-05T08:00:00.000Z"
  },
  {
    "id": 2,
    "filament": {
      "name": "FlashForge PLA White",
      "material": "PLA",
      "density": 1.24,
      "diameter": 1.75,
      "weight": 1000,
      "spool_weight": 245,
      "color_hex": "#FFFFFF",
      "vendor": "FlashForge"
    },
    "remaining_weight": 420.5,
    "used_weight": 579.5,
    "location": "Shelf A",
    "registered": "2026-02-11T10:30:00.000Z"
  },
  {
    "id": 3,
    "filament": {
      "name": "Polymaker PolyLite PETG Black",
      "material": "PETG",
      "density": 1.27,
      "diameter": 1.75,
      "weight": 1000,
      "color_hex": "#0D0D0D",
      "settings_extruder_temp": 240,
      "settings_bed_temp": 80,
      "vendor": "Polymaker"
    },
    "remaining_weight": 990,
    "used_weight": 10,
    "location": "Shelf B",
    "lot_nr": "LOT-2025-A",
    "registered": "2026-03-02T14:00:00.000Z"
  },
  {
    "id": 4,
    "filament": {
      "name": "eSun ABS+ Red",
      "material": "ABS",
      "density": 1.04,
      "diameter": 1.75,
      "weight": 1000,
      "color_hex": "#D32F2F",
      "vendor": "eSun"
    },
    "remaining_weight": 233.25,
    "used_weight": 766.75,
    "location": "Printer 1",
    "registered": "2026-04-19T09:15:00.000Z"
  },
  {
    "id": 5,
    "filament": {
      "name": "Overture TPU 95A Black",
      "material": "TPU",
      "density": 1.21,
      "diameter": 1.75,
      "weight": 1000,
      "color_hex": "#1A1A1A",
      "settings_extruder_temp": 225,
      "settings_bed_temp": 60,
      "vendor": "Overture"
    },
    "remaining_weight": 660,
    "used_weight": 340,
    "comment": "Flexible material - print slow",
    "registered": "2026-05-27T16:45:00.000Z"
  },
  {
    "id": 6,
    "filament": {
      "name": "FlashForge PLA Matte Gray (empty)",
      "material": "PLA",
      "density": 1.24,
      "diameter": 1.75,
      "weight": 1000,
      "color_hex": "#9E9E9E",
      "vendor": "FlashForge"
    },
    "remaining_weight": 0,
    "used_weight": 1000,
    "archived": true,
    "location": "Recycle bin",
    "registered": "2025-12-01T12:00:00.000Z"
  }
]
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rejectUnknownKeys(
  record: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  path: string
): void {
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      throw new Error(
        `Invalid spoolman seed: unknown key "${key}" in ${path} (allowed: ${[...allowed].sort().join(', ')})`
      );
    }
  }
}

function expectRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Invalid spoolman seed: ${path} must be an object`);
  }
  return value;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid spoolman seed: ${path} must be a string`);
  }
  return value;
}

function expectNonEmptyString(value: unknown, path: string): string {
  const text = expectString(value, path);
  if (text.trim().length === 0) {
    throw new Error(`Invalid spoolman seed: ${path} must not be empty`);
  }
  return text;
}

function expectNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid spoolman seed: ${path} must be a finite number`);
  }
  return value;
}

function expectNonNegativeNumber(value: unknown, path: string): number {
  const number = expectNumber(value, path);
  if (number < 0) {
    throw new Error(`Invalid spoolman seed: ${path} must be >= 0`);
  }
  return number;
}

function expectPositiveInt(value: unknown, path: string): number {
  const number = expectNumber(value, path);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`Invalid spoolman seed: ${path} must be a positive integer`);
  }
  return number;
}

function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid spoolman seed: ${path} must be a boolean`);
  }
  return value;
}

function optionalString(value: unknown, path: string): string | null {
  return value === undefined ? null : expectString(value, path);
}

function optionalNonNegativeNumber(value: unknown, path: string): number | null {
  return value === undefined ? null : expectNonNegativeNumber(value, path);
}

function optionalPositiveInt(value: unknown, path: string): number | null {
  return value === undefined ? null : expectPositiveInt(value, path);
}

interface VendorSeedInput {
  readonly id: number | undefined;
  readonly name: string;
  readonly emptySpoolWeight: number | undefined;
  readonly externalId: string | undefined;
}

/**
 * Normalize one seed spool (raw JSON) into a SpoolmanSpoolRecord, filling
 * Spoolman-shaped defaults for everything the seed left out. Vendor IDs
 * are assigned deterministically (first-seen order) so re-runs produce
 * identical output.
 */
function normalizeSpool(
  raw: unknown,
  index: number,
  assignedVendorIds: Map<string, number>
): SpoolmanSpoolRecord {
  const path = `spools[${index}]`;
  const spool = expectRecord(raw, path);
  rejectUnknownKeys(spool, SPOOL_KEYS, path);

  const id = expectPositiveInt(spool['id'], `${path}.id`);
  const filamentRaw = expectRecord(spool['filament'], `${path}.filament`);
  rejectUnknownKeys(filamentRaw, FILAMENT_KEYS, `${path}.filament`);
  const filamentName = expectNonEmptyString(filamentRaw['name'], `${path}.filament.name`);

  const density =
    filamentRaw['density'] === undefined
      ? 1.24
      : expectNumber(filamentRaw['density'], `${path}.filament.density`);
  const diameter =
    filamentRaw['diameter'] === undefined
      ? 1.75
      : expectNumber(filamentRaw['diameter'], `${path}.filament.diameter`);
  if (density <= 0 || diameter <= 0) {
    throw new Error(`Invalid spoolman seed: ${path}.filament density and diameter must be > 0`);
  }
  const weight =
    optionalNonNegativeNumber(filamentRaw['weight'], `${path}.filament.weight`) ?? 1000;
  const multiColorDirectionRaw = filamentRaw['multi_color_direction'];
  if (
    multiColorDirectionRaw !== undefined &&
    multiColorDirectionRaw !== 'coaxial' &&
    multiColorDirectionRaw !== 'longitudinal'
  ) {
    throw new Error(
      `Invalid spoolman seed: ${path}.filament.multi_color_direction must be "coaxial" or "longitudinal"`
    );
  }

  const vendorRaw = filamentRaw['vendor'];
  let vendor: SpoolmanVendorRecord | null = null;
  if (vendorRaw !== undefined && vendorRaw !== null) {
    const input: VendorSeedInput =
      typeof vendorRaw === 'string'
        ? { id: undefined, name: vendorRaw, emptySpoolWeight: undefined, externalId: undefined }
        : (() => {
            const record = expectRecord(vendorRaw, `${path}.filament.vendor`);
            rejectUnknownKeys(record, VENDOR_KEYS, `${path}.filament.vendor`);
            return {
              id: optionalPositiveInt(record['id'], `${path}.filament.vendor.id`) ?? undefined,
              name: expectNonEmptyString(record['name'], `${path}.filament.vendor.name`),
              emptySpoolWeight:
                optionalNonNegativeNumber(
                  record['empty_spool_weight'],
                  `${path}.filament.vendor.empty_spool_weight`
                ) ?? undefined,
              externalId:
                optionalString(record['external_id'], `${path}.filament.vendor.external_id`) ??
                undefined,
            };
          })();

    const explicitId = input.id ?? assignedVendorIds.get(input.name);
    const vendorId = explicitId ?? assignedVendorIds.size + 1;
    assignedVendorIds.set(input.name, vendorId);
    vendor = {
      id: vendorId,
      registered: DEFAULT_REGISTERED,
      name: input.name,
      emptySpoolWeight: input.emptySpoolWeight ?? null,
      externalId: input.externalId ?? null,
    };
  }

  const referenceWeight = weight;
  const usedWeight = optionalNonNegativeNumber(spool['used_weight'], `${path}.used_weight`) ?? 0;
  const remainingWeight =
    optionalNonNegativeNumber(spool['remaining_weight'], `${path}.remaining_weight`) ??
    Math.max(0, referenceWeight - usedWeight);
  const usedLength =
    optionalNonNegativeNumber(spool['used_length'], `${path}.used_length`) ??
    lengthFromWeight(usedWeight, density, diameter);
  const remainingLength =
    optionalNonNegativeNumber(spool['remaining_length'], `${path}.remaining_length`) ??
    lengthFromWeight(remainingWeight, density, diameter);

  return {
    id,
    registered: optionalString(spool['registered'], `${path}.registered`) ?? DEFAULT_REGISTERED,
    firstUsed: optionalString(spool['first_used'], `${path}.first_used`),
    lastUsed: optionalString(spool['last_used'], `${path}.last_used`),
    archived:
      spool['archived'] === undefined
        ? false
        : expectBoolean(spool['archived'], `${path}.archived`),
    price: optionalNonNegativeNumber(spool['price'], `${path}.price`),
    initialWeight:
      optionalNonNegativeNumber(spool['initial_weight'], `${path}.initial_weight`) ?? weight,
    remainingWeight,
    usedWeight,
    remainingLength,
    usedLength,
    location: optionalString(spool['location'], `${path}.location`),
    lotNr: optionalString(spool['lot_nr'], `${path}.lot_nr`),
    comment: optionalString(spool['comment'], `${path}.comment`),
    filament: {
      id: optionalPositiveInt(filamentRaw['id'], `${path}.filament.id`) ?? 1000 + id,
      registered:
        optionalString(filamentRaw['registered'], `${path}.filament.registered`) ??
        DEFAULT_REGISTERED,
      name: filamentName,
      material: optionalString(filamentRaw['material'], `${path}.filament.material`),
      density,
      diameter,
      weight,
      spoolWeight: optionalNonNegativeNumber(
        filamentRaw['spool_weight'],
        `${path}.filament.spool_weight`
      ),
      colorHex: optionalString(filamentRaw['color_hex'], `${path}.filament.color_hex`),
      multiColorHexes: optionalString(
        filamentRaw['multi_color_hexes'],
        `${path}.filament.multi_color_hexes`
      ),
      multiColorDirection: multiColorDirectionRaw ?? null,
      articleNumber: optionalString(
        filamentRaw['article_number'],
        `${path}.filament.article_number`
      ),
      settingsExtruderTemp: optionalNonNegativeNumber(
        filamentRaw['settings_extruder_temp'],
        `${path}.filament.settings_extruder_temp`
      ),
      settingsBedTemp: optionalNonNegativeNumber(
        filamentRaw['settings_bed_temp'],
        `${path}.filament.settings_bed_temp`
      ),
      price: optionalNonNegativeNumber(filamentRaw['price'], `${path}.filament.price`),
      comment: optionalString(filamentRaw['comment'], `${path}.filament.comment`),
      externalId: optionalString(filamentRaw['external_id'], `${path}.filament.external_id`),
      vendor,
    },
  };
}

/**
 * Parse and normalize a raw seed value (already JSON.parsed) into spool
 * records. Accepts an array of spools or a single spool object.
 */
export function normalizeSeed(raw: unknown): readonly SpoolmanSpoolRecord[] {
  const list = Array.isArray(raw) ? raw : [raw];
  if (list.length === 0) {
    throw new Error('Invalid spoolman seed: seed must contain at least one spool');
  }
  const assignedVendorIds = new Map<string, number>();
  const seenIds = new Set<number>();
  const records = list.map((entry, index) => {
    const record = normalizeSpool(entry, index, assignedVendorIds);
    if (seenIds.has(record.id)) {
      throw new Error(`Invalid spoolman seed: duplicate spool id ${record.id}`);
    }
    seenIds.add(record.id);
    return record;
  });
  return records;
}

/** The built-in default seed, normalized through the same path as user seeds. */
export function getDefaultSeed(): readonly SpoolmanSpoolRecord[] {
  return normalizeSeed(JSON.parse(DEFAULT_SEED_JSON));
}

function loadSeedValue(seedArg: string): { raw: unknown; source: string } {
  const trimmed = seedArg.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return { raw: JSON.parse(trimmed), source: 'inline JSON' };
    } catch (error) {
      throw new Error(
        `Invalid --seed inline JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  try {
    return {
      raw: JSON.parse(readFileSync(seedArg, 'utf-8')),
      source: `file: ${seedArg}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read --seed file "${seedArg}" as JSON (it does not start with "[" or "{" so it was treated as a path): ${message}`
    );
  }
}

/**
 * Parse the Spoolman sidecar CLI. Supported options (both "--opt value"
 * and "--opt=value" forms are accepted):
 *   --port <1-65535>   HTTP port to listen on (default 7912)
 *   --seed <json|path> inline JSON array/object, or a path to a JSON file
 */
export function parseSpoolmanArgs(argv: readonly string[]): SpoolmanSidecarOptions {
  const known = new Set(['--port', '--seed']);
  const values = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) {
      break;
    }
    let name = arg;
    let inlineValue: string | undefined;
    const separator = arg.indexOf('=');
    if (separator !== -1) {
      name = arg.slice(0, separator);
      inlineValue = arg.slice(separator + 1);
    }
    if (!known.has(name)) {
      throw new Error(`Unknown option "${arg}" (known options: ${[...known].join(', ')})`);
    }
    const value = inlineValue ?? argv[i + 1];
    if (value === undefined || value === '') {
      throw new Error(`Option "${name}" requires a value`);
    }
    values.set(name, value);
    if (inlineValue === undefined) {
      i++;
    }
  }

  const portArg = values.get('--port');
  const port = portArg === undefined ? DEFAULT_SPOOLMAN_PORT : Number.parseInt(portArg, 10);
  if (portArg !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) {
    throw new Error(`Invalid --port "${portArg}": must be an integer between 1 and 65535`);
  }

  const seedArg = values.get('--seed');
  if (seedArg === undefined) {
    return { port, seedSpools: getDefaultSeed(), seedSource: 'default' };
  }
  const { raw, source } = loadSeedValue(seedArg);
  return { port, seedSpools: normalizeSeed(raw), seedSource: source };
}
