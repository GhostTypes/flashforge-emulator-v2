/**
 * @fileoverview
 * In-memory state store for the mocked Spoolman sidecar.
 *
 * This is the single source of truth for the sidecar's simulated spool state,
 * mirroring the role PrinterStateStore plays for printer instances:
 *  - the Express routes in run-spoolman.ts read/query through this store,
 *  - usage PUTs and /__reset mutate through this store,
 *  - nothing else keeps a parallel copy of spool state that can drift.
 *
 * There is deliberately NO dependency on Electron, the emulator's printer
 * services, or the instance registry — the sidecar is standalone test
 * infrastructure, not part of a printer instance.
 *
 * @packageDocumentation
 */

/**
 * Vendor entry as stored internally (camelCase) and serialized to the
 * Spoolman wire shape (snake_case) by {@link serializeSpool}.
 */
export interface SpoolmanVendorRecord {
  readonly id: number;
  readonly registered: string;
  readonly name: string;
  readonly emptySpoolWeight: number | null;
  readonly externalId: string | null;
}

/**
 * Filament entry attached to a spool. Field names follow the frontend
 * `FilamentObject` contract (FlashForgeWebUI / FlashForgeUI-Electron
 * `src/types/spoolman.ts`); the wire serializer emits the snake_case names.
 */
export interface SpoolmanFilamentRecord {
  readonly id: number;
  readonly registered: string;
  readonly name: string;
  readonly material: string | null;
  readonly density: number;
  readonly diameter: number;
  readonly weight: number | null;
  readonly spoolWeight: number | null;
  readonly colorHex: string | null;
  readonly multiColorHexes: string | null;
  readonly multiColorDirection: 'coaxial' | 'longitudinal' | null;
  readonly articleNumber: string | null;
  readonly settingsExtruderTemp: number | null;
  readonly settingsBedTemp: number | null;
  readonly price: number | null;
  readonly comment: string | null;
  readonly externalId: string | null;
  readonly vendor: SpoolmanVendorRecord | null;
}

/**
 * A single spool as stored internally. Weights are grams, lengths are
 * millimeters — the same units Spoolman itself uses on the wire.
 */
export interface SpoolmanSpoolRecord {
  readonly id: number;
  readonly registered: string;
  readonly firstUsed: string | null;
  readonly lastUsed: string | null;
  readonly archived: boolean;
  readonly price: number | null;
  readonly initialWeight: number | null;
  readonly remainingWeight: number;
  readonly usedWeight: number;
  readonly remainingLength: number;
  readonly usedLength: number;
  readonly location: string | null;
  readonly lotNr: string | null;
  readonly comment: string | null;
  readonly filament: SpoolmanFilamentRecord;
}

/**
 * One ledger entry per accepted usage PUT, in arrival order.
 * `useWeight`/`useLength` record what the request carried — exactly one of
 * them is non-null, matching Spoolman's either/or usage payload contract.
 */
export interface SpoolmanUsageLedgerEntry {
  readonly spoolId: number;
  readonly useWeight: number | null;
  readonly useLength: number | null;
  readonly timestamp: string;
}

/**
 * Parsed query for `GET /api/v1/spool`. String filters use Spoolman's
 * case-insensitive substring semantics; comma-separated values are an
 * any-of match.
 */
export interface SpoolListQuery {
  readonly filamentName: string | undefined;
  readonly filamentMaterial: string | undefined;
  readonly filamentVendorName: string | undefined;
  readonly location: string | undefined;
  readonly lotNr: string | undefined;
  readonly allowArchived: boolean;
  readonly sort: string | undefined;
  readonly limit: number | undefined;
  readonly offset: number | undefined;
}

/**
 * Usage payload for `PUT /api/v1/spool/:id/use`. Exactly one of the two
 * fields is set — the route layer enforces Spoolman's either/or contract
 * (HTTP 422 otherwise) before it reaches the store.
 */
export type SpoolUsageInput =
  | { readonly useWeight: number; readonly useLength?: undefined }
  | { readonly useWeight?: undefined; readonly useLength: number };

