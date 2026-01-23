/**
 * @fileoverview
 * Global type definitions for the renderer process
 *
 * Extends the Window interface to include the exposed API from the preload script.
 *
 * @packageDocumentation
 */

import type { EmulatorApi } from '@preload/index';

declare global {
  interface Window {
    readonly api: EmulatorApi;
  }
}
