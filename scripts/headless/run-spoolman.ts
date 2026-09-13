/**
 * @fileoverview
 * Mocked Spoolman sidecar — a standalone HTTP server that speaks the subset
 * of the Spoolman REST API the FlashForge frontends actually use, plus
 * `__`-prefixed test-control routes in this repo's house style.
 *
 * Purpose: FlashForgeWebUI and FlashForgeUI-Electron talk to a real Spoolman
 * server for spool selection and filament-usage deduction. Their e2e suites
 * point at this sidecar instead. It is ONE process per test run — it is NOT
 * part of a printer instance, registers nothing in the instance registry,
 * and must never gain a dependency on Electron or the emulator's printer
 * services (it has to run headless in CI containers).
 *
 * Implemented API surface (derived from FlashForgeWebUI/src/services/
 * SpoolmanService.ts — identical in FlashForgeUI-Electron/src/main/services):
 *
 *   GET  /api/v1/spool          list spools (filters, sort, limit, offset)
 *   GET  /api/v1/spool/:id      fetch one spool
 *   PUT  /api/v1/spool/:id/use  deduct usage ({use_weight} XOR {use_length})
 *
 * Test-control routes (unauthenticated, non-Spoolman by design):
 *
 *   GET  /__requests            ordered ledger of accepted usage PUTs
 *   POST /__reset               restore seed spool state + clear ledger
 *   POST /__shutdown            graceful exit
 *
 * Usage:
 *   npm run headless:spoolman -- --port 7912 --seed spools.json
 *
 * @packageDocumentation
 */

import express, { type NextFunction, type Request, type Response } from 'express';
import { parseSpoolmanArgs } from './spoolman-config';
import {
  type SpoolListQuery,
  type SpoolmanSpoolWire,
  SpoolmanStore,
  isSortableField,
} from './spoolman-store';

/** Thrown for client errors that must map to a Spoolman-style 4xx body. */
class RequestError extends Error {
  readonly statusCode: number;
  readonly type: string;

