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
import type { PrinterFile, PrinterModel } from '../../../shared/types/printer';
import { printerStateStore } from '../state/PrinterStateStore';

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
 * Tool data for G-code file entry
 */
interface GcodeToolData {
  /** Tool ID (0-based) */
  toolId: number;
  /** Material name */
  materialName?: string;
  /** Material color hex code */
  materialColor?: string;
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
    this.#app.use((req, _res, next) => {
      this.emit('request-received', {
        method: req.method,
        path: req.path,
        headers: req.headers,
      });
      next();
    });
  }

  /**
   * Sets up API routes
   */
  #setupRoutes(): void {
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
    const profile = printerStateStore.getProfile();

    // Map machine status to API format
    const statusMap: Record<string, string> = {
      idle: 'ready',
      ready: 'ready',
      busy: 'busy',
      printing: 'printing',
      paused: 'paused',
      pausing: 'pausing',
      cancel: 'cancel',
      completed: 'completed',
      heating: 'heating',
      error: 'error',
      calibrate_doing: 'calibrate_doing',
    };

    const detail: Record<string, unknown> = {
      autoShutdown: state.autoShutdown,
      autoShutdownTime: state.autoShutdownTime,
      cameraStreamUrl: profile.hasCamera ? `http://${state.ipAddress}:8080/stream` : '',
      chamberFanSpeed: state.fan.chamberFanSpeed,
      chamberTargetTemp: state.temperature.chamberTarget,
      chamberTemp: state.temperature.chamberCurrent,
      coolingFanSpeed: state.fan.coolingFanSpeed,
      cumulativeFilament: 0,
      cumulativePrintTime: 0,
      currentPrintSpeed: 100,
      doorStatus: state.doorOpen ? 'open' : 'close',
      errorCode: '',
      estimatedLeftLen: 0,
      estimatedLeftWeight: 0,
      estimatedRightLen: 0,
      estimatedRightWeight: 0,
      estimatedTime: state.printJob.estimatedTimeRemaining,
      externalFanStatus: state.fan.externalFanEnabled ? 'open' : 'close',
      fillAmount: 0,
      firmwareVersion: state.firmwareVersion,
      flashRegisterCode: '',
      internalFanStatus: state.fan.internalFanEnabled ? 'open' : 'close',
      ipAddr: state.ipAddress,
      leftFilamentType: '',
      leftTargetTemp: 0,
      leftTemp: 0,
      lightStatus: state.led.enabled ? 'open' : 'close',
      location: '',
      macAddr: state.macAddress.replace(/:/g, ''),
      name: state.machineName,
      nozzleCnt: state.nozzleCount,
      nozzleModel: state.nozzleModel,
      nozzleStyle: 1,
      pid: 0,
      platTargetTemp: state.temperature.bedTarget,
      platTemp: state.temperature.bedCurrent,
      polarRegisterCode: '',
      printDuration: state.printJob.elapsedTime,
      printFileName: state.printJob.currentFile ?? '',
      printFileThumbUrl: state.printJob.currentFile
        ? `http://${state.ipAddress}:8898/thumb/${state.printJob.currentFile}`
        : '',
      printLayer: state.printJob.currentLayer,
      printProgress: state.printJob.progress,
      printSpeedAdjust: 100,
      remainingDiskSpace: 1024,
      rightFilamentType: 'PLA',
      rightTargetTemp: state.temperature.nozzleTarget,
      rightTemp: state.temperature.nozzleCurrent,
      status: statusMap[state.machineStatus] ?? 'ready',
      targetPrintLayer: state.printJob.totalLayers,
      tvoc: 0,
      zAxisCompensation: 0,
    };

    // Add AD5X material station info if applicable
    if (profile.hasMaterialStation) {
      detail['hasMatlStation'] = true;
      detail['matlStationInfo'] = {
        currentLoadSlot: state.materialStation.currentLoadSlot,
        currentSlot: state.materialStation.currentSlot,
        slotCnt: state.materialStation.slotCount,
        stateAction: 0,
        stateStep: 0,
        slotInfos: state.materialStation.slots.map((slot) => ({
          slotId: slot.slotId - 1, // API uses 0-based indexing
          hasFilament: slot.hasFilament,
          materialName: slot.materialName || 'PLA',
          materialColor: slot.materialColor,
        })),
      };
      detail['indepMatlInfo'] = {
        currentLoadSlot: 0,
        currentSlot: state.materialStation.currentSlot,
        stateAction: 0,
        stateStep: 0,
      };
    } else {
      detail['hasMatlStation'] = false;
    }

    this.emit('response-sent', { path: '/detail', detail });
    res.json(this.#success(detail));
  });

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
          // Speed adjustment - would be stored in state
        }
        if (typeof args?.chamberFan === 'number') {
          printerStateStore.updateFan({ chamberFanSpeed: args.chamberFan });
        }
        if (typeof args?.coolingFan === 'number') {
          printerStateStore.updateFan({ coolingFanSpeed: args.coolingFan });
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
            printerStateStore.stopPrint();
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
          // Reset completed state
          if (printerStateStore.state.machineStatus === 'completed') {
            printerStateStore.setMachineStatus('idle');
          }
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

    // Build gcodeListDetail array (empty for now as per PRD)
    const gcodeListDetail: GcodeFileEntry[] = [];

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

    // Return placeholder 1x1 transparent PNG
    const placeholderPng =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    this.emit('response-sent', { path: '/gcodeThumb', fileName });
    res.json(this.#success(placeholderPng, 'imageData'));
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

    // Check if printer is busy
    if (
      printerStateStore.state.machineStatus === 'printing' ||
      printerStateStore.state.machineStatus === 'busy'
    ) {
      res.json(this.#error(ResponseCode.Busy, 'Busy'));
      return;
    }

    // Parse AD5X parameters (stored for future implementation)
    const ad5xParams = {
      flowCalibration: body.flowCalibration ?? false,
      useMatlStation: body.useMatlStation ?? false,
      gcodeToolCnt: body.gcodeToolCnt ?? 0,
      materialMappings: body.materialMappings ?? [],
    };

    printerStateStore.startPrint(fileName, file.printTime);
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

    // Parse AD5X headers (reserved for future use)
    void req.headers['flowcalibration'];
    void req.headers['usematlstation'];
    void req.headers['gcodeltoolcnt'];
    void req.headers['materialmappings'];

    // Create printer file entry
    const printTime = estimatePrintTime(fileSize);
    const is3mf = fileName.toLowerCase().endsWith('.3mf');
    const printerFile: PrinterFile = {
      name: fileName,
      path: `/data/${fileName}`,
      size: fileSize,
      printTime,
      is3mf,
    };

    // Add file to state
    printerStateStore.addFile(printerFile);

    this.emit('upload-complete', {
      fileName,
      fileSize,
      printNow,
      levelingBeforePrint,
    });

    // Start printing if requested
    if (printNow) {
      // Check if printer is busy
      if (
        printerStateStore.state.machineStatus === 'printing' ||
        printerStateStore.state.machineStatus === 'busy'
      ) {
        res.json(this.#error(ResponseCode.Busy, 'Printer is busy'));
        return;
      }

      printerStateStore.startPrint(fileName, printTime);
      this.emit('print-started', { fileName });
    }

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
