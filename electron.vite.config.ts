/**
 * @fileoverview
 * Electron Vite configuration for FlashForge Emulator V2
 *
 * Configures the build process for main, preload, and renderer processes.
 * Integrates React plugin for the renderer.
 *
 * @packageDocumentation
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';
import type { UserConfig } from 'electron-vite';

const rendererConfig: UserConfig = {
  root: '.',
  build: {
    outDir: './dist',
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
  plugins: [react(), tailwindcss()],
};

const mainConfig: UserConfig = {
  build: {
    outDir: './dist-electron/main',
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
    outDir: './dist-electron/preload',
    rollupOptions: {
      input: {
        index: './electron/preload/index.ts',
      },
      output: {
        inlineDynamicImports: true,
        format: 'cjs',
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