/** Wire shape of a Spoolman vendor (`VendorObject` in the frontends). */
export interface SpoolmanVendorWire {
  readonly id: number;
  readonly registered: string;
  readonly name: string;
  readonly empty_spool_weight: number | null;
  readonly external_id: string | null;
  readonly extra: Record<string, string>;
}

/** Wire shape of a Spoolman filament (`FilamentObject` in the frontends). */
export interface SpoolmanFilamentWire {
  readonly id: number;
  readonly registered: string;
  readonly name: string;
  readonly vendor: SpoolmanVendorWire | null;
  readonly material: string | null;
  readonly density: number;
  readonly diameter: number;
  readonly weight: number | null;
  readonly spool_weight: number | null;
  readonly color_hex: string | null;
  readonly multi_color_hexes: string | null;
  readonly multi_color_direction: 'coaxial' | 'longitudinal' | null;
  readonly article_number: string | null;
  readonly settings_extruder_temp: number | null;
  readonly settings_bed_temp: number | null;
  readonly price: number | null;
  readonly comment: string | null;
  readonly external_id: string | null;
  readonly extra: Record<string, string>;
}

/**
 * Wire shape of a Spoolman spool — the exact `SpoolResponse` object the
 * frontends' `SpoolmanService` decodes. Optional/unset fields are emitted
 * as `null` (FastAPI `None` serialization), not omitted, matching real
 * Spoolman output.
 */
export interface SpoolmanSpoolWire {
  readonly id: number;
  readonly registered: string;
  readonly first_used: string | null;
  readonly last_used: string | null;
  readonly archived: boolean;
  readonly price: number | null;
  readonly initial_weight: number | null;
  readonly remaining_weight: number;
  readonly used_weight: number;
  readonly remaining_length: number;
  readonly used_length: number;
  readonly location: string | null;
  readonly lot_nr: string | null;
  readonly comment: string | null;
  readonly filament: SpoolmanFilamentWire;
  readonly extra: Record<string, string>;
}

/**
 * Cross-section area of the filament in mm² (πr², diameter in mm).
 */
export function filamentCrossSectionArea(diameter: number): number {
  return Math.PI * (diameter / 2) ** 2;
}

/**
 * Convert a filament length (mm) to weight (g) for the given density
 * (g/cm³) and diameter (mm) — the same conversion real Spoolman applies
 * for `use_length` payloads.
 */
export function weightFromLength(length: number, density: number, diameter: number): number {
  return (length * filamentCrossSectionArea(diameter) * density) / 1000;
}

/**
 * Convert a filament weight (g) to length (mm) — the inverse of
 * {@link weightFromLength}.
 */
export function lengthFromWeight(weight: number, density: number, diameter: number): number {
  return (weight * 1000) / (filamentCrossSectionArea(diameter) * density);
}

/**
 * Single place the Spoolman wire payload is built, mirroring the role
 * `serializeHttpDetail` plays for printer `/detail` responses. Routes and
 * tests must never hand-assemble a spool payload.
 */
export function serializeSpool(spool: Readonly<SpoolmanSpoolRecord>): SpoolmanSpoolWire {
  const filament = spool.filament;
  const vendor = filament.vendor;
  return {
    id: spool.id,
    registered: spool.registered,
    first_used: spool.firstUsed,
    last_used: spool.lastUsed,
    archived: spool.archived,
    price: spool.price,
    initial_weight: spool.initialWeight,
    remaining_weight: spool.remainingWeight,
    used_weight: spool.usedWeight,
    remaining_length: spool.remainingLength,
    used_length: spool.usedLength,
    location: spool.location,
    lot_nr: spool.lotNr,
    comment: spool.comment,
    filament: {
      id: filament.id,
      registered: filament.registered,
      name: filament.name,
      vendor:
        vendor === null
          ? null
          : {
              id: vendor.id,
              registered: vendor.registered,
              name: vendor.name,
              empty_spool_weight: vendor.emptySpoolWeight,
              external_id: vendor.externalId,
              extra: {},
            },
      material: filament.material,
      density: filament.density,
      diameter: filament.diameter,
      weight: filament.weight,
      spool_weight: filament.spoolWeight,
      color_hex: filament.colorHex,
      multi_color_hexes: filament.multiColorHexes,
      multi_color_direction: filament.multiColorDirection,
      article_number: filament.articleNumber,
      settings_extruder_temp: filament.settingsExtruderTemp,
      settings_bed_temp: filament.settingsBedTemp,
      price: filament.price,
      comment: filament.comment,
      external_id: filament.externalId,
      extra: {},
    },
    extra: {},
  };
}

