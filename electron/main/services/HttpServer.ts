/**
 * @fileoverview
 * HTTP Server for FlashForge printer emulation
 *
 * Implements the modern HTTP API on port 8898.
 * Handles JSON REST API requests following the FlashForge API.
 *
 * @packageDocumentation
 */

import { EventEmitter } from 'node:events';
import type { Request, RequestHandler, Response } from 'express';
import express from 'express';
import type { FileFilterCallback } from 'multer';
import multer from 'multer';
import { serializeHttpDetail } from '../../../shared/serializers/httpDetail';
import type {
  GcodeToolData,
  PrinterFile,
  PrinterModel,
  PrinterScenario,
  ScenarioPresetId,
} from '../../../shared/types/printer';
import {
  PRINTER_PROFILES,
  canStartNewPrint,
  isCreator5Series,
  isStickyTerminalState,
} from '../../../shared/types/printer';
import { printerStateStore } from '../state/PrinterStateStore';
import { protocolLogStore } from '../state/ProtocolLogStore';
import { simulationService } from './SimulationService';

/**
 * Authentication credentials from request
 */
interface AuthCredentials {
  serialNumber: string;
  checkCode: string;
}

/**
 * G-code file entry with detailed information (AD5X format)
 */
interface GcodeFileEntry {
  /** The name of the G-code file */
  gcodeFileName: string;
  /** Number of tools/materials used */
  gcodeToolCnt?: number;
  /** Detailed information for each tool/material */
  gcodeToolDatas?: GcodeToolData[];
  /** Estimated printing time in seconds */
  printingTime: number;
  /** Total estimated filament weight in grams */
  totalFilamentWeight?: number;
  /** Whether the file uses material station */
  useMatlStation?: boolean;
}

/**
 * Standard API response wrapper
 */
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  detail?: T;
  product?: T;
  gcodeList?: T;
  gcodeListDetail?: GcodeFileEntry[];
  imageData?: string;
}

interface HealthState {
  instanceId: string;
  tcpPort: number;
  ready: boolean;
  startedAtMs: number;
}

/**
 * Control command argument types
 */
interface ControlArgs extends Record<string, unknown> {
  status?: string;
  speed?: number;
  chamberFan?: number;
  coolingFan?: number;
  action?: string;
  internal?: string;
  external?: string;
  platformTemp?: number;
  rightTemp?: number;
  leftTemp?: number;
  chamberTemp?: number;
  zAxisCompensation?: number;
  coolingLeftFan?: number;
  /** Creator 5 series canonical per-tool targets: exactly 4 ints (0 = off, -200 = no change) */
  nozzles?: unknown;
  /** Creator 5 series canonical bed target (-200 = no change, -100 = off) */
  platform?: number;
  /** Creator 5 series canonical chamber target (Pro only; -200/-100 sentinels) */
  chamber?: number;
  rightNozzle?: number;
  leftNozzle?: number;
}

/**
 * Command payload structure
 */
interface CommandPayload {
  cmd: string;
  args: ControlArgs;
}

/**
 * Request body with authentication
 */
interface AuthenticatedRequest {
  serialNumber: string;
  checkCode: string;
  payload?: CommandPayload;
  fileName?: string;
  levelingBeforePrint?: boolean;
  flowCalibration?: boolean;
  useMatlStation?: boolean;
  gcodeToolCnt?: number;
  materialMappings?: unknown[];
}

interface AD5XMaterialMappingPayload {
  toolId: number;
  slotId: number;
  materialName: string;
  toolMaterialColor: string;
  slotMaterialColor: string;
}

interface RequestWithUpload extends Request {
  file?: Express.Multer.File;
}

/**
 * Response codes matching FlashForge API
 */
enum ResponseCode {
  Success = 0,
  Error = 1,
  InvalidParameter = 2,
  Unauthorized = 3,
  NotFound = 4,
  Busy = 5,
  /** Creator 5 series firmware-style parameter error */
  ParameterError = -1,
}

/** 1x1 transparent PNG used when a file or job has no extracted thumbnail */
const PLACEHOLDER_THUMBNAIL_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function clampTemperature(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Firmware-style boolean header parsing for /uploadGcode. Real firmware and
 * the TS reference client send "1"/"0"; "true"/"false" is still accepted for
 * older clients. Absent, empty, or any other value reads as false.
 */
function parseBooleanHeader(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.trim().toLowerCase();
  return normalized === '1' || normalized === 'true';
}

/**
 * Multer configuration for file uploads
 * Uses memory storage for the emulator
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB max file size
  },
  fileFilter: (_req, file, cb: FileFilterCallback) => {
    // Accept G-code and 3MF files
    const acceptedExtensions = ['.gcode', '.gco', '.g', '.3mf'];
    const fileExt = file.originalname.toLowerCase();
    const hasValidExtension = acceptedExtensions.some((ext) => fileExt.endsWith(ext));
    if (hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .gcode and .3mf files are allowed.'));
    }
  },
});

/**
 * Estimates print time based on file size
 * This is a rough approximation for emulation purposes
 */
function estimatePrintTime(fileSize: number): number {
  // Rough estimate: ~1 MB = 10 minutes of print time
  // This is not accurate but provides a reasonable emulation value
  const minutesPerMB = 10;
  const fileSizeMB = fileSize / (1024 * 1024);
  return Math.max(60, Math.floor(fileSizeMB * minutesPerMB * 60));
}

function isAD5XMaterialMappingPayload(value: unknown): value is AD5XMaterialMappingPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['toolId'] === 'number' &&
    Number.isFinite(candidate['toolId']) &&
    typeof candidate['slotId'] === 'number' &&
    Number.isFinite(candidate['slotId']) &&
    typeof candidate['materialName'] === 'string' &&
    typeof candidate['toolMaterialColor'] === 'string' &&
    typeof candidate['slotMaterialColor'] === 'string'
  );
}

