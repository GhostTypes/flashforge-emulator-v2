/**
 * @fileoverview
 * Protocol log store for HTTP, TCP, discovery, and internal emulator events.
 *
 * Keeps a bounded history of real protocol traffic so the renderer can inspect
 * incoming requests and outgoing responses without scraping console output.
 *
 * @packageDocumentation
 */

import { EventEmitter } from 'node:events';
import type { ProtocolLogEntry } from '../../../shared/types/printer';

type ProtocolLogEvent = 'entry-added' | 'cleared';

interface ProtocolLogInput {
  protocol: ProtocolLogEntry['protocol'];
  direction: ProtocolLogEntry['direction'];
  level: ProtocolLogEntry['level'];
  summary: string;
  payload?: unknown;
}

const MAX_LOG_ENTRIES = 1000;

function createLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export class ProtocolLogStore extends EventEmitter {
  #entries: ProtocolLogEntry[] = [];

  get entries(): readonly ProtocolLogEntry[] {
    return this.#entries;
  }

  add(input: ProtocolLogInput): ProtocolLogEntry {
    const entry: ProtocolLogEntry = {
      id: createLogId(),
      timestamp: new Date().toISOString(),
      ...input,
    };

    this.#entries = [...this.#entries.slice(-(MAX_LOG_ENTRIES - 1)), entry];
    this.emit('entry-added', entry);
    return entry;
  }

  clear(): void {
    if (this.#entries.length === 0) {
      return;
    }

    this.#entries = [];
    this.emit('cleared');
  }
}

export const protocolLogStore = new ProtocolLogStore();

export type { ProtocolLogEvent };