/** Result of a usage application: either the updated spool, or not-found. */
export type SpoolUsageResult =
  | { readonly ok: true; readonly spool: SpoolmanSpoolWire }
  | { readonly ok: false; readonly error: 'spool-not-found' };

function matchesFilter(actual: string | null, filter: string | undefined): boolean {
  if (filter === undefined) {
    return true;
  }
  if (actual === null) {
    // Spoolman semantics: a filter on an unset field only matches when the
    // filter explicitly lists the empty string.
    return filter === '';
  }
  const lowered = actual.toLowerCase();
  return filter
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0)
    .some((value) => lowered.includes(value));
}

interface WireAccessor {
  readonly get: (spool: SpoolmanSpoolWire) => string | number | null;
}

/**
 * dot-path accessors for sortable fields (wire names, so the `sort` query
 * parameter uses the same identifiers clients see in responses).
 */
const SORTABLE_FIELDS: Readonly<Record<string, WireAccessor>> = {
  id: { get: (s) => s.id },
  registered: { get: (s) => s.registered },
  first_used: { get: (s) => s.first_used },
  last_used: { get: (s) => s.last_used },
  price: { get: (s) => s.price },
  initial_weight: { get: (s) => s.initial_weight },
  remaining_weight: { get: (s) => s.remaining_weight },
  used_weight: { get: (s) => s.used_weight },
  remaining_length: { get: (s) => s.remaining_length },
  used_length: { get: (s) => s.used_length },
  location: { get: (s) => s.location },
  lot_nr: { get: (s) => s.lot_nr },
  comment: { get: (s) => s.comment },
  'filament.id': { get: (s) => s.filament.id },
  'filament.registered': { get: (s) => s.filament.registered },
  'filament.name': { get: (s) => s.filament.name },
  'filament.material': { get: (s) => s.filament.material },
  'filament.density': { get: (s) => s.filament.density },
  'filament.diameter': { get: (s) => s.filament.diameter },
  'filament.weight': { get: (s) => s.filament.weight },
  'filament.spool_weight': { get: (s) => s.filament.spool_weight },
  'filament.article_number': { get: (s) => s.filament.article_number },
  'filament.price': { get: (s) => s.filament.price },
  'filament.settings_extruder_temp': { get: (s) => s.filament.settings_extruder_temp },
  'filament.settings_bed_temp': { get: (s) => s.filament.settings_bed_temp },
};

/**
 * Check whether a sort expression can be honored. Route layer uses this to
 * reject unknown sort fields with a 422 the way real Spoolman (FastAPI
 * enum validation) does.
 */
export function isSortableField(field: string): boolean {
  return Object.prototype.hasOwnProperty.call(SORTABLE_FIELDS, field);
}

function compareValues(a: string | number | null, b: string | number | null): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  const aText = a === null ? '' : String(a).toLowerCase();
  const bText = b === null ? '' : String(b).toLowerCase();
  return aText < bText ? -1 : aText > bText ? 1 : 0;
}

/**
 * Single source of truth for the mocked Spoolman sidecar's state: the
 * spool table (seeded at startup, mutated only by usage PUTs and resets)
 * plus the ordered ledger of accepted usage PUTs.
 */
export class SpoolmanStore {
  #spools: Map<number, SpoolmanSpoolRecord>;
  #seedSpools: ReadonlyMap<number, SpoolmanSpoolRecord>;
  #ledger: SpoolmanUsageLedgerEntry[] = [];

