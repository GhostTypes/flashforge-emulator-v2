/**
 * @fileoverview
 * TCP Server for FlashForge printer emulation
 *
 * Implements the legacy TCP protocol on port 8899.
 * Handles G/M-code commands and responses following the FlashForge API.
 *
 * @packageDocumentation
 */

import { EventEmitter } from 'node:events';
import * as net from 'node:net';
import type { PrinterModel } from '../../../shared/types/printer';
import { printerStateStore } from '../state/PrinterStateStore';

/**
 * Connection states for TCP clients
 */
type ConnectionState = 'connected' | 'control-requested' | 'control-active' | 'disconnected';

/**
 * Represents a single TCP client connection
 */
interface TcpClient {
  /** Socket connection */
  socket: net.Socket;
  /** Current connection state */
  state: ConnectionState;
  /** Remote address for logging */
  remoteAddress: string;
  /** Buffer for incoming data */
  buffer: string;
  /** Connection timestamp */
  connectedAt: Date;
  /** Last activity timestamp */
  lastActivityAt: Date;
}

/**
 * Command response builder
 */
class ResponseBuilder {
  /** Current response lines */
  #lines: string[] = [];

  /**
   * Adds a command received acknowledgment
   */
  cmdReceived(command: string): this {
    this.#lines.push(`CMD ${command} Received.`);
    return this;
  }

  /**
   * Adds a line to the response
   */
  addLine(line: string): this {
    this.#lines.push(line);
    return this;
  }

  /**
   * Adds multiple lines to the response
   */
  addLines(lines: readonly string[]): this {
    this.#lines.push(...lines);
    return this;
  }

  /**
   * Builds the final response with 'ok' terminator
   */
  build(): string {
    this.#lines.push('ok');
    return `${this.#lines.join('\n')}\n`;
  }

  /**
   * Builds a control success response
   */
  static controlSuccess(): string {
    return 'Control Success V2.1.\nok\n';
  }

  /**
   * Builds a control release response
   */
  static controlRelease(): string {
    return 'Control Release.\nok\n';
  }

  /**
   * Builds a control failed response
   */
  static controlFailed(): string {
    return 'Control Failed.\nok\n';
  }

  /**
   * Builds an error response
   */
  static error(message: string): string {
    return `Error: ${message}\nok\n`;
  }
}

/**
 * TCP Server for FlashForge printer emulation
 *
 * Listens on port 8899 and handles legacy TCP protocol commands.
 */
export class TcpServer extends EventEmitter {
  /** TCP server instance */
  #server: net.Server | null = null;
  /** Port number for the TCP server */
  #port: number;
  /** Connected clients */
  #clients: Map<net.Socket, TcpClient> = new Map();
  /** Whether the server is running */
  #running = false;
  /** Keep-alive interval */
  #keepAliveInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Current printer model (reserved for future model-specific behavior)
   */
  #model: PrinterModel;

  /**
   * Gets the current port
   */
  get port(): number {
    return this.#port;
  }

  /**
   * Gets the current printer model
   */
  get model(): PrinterModel {
    return this.#model;
  }

  /**
   * Gets whether the server is running
   */
  get running(): boolean {
    return this.#running;
  }

  /**
   * Gets the number of connected clients
   */
  get clientCount(): number {
    return this.#clients.size;
  }

  constructor(port: number, model: PrinterModel) {
    super();
    this.#port = port;
    this.#model = model;
  }

