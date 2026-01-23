/**
 * @fileoverview
 * Vite environment type definitions
 *
 * Extends the ImportMeta interface to include Vite's env properties.
 *
 * @packageDocumentation
 */

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