/** Material slot IDs are 1-based on the wire (`slotId` 1..4); tool IDs are 0-based. */
const MIN_MATERIAL_SLOT_ID = 1;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * Validates a `materialMappings` payload the way real material-station firmware does.
 *
 * The important guarantee here is the **slot ID base**: slots are 1-based on the wire
 * (`slotId` 1..slotCnt) while tools are 0-based (`toolId` 0..toolCount-1). A client with
 * an off-by-one bug sends `slotId: 0`, and previously the emulator accepted it silently
 * — so a broken client passed against the emulator and failed against hardware. Both
 * `/uploadGcode` (AD5X, mappings at upload time) and `/printGcode` (Creator 5, mappings
 * at print-start) run this check.
 *
 * Models with no material station are left alone: what their firmware does with a
 * stray `materialMappings` payload has never been captured, and guessing a rejection
 * there would be inventing behavior rather than emulating it.
 *
 * @param rawMappings Raw `materialMappings` array from the request.
 * @param model Model the request was addressed to.
 * @returns `null` when the payload is acceptable, otherwise the rejection reason.
 */
function validateMaterialMappings(
  rawMappings: readonly unknown[],
  model: PrinterModel
): string | null {
  const profile = PRINTER_PROFILES[model];

  if (!profile.hasMaterialStation) {
    return null;
  }

  const slotCount = printerStateStore.state.materialStation.slotCount;
  if (rawMappings.length > slotCount) {
    return `Too many materialMappings: ${rawMappings.length} (station has ${slotCount} slots)`;
  }

  const seenToolIds = new Set<number>();
  const seenSlotIds = new Set<number>();

  for (let index = 0; index < rawMappings.length; index++) {
    const mapping = rawMappings[index];
    if (!isAD5XMaterialMappingPayload(mapping)) {
      return `materialMappings[${index}] is malformed`;
    }

    if (
      !Number.isInteger(mapping.toolId) ||
      mapping.toolId < 0 ||
      mapping.toolId > profile.toolCount - 1
    ) {
      return `materialMappings[${index}].toolId must be 0-${profile.toolCount - 1}, got ${mapping.toolId}`;
    }

    if (
      !Number.isInteger(mapping.slotId) ||
      mapping.slotId < MIN_MATERIAL_SLOT_ID ||
      mapping.slotId > slotCount
    ) {
      return `materialMappings[${index}].slotId must be ${MIN_MATERIAL_SLOT_ID}-${slotCount} (slots are 1-based), got ${mapping.slotId}`;
    }

    if (seenToolIds.has(mapping.toolId)) {
      return `Duplicate toolId ${mapping.toolId} in materialMappings`;
    }
    if (seenSlotIds.has(mapping.slotId)) {
      return `Duplicate slotId ${mapping.slotId} in materialMappings`;
    }
    seenToolIds.add(mapping.toolId);
    seenSlotIds.add(mapping.slotId);

    if (mapping.materialName.trim().length === 0) {
      return `materialMappings[${index}].materialName is required`;
    }
    if (!HEX_COLOR_PATTERN.test(mapping.toolMaterialColor)) {
      return `materialMappings[${index}].toolMaterialColor must be #RRGGBB, got ${mapping.toolMaterialColor}`;
    }
    if (!HEX_COLOR_PATTERN.test(mapping.slotMaterialColor)) {
      return `materialMappings[${index}].slotMaterialColor must be #RRGGBB, got ${mapping.slotMaterialColor}`;
    }
  }

  return null;
}

function buildGcodeToolDatas(
  rawMappings: readonly unknown[],
  requestedToolCount: number,
  hasMaterialStation: boolean
): GcodeToolData[] {
  const mappedTools = rawMappings
    .filter((mapping): mapping is AD5XMaterialMappingPayload =>
      isAD5XMaterialMappingPayload(mapping)
    )
    .map((mapping) => ({
      toolId: mapping.toolId,
      materialName: mapping.materialName || 'PLA',
      materialColor: mapping.toolMaterialColor || '#4DA3FF',
      filamentWeight: 0,
      slotId: mapping.slotId,
    }));

  if (mappedTools.length > 0) {
    return mappedTools;
  }

  if (requestedToolCount <= 0) {
    return [];
  }

  // No mappings were supplied, so synthesize one entry per tool. Tool IDs are 0-based;
  // the paired slot ID is 1-based on a material-station printer and 0 ("no slot") on a
  // direct-feed one.
  return Array.from({ length: requestedToolCount }, (_, index) => ({
    toolId: index,
    materialName: 'PLA',
    materialColor: '#4DA3FF',
    filamentWeight: 0,
    slotId: hasMaterialStation ? index + MIN_MATERIAL_SLOT_ID : 0,
  }));
}

function buildHttpLogPayload(req: Request): Record<string, unknown> {
  const request = req as RequestWithUpload;
  return {
    headers: request.headers,
    body: request.body,
    file: request.file
      ? {
          originalname: request.file.originalname,
          size: request.file.size,
          mimetype: request.file.mimetype,
        }
      : undefined,
  };
}

/**
 * Extracts thumbnail image data from G-code file content
 *
 * G-code files may contain embedded thumbnails in the format:
 * ; thumbnail begin
 * ; <base64_encoded_png_data_line_1>
 * ; <base64_encoded_png_data_line_2>
 * ; ...
 * ; thumbnail end
 *
 * @param gcodeContent The raw G-code file content as a string or Buffer
 * @returns Base64-encoded PNG data, or empty string if no thumbnail found
 */
function extractThumbnailFromGcode(gcodeContent: string | Buffer): string {
  const content = typeof gcodeContent === 'string' ? gcodeContent : gcodeContent.toString('utf-8');

  // Find the thumbnail section
  const thumbnailBeginIndex = content.indexOf('; thumbnail begin');
  if (thumbnailBeginIndex === -1) {
    return '';
  }

  const thumbnailEndIndex = content.indexOf('; thumbnail end', thumbnailBeginIndex);
  if (thumbnailEndIndex === -1) {
    return '';
  }

  // Extract the thumbnail section
  const thumbnailSection = content.slice(thumbnailBeginIndex, thumbnailEndIndex);

  // Collect all base64 lines (lines starting with ';' after 'begin' and before 'end')
  const lines = thumbnailSection.split('\n');
  const base64Lines: string[] = [];

  let inThumbnailData = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '; thumbnail begin') {
      inThumbnailData = true;
      continue;
    }

    if (trimmedLine === '; thumbnail end') {
      break;
    }

    // Collect base64 data lines (lines starting with ';' after 'begin')
    if (inThumbnailData && trimmedLine.startsWith(';') && trimmedLine.length > 1) {
      // Remove the '; ' prefix to get raw base64 data
      const base64Data = trimmedLine.substring(1).trim();
      if (base64Data.length > 0) {
        base64Lines.push(base64Data);
      }
    }
  }

  // Join all base64 lines into a single string
  return base64Lines.join('');
}