  constructor(statusCode: number, type: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseSpoolIdParam(rawId: string): number {
  if (!/^\d+$/.test(rawId)) {
    throw new RequestError(422, 'request', `"${rawId}" is not a valid spool id`);
  }
  return Number.parseInt(rawId, 10);
}

/**
 * Validate the PUT /use body against Spoolman's either/or contract:
 * exactly one of use_weight / use_length, a finite number > 0.
 */
function parseUsageBody(body: unknown): { useWeight: number } | { useLength: number } {
  if (!isRecord(body)) {
    throw new RequestError(422, 'request', 'Request body must be a JSON object');
  }
  for (const key of Object.keys(body)) {
    if (key !== 'use_weight' && key !== 'use_length') {
      throw new RequestError(
        422,
        'request',
        `Unknown field "${key}" (allowed: use_weight, use_length)`
      );
    }
  }
  const hasWeight = body['use_weight'] !== undefined;
  const hasLength = body['use_length'] !== undefined;
  if (hasWeight && hasLength) {
    throw new RequestError(422, 'request', 'Only one of use_weight and use_length may be provided');
  }
  if (!hasWeight && !hasLength) {
    throw new RequestError(422, 'request', 'Either use_weight or use_length must be provided');
  }
  const key = hasWeight ? 'use_weight' : 'use_length';
  const value = body[key];
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new RequestError(422, 'request', `${key} must be a number greater than 0`);
  }
  return hasWeight ? { useWeight: value } : { useLength: value };
}

function parseListQuery(req: Request): SpoolListQuery {
  const query = req.query;
  const readString = (key: string): string | undefined => {
    const value = query[key];
    if (value === undefined) {
      return undefined;
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new RequestError(422, 'request', `Query parameter "${key}" must be a single value`);
  };
  const readInt = (key: string): number | undefined => {
    const raw = readString(key);
    if (raw === undefined) {
      return undefined;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new RequestError(
        422,
        'request',
        `Query parameter "${key}" must be a non-negative integer`
      );
    }
    return parsed;
  };

  const allowArchivedRaw = readString('allow_archived');
  let allowArchived = false;
  if (allowArchivedRaw !== undefined) {
    const normalized = allowArchivedRaw.toLowerCase();
    if (normalized !== 'true' && normalized !== 'false') {
      throw new RequestError(
        422,
        'request',
        'Query parameter "allow_archived" must be "true" or "false"'
      );
    }
    allowArchived = normalized === 'true';
  }

  const sort = readString('sort');
  if (sort !== undefined) {
    const field = sort.replace(/^[+-]/, '');
    if (!isSortableField(field)) {
      throw new RequestError(422, 'request', `Cannot sort by unknown field "${field}"`);
    }
  }

  return {
    filamentName: readString('filament.name'),
    filamentMaterial: readString('filament.material'),
    filamentVendorName: readString('filament.vendor.name'),
    location: readString('location'),
    lotNr: readString('lot_nr'),
    allowArchived,
    sort,
    limit: readInt('limit'),
    offset: readInt('offset'),
  };
}

function sendSpoolmanError(res: Response, error: RequestError): void {
  res.status(error.statusCode).json({ message: error.message, type: error.type });
}

function createApp(store: SpoolmanStore, onRequestShutdown: () => void): express.Express {
  const app = express();
  // Real Spoolman (uvicorn/FastAPI) sends no framework banner header and
  // no ETag on its JSON responses.
  app.disable('x-powered-by');
  app.disable('etag');
  app.use(express.json());

  // --- Spoolman-faithful routes -------------------------------------------

  app.get('/api/v1/spool', (req: Request, res: Response) => {
    const query = parseListQuery(req);
    res.json(store.listSpools(query));
  });

  app.get('/api/v1/spool/:id', (req: Request, res: Response) => {
    const id = parseSpoolIdParam(req.params['id'] ?? '');
    const spool: SpoolmanSpoolWire | null = store.getSpool(id);
    if (spool === null) {
      sendSpoolmanError(res, new RequestError(404, 'spool', `Spool with ID ${id} not found`));
      return;
    }
    res.json(spool);
  });

  app.put('/api/v1/spool/:id/use', (req: Request, res: Response) => {
    const id = parseSpoolIdParam(req.params['id'] ?? '');
    const usage = parseUsageBody(req.body);
    const result = store.applyUsage(id, usage, new Date().toISOString());
    if (!result.ok) {
      sendSpoolmanError(res, new RequestError(404, 'spool', `Spool with ID ${id} not found`));
      return;
    }
    res.json(result.spool);
  });

  // --- Test-control routes (house style: unauthenticated /__ prefix) ------

  app.get('/__requests', (_req: Request, res: Response) => {
    res.json({ ok: true, requests: store.getLedger() });
  });

  app.post('/__reset', (_req: Request, res: Response) => {
    store.reset();
    res.json({ ok: true, message: 'Spool state reset to seed values' });
  });

  app.post('/__shutdown', (_req: Request, res: Response) => {
    res.json({ ok: true, message: 'Shutting down' });
    res.on('finish', () => {
      onRequestShutdown();
    });
  });

  // --- Errors -------------------------------------------------------------

  app.use((_req: Request, res: Response) => {
    sendSpoolmanError(res, new RequestError(404, 'request', 'Not Found'));
  });

  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    if (error instanceof RequestError) {
      sendSpoolmanError(res, error);
      return;
    }
    // Malformed JSON bodies behave like Spoolman's FastAPI validation
    // errors (422); anything unexpected is a plain 500 without internals.
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      sendSpoolmanError(res, new RequestError(422, 'request', 'Request body is not valid JSON'));
      return;
    }
    console.error('spoolman sidecar: unhandled request error:', error);
    res.status(500).json({ message: 'Internal Server Error', type: 'server' });
  });

  return app;
}

async function main(): Promise<void> {
  const options = parseSpoolmanArgs(process.argv.slice(2));
  const store = new SpoolmanStore(options.seedSpools);
  const app = createApp(store, () => {
    void shutdown(0);
  });

  const server = app.listen(options.port);
  let shuttingDown = false;

  const shutdown = (exitCode: number): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    // Close keep-alive sockets too, otherwise an open undici connection can
    // pin server.close() open indefinitely.
    server.closeAllConnections();
    server.close(() => {
      process.exit(exitCode);
    });
    // Safety net: never hang the test harness on a stuck connection.
    const forceExit = setTimeout(() => {
      process.exit(exitCode);
    }, 2000);
    forceExit.unref();
  };

  process.on('SIGINT', () => {
    shutdown(0);
  });
  process.on('SIGTERM', () => {
    shutdown(0);
  });
  process.on('uncaughtException', (error) => {
    console.error('spoolman sidecar: uncaught exception:', error);
    shutdown(1);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('spoolman sidecar: unhandled rejection:', reason);
    shutdown(1);
  });

  server.on('listening', () => {
    console.log('SPOOLMAN_READY');
    console.log(
      JSON.stringify({
        port: options.port,
        spoolCount: options.seedSpools.length,
        seedSource: options.seedSource,
      })
    );
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `spoolman sidecar: port ${options.port} is already in use — another process (perhaps a previous test run) is listening. Stop it or pass --port to pick another port.`
      );
    } else {
      console.error(`spoolman sidecar: failed to listen on port ${options.port}:`, error);
    }
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
});