  constructor(seedSpools: readonly SpoolmanSpoolRecord[]) {
    this.#spools = new Map(seedSpools.map((spool) => [spool.id, spool]));
    this.#seedSpools = new Map(seedSpools.map((spool) => [spool.id, spool]));
  }

  /** Query: list spools filtered/sorted/paged per Spoolman semantics. */
  listSpools(query: SpoolListQuery): SpoolmanSpoolWire[] {
    const all = [...this.#spools.values()].map(serializeSpool);
    const filtered = all.filter((spool) => {
      if (!query.allowArchived && spool.archived) {
        return false;
      }
      return (
        matchesFilter(spool.filament.name, query.filamentName) &&
        matchesFilter(spool.filament.material, query.filamentMaterial) &&
        matchesFilter(spool.filament.vendor?.name ?? null, query.filamentVendorName) &&
        matchesFilter(spool.location, query.location) &&
        matchesFilter(spool.lot_nr, query.lotNr)
      );
    });

    const sort = query.sort ?? 'id';
    const descending = sort.startsWith('-');
    const field = descending ? sort.slice(1) : sort.replace(/^\+/, '');
    const accessor = SORTABLE_FIELDS[field] ??
      SORTABLE_FIELDS['id'] ?? {
        get: (s: SpoolmanSpoolWire) => s.id,
      };
    filtered.sort((a, b) => {
      const comparison = compareValues(accessor.get(a), accessor.get(b));
      return descending ? -comparison : comparison;
    });

    // Pagination applies offset first, then limit (SQL semantics).
    const offset = query.offset ?? 0;
    const paged = filtered.slice(offset);
    return query.limit === undefined ? paged : paged.slice(0, query.limit);
  }

  /** Query: single spool by ID, or null when unknown. */
  getSpool(id: number): SpoolmanSpoolWire | null {
    const spool = this.#spools.get(id);
    return spool === undefined ? null : serializeSpool(spool);
  }

  /**
   * Command: apply a usage deduction (grams or millimeters) to a spool,
   * updating both weight and length fields the way real Spoolman does (it
   * converts between them via the filament's density and diameter), stamps
   * first_used/last_used, and appends to the ledger. Rejected payloads
   * never reach this method; only a missing spool can fail here.
   */
  applyUsage(id: number, input: SpoolUsageInput, timestamp: string): SpoolUsageResult {
    const spool = this.#spools.get(id);
    if (spool === undefined) {
      return { ok: false, error: 'spool-not-found' };
    }

    const { density, diameter } = spool.filament;
    const useWeight =
      input.useWeight === undefined
        ? weightFromLength(input.useLength, density, diameter)
        : input.useWeight;
    const useLength =
      input.useLength === undefined
        ? lengthFromWeight(input.useWeight, density, diameter)
        : input.useLength;

    const updated: SpoolmanSpoolRecord = {
      ...spool,
      remainingWeight: spool.remainingWeight - useWeight,
      usedWeight: spool.usedWeight + useWeight,
      remainingLength: spool.remainingLength - useLength,
      usedLength: spool.usedLength + useLength,
      firstUsed: spool.firstUsed ?? timestamp,
      lastUsed: timestamp,
    };
    this.#spools.set(id, updated);
    this.#ledger.push({
      spoolId: id,
      useWeight: input.useWeight ?? null,
      useLength: input.useLength ?? null,
      timestamp,
    });
    return { ok: true, spool: serializeSpool(updated) };
  }

  /** Query: ordered ledger of accepted usage PUTs (newest last). */
  getLedger(): readonly SpoolmanUsageLedgerEntry[] {
    return this.#ledger;
  }

  /** Command: restore spool state to the seed values and clear the ledger. */
  reset(): void {
    this.#spools = new Map(
      [...this.#seedSpools.values()].map((spool) => [spool.id, structuredClone(spool)])
    );
    this.#ledger = [];
  }
}
