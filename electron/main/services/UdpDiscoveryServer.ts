/**
 * @fileoverview
 * UDP Discovery Server for FlashForge printer emulation
 *
 * Implements the printer discovery protocols.
 * Supports Modern (multicast 19000 & broadcast 48899) and Legacy (multicast 8899).
 *
 * @packageDocumentation
 */

import * as dgram from 'node:dgram';
import { EventEmitter } from 'node:events';
import type { DiscoveryConfig, PrinterModel, PrinterState } from '../../../shared/types/printer';
import { PRINTER_PROFILES } from '../../../shared/types/printer';
import { printerStateStore } from '../state/PrinterStateStore';
import { protocolLogStore } from '../state/ProtocolLogStore';

/**
 * Creates the modern discovery response buffer (276 bytes)
 */
function createModernResponse(state: PrinterState, overrides: DiscoveryConfig): Buffer {
  const RESPONSE_SIZE = 276;
  const response = Buffer.alloc(RESPONSE_SIZE);

  const nameToUse = overrides.machineName || state.machineName;
  const nameBytes = Buffer.from(nameToUse, 'ascii');
  nameBytes.copy(response, 0, 0, Math.min(nameBytes.length, 132));

  response.writeUInt16BE(overrides.commandPort, 0x84);
  response.writeUInt16BE(overrides.vid, 0x86);
  response.writeUInt16BE(overrides.pid, 0x88);
  response.writeUInt16BE(0, 0x8a); // Reserved
  response.writeUInt16BE(overrides.productType, 0x8c);
  response.writeUInt16BE(overrides.httpPort, 0x8e);
  response.writeUInt16BE(overrides.status, 0x90);

  const serialBytes = Buffer.from(state.serialNumber, 'ascii');
  serialBytes.copy(response, 0x92, 0, Math.min(serialBytes.length, 130));

  return response;
}

/**
 * Creates the legacy discovery response buffer (140 bytes)
 */
function createLegacyResponse(state: PrinterState, overrides: DiscoveryConfig): Buffer {
  const RESPONSE_SIZE = 140;
  const response = Buffer.alloc(RESPONSE_SIZE);

  const nameToUse = overrides.machineName || state.machineName;
  const nameBytes = Buffer.from(nameToUse, 'ascii');
  nameBytes.copy(response, 0, 0, Math.min(nameBytes.length, 128));

  response.writeUInt16BE(overrides.status, 0x80);
  response.writeUInt16BE(overrides.commandPort, 0x82);
  response.writeUInt16BE(overrides.legacyPort2, 0x84);
  response.writeUInt16BE(overrides.httpPort, 0x86);

  return response;
}

/**
 * UDP Discovery Server for FlashForge printer emulation
 */
export class UdpDiscoveryServer extends EventEmitter {
  /** UDP socket instances */
  #sockets: dgram.Socket[] = [];
  /** Whether the server is running */
  #running = false;
  /** Whether startup is in progress */
  #startupInProgress = false;
  /** Number of sockets expected for the selected discovery mode */
  #expectedSocketCount = 0;
  /** Number of sockets that have fully bound/listened */
  #listeningSocketCount = 0;
  /** Current printer model */
  #model: PrinterModel;
  /** Bind address for the discovery server (empty = all interfaces) */
  #bindAddress = '';

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
   * Gets the current bind address
   */
  get bindAddress(): string {
    return this.#bindAddress;
  }

  constructor(model: PrinterModel) {
    super();
    this.#model = model;
  }

  /**
   * Starts the UDP discovery server
   */
  start(): boolean {
    if (this.#running || this.#startupInProgress) {
      return true;
    }

    try {
      const state = printerStateStore.state;
      const mode = state.protocolMode;

      this.#startupInProgress = true;
      this.#listeningSocketCount = 0;
      this.#expectedSocketCount = mode === 'modern' ? 2 : 1;

      if (mode === 'modern') {
        this.#createSocket(48899, false); // broadcast
        this.#createSocket(19000, true); // multicast
      } else {
        this.#createSocket(8899, true); // multicast
      }
      return true;
    } catch (error) {
      this.#startupInProgress = false;
      this.#expectedSocketCount = 0;
      this.#listeningSocketCount = 0;
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Stops the UDP discovery server
   */
  stop(): void {
    if (!this.#running && !this.#startupInProgress) {
      return;
    }

    this.#startupInProgress = false;

    for (const socket of this.#sockets) {
      try {
        socket.close();
      } catch {
        // Ignore close errors
      }
    }
    this.#sockets = [];
    this.#expectedSocketCount = 0;
    this.#listeningSocketCount = 0;
    this.#running = false;
    this.emit('stopped');
  }

  /**
   * Helper to create, bind, and config a UDP socket
   */
  #createSocket(port: number, isMulticast: boolean): void {
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    this.#sockets.push(socket);

    socket.on('error', (error) => {
      if (this.#startupInProgress && !this.#running) {
        this.#abortStartup(error);
        return;
      }
      this.emit('error', error);
    });

    socket.on('message', (buffer, rinfo) => {
      this.#handleDiscovery(buffer, rinfo, socket);
    });

    socket.on('listening', () => {
      try {
        if (!isMulticast) {
          socket.setBroadcast(true);
        } else {
          const bindAddressAttr = this.#bindAddress || undefined;
          if (bindAddressAttr) {
            socket.addMembership('225.0.0.9', bindAddressAttr);
          } else {
            socket.addMembership('225.0.0.9');
          }
        }
      } catch (err) {
        const error = new Error(
          `Failed to configure connection for port ${port}: ${err instanceof Error ? err.message : String(err)}`
        );
        if (this.#startupInProgress && !this.#running) {
          this.#abortStartup(error);
          return;
        }
        this.emit('error', error);
        return;
      }

      this.#markSocketListening();
    });

    const bindAddress = this.#bindAddress || undefined;
    socket.bind({ port, address: bindAddress });
  }

  #markSocketListening(): void {
    this.#listeningSocketCount += 1;

    if (
      this.#startupInProgress &&
      this.#expectedSocketCount > 0 &&
      this.#listeningSocketCount >= this.#expectedSocketCount
    ) {
      this.#startupInProgress = false;
      this.#running = true;
      this.emit('started');
    }
  }