/**
 * HTTP Server for FlashForge printer emulation
 *
 * Listens on port 8898 and handles modern HTTP API requests.
 */
export class HttpServer extends EventEmitter {
  /** Express application */
  #app: express.Express;
  /** HTTP server instance */
  #server: ReturnType<typeof express.application.listen> | null = null;
  /** Port number for the HTTP server */
  #port: number;
  /** Whether the server is running */
  #running = false;
  /** Current printer model */
  #model: PrinterModel;
  /** Headless health/readiness metadata */
  #healthState: HealthState;
  /** Whether the simulation tick has been paused via /__simulate */
  #simulationPaused = false;

  /**
   * Gets the current port
   */
  get port(): number {
    return this.#port;
  }

  /**
   * Gets whether the server is running
   */
  get running(): boolean {
    return this.#running;
  }

  /**
   * Gets the current printer model
   */
  get model(): PrinterModel {
    return this.#model;
  }

  constructor(port: number, model: PrinterModel) {
    super();
    this.#port = port;
    this.#model = model;
    this.#healthState = {
      instanceId: 'default',
      tcpPort: printerStateStore.config.tcpPort,
      ready: true,
      startedAtMs: Date.now(),
    };
    this.#app = express();
    this.#setupMiddleware();
    this.#setupRoutes();
  }

  /**
   * Sets up Express middleware
   */
  #setupMiddleware(): void {
    // JSON body parsing
    this.#app.use(express.json());

    // Request logging
    this.#app.use((req, res, next) => {
      this.emit('request-received', {
        method: req.method,
        path: req.path,
        headers: req.headers,
      });

      protocolLogStore.add({
        protocol: 'http',
        direction: 'incoming',
        level: 'info',
        summary: `${req.method} ${req.path}`,
        payload: buildHttpLogPayload(req),
      });

      const originalJson = res.json.bind(res);
      res.json = ((body: unknown) => {
        protocolLogStore.add({
          protocol: 'http',
          direction: 'outgoing',
          level: res.statusCode >= 400 ? 'error' : 'info',
          summary: `${req.method} ${req.path} -> ${res.statusCode}`,
          payload: body,
        });
        return originalJson(body);
      }) as typeof res.json;

      next();
    });
  }

  /**
   * Sets up API routes
   */
  #setupRoutes(): void {
    // GET /__health - Runtime readiness and identity
    this.#app.get('/__health', this.#handleHealth.bind(this));

    // --- Internal control API (unauthenticated, for orchestrator/agent use) ---

    // GET /__state - Full internal emulator state dump
    this.#app.get('/__state', this.#handleGetState.bind(this));

    // POST /__scenario - Apply a named preset or raw scenario
    this.#app.post('/__scenario', this.#handleScenario.bind(this));

    // POST /__simulate - Control simulation (pause/resume/restart, speed)
    this.#app.post('/__simulate', this.#handleSimulate.bind(this));

    // POST /__reset - Wipe state back to initial idle
    this.#app.post('/__reset', this.#handleReset.bind(this));

    // POST /__shutdown - Gracefully stop the instance (same path as SIGTERM)
    this.#app.post('/__shutdown', this.#handleShutdown.bind(this));

    // Legacy (TCP-only) models — Adventurer 3/4 — have no HTTP REST server on
    // real hardware. We deliberately do NOT register the printer protocol routes
    // for them, so /detail and friends return Express's default 404. This makes
    // the client's "HTTP getDetail fails → fall back to TCP ~M115 identify" path
    // run exactly as it would against real legacy hardware. The internal /__*
    // control API stays available so orchestrators can still drive the instance.
    if (this.#isLegacyModel()) {
      this.#registerNotFoundHandler();
      return;
    }

    // --- Printer protocol routes (authenticated) ---

    // POST /detail - Get printer details
    this.#app.post('/detail', this.#handleDetail.bind(this));

    // POST /product - Get product feature availability
    this.#app.post('/product', this.#handleProduct.bind(this));

    // POST /control - Send control commands
    this.#app.post('/control', this.#handleControl.bind(this));

    // POST /gcodeList - Get recent files
    this.#app.post('/gcodeList', this.#handleGcodeList.bind(this));

    // POST /gcodeThumb - Get file thumbnail
    this.#app.post('/gcodeThumb', this.#handleGcodeThumb.bind(this));

    // POST /printGcode - Print a local file
    this.#app.post('/printGcode', this.#handlePrintGcode.bind(this));

    // POST /uploadGcode - Upload and optionally print (uses multer for file handling)
    this.#app.post('/uploadGcode', upload.single('gcodeFile'), this.#handleUploadGcode.bind(this));

    // GET /getThum - Current print thumbnail (Creator 5 series only). Real
    // firmware serves this without credentials (only the LAN-mode gate, which
    // the emulator always passes) and /detail printFileThumbUrl points at it.
    if (isCreator5Series(this.#model)) {
      this.#app.get('/getThum', this.#handleGetThum);
    }

    // POST /deleteGcode - Delete a G-code file. The Creator 5 series firmware
    // has no such route (unknown paths return "page not found"), so it is not
    // registered and falls through to Express's default 404 like real hardware.
    if (!isCreator5Series(this.#model)) {
      this.#app.post('/deleteGcode', this.#handleDeleteGcode.bind(this));
    }

    // GET /thumb/:filename - Per-file thumbnail bytes for the printFileThumbUrl
    // that /detail advertises on non-Creator-5 models (the Creator 5 series
    // advertises /getThum instead). Serves the same stored thumbnail bytes as
    // /gcodeThumb; like /getThum on real firmware it is served without
    // credentials because clients load it from <img src> tags.
    if (!isCreator5Series(this.#model)) {
      this.#app.get('/thumb/:filename', this.#handleThumbFile);
    }

    // Error handler
    this.#app.use(
      (
        _err: unknown,
        _req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: unknown
      ) => {
        res.json({ code: ResponseCode.Error, message: 'Error' });
      }
    );
  }

  /**
   * Whether the configured model is a legacy (TCP-only) printer that exposes no
   * HTTP REST API on real hardware (Adventurer 3/4).
   */
  #isLegacyModel(): boolean {
    return PRINTER_PROFILES[this.#model].protocolMode === 'legacy';
  }

  /**
   * Registers a catch-all 404 for legacy models so any printer protocol request
   * (e.g. POST /detail) is rejected the way a TCP-only printer would — there is
   * no HTTP server answering it. The internal /__* routes are registered before
   * this handler and remain reachable.
   */
  #registerNotFoundHandler(): void {
    this.#app.use((req: Request, res: Response) => {
      // Plain-text (non-JSON) body on purpose: real legacy hardware has no HTTP
      // API at all, so we must not emit the {code,...} envelope a client could
      // mistake for a valid printer response. The 404 status is the signal that
      // pushes the client onto its TCP identify/fallback path.
      res
        .status(404)
        .type('text/plain')
        .send(`No HTTP endpoint: ${req.method} ${req.path} (legacy TCP-only model)`);
    });
  }

  /**
   * Validates authentication from request body
   */
  #validateAuth(req: Request): AuthCredentials | null {
    const body = req.body as AuthenticatedRequest;

    if (!body.serialNumber || !body.checkCode) {
      return null;
    }

    const state = printerStateStore.state;

    if (body.serialNumber !== state.serialNumber || body.checkCode !== state.checkCode) {
      return null;
    }

    return { serialNumber: body.serialNumber, checkCode: body.checkCode };
  }

  /**
   * Validates authentication from request headers (for uploadGcode)
   */
  #validateAuthFromHeaders(req: Request): AuthCredentials | null {
    const serialNumber = req.headers['serialnumber'] as string;
    const checkCode = req.headers['checkcode'] as string;

    if (!serialNumber || !checkCode) {
      return null;
    }

    const state = printerStateStore.state;

    if (serialNumber !== state.serialNumber || checkCode !== state.checkCode) {
      return null;
    }

    return { serialNumber, checkCode };
  }

  /**
   * Creates a success response
   */
  #success<T>(data?: T, key = 'detail'): ApiResponse {
    const baseResponse = { code: ResponseCode.Success, message: 'Success' };
    if (data === undefined) {
      return baseResponse;
    }
    if (key === 'detail') {
      return { ...baseResponse, detail: data };
    }
    if (key === 'product') {
      return { ...baseResponse, product: data };
    }
    if (key === 'gcodeList') {
      return { ...baseResponse, gcodeList: data };
    }
    if (key === 'imageData') {
      return { ...baseResponse, imageData: data as string };
    }
    return baseResponse;
  }

  /**
   * Creates an error response
   */
  #error(code: ResponseCode, message: string): ApiResponse {
    return { code, message };
  }

  /**
   * Creates the rejection response for a bad `materialMappings` payload.
   *
   * Real firmware only ever says "Parameter is error." on the Creator 5 series (and
   * "Invalid parameter" elsewhere), so the code and the terse message match hardware.
   * The specific reason is appended as a `detail` string, which real firmware does not
   * send — it exists purely so a developer driving the emulator can see *why* the
   * mapping was refused instead of guessing.
   */
  #materialMappingError(reason: string): ApiResponse {
    const creator5 = isCreator5Series(this.#model);
    return {
      ...this.#error(
        creator5 ? ResponseCode.ParameterError : ResponseCode.InvalidParameter,
        creator5 ? 'Parameter is error.' : 'Invalid parameter'
      ),
      detail: reason,
    };
  }

  /**
   * Wraps a handler with authentication check
   */
  #withAuth(handler: (req: Request, res: Response) => void): RequestHandler {
    return (req, res) => {
      if (!this.#validateAuth(req)) {
        this.emit('auth-failed', { path: req.path });
        res.json(this.#error(ResponseCode.Unauthorized, 'Unauthorized'));
        return;
      }

      handler(req, res);
    };
  }

  /**
   * Wraps a handler with header-based authentication check
   */
  #withHeaderAuth(handler: (req: Request, res: Response) => void): RequestHandler {
    return (req, res) => {
      if (!this.#validateAuthFromHeaders(req)) {
        this.emit('auth-failed', { path: req.path });
        res.json(this.#error(ResponseCode.Unauthorized, 'Unauthorized'));
        return;
      }

      handler(req, res);
    };
  }

  /**
   * GET /detail - Get printer details
   */
  #handleDetail = this.#withAuth((_req: Request, res: Response): void => {
    const state = printerStateStore.state;
    const detail = serializeHttpDetail(state);

    this.emit('response-sent', { path: '/detail', detail });
    res.json(this.#success(detail));
  });

  #handleHealth(_req: Request, res: Response): void {
    const state = printerStateStore.state;
    const uptimeMs = Math.max(0, Date.now() - this.#healthState.startedAtMs);

    res.json({
      ok: this.#healthState.ready,
      instanceId: this.#healthState.instanceId,
      model: this.#model,
      serial: state.serialNumber,
      tcpPort: this.#healthState.tcpPort,
      httpPort: this.#port,
      uptimeMs,
    });
  }

  // ---------------------------------------------------------------------------
  // Internal control API handlers (unauthenticated)
  // ---------------------------------------------------------------------------

  /**
   * GET /__state - Full internal emulator state dump.
   *
   * Returns the complete PrinterState, config, simulation status, file list,
   * and available scenario presets. Richer than /detail — intended for
   * orchestrator/agent consumption.
   */
  #handleGetState(_req: Request, res: Response): void {
    const config = printerStateStore.config;
    const presets = printerStateStore.getScenarioPresets();

    res.json({
      ok: true,
      state: printerStateStore.state,
      config: {
        model: config.selectedModel,
        serialNumber: config.serialNumber,
        checkCode: config.checkCode,
        simulationMode: config.simulationMode,
        simulationSpeed: config.simulationSpeed,
        tcpPort: config.tcpPort,
        httpPort: config.httpPort,
      },
      simulation: {
        mode: printerStateStore.simulationMode,
        speed: printerStateStore.simulationSpeed,
        active: simulationService.active,
        paused: this.#simulationPaused,
      },
      files: printerStateStore.state.files.map((f) => f.name),
      presets: presets.map((p) => p.id),
    });
  }

  /**
   * POST /__scenario - Apply a named preset or raw scenario object.
   *
   * Accepts either `{ "preset": "printing" }` or
   * `{ "scenario": { "machineStatus": "idle", ... } }`.
   * The two fields are mutually exclusive.
   */
  #handleScenario(req: Request, res: Response): void {
    const body = req.body as Record<string, unknown>;
    const hasPreset = 'preset' in body && body['preset'] !== undefined;
    const hasScenario = 'scenario' in body && body['scenario'] !== undefined;

    if (hasPreset && hasScenario) {
      res.status(400).json({
        ok: false,
        error: "Must provide 'preset' or 'scenario', not both",
      });
      return;
    }

    if (!hasPreset && !hasScenario) {
      res.status(400).json({
        ok: false,
        error: "Must provide 'preset' or 'scenario'",
      });
      return;
    }

    if (hasPreset) {
      const presetId = body['preset'] as ScenarioPresetId;
      const presets = printerStateStore.getScenarioPresets();
      const found = presets.find((p) => p.id === presetId);

      if (!found) {
        res.status(400).json({
          ok: false,
          error: `Unknown preset: '${presetId}'. Available: ${presets.map((p) => p.id).join(', ')}`,
        });
        return;
      }

      printerStateStore.applyScenarioPreset(presetId);
      res.json({ ok: true, applied: { preset: presetId } });
      return;
    }

    const scenario = body['scenario'] as PrinterScenario;
    printerStateStore.applyScenario(scenario);
    res.json({ ok: true, applied: { scenario } });
  }

  /**
   * POST /__simulate - Control the simulation service at runtime.
   *
   * Accepts optional `{ "action": "pause"|"resume"|"restart"|"jump", "speed": 1-1000 }`.
   * Fields can be sent together or individually. `jump` additionally requires
   * `percent` (0-100) and fast-forwards the active job's derived progress
   * fields without ticking.
   */
  #handleSimulate(req: Request, res: Response): void {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const action = body['action'] as string | undefined;
    const speed = body['speed'] as number | undefined;
    const percent = body['percent'];

    if (
      action !== undefined &&
      action !== 'pause' &&
      action !== 'resume' &&
      action !== 'restart' &&
      action !== 'jump'
    ) {
      res.status(400).json({
        ok: false,
        error: `Unknown action: '${action}'. Must be 'pause', 'resume', 'restart', or 'jump'`,
      });
      return;
    }

    if (
      action === 'jump' &&
      (typeof percent !== 'number' || !Number.isFinite(percent) || percent < 0 || percent > 100)
    ) {
      res.status(400).json({
        ok: false,
        error: "percent must be a number between 0 and 100 when action is 'jump'",
      });
      return;
    }

    if (speed !== undefined) {
      if (typeof speed !== 'number' || speed < 1 || speed > 1000) {
        res.status(400).json({
          ok: false,
          error: 'speed must be a number between 1 and 1000',
        });
        return;
      }
      printerStateStore.simulationSpeed = speed;
    }

    if (action === 'pause') {
      simulationService.stop();
      this.#simulationPaused = true;
    } else if (action === 'resume') {
      simulationService.start();
      this.#simulationPaused = false;
    } else if (action === 'restart') {
      simulationService.stop();
      simulationService.start();
      this.#simulationPaused = false;
    } else if (action === 'jump') {
      const jumped = printerStateStore.jumpPrintProgress(percent as number);
      if (!jumped) {
        res.status(409).json({
          ok: false,
          error:
            'No jumpable print job: start a job first, and clear sticky terminal states (completed/cancelled/error) before jumping',
        });
        return;
      }
    }

    res.json({
      ok: true,
      simulation: {
        mode: printerStateStore.simulationMode,
        speed: printerStateStore.simulationSpeed,
        active: simulationService.active,
        paused: this.#simulationPaused,
      },
    });
  }

  /**
   * POST /__reset - Wipe state back to initial idle.
   *
   * Calls printerStateStore.reset() which reinitializes all state
   * to model defaults.
   */
  #handleReset(_req: Request, res: Response): void {
    printerStateStore.reset();
    res.json({ ok: true, message: 'State reset to initial idle' });
  }

  /**
   * POST /__shutdown - Gracefully stop this instance.
   *
   * Emits 'shutdown-requested' after the response has flushed; the headless
   * entrypoint wires that event to the same shutdown path its SIGTERM handler
   * uses (stop servers, deregister from the instance registry, exit 0). In the
   * desktop app no listener is attached — the QA console still drives those
   * servers — so the route refuses rather than half-stopping them.
   */
  #handleShutdown(_req: Request, res: Response): void {
    if (this.listenerCount('shutdown-requested') === 0) {
      res.status(501).json({
        ok: false,
        error: 'No shutdown handler is configured for this process',
      });
      return;
    }

    res.json({ ok: true, message: 'Shutting down' });
    res.on('finish', () => {
      this.emit('shutdown-requested');
    });
  }

  /**
   * POST /product - Get product feature availability
   */
  #handleProduct = this.#withAuth((_req: Request, res: Response): void => {
    const profile = printerStateStore.getProfile();
    const creator5 = isCreator5Series(this.#model);

    // Real Creator 5 firmware misreports capabilities here: chamberTempCtrlState
    // reads 1 even on the heater-less base model, and the fan control states read
    // 0 even on the Pro (which has filtration hardware). Emulated clients must
    // gate on pid/model, exactly as against real hardware.
    const product = {
      chamberTempCtrlState: creator5 ? 1 : profile.hasChamberTemp ? 1 : 0,
      externalFanCtrlState: creator5 ? 0 : 1,
      internalFanCtrlState: creator5 ? 0 : 1,
      lightCtrlState: 1,
      nozzleTempCtrlState: 1,
      platformTempCtrlState: 1,
    };

    this.emit('response-sent', { path: '/product', product });
    res.json(this.#success(product, 'product'));
  });

  /**
   * POST /control - Send control commands
   */
  #handleControl = this.#withAuth((req: Request, res: Response): void => {
    const body = req.body as AuthenticatedRequest;
    const { cmd, args } = body.payload ?? { cmd: '', args: {} };

    switch (cmd) {
      case 'lightControl_cmd': {
        const status = args?.status === 'open';
        printerStateStore.updateLed(status);
        this.emit('command-executed', { cmd, args });
        break;
      }

      case 'printerCtl_cmd': {
        if (typeof args?.speed === 'number') {
          printerStateStore.updatePrintSpeed(args.speed);
        }
        if (typeof args?.chamberFan === 'number') {
          printerStateStore.updateFan({ chamberFanSpeed: args.chamberFan });
        }
        if (typeof args?.coolingFan === 'number') {
          printerStateStore.updateFan({ coolingFanSpeed: args.coolingFan });
        }
        if (typeof args?.zAxisCompensation === 'number') {
          printerStateStore.updateZAxisCompensation(args.zAxisCompensation);
        }
        if (typeof args?.coolingLeftFan === 'number') {
          printerStateStore.updateFan({ coolingLeftFanSpeed: args.coolingLeftFan });
        }
        this.emit('command-executed', { cmd, args });
        break;
      }

      case 'jobCtl_cmd': {
        const action = args?.action as string;
        switch (action) {
          case 'pause':
            printerStateStore.pausePrint();
            break;
          case 'continue':
            printerStateStore.resumePrint();
            break;
          case 'cancel':
            printerStateStore.cancelPrint();
            break;
        }
        this.emit('command-executed', { cmd, args });
        break;
      }

      case 'circulateCtl_cmd': {
        if (!printerStateStore.getProfile().filtrationControllable) {
          // Creator 5 series: firmware acknowledges circulateCtl_cmd with
          // success but never actuates the fans (the Pro's filtration is not
          // API-controllable; the base has no filtration hardware). Silent ACK
          // is deliberate bug-compatibility.
          this.emit('command-executed', {
            cmd,
            args,
            ignored: 'filtration is not controllable on this model',
          });
          break;
        }
        const internal = args?.internal === 'open';
        const external = args?.external === 'open';
        printerStateStore.updateFan({
          internalFanEnabled: internal,
          externalFanEnabled: external,
        });
        this.emit('command-executed', { cmd, args });
        break;
      }

      case 'streamCtrl_cmd': {
        // Camera control - would be stored in state
        this.emit('command-executed', { cmd, args });
        break;
      }

      case 'stateCtrl_cmd': {
        const action = args?.action as string;
        if (action === 'setClearPlatform') {
          const machineStatus = printerStateStore.state.machineStatus;
          if (
            machineStatus === 'completed' ||
            machineStatus === 'cancelled' ||
            machineStatus === 'error'
          ) {
            printerStateStore.clearCompletedState();
          }
        }
        this.emit('command-executed', { cmd, args });
        break;
      }

      case 'temperatureCtl_cmd': {
        if (isCreator5Series(this.#model)) {
          this.#handleCreator5TemperatureControl(args);
          this.emit('command-executed', { cmd, args });
          break;
        }

        // Handle temperature control commands
        const state = printerStateStore.state;
        const hasNewTargetTemp =
          (typeof args?.platformTemp === 'number' &&
            args.platformTemp > state.temperature.bedCurrent) ||
          (typeof args?.rightTemp === 'number' &&
            args.rightTemp > state.temperature.nozzleCurrent) ||
          (typeof args?.leftTemp === 'number' &&
            args.leftTemp > state.temperature.leftNozzleCurrent) ||
          (typeof args?.chamberTemp === 'number' &&
            args.chamberTemp > state.temperature.chamberCurrent);

        if (typeof args?.platformTemp === 'number') {
          printerStateStore.updateTemperature({ bedTarget: args.platformTemp });
        }
        if (typeof args?.rightTemp === 'number') {
          printerStateStore.updateTemperature({ nozzleTarget: args.rightTemp });
        }
        if (typeof args?.leftTemp === 'number') {
          printerStateStore.updateTemperature({ leftNozzleTarget: args.leftTemp });
        }
        if (typeof args?.chamberTemp === 'number') {
          printerStateStore.updateTemperature({ chamberTarget: args.chamberTemp });
        }

        // Transition to 'heating' state if new target temps exceed current temps and status is idle
        if (
          hasNewTargetTemp &&
          (state.machineStatus === 'idle' || state.machineStatus === 'ready')
        ) {
          printerStateStore.setMachineStatus('heating');
        }

        this.emit('command-executed', { cmd, args });
        break;
      }

      default:
        this.emit('command-unknown', { cmd });
        break;
    }

    res.json(this.#success());
  });

  /**
   * Creator 5 series temperatureCtl_cmd handling (canonical wire format).
   *
   * Real firmware drives the four tool heads ONLY through the `nozzles` array:
   * it must be exactly 4 ints or the whole per-tool block is skipped. Inside
   * the array 0 = off, -200 = no change, and -100 is ignored (the tool keeps
   * its target). rightNozzle/leftNozzle are legacy fields this firmware never
   * reads for tool control. The scalar heaters (platform, chamber) use
   * -200 = no change and -100 = off. Chamber is capped at 80 C and only the
   * Pro honors it — on the base model the command is acknowledged without
   * effect, matching the firmware's silent-ACK behaviour.
   */
  #handleCreator5TemperatureControl(args: ControlArgs): void {
    const TEMP_NO_CHANGE = -200;
    const TEMP_OFF = -100;
    const profile = printerStateStore.getProfile();
    const state = printerStateStore.state;
    let hasNewTargetTemp = false;

    if (Array.isArray(args?.nozzles) && args.nozzles.length === 4) {
      const nextTargets = [...state.toolTargetTemps];
      let toolChanged = false;
      args.nozzles.forEach((value, index) => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
          // -200 = no change; any other negative (notably -100) is IGNORED by
          // real firmware — the tool keeps its target. Only 0..350 applies,
          // with 0 meaning off.
          return;
        }
        const clamped = clampTemperature(value, 0, 350);
        if (nextTargets[index] !== clamped) {
          toolChanged = true;
        }
        nextTargets[index] = clamped;
        if (clamped > (state.toolTemps[index] ?? 0)) {
          hasNewTargetTemp = true;
        }
      });
      if (toolChanged) {
        printerStateStore.setToolTargetTemps(nextTargets);
      }
    }

    if (typeof args?.platform === 'number' && args.platform !== TEMP_NO_CHANGE) {
      const bedTarget = args.platform === TEMP_OFF ? 0 : clampTemperature(args.platform, 0, 130);
      printerStateStore.updateTemperature({ bedTarget });
      if (bedTarget > state.temperature.bedCurrent) {
        hasNewTargetTemp = true;
      }
    }

    if (
      typeof args?.chamber === 'number' &&
      args.chamber !== TEMP_NO_CHANGE &&
      profile.hasChamberTemp
    ) {
      const chamberTarget = args.chamber === TEMP_OFF ? 0 : clampTemperature(args.chamber, 0, 80);
      printerStateStore.updateTemperature({ chamberTarget });
      if (chamberTarget > state.temperature.chamberCurrent) {
        hasNewTargetTemp = true;
      }
    }

    if (hasNewTargetTemp && (state.machineStatus === 'idle' || state.machineStatus === 'ready')) {
      printerStateStore.setMachineStatus('heating');
    }
  }

  /**
   * POST /gcodeList - Get recent G-code files
   */
  #handleGcodeList = this.#withAuth((_req: Request, res: Response): void => {
    const files = printerStateStore.getFiles();
    const fileNames = files.slice(0, 10).map((f) => f.name);

    // Real Creator 5 firmware returns bare file names (no gcodeListDetail),
    // so clients must parse tool data at upload time. Other models keep the
    // detailed listing the emulator has always served.
    const response: ApiResponse = {
      code: ResponseCode.Success,
      message: 'Success',
      gcodeList: fileNames,
    };

    if (printerStateStore.getProfile().gcodeListIncludesDetail) {
      response.gcodeListDetail = files.slice(0, 10).map((file) => ({
        gcodeFileName: file.name,
        gcodeToolCnt: file.gcodeToolCnt,
        gcodeToolDatas: file.gcodeToolDatas,
        printingTime: file.printTime,
        totalFilamentWeight: file.totalFilamentWeight,
        useMatlStation: file.useMatlStation,
      }));
    }

    this.emit('response-sent', { path: '/gcodeList', count: fileNames.length });
    res.json(response);
  });

  /**
   * POST /gcodeThumb - Get file thumbnail
   */
  #handleGcodeThumb = this.#withAuth((req: Request, res: Response): void => {
    const body = req.body as AuthenticatedRequest;
    const fileName = body.fileName;

    if (!fileName) {
      res.json(this.#error(ResponseCode.InvalidParameter, 'Invalid parameter'));
      return;
    }

    const file = printerStateStore.getFile(fileName);
    if (!file) {
      res.json(this.#error(ResponseCode.NotFound, 'Not found'));
      return;
    }

    // Return extracted thumbnail if available, otherwise placeholder
    const thumbnailData = file.thumbnail || '';
    this.emit('response-sent', { path: '/gcodeThumb', fileName });
    res.json(this.#success(thumbnailData || PLACEHOLDER_THUMBNAIL_PNG, 'imageData'));
  });

  /**
   * POST /printGcode - Print a local file
   */
  #handlePrintGcode = this.#withAuth((req: Request, res: Response): void => {
    const body = req.body as AuthenticatedRequest;
    const fileName = body.fileName;

    if (!fileName) {
      const creator5 = isCreator5Series(this.#model);
      res.json(
        this.#error(
          creator5 ? ResponseCode.ParameterError : ResponseCode.InvalidParameter,
          creator5 ? 'Parameter is error.' : 'Invalid parameter'
        )
      );
      return;
    }

    // Real Creator 5 firmware rejects /printGcode without the required
    // levelingBeforePrint boolean ({code: -1, "Parameter is error."}).
    if (isCreator5Series(this.#model) && typeof body.levelingBeforePrint !== 'boolean') {
      res.json(this.#error(ResponseCode.ParameterError, 'Parameter is error.'));
      return;
    }

    // The Creator 5 series maps materials here rather than at upload time, so this is
    // where an off-by-one slot ID has to be caught for that family.
    const requestedMappings = body.materialMappings ?? [];
    if (requestedMappings.length > 0) {
      const mappingError = validateMaterialMappings(requestedMappings, this.#model);
      if (mappingError) {
        this.emit('print-rejected', { fileName, reason: mappingError });
        res.json(this.#materialMappingError(mappingError));
        return;
      }
    }

    const file = printerStateStore.getFile(fileName);
    if (!file) {
      res.json(this.#error(ResponseCode.NotFound, 'Not found'));
      return;
    }

    const machineStatus = printerStateStore.state.machineStatus;
    if (!canStartNewPrint(machineStatus)) {
      res.json(
        this.#error(
          ResponseCode.Busy,
          isStickyTerminalState(machineStatus) ? 'Clear to ready before starting a new job' : 'Busy'
        )
      );
      return;
    }

    // Parse AD5X parameters (stored for future implementation)
    const ad5xParams = {
      flowCalibration: body.flowCalibration ?? false,
      useMatlStation: body.useMatlStation ?? false,
      gcodeToolCnt: body.gcodeToolCnt ?? 0,
      materialMappings: requestedMappings,
    };

    if (!printerStateStore.startPrint(fileName, file.printTime)) {
      res.json(this.#error(ResponseCode.Busy, 'Busy'));
      return;
    }
    this.emit('print-started', { fileName, ad5xParams });
    res.json(this.#success());
  });

  /**
   * POST /uploadGcode - Upload and optionally print file
   */
  #handleUploadGcode = this.#withHeaderAuth((req: Request, res: Response): void => {
    // Get file from multer
    const uploadedFile = req.file;
    if (!uploadedFile) {
      this.emit('upload-failed', { reason: 'No file provided' });
      res.json(this.#error(ResponseCode.InvalidParameter, 'No file provided'));
      return;
    }

    const fileName = uploadedFile.originalname;
    const fileSize = uploadedFile.size;

    // Parse print-related headers
    const printNow = parseBooleanHeader(req.headers['printnow']);
    const levelingBeforePrint = parseBooleanHeader(req.headers['levelingbeforeprint']);

    // Parse AD5X headers
    const flowCalibration = parseBooleanHeader(req.headers['flowcalibration']);
    const useMatlStation = parseBooleanHeader(req.headers['usematlstation']);
    const parsedGcodeToolCnt = Number.parseInt(req.headers['gcodetoolcnt'] as string, 10);
    const gcodeToolCnt =
      Number.isFinite(parsedGcodeToolCnt) && parsedGcodeToolCnt > 0 ? parsedGcodeToolCnt : 0;

    // Base64 decode materialMappings if present
    let materialMappings: unknown[] = [];
    const materialMappingsHeader = req.headers['materialmappings'] as string;
    if (materialMappingsHeader) {
      try {
        const decoded = Buffer.from(materialMappingsHeader, 'base64').toString('utf-8');
        materialMappings = JSON.parse(decoded) as unknown[];
      } catch {
        // If decoding fails, leave as empty array
        materialMappings = [];
      }
    }

    // The AD5X maps materials at upload time, so the slot IDs land here for that family.
    if (materialMappings.length > 0) {
      const mappingError = validateMaterialMappings(materialMappings, this.#model);
      if (mappingError) {
        this.emit('upload-failed', { reason: mappingError });
        res.json(this.#materialMappingError(mappingError));
        return;
      }
    }

    // Create printer file entry
    const printTime = estimatePrintTime(fileSize);
    const is3mf = fileName.toLowerCase().endsWith('.3mf');

    const hasMaterialStation = PRINTER_PROFILES[this.#model].hasMaterialStation;
    const gcodeToolDatas = buildGcodeToolDatas(materialMappings, gcodeToolCnt, hasMaterialStation);
    const resolvedToolCount = gcodeToolDatas.length > 0 ? gcodeToolDatas.length : gcodeToolCnt;
    const resolvedUseMaterialStation = useMatlStation || resolvedToolCount > 0;

    // Calculate total filament weight from tool data
    const totalFilamentWeight = gcodeToolDatas.reduce((sum, tool) => sum + tool.filamentWeight, 0);

    // Extract thumbnail from G-code content (only for .gcode files)
    let thumbnail = '';
    if (!is3mf && uploadedFile.buffer) {
      thumbnail = extractThumbnailFromGcode(uploadedFile.buffer);
    }

    const printerFile: PrinterFile = {
      name: fileName,
      path: `/data/${fileName}`,
      size: fileSize,
      printTime,
      is3mf,
      gcodeToolCnt: resolvedToolCount,
      gcodeToolDatas,
      useMatlStation: resolvedUseMaterialStation,
      totalFilamentWeight,
      thumbnail,
    };

    // Add file to state
    printerStateStore.addFile(printerFile);

    // Store AD5X parameters for this upload
    const ad5xParams = {
      flowCalibration,
      useMatlStation: resolvedUseMaterialStation,
      gcodeToolCnt: resolvedToolCount,
      materialMappings,
    };

    this.emit('upload-complete', {
      fileName,
      fileSize,
      printNow,
      levelingBeforePrint,
      ad5xParams,
    });

    // Start printing if requested
    if (printNow) {
      const machineStatus = printerStateStore.state.machineStatus;
      if (!canStartNewPrint(machineStatus)) {
        res.json(
          this.#error(
            ResponseCode.Busy,
            isStickyTerminalState(machineStatus)
              ? 'Clear to ready before starting a new job'
              : 'Printer is busy'
          )
        );
        return;
      }

      if (!printerStateStore.startPrint(fileName, printTime)) {
        res.json(this.#error(ResponseCode.Busy, 'Printer is busy'));
        return;
      }
      this.emit('print-started', { fileName, ad5xParams });
    }

    res.json(this.#success());
  });

  /**
   * POST /deleteGcode - Delete a G-code file
   */
  #handleDeleteGcode = this.#withAuth((req: Request, res: Response): void => {
    const body = req.body as AuthenticatedRequest;
    const fileName = body.fileName;

    if (!fileName) {
      res.json(this.#error(ResponseCode.InvalidParameter, 'Invalid parameter'));
      return;
    }

    const file = printerStateStore.getFile(fileName);
    if (!file) {
      res.json(this.#error(ResponseCode.NotFound, 'Not found'));
      return;
    }

    // Remove file from state
    printerStateStore.removeFile(fileName);
    this.emit('file-deleted', { fileName });
    res.json(this.#success());
  });

  /**
   * GET /getThum - Current print thumbnail (Creator 5 series).
   *
   * Unauthenticated by design: real firmware gates only LAN mode here.
   * Serves the current job's extracted thumbnail or a 1x1 placeholder.
   */
  #handleGetThum = (_req: Request, res: Response): void => {
    const state = printerStateStore.state;
    const currentFile = state.printJob.currentFile
      ? printerStateStore.getFile(state.printJob.currentFile)
      : undefined;
    const base64 = currentFile?.thumbnail || PLACEHOLDER_THUMBNAIL_PNG;

    this.emit('response-sent', { path: '/getThum' });
    res.type('image/png').send(Buffer.from(base64, 'base64'));
  };

  /**
   * GET /thumb/:filename - Stored thumbnail bytes for one file.
   *
   * Serves the exact same bytes /gcodeThumb would return for the file (the
   * extracted G-code thumbnail, or the 1x1 placeholder when none was found),
   * so clients following the printFileThumbUrl from /detail get a real image
   * instead of falling back to /gcodeThumb. Unknown filenames 404 in the
   * plain-text style used by the other non-JSON not-found paths.
   */
  #handleThumbFile = (req: Request, res: Response): void => {
    const fileName = req.params['filename'] ?? '';
    const file = printerStateStore.getFile(fileName);

    if (!file) {
      res.status(404).type('text/plain').send('Not found');
      return;
    }

    const thumbnailData = file.thumbnail || PLACEHOLDER_THUMBNAIL_PNG;
    this.emit('response-sent', { path: '/thumb', fileName });
    res.type('image/png').send(Buffer.from(thumbnailData, 'base64'));
  };

  /**
   * Starts the HTTP server
   */
  start(): boolean {
    if (this.#running) {
      return true;
    }

    this.#server = this.#app.listen(this.#port, () => {
      this.#running = true;
      this.emit('started', this.#port);
    });

    this.#server.on('error', (error) => {
      this.emit('error', error);
    });

    return true;
  }

  configureHealthState(healthState: Partial<HealthState>): void {
    this.#healthState = {
      ...this.#healthState,
      ...healthState,
      startedAtMs: healthState.startedAtMs ?? this.#healthState.startedAtMs,
    };
  }

  /**
   * Stops the HTTP server
   */
  stop(): void {
    if (!this.#running) {
      return;
    }

    if (this.#server) {
      this.#server.close();
      this.#server = null;
    }

    this.#running = false;
    this.emit('stopped');
  }

  /**
   * Updates the printer model
   */
  updateModel(model: PrinterModel): void {
    this.#model = model;
  }
}

/**
 * Global singleton instance
 */
let httpServerInstance: HttpServer | null = null;

/**
 * Gets or creates the HTTP server singleton
 */
export function getHttpServer(port: number, model: PrinterModel): HttpServer {
  if (!httpServerInstance) {
    httpServerInstance = new HttpServer(port, model);
  } else {
    httpServerInstance.updateModel(model);
  }
  return httpServerInstance;
}

/**
 * Destroys the HTTP server singleton
 */
export function destroyHttpServer(): void {
  if (httpServerInstance) {
    httpServerInstance.stop();
    httpServerInstance = null;
  }
}
