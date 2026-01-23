/**
 * @fileoverview
 * Electron Vite configuration for FlashForge Emulator V2
 *
 * Configures the build process for main, preload, and renderer processes.
 * Integrates React plugin for the renderer.
 *
 * @packageDocumentation
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';
import type { UserConfig } from 'electron-vite';

const rendererConfig: UserConfig = {
  root: '.',
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
      },
    },
  },
  resolve: {
    alias: {
      '@renderer': '/src',
      '@shared': '/shared',
    },
  },
  plugins: [react()],
};

const mainConfig: UserConfig = {
  build: {
    rollupOptions: {
      input: {
        index: './electron/main/index.ts',
      },
    },
  },
  resolve: {
    alias: {
      '@main': '/electron/main',
      '@shared': '/shared',
    },
  },
};

const preloadConfig: UserConfig = {
  build: {
    rollupOptions: {
      input: {
        index: './electron/preload/index.ts',
      },
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      '@preload': '/electron/preload',
      '@shared': '/shared',
    },
  },
};

export default defineConfig({
  main: mainConfig,
  preload: preloadConfig,
  renderer: rendererConfig,
});
