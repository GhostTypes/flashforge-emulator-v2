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

function buildGcodeToolDatas(
  rawMappings: readonly unknown[],
  requestedToolCount: number
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

  return Array.from({ length: requestedToolCount }, (_, index) => ({
    toolId: index,
    materialName: 'PLA',
    materialColor: '#4DA3FF',
    filamentWeight: 0,
    slotId: 0,
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

    // POST /deleteGcode - Delete a G-code file
    this.#app.post('/deleteGcode', this.#handleDeleteGcode.bind(this));

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
   * Accepts optional `{ "action": "pause"|"resume"|"restart", "speed": 1-1000 }`.
   * Fields can be sent together or individually.
   */
  #handleSimulate(req: Request, res: Response): void {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const action = body['action'] as string | undefined;
    const speed = body['speed'] as number | undefined;

    if (action !== undefined && action !== 'pause' && action !== 'resume' && action !== 'restart') {
      res.status(400).json({
        ok: false,
        error: `Unknown action: '${action}'. Must be 'pause', 'resume', or 'restart'`,
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
   * POST /product - Get product feature availability
   */
  #handleProduct = this.#withAuth((_req: Request, res: Response): void => {
    const profile = printerStateStore.getProfile();

    const product = {
      chamberTempCtrlState: profile.hasChamberTemp ? 1 : 0,
      externalFanCtrlState: 1,
      internalFanCtrlState: 1,
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
   * POST /gcodeList - Get recent G-code files
   */
  #handleGcodeList = this.#withAuth((_req: Request, res: Response): void => {
    const files = printerStateStore.getFiles();
    const fileNames = files.slice(0, 10).map((f) => f.name);

    // Build gcodeListDetail array with actual file metadata
    const gcodeListDetail: GcodeFileEntry[] = files.slice(0, 10).map((file) => ({
      gcodeFileName: file.name,
      gcodeToolCnt: file.gcodeToolCnt,
      gcodeToolDatas: file.gcodeToolDatas,
      printingTime: file.printTime,
      totalFilamentWeight: file.totalFilamentWeight,
      useMatlStation: file.useMatlStation,
    }));

    this.emit('response-sent', { path: '/gcodeList', count: fileNames.length });
    res.json({
      code: ResponseCode.Success,
      message: 'Success',
      gcodeList: fileNames,
      gcodeListDetail,
    } satisfies ApiResponse);
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
    const placeholderPng =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    this.emit('response-sent', { path: '/gcodeThumb', fileName });
    res.json(this.#success(thumbnailData || placeholderPng, 'imageData'));
  });

  /**
   * POST /printGcode - Print a local file
   */
  #handlePrintGcode = this.#withAuth((req: Request, res: Response): void => {
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
      materialMappings: body.materialMappings ?? [],
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
    const printNow = req.headers['printnow'] === 'true';
    const levelingBeforePrint = req.headers['levelingbeforeprint'] === 'true';

    // Parse AD5X headers
    const flowCalibration = req.headers['flowcalibration'] === 'true';
    const useMatlStation = req.headers['usematlstation'] === 'true';
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

    // Create printer file entry
    const printTime = estimatePrintTime(fileSize);
    const is3mf = fileName.toLowerCase().endsWith('.3mf');

    const gcodeToolDatas = buildGcodeToolDatas(materialMappings, gcodeToolCnt);
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
