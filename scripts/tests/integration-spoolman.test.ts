/**
 * @fileoverview
 * Integration tests for the mocked Spoolman sidecar
 * (scripts/headless/run-spoolman.ts).
 *
 * Spawns the real sidecar process the way CI/harnesses do, waits for its
 * SPOOLMAN_READY announcement, then exercises:
 *  - the Spoolman-faithful REST surface (exact wire shapes, filters, sort,
 *    pagination, usage deduction with weight<->length conversion, 404/422
 *    error behavior),
 *  - the /__ test-control routes (usage ledger, reset, shutdown),
 *  - CLI behavior (--seed inline JSON / file, default seed, loud failures
 *    for invalid seeds and port conflicts).
 *
 * Mirrors the spawn/readline conventions of integration-multi-instance.test.ts.
 *
 * @packageDocumentation
 */

import assert from 'node:assert/strict';
import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import test from 'node:test';
import { lengthFromWeight, weightFromLength } from '../headless/spoolman-store';

const SCRIPT = 'scripts/headless/run-spoolman.ts';
const TEST_TIMEOUT_MS = 120_000;
const STARTUP_TIMEOUT_MS = 30_000;

/** Readiness payload printed after the SPOOLMAN_READY marker line. */
interface SidecarReadyPayload {
  port: number;
  spoolCount: number;
  seedSource: string;
}

interface StartedSidecar {
  readonly child: ChildProcess;
  readonly baseUrl: string;
  readonly readyPayload: SidecarReadyPayload;
  /** Resolves with the exit code once the process terminates. */
  readonly exited: Promise<number | null>;
}

interface UsageLedgerEntryWire {
  spoolId: number;
  useWeight: number | null;
  useLength: number | null;
  timestamp: string;
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      if (address === null || typeof address === 'string') {
        probe.close(() => reject(new Error('Could not determine a free port')));
        return;
      }
      const { port } = address;
      probe.close(() => {
        resolve(port);
      });
    });
  });
}

