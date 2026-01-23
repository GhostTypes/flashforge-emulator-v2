/**
 * @fileoverview
 * UDP Discovery Server for FlashForge printer emulation
 *
 * Implements the printer discovery protocol on port 48899.
 * Responds to UDP broadcast discovery packets from FlashFinderUI.
 *
 * @packageDocumentation
 */

import * as dgram from 'node:dgram';
import { EventEmitter } from 'node:events';
import type { PrinterModel } from '../../../shared/types/printer';
import { printerStateStore } from '../state/PrinterStateStore';

/**
 * The UDP port for receiving discovery packets
 * FlashFinderUI sends broadcasts to this port
 */
const DISCOVERY_PORT = 48899;

/**
 * The discovery packet pattern (first 8 bytes)
 * This is "www.usr" in ASCII followed by specific bytes
 */
const DISCOVERY_PACKET_PATTERN = Buffer.from([
  0x77, 0x77, 0x77, 0x2e, 0x75, 0x73, 0x72, 0x22, 0x65, 0x36, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
]);

/**
 * Creates the discovery response buffer
 * Returns a 196-byte (0xC4) buffer with printer information
 *
 * Response format:
 * - Offset 0x00 (0-31): Printer name (32 bytes, ASCII, null-padded)
 * - Offset 0x20-0x91: Unknown/reserved data
 * - Offset 0x92 (146-177): Serial number (32 bytes, ASCII, null-padded)
 * - Remaining bytes: Additional data
 */
function createDiscoveryResponse(printerName: string, serialNumber: string): Buffer {
  const RESPONSE_SIZE = 0xc4; // 196 bytes
  const response = Buffer.alloc(RESPONSE_SIZE);

  // Write printer name at offset 0x00 (32 bytes)
  const nameBytes = Buffer.from(printerName, 'ascii');
  const nameEnd = Math.min(nameBytes.length, 32);
  nameBytes.copy(response, 0, 0, nameEnd);

  // Write serial number at offset 0x92 (32 bytes)
  const serialBytes = Buffer.from(serialNumber, 'ascii');
  const serialEnd = Math.min(serialBytes.length, 32);
  serialBytes.copy(response, 0x92, 0, serialEnd);

  // The rest of the buffer contains additional printer information
  // For now, we keep it minimal to enable discovery

  return response;
}

/**
 * UDP Discovery Server for FlashForge printer emulation
 *
 * Listens on port 48899 for discovery packets and responds
 * with printer information to enable FlashFinderUI to find the printer.
 */
export class UdpDiscoveryServer extends EventEmitter {
  /** UDP socket instance */
  #socket: dgram.Socket | null = null;
  /** Port number for the discovery server */
  #port: number;
  /** Whether the server is running */
  #running = false;
  /** Current printer model */
  #model: PrinterModel;
  /** Bind address for the discovery server (empty = all interfaces) */
  #bindAddress = '';

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
   * Gets the current bind address
   */
  get bindAddress(): string {
    return this.#bindAddress;
  }

  constructor(model: PrinterModel) {
    super();
    this.#port = DISCOVERY_PORT;
    this.#model = model;
  }

  /**
   * Starts the UDP discovery server
   */
  start(): boolean {
    if (this.#running) {
      return true;
    }

    try {
      this.#socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      this.#socket.on('error', (error) => {
        this.emit('error', error);
      });

      this.#socket.on('message', (buffer, rinfo) => {
        this.#handleDiscovery(buffer, rinfo);
      });

      this.#socket.on('listening', () => {
        // Enable broadcast to receive broadcast messages
        this.#socket?.setBroadcast(true);
        this.#running = true;
        this.emit('started', this.#port);
      });

      // Bind to the discovery port on the configured address
      // Empty address means bind to all interfaces (0.0.0.0)
      const bindAddress = this.#bindAddress || undefined;
      this.#socket.bind({ port: this.#port, address: bindAddress });

      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Stops the UDP discovery server
   */
  stop(): void {
    if (!this.#running || !this.#socket) {
      return;
    }

    this.#socket.close();
    this.#socket = null;
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
   * Updates the bind address and restarts the server if running
   */
  updateBindAddress(address: string): void {
    const oldAddress = this.#bindAddress;
    this.#bindAddress = address;

    // Restart server if address changed and server is running
    if (oldAddress !== address && this.#running) {
      this.stop();
      this.start();
    }
  }

  /**
   * Handles incoming discovery packets
   *
   * When a valid discovery packet is received, sends a response
   * with printer information back to the sender.
   */
  #handleDiscovery(buffer: Buffer, rinfo: dgram.RemoteInfo): void {
    // Check if this is a valid discovery packet
    // The discovery packet is 20 bytes starting with "www.usr"
    if (buffer.length < 20) {
      return;
    }

    // Compare first 20 bytes with the discovery pattern
    let isValidDiscovery = true;
    for (let i = 0; i < DISCOVERY_PACKET_PATTERN.length; i++) {
      if (buffer[i] !== DISCOVERY_PACKET_PATTERN[i]) {
        isValidDiscovery = false;
        break;
      }
    }

    if (!isValidDiscovery) {
      return;
    }

    this.emit('discovery-request', {
      remoteAddress: rinfo.address,
      remotePort: rinfo.port,
    });

    // Get printer information
    const state = printerStateStore.state;
    const profile = printerStateStore.getProfile();

    // Create and send discovery response
    const response = createDiscoveryResponse(profile.name, state.serialNumber);

    // Send response back to the sender
    // The client typically listens on port 18007 for responses
    const responsePort = 18007;

    if (this.#socket) {
      this.#socket.send(response, responsePort, rinfo.address, (error) => {
        if (error) {
          this.emit('send-error', {
            remoteAddress: rinfo.address,
            error,
          });
        } else {
          this.emit('discovery-response', {
            remoteAddress: rinfo.address,
            printerName: profile.name,
            serialNumber: state.serialNumber,
          });
        }
      });
    }
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