  /**
   * Starts the TCP server
   */
  start(): boolean {
    if (this.#running) {
      return true;
    }

    this.#server = net.createServer((socket) => {
      this.#handleConnection(socket);
    });

    this.#server.on('error', (error) => {
      this.emit('error', error);
    });

    this.#server.listen(this.#port, () => {
      this.#running = true;
      this.emit('started', this.#port);
      this.#startKeepAlive();
    });

    return true;
  }

  /**
   * Stops the TCP server
   */
  stop(): void {
    if (!this.#running) {
      return;
    }

    this.#stopKeepAlive();

    // Close all client connections
    for (const client of this.#clients.values()) {
      client.socket.destroy();
    }
    this.#clients.clear();

    // Close the server
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

  /**
   * Handles a new client connection
   */
  #handleConnection(socket: net.Socket): void {
    const remoteAddress = socket.remoteAddress ?? 'unknown';
    const client: TcpClient = {
      socket,
      state: 'connected',
      remoteAddress,
      buffer: '',
      connectedAt: new Date(),
      lastActivityAt: new Date(),
    };

    this.#clients.set(socket, client);
    this.emit('client-connected', remoteAddress);

    // Set socket timeout (30 seconds)
    socket.setTimeout(30000);

    // Handle incoming data
    socket.on('data', (data: Buffer) => {
      client.lastActivityAt = new Date();
      this.#handleData(client, data);
    });

    // Handle socket close
    socket.on('close', () => {
      this.#handleDisconnect(client);
    });

    // Handle socket timeout
    socket.on('timeout', () => {
      this.emit('client-timeout', remoteAddress);
      socket.destroy();
    });

    // Handle socket errors
    socket.on('error', (error) => {
      this.emit('client-error', { remoteAddress, error });
    });
  }

  /**
   * Handles client disconnection
   */
  #handleDisconnect(client: TcpClient): void {
    this.#clients.delete(client.socket);

    // Release control if client had control
    if (client.state === 'control-active') {
      printerStateStore.setTcpControlActive(false);
    }

    this.emit('client-disconnected', client.remoteAddress);
  }

  /**
   * Handles incoming data from a client
   */
  #handleData(client: TcpClient, data: Buffer): void {
    // Add incoming data to buffer
    client.buffer += data.toString('utf-8');

    // Process complete lines (commands are terminated by newlines)
    const lines = client.buffer.split('\n');
    client.buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        this.#processCommand(client, trimmed);
      }
    }
  }

  /**
   * Processes a single command from a client
   */
  #processCommand(client: TcpClient, command: string): void {
    this.emit('command-received', { client: client.remoteAddress, command });

    const response = this.#handleCommand(client, command);

    if (response) {
      client.socket.write(response, 'utf-8');
      this.emit('response-sent', { client: client.remoteAddress, response });
    }
  }

  /**
   * Handles a command and returns the response
   */
  #handleCommand(client: TcpClient, command: string): string | null {
    // Handshake commands
    if (command === 'M601') {
      return this.#handleM601(client);
    }

    if (command === 'M602') {
      return this.#handleM602(client);
    }

    // Require control for most commands
    if (client.state !== 'control-active') {
      return ResponseBuilder.controlFailed();
    }

    // Information commands
    if (command === 'M115' || command === '~M115') {
      return this.#handleM115();
    }

    if (command === 'M105' || command === '~M105') {
      return this.#handleM105();
    }

    if (command === 'M119' || command === '~M119') {
      return this.#handleM119();
    }

    if (command === 'M114' || command === '~M114') {
      return this.#handleM114();
    }

    if (command === 'M27' || command === '~M27') {
      return this.#handleM27();
    }

    if (command === 'M661' || command === '~M661') {
      return this.#handleM661();
    }

    if (command.startsWith('M662 ') || command.startsWith('~M662 ')) {
      return this.#handleM662(command);
    }

    // Control commands
    if (command === 'G28' || command === '~G28') {
      return this.#handleG28();
    }

    if (command.startsWith('M23 ')) {
      return this.#handleM23(command);
    }

    if (command === 'M24' || command === '~M24') {
      return this.#handleM24();
    }

    if (command === 'M25' || command === '~M25') {
      return this.#handleM25();
    }

    if (command === 'M26' || command === '~M26') {
      return this.#handleM26();
    }

    if (command.startsWith('M104 ')) {
      return this.#handleM104(command);
    }

    if (command.startsWith('M140 ')) {
      return this.#handleM140(command);
    }

    if (command.startsWith('M146 ')) {
      return this.#handleM146(command);
    }

    // Unknown command - return ok anyway (printer behavior)
    return new ResponseBuilder().cmdReceived(command).build();
  }

  /**
   * M601 - Request control
   */
  #handleM601(client: TcpClient): string {
    if (printerStateStore.state.tcpControlActive) {
      // Another client has control
      return ResponseBuilder.controlFailed();
    }

    client.state = 'control-active';
    printerStateStore.setTcpControlActive(true);
    return new ResponseBuilder().cmdReceived('M601').build() + ResponseBuilder.controlSuccess();
  }

  /**
   * M602 - Release control
   */
  #handleM602(client: TcpClient): string {
    client.state = 'connected';
    printerStateStore.setTcpControlActive(false);
    return new ResponseBuilder().cmdReceived('M602').build() + ResponseBuilder.controlRelease();
  }

  /**
   * M115 - Get printer information
   */
  #handleM115(): string {
    const state = printerStateStore.state;
    const profile = printerStateStore.getProfile();

    return new ResponseBuilder()
      .cmdReceived('M115')
      .addLine(`Machine Type: Flashforge ${profile.name}`)
      .addLine(`Machine Name: ${state.machineName}`)
      .addLine(`Firmware: ${state.firmwareVersion}`)
      .addLine(`SN: ${state.serialNumber}`)
      .addLine(
        `X: ${profile.buildVolume.x} Y: ${profile.buildVolume.y} Z: ${profile.buildVolume.z}`
      )
      .addLine(`Tool Count: ${state.nozzleCount}`)
      .addLine(`Mac Address:${state.macAddress.replace(/:/g, '')}`)
      .build();
  }

  /**
   * M105 - Get temperatures
   */
  #handleM105(): string {
    const temp = printerStateStore.state.temperature;

    return new ResponseBuilder()
      .cmdReceived('M105')
      .addLine(
        `T0:${temp.nozzleCurrent.toFixed(1)}/${temp.nozzleTarget.toFixed(0)} B:${temp.bedCurrent.toFixed(1)}/${temp.bedTarget.toFixed(0)}`
      )
      .build();
  }

  /**
   * M119 - Get endstop and printer status
   */
  #handleM119(): string {
    const state = printerStateStore.state;
    const endstops = state.endstops;

    // Map machine status to protocol value
    const statusMap: Record<string, string> = {
      idle: 'READY',
      ready: 'READY',
      busy: 'BUSY',
      printing: 'BUILDING_FROM_SD',
      paused: 'PAUSED',
      completed: 'BUILDING_COMPLETED',
      heating: 'BUSY',
      error: 'READY',
    };

    const machineStatus = statusMap[state.machineStatus] ?? 'READY';
    const moveMode =
      machineStatus === 'BUSY' || machineStatus === 'BUILDING_FROM_SD' ? 'MOVING' : 'READY';
    const ledValue = state.led.enabled ? 1 : 0;
    const currentFile = state.printJob.currentFile ?? '';

    return new ResponseBuilder()
      .cmdReceived('M119')
      .addLine(`Endstop: X-max: ${endstops.xMax} Y-max: ${endstops.yMax} Z-min: ${endstops.zMin}`)
      .addLine(`MachineStatus: ${machineStatus}`)
      .addLine(`MoveMode: ${moveMode}`)
      .addLine('Status: S:1 L:0 J:0 F:0')
      .addLine(`LED: ${ledValue}`)
      .addLine(`CurrentFile: ${currentFile}`)
      .build();
  }

  /**
   * M114 - Get current position
   */
  #handleM114(): string {
    const pos = printerStateStore.state.position;

    return new ResponseBuilder()
      .cmdReceived('M114')
      .addLine(
        `X:${pos.x.toFixed(3)} Y:${pos.y.toFixed(3)} Z:${pos.z.toFixed(3)} E:${pos.e.toFixed(3)}`
      )
      .build();
  }

  /**
   * M27 - Get print status
   */
  #handleM27(): string {
    const job = printerStateStore.state.printJob;
    const progress = Math.floor(job.progress * 100);

    return new ResponseBuilder()
      .cmdReceived('M27')
      .addLine(`SD printing byte ${progress}/100`)
      .addLine(`Layer: ${job.currentLayer}/${job.totalLayers}`)
      .build();
  }

  /**
   * M661 - Get local file list
   */
  #handleM661(): string {
    const files = printerStateStore.getFiles();
    const fileNames = files.map((f) => `/data/${f.name}`).join('::');

    return new ResponseBuilder().cmdReceived('M661').build() + fileNames;
  }

  /**
   * M662 - Get file thumbnail
   */
  #handleM662(command: string): string {
    // Extract file path from command
    const match = command.match(/M662\s+(.+)/);
    if (!match?.[1]) {
      return ResponseBuilder.error('Invalid M662 command');
    }

    const filePath = match[1].trim();
    const fileName = filePath.replace('/data/', '').replace('/user/', '');
    const file = printerStateStore.getFile(fileName);

    if (!file) {
      return ResponseBuilder.error('File not found');
    }

    // Return empty PNG for now (should be replaced with actual thumbnail)
    return new ResponseBuilder().cmdReceived('M662').build();
  }

  /**
   * G28 - Home axes
   */
  #handleG28(): string {
    printerStateStore.homeAxes('all');
    return new ResponseBuilder().cmdReceived('G28').build();
  }

  /**
   * M23 - Start print job
   */
  #handleM23(command: string): string {
    // Extract file path from command (format: M23 0:{file_path})
    const match = command.match(/M23\s+0:(.+)/);
    if (!match?.[1]) {
      return ResponseBuilder.error('Invalid M23 command');
    }

    const filePath = match[1].trim();
    const fileName = filePath.replace('/data/', '').replace('/user/', '');
    const file = printerStateStore.getFile(fileName);

    if (!file) {
      return ResponseBuilder.error('File not found');
    }

    printerStateStore.startPrint(fileName, file.printTime);
    return new ResponseBuilder().cmdReceived('M23').build();
  }

  /**
   * M24 - Resume print
   */
  #handleM24(): string {
    printerStateStore.resumePrint();
    return new ResponseBuilder().cmdReceived('M24').build();
  }

  /**
   * M25 - Pause print
   */
  #handleM25(): string {
    printerStateStore.pausePrint();
    return new ResponseBuilder().cmdReceived('M25').build();
  }

  /**
   * M26 - Stop print
   */
  #handleM26(): string {
    printerStateStore.stopPrint();
    return new ResponseBuilder().cmdReceived('M26').build();
  }

  /**
   * M104 - Set extruder temperature
   */
  #handleM104(command: string): string {
    const match = command.match(/M104\s+S(\d+)/);
    if (!match?.[1]) {
      return ResponseBuilder.error('Invalid M104 command');
    }

    const temp = Number.parseInt(match[1], 10);
    printerStateStore.setTargetTemperatures(temp, printerStateStore.state.temperature.bedTarget);
    return new ResponseBuilder().cmdReceived('M104').build();
  }

  /**
   * M140 - Set bed temperature
   */
  #handleM140(command: string): string {
    const match = command.match(/M140\s+S(\d+)/);
    if (!match?.[1]) {
      return ResponseBuilder.error('Invalid M140 command');
    }

    const temp = Number.parseInt(match[1], 10);
    printerStateStore.setTargetTemperatures(printerStateStore.state.temperature.nozzleTarget, temp);
    return new ResponseBuilder().cmdReceived('M140').build();
  }

  /**
   * M146 - LED control
   */
  #handleM146(command: string): string {
    // Format: M146 r{red} g{green} b{blue} F{flag}
    const redMatch = command.match(/r(\d+)/);
    const greenMatch = command.match(/g(\d+)/);
    const blueMatch = command.match(/b(\d+)/);

    const red = redMatch?.[1] ? Number.parseInt(redMatch[1], 10) : 0;
    const green = greenMatch?.[1] ? Number.parseInt(greenMatch[1], 10) : 0;
    const blue = blueMatch?.[1] ? Number.parseInt(blueMatch[1], 10) : 0;

    const enabled = red > 0 || green > 0 || blue > 0;
    printerStateStore.updateLed(enabled, red, green, blue);

    return new ResponseBuilder().cmdReceived('M146').build();
  }

  /**
   * Starts the keep-alive mechanism
   * Monitors client connections and disconnects inactive ones
   */
  #startKeepAlive(): void {
    if (this.#keepAliveInterval) {
      return;
    }

    this.#keepAliveInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 60 seconds

      for (const [socket, client] of this.#clients) {
        const inactiveTime = now - client.lastActivityAt.getTime();
        if (inactiveTime > timeout) {
          this.emit('client-timeout', client.remoteAddress);
          socket.destroy();
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Stops the keep-alive mechanism
   */
  #stopKeepAlive(): void {
    if (this.#keepAliveInterval) {
      clearInterval(this.#keepAliveInterval);
      this.#keepAliveInterval = null;
    }
  }
}

/**
 * Global singleton instance
 */
let tcpServerInstance: TcpServer | null = null;

/**
 * Gets or creates the TCP server singleton
 */
export function getTcpServer(port: number, model: PrinterModel): TcpServer {
  if (!tcpServerInstance) {
    tcpServerInstance = new TcpServer(port, model);
  } else {
    tcpServerInstance.updateModel(model);
  }
  return tcpServerInstance;
}

/**
 * Destroys the TCP server singleton
 */
export function destroyTcpServer(): void {
  if (tcpServerInstance) {
    tcpServerInstance.stop();
    tcpServerInstance = null;
  }
}