function startSpoolman(args: string[]): Promise<StartedSidecar> {
  const child = spawn(process.execPath, ['--import', 'tsx', SCRIPT, ...args], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  const exited = new Promise<number | null>((resolve) => {
    child.once('exit', (code) => {
      resolve(code);
    });
  });

  return new Promise<StartedSidecar>((resolve, reject) => {
    let stderrText = '';
    let settled = false;
    const settle = (action: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      action();
    };

    const timeout = setTimeout(() => {
      settle(() => {
        child.kill();
        reject(
          new Error(
            `Timed out after ${STARTUP_TIMEOUT_MS}ms waiting for SPOOLMAN_READY. stderr: ${stderrText}`
          )
        );
      });
    }, STARTUP_TIMEOUT_MS);
    timeout.unref();

    child.stderr.on('data', (chunk: Buffer) => {
      stderrText += chunk.toString('utf-8');
    });
    child.once('exit', (code) => {
      settle(() => {
        reject(new Error(`Sidecar exited before readiness (code ${code}). stderr: ${stderrText}`));
      });
    });

    const stdoutReader = createInterface({ input: child.stdout });
    let sawReadyMarker = false;
    stdoutReader.on('line', (line: string) => {
      if (!sawReadyMarker) {
        if (line === 'SPOOLMAN_READY') {
          sawReadyMarker = true;
        }
        return;
      }
      try {
        const payload = JSON.parse(line) as SidecarReadyPayload;
        settle(() => {
          resolve({
            child,
            baseUrl: `http://127.0.0.1:${payload.port}`,
            readyPayload: payload,
            exited,
          });
        });
      } catch (error) {
        settle(() => {
          child.kill();
          reject(new Error(`Could not parse readiness payload "${line}": ${String(error)}`));
        });
      }
    });
  });
}

function hardStop(sidecar: StartedSidecar): Promise<void> {
  sidecar.child.kill();
  return sidecar.exited.then(() => {});
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<{ status: number; body: T }> {
  const response = await fetch(url, init);
  const body = (await response.json()) as T;
  return { status: response.status, body };
}

function putUsage(url: string, body: string): Promise<{ status: number; body: unknown }> {
  return fetchJson<unknown>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

test(
  'spoolman sidecar serves the Spoolman spool surface, usage deduction, and control routes',
  { timeout: TEST_TIMEOUT_MS },
  async (t) => {
    const port = await getFreePort();
    const sidecar = await startSpoolman([`--port=${port}`]);
    t.after(() => {
      void hardStop(sidecar);
    });
    const base = sidecar.baseUrl;

    assert.equal(sidecar.readyPayload.port, port);
    assert.equal(sidecar.readyPayload.spoolCount, 6);
    assert.equal(sidecar.readyPayload.seedSource, 'default');

    // --- GET /api/v1/spool: default excludes the archived spool ---------
    const listResult = await fetchJson<unknown[]>(`${base}/api/v1/spool`);
    assert.equal(listResult.status, 200);
    assert.equal(listResult.body.length, 5);

    // Exact wire shape of spool 1 (deep equality, computed lengths included).
    const spool1 = listResult.body.find((spool) => (spool as { id: number }).id === 1);
    assert.deepEqual(spool1, {
      id: 1,
      registered: '2026-01-05T08:00:00.000Z',
      first_used: null,
      last_used: null,
      archived: false,
      price: null,
      initial_weight: 1000,
      remaining_weight: 850,
      used_weight: 150,
      remaining_length: lengthFromWeight(850, 1.24, 1.75),
      used_length: lengthFromWeight(150, 1.24, 1.75),
      location: 'Shelf A',
      lot_nr: null,
      comment: null,
      filament: {
        id: 1001,
        registered: '2026-01-01T00:00:00.000Z',
        name: 'FlashForge PLA Black',
        vendor: {
          id: 1,
          registered: '2026-01-01T00:00:00.000Z',
          name: 'FlashForge',
          empty_spool_weight: null,
          external_id: null,
          extra: {},
        },
        material: 'PLA',
        density: 1.24,
        diameter: 1.75,
        weight: 1000,
        spool_weight: 245,
        color_hex: '#000000',
        multi_color_hexes: null,
        multi_color_direction: null,
        article_number: null,
        settings_extruder_temp: 210,
        settings_bed_temp: 50,
        price: null,
        comment: null,
        external_id: null,
        extra: {},
      },
      extra: {},
    });

    // The frontends' connection test: GET /spool?limit=1 must succeed.
    const connectionTest = await fetchJson<unknown[]>(`${base}/api/v1/spool?limit=1`);
    assert.equal(connectionTest.status, 200);
    assert.equal(connectionTest.body.length, 1);

    // --- GET single spool / 404 / non-numeric id -------------------------
    const single = await fetchJson<{ id: number; lot_nr: string | null }>(`${base}/api/v1/spool/3`);
    assert.equal(single.status, 200);
    assert.equal(single.body.id, 3);
    assert.equal(single.body.lot_nr, 'LOT-2025-A');

    const missing = await fetchJson<{ message: string; type: string }>(`${base}/api/v1/spool/999`);
    assert.equal(missing.status, 404);
    assert.match(missing.body.message, /999/);
    assert.equal(missing.body.type, 'spool');

    const badId = await fetchJson<{ message: string }>(`${base}/api/v1/spool/abc`);
    assert.equal(badId.status, 422);

    // --- PUT usage: weight -------------------------------------------------
    const useWeight = await putUsage(`${base}/api/v1/spool/1/use`, '{"use_weight":50}');
    assert.equal(useWeight.status, 200);
    const afterWeight = useWeight.body as {
      remaining_weight: number;
      used_weight: number;
      remaining_length: number;
      used_length: number;
      first_used: string;
      last_used: string;
    };
    assert.equal(afterWeight.remaining_weight, 800);
    assert.equal(afterWeight.used_weight, 200);
    assert.equal(
      afterWeight.remaining_length,
      lengthFromWeight(850, 1.24, 1.75) - lengthFromWeight(50, 1.24, 1.75)
    );
    assert.equal(
      afterWeight.used_length,
      lengthFromWeight(150, 1.24, 1.75) + lengthFromWeight(50, 1.24, 1.75)
    );
    assert.match(afterWeight.first_used, ISO_TIMESTAMP);
    assert.equal(afterWeight.first_used, afterWeight.last_used);

    // --- PUT usage: length converts to weight via density + diameter -------
    const useLength = await putUsage(`${base}/api/v1/spool/2/use`, '{"use_length":1000}');
    assert.equal(useLength.status, 200);
    const afterLength = useLength.body as { remaining_weight: number; used_length: number };
    assert.equal(afterLength.remaining_weight, 420.5 - weightFromLength(1000, 1.24, 1.75));
    assert.equal(afterLength.used_length, lengthFromWeight(579.5, 1.24, 1.75) + 1000);

    // --- PUT usage: bad payloads are 422 and change nothing ---------------
    for (const badBody of [
      '{"use_weight":10,"use_length":100}',
      '{}',
      '{"use_weight":-5}',
      '{"use_weight":0}',
      '{"use_weight":"50"}',
      '{"weight":50}',
    ]) {
      const rejected = await putUsage(`${base}/api/v1/spool/1/use`, badBody);
      assert.equal(rejected.status, 422, `expected 422 for body ${badBody}`);
    }
    const missingUsage = await putUsage(`${base}/api/v1/spool/999/use`, '{"use_weight":10}');
    assert.equal(missingUsage.status, 404);

    // Rejected PUTs must not reach the ledger.
    const ledger = await fetchJson<{ ok: boolean; requests: UsageLedgerEntryWire[] }>(
      `${base}/__requests`
    );
    assert.equal(ledger.status, 200);
    assert.equal(ledger.body.ok, true);
    assert.equal(ledger.body.requests.length, 2);
    assert.deepEqual(ledger.body.requests[0], {
      spoolId: 1,
      useWeight: 50,
      useLength: null,
      timestamp: ledger.body.requests[0]?.timestamp,
    });
    assert.match(ledger.body.requests[0]?.timestamp ?? '', ISO_TIMESTAMP);
    assert.deepEqual(ledger.body.requests[1], {
      spoolId: 2,
      useWeight: null,
      useLength: 1000,
      timestamp: ledger.body.requests[1]?.timestamp,
    });

    // --- Filters, sorting, pagination --------------------------------------
    const ids = (spools: unknown[]): number[] =>
      spools.map((spool) => (spool as { id: number }).id);

    const pla = await fetchJson<unknown[]>(`${base}/api/v1/spool?filament.material=PLA`);
    assert.deepEqual(ids(pla.body), [1, 2]);

    const plaCaseInsensitive = await fetchJson<unknown[]>(
      `${base}/api/v1/spool?filament.material=pla`
    );
    assert.deepEqual(ids(plaCaseInsensitive.body), [1, 2]);

    const multiMaterial = await fetchJson<unknown[]>(
      `${base}/api/v1/spool?filament.material=PLA,PETG&allow_archived=true`
    );
    assert.deepEqual(ids(multiMaterial.body), [1, 2, 3, 6]);

    const substringName = await fetchJson<unknown[]>(
      `${base}/api/v1/spool?filament.name=petg black`
    );
    assert.deepEqual(ids(substringName.body), [3]);

    const byLocation = await fetchJson<unknown[]>(`${base}/api/v1/spool?location=Shelf+B`);
    assert.deepEqual(ids(byLocation.body), [3]);

    const sortedDesc = await fetchJson<unknown[]>(`${base}/api/v1/spool?sort=-remaining_weight`);
    assert.deepEqual(ids(sortedDesc.body), [3, 1, 5, 2, 4]);

    const paged = await fetchJson<unknown[]>(
      `${base}/api/v1/spool?sort=-remaining_weight&limit=2&offset=1`
    );
    assert.deepEqual(ids(paged.body), [1, 5]);

    const vendorFilter = await fetchJson<unknown[]>(
      `${base}/api/v1/spool?filament.vendor.name=Polymaker`
    );
    assert.deepEqual(ids(vendorFilter.body), [3]);

    const badLimit = await fetchJson<{ message: string }>(`${base}/api/v1/spool?limit=abc`);
    assert.equal(badLimit.status, 422);
    const badSort = await fetchJson<{ message: string }>(`${base}/api/v1/spool?sort=bogus`);
    assert.equal(badSort.status, 422);
    const badArchived = await fetchJson<{ message: string }>(
      `${base}/api/v1/spool?allow_archived=yes`
    );
    assert.equal(badArchived.status, 422);

    // Unknown paths get a plain 404 (Spoolman-style message body).
    const unknownRoute = await fetchJson<{ message: string }>(`${base}/api/v1/nope`);
    assert.equal(unknownRoute.status, 404);
    assert.equal(unknownRoute.body.message, 'Not Found');

    // --- __reset restores seed state and clears the ledger ----------------
    const reset = await fetchJson<{ ok: boolean; message: string }>(`${base}/__reset`, {
      method: 'POST',
    });
    assert.equal(reset.status, 200);
    assert.equal(reset.body.ok, true);

    const spool1AfterReset = await fetchJson<{ remaining_weight: number; used_weight: number }>(
      `${base}/api/v1/spool/1`
    );
    assert.equal(spool1AfterReset.body.remaining_weight, 850);
    assert.equal(spool1AfterReset.body.used_weight, 150);

    const ledgerAfterReset = await fetchJson<{ requests: UsageLedgerEntryWire[] }>(
      `${base}/__requests`
    );
    assert.deepEqual(ledgerAfterReset.body.requests, []);

    // --- __shutdown exits gracefully with code 0 ---------------------------
    const shutdownResponse = await fetchJson<{ ok: boolean; message: string }>(
      `${base}/__shutdown`,
      {
        method: 'POST',
      }
    );
    assert.equal(shutdownResponse.status, 200);
    assert.equal(shutdownResponse.body.ok, true);
    assert.equal(await sidecar.exited, 0);
  }
);

test(
  'spoolman sidecar accepts inline JSON and file seeds, and rejects invalid ones loudly',
  { timeout: TEST_TIMEOUT_MS },
  async (t) => {
    const port = await getFreePort();

    // --- Inline JSON seed with a full vendor object ------------------------
    const inlineSeed =
      '[{"id":10,"filament":{"name":"Test PLA","material":"PLA","vendor":{"id":7,"name":"Acme Co","empty_spool_weight":210}},"remaining_weight":500,"used_weight":100,"location":"Bay 9"}]';
    const inlineSidecar = await startSpoolman([`--port=${port}`, `--seed=${inlineSeed}`]);
    t.after(() => {
      void hardStop(inlineSidecar);
    });
    assert.equal(inlineSidecar.readyPayload.seedSource, 'inline JSON');
    assert.equal(inlineSidecar.readyPayload.spoolCount, 1);

    const inlineList = await fetchJson<Array<{ id: number; initial_weight: number | null }>>(
      `${inlineSidecar.baseUrl}/api/v1/spool`
    );
    assert.equal(inlineList.body.length, 1);
    const inlineSpool = inlineList.body[0];
    assert.ok(inlineSpool);
    assert.equal(inlineSpool.id, 10);
    // weight defaulted to 1000, so initial_weight follows filament.weight.
    assert.equal(inlineSpool.initial_weight, 1000);

    const inlineDetail = await fetchJson<{
      filament: {
        id: number;
        vendor: { id: number; name: string; empty_spool_weight: number | null } | null;
      };
    }>(`${inlineSidecar.baseUrl}/api/v1/spool/10`);
    assert.equal(inlineDetail.body.filament.id, 1010);
    assert.equal(inlineDetail.body.filament.vendor?.id, 7);
    assert.equal(inlineDetail.body.filament.vendor?.name, 'Acme Co');
    assert.equal(inlineDetail.body.filament.vendor?.empty_spool_weight, 210);
    await hardStop(inlineSidecar);

    // --- File seed ----------------------------------------------------------
    const tempDir = mkdtempSync(join(tmpdir(), 'spoolman-seed-'));
    t.after(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });
    const seedFile = join(tempDir, 'spools.json');
    writeFileSync(
      seedFile,
      JSON.stringify([
        {
          id: 1,
          filament: { name: 'File PLA', vendor: 'FileVendor' },
          remaining_weight: 90,
          used_weight: 10,
        },
        { id: 2, filament: { name: 'File PETG', material: 'PETG' }, remaining_weight: 40 },
      ]),
      'utf-8'
    );
    const filePort = await getFreePort();
    const fileSidecar = await startSpoolman([`--port=${filePort}`, '--seed', seedFile]);
    t.after(() => {
      void hardStop(fileSidecar);
    });
    assert.equal(fileSidecar.readyPayload.seedSource, `file: ${seedFile}`);
    assert.equal(fileSidecar.readyPayload.spoolCount, 2);

    const fileList = await fetchJson<Array<{ id: number; filament: { name: string } }>>(
      `${fileSidecar.baseUrl}/api/v1/spool`
    );
    assert.deepEqual(
      fileList.body.map((spool) => spool.id),
      [1, 2]
    );
    assert.equal(fileList.body[0]?.filament.name, 'File PLA');
    // Spool 2 has no explicit used_weight: derived from remaining only.
    const spool2 = await fetchJson<{ used_weight: number; initial_weight: number | null }>(
      `${fileSidecar.baseUrl}/api/v1/spool/2`
    );
    assert.equal(spool2.body.used_weight, 0);
    await hardStop(fileSidecar);

    // --- Invalid seeds and CLI misuse fail loudly ---------------------------
    const runSync = (args: string[]): { status: number | null; stderr: string } => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', SCRIPT, ...args], {
        cwd: process.cwd(),
        encoding: 'utf-8',
        timeout: STARTUP_TIMEOUT_MS,
        windowsHide: true,
      });
      return { status: result.status, stderr: result.stderr ?? '' };
    };

    const missingFilament = runSync(['--seed', '[{"id":1}]']);
    assert.notEqual(missingFilament.status, 0);
    assert.match(missingFilament.stderr, /Invalid spoolman seed: spools\[0\]\.filament/);

    const unknownKey = runSync(['--seed', '[{"id":1,"filament":{"name":"X"},"bogus":true}]']);
    assert.notEqual(unknownKey.status, 0);
    assert.match(unknownKey.stderr, /unknown key "bogus"/);

    const unknownOption = runSync(['--nope']);
    assert.notEqual(unknownOption.status, 0);
    assert.match(unknownOption.stderr, /Unknown option "--nope"/);

    const badPort = runSync(['--port', 'not-a-port']);
    assert.notEqual(badPort.status, 0);
    assert.match(badPort.stderr, /Invalid --port/);

    const badSeedPath = runSync(['--seed', 'Z:\\definitely\\missing\\spools.json']);
    assert.notEqual(badSeedPath.status, 0);
    assert.match(badSeedPath.stderr, /Failed to read --seed file/);
  }
);

test(
  'spoolman sidecar fails loudly when the port is already in use',
  { timeout: TEST_TIMEOUT_MS },
  async (t) => {
    const port = await getFreePort();
    const sidecar = await startSpoolman([`--port=${port}`]);
    t.after(() => {
      void hardStop(sidecar);
    });
    assert.equal(sidecar.readyPayload.port, port);

    const conflict = spawnSync(process.execPath, ['--import', 'tsx', SCRIPT, `--port=${port}`], {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: STARTUP_TIMEOUT_MS,
      windowsHide: true,
    });
    assert.notEqual(conflict.status, 0);
    assert.match(conflict.stderr ?? '', /already in use/);

    // Shut the first instance down through the control route.
    const shutdown = await fetchJson<{ ok: boolean }>(`${sidecar.baseUrl}/__shutdown`, {
      method: 'POST',
    });
    assert.equal(shutdown.status, 200);
    assert.equal(shutdown.body.ok, true);
    assert.equal(await sidecar.exited, 0);
  }
);