  #abortStartup(error: Error): void {
    this.#startupInProgress = false;

    for (const socket of this.#sockets) {
      try {
        socket.close();
      } catch {
        // Ignore close errors while aborting startup
      }
    }

    this.#sockets = [];
    this.#running = false;
    this.#expectedSocketCount = 0;
    this.#listeningSocketCount = 0;
    this.emit('error', error);
  }

  /**
   * Updates the printer model
   */
  updateModel(model: PrinterModel): void {
    const currentMode = PRINTER_PROFILES[this.#model]?.protocolMode;
    const newMode = PRINTER_PROFILES[model]?.protocolMode;

    this.#model = model;

    // If the required discovery protocol mode differs, restart the server
    if ((this.#running || this.#startupInProgress) && currentMode !== newMode) {
      this.stop();
      this.start();
    }
  }

  /**
   * Updates the bind address and restarts the server if running
   */
  updateBindAddress(address: string): void {
    const oldAddress = this.#bindAddress;
    this.#bindAddress = address;

    // Restart server if address changed and server is running
    if (oldAddress !== address && (this.#running || this.#startupInProgress)) {
      this.stop();
      this.start();
    }
  }

  /**
   * Handles incoming discovery packets
   */
  #handleDiscovery(buffer: Buffer, rinfo: dgram.RemoteInfo, originSocket: dgram.Socket): void {
    // Ignore empty/meaningless noise
    if (!buffer || buffer.length === 0) {
      return;
    }

    // According to unified implementation spec, probe payload is ignored (any UDP packet works)
    // No longer strictly validating 'www.usr' to ensure full client compatibility

    this.emit('discovery-request', {
      remoteAddress: rinfo.address,
      remotePort: rinfo.port,
      size: buffer.length,
    });
    protocolLogStore.add({
      protocol: 'discovery',
      direction: 'incoming',
      level: 'info',
      summary: `Discovery probe from ${rinfo.address}:${rinfo.port}`,
      payload: {
        remoteAddress: rinfo.address,
        remotePort: rinfo.port,
        size: buffer.length,
        hexPreview: buffer.toString('hex').slice(0, 80),
      },
    });

    const state = printerStateStore.state;
    const config = printerStateStore.config;

    let response: Buffer;

    if (state.protocolMode === 'legacy') {
      response = createLegacyResponse(state, config.discoveryConfig);
    } else {
      response = createModernResponse(state, config.discoveryConfig);
    }

    // Typical clients (like FlashForgeUI) listen on port 18007 for responses
    const responsePort = 18007;

    originSocket.send(response, responsePort, rinfo.address, (error) => {
      if (error) {
        this.emit('send-error', {
          remoteAddress: rinfo.address,
          error,
        });
        protocolLogStore.add({
          protocol: 'discovery',
          direction: 'outgoing',
          level: 'error',
          summary: `Discovery response failed: ${rinfo.address}:${responsePort}`,
          payload: { error: error.message },
        });
      } else {
        this.emit('discovery-response', {
          remoteAddress: rinfo.address,
          printerName: config.discoveryConfig.machineName || state.machineName,
          serialNumber: state.serialNumber,
          mode: state.protocolMode,
        });
        protocolLogStore.add({
          protocol: 'discovery',
          direction: 'outgoing',
          level: 'info',
          summary: `Discovery response to ${rinfo.address}:${responsePort}`,
          payload: {
            printerName: config.discoveryConfig.machineName || state.machineName,
            serialNumber: state.serialNumber,
            mode: state.protocolMode,
            size: response.byteLength,
          },
        });
      }
    });
  }
}

/**
 * Global singleton instance
 */
let udpDiscoveryServerInstance: UdpDiscoveryServer | null = null;

/**
 * Gets or creates the UDP discovery server singleton
 */
export function getUdpDiscoveryServer(model: PrinterModel): UdpDiscoveryServer {
  if (!udpDiscoveryServerInstance) {
    udpDiscoveryServerInstance = new UdpDiscoveryServer(model);
  } else {
    udpDiscoveryServerInstance.updateModel(model);
  }
  return udpDiscoveryServerInstance;
}

/**
 * Destroys the UDP discovery server singleton
 */
export function destroyUdpDiscoveryServer(): void {
  if (udpDiscoveryServerInstance) {
    udpDiscoveryServerInstance.stop();
    udpDiscoveryServerInstance = null;
  }
}
