---
name: electron-vite
description: Build Electron apps with Vite. Use when creating, configuring, or troubleshooting Electron + Vite applications, including setup, hot reload, HMR, packaging, and integrating React/Vue with electron-vite. Covers electron-builder configuration, C/C++ addons, dependency pre-bundling, debugging, and all electron-vite plugins.
---

# Electron Vite

Electron⚡️Vite is the easiest way to turn a Vite App into an Electron App. It provides the best practice integration between Electron and Vite, with out-of-the-box support for hot restart, HMR, and full Node.js API access.

## Quick Start

### Create a New Project

```bash
# Method 1: Using create-electron-vite (recommended)
npm create electron-vite@latest my-app

# Method 2: Using Vite's create command
npm create vite@latest my-app
# Select "Others" → "create-electron-vite"
# Choose Vue, React, or Vanilla
```

### Manual Setup

```bash
npm install -D vite vite-plugin-electron vite-plugin-electron-renderer
```

```ts
// vite.config.ts
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default {
  plugins: [
    electron({
      entry: 'electron/main.ts',
    }),
    renderer(),
  ],
}
```

```ts
// electron/main.ts
import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
  const win = new BrowserWindow({
    title: 'Main window',
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile('dist/index.html')
  }
})
```

## Core Features

### Hot Restart (Main Process)

Automatically restarts Electron when main process code changes:

```ts
// vite.config.ts
import electron from 'vite-plugin-electron'

export default {
  plugins: [
    electron({
      entry: 'electron/main.ts',
      onstart({ startup }) {
        // Custom logic before/after restart
        startup()
      },
    }),
  ],
}
```

### HMR (Renderer Process)

Based on Vite's built-in HMR. Enable with `VITE_DEV_SERVER_URL`:

```ts
// electron/main.ts
if (process.env.VITE_DEV_SERVER_URL) {
  win.loadURL(process.env.VITE_DEV_SERVER_URL)
}
```

### Hot Reload (Preload Scripts)

Refresh renderer when preload scripts change:

```ts
// vite.config.ts
import electron from 'vite-plugin-electron'

export default {
  plugins: [
    electron([
      {
        entry: 'electron/main/index.ts',
      },
      {
        entry: 'electron/preload/index.ts',
        onstart({ reload }) {
          // Reload instead of restart
          reload()
        },
      },
    ]),
  ],
}
```

## Using React with Vite

### Create React + Vite Project

```bash
npm create vite@latest my-app --template react
cd my-app
npm install
```

### Add Electron to React Vite App

```bash
npm install -D vite-plugin-electron vite-plugin-electron-renderer electron
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart({ reload }) {
          reload()
        },
      },
    ]),
    renderer(),
  ],
})
```

For detailed React + Vite setup, see `references/README.md` and `references/vite-guide/`.

## Configuration

### vite-plugin-electron Options

```ts
electron({
  // Main process entry
  entry: 'electron/main.ts' | string[] | { [name: string]: string },

  // Lifecycle hooks
  onstart({ startup, reload }) {
    // startup() - start Electron app
    // reload() - reload renderer process
  },

  // Vite config overrides
  vite: {
    build: {
      rollupOptions: {
        // External C/C++ addons
        external: ['better-sqlite3', 'sqlite3'],
      },
    },
  },
})
```

### Using Node.js APIs in Renderer

Enable `nodeIntegration` and use `vite-plugin-electron-renderer`:

```ts
// electron/main.ts
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
})
```

```ts
// In renderer
import { readFileSync } from 'node:fs'
import { ipcRenderer } from 'electron'
```

### C/C++ Native Addons

Externalize from bundling:

```ts
// vite.config.ts
export default {
  plugins: [
    electron({
      entry: 'electron/main.ts',
      vite: {
        build: {
          rollupOptions: {
            external: ['better-sqlite3', 'sqlite3', 'serialport'],
          },
        },
      },
    }),
  ],
}
```

For native addon pre-bundling in renderer, use `vite-plugin-electron-renderer`:

```ts
import renderer from 'vite-plugin-electron-renderer'

export default {
  plugins: [
    renderer({
      resolve: {
        // C/C++ addons
        sqlite3: { type: 'cjs' },
        // ESM packages
        'node-fetch': { type: 'esm' },
      },
    }),
  ],
}
```

See `references/electron-vite-guide/cpp-addons.md` and `references/electron-vite-guide/dependency-pre-bundling.md`.

## Debugging

### VSCode Debug Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

### Pass Debug Args

```ts
// vite.config.ts
electron({
  entry: 'electron/main.ts',
  onstart({ startup }) {
    startup([
      '.',
      '--no-sandbox',
      '--sourcemap',
      '--remote-debugging-port=9222',
    ])
  },
})
```

## Packaging with electron-builder

### electron-builder.json5

```json5
{
  "appId": "com.example.myapp",
  "productName": "MyApp",
  "directories": {
    "output": "release/${version}"
  },
  "files": [
    "dist",
    "dist-electron"
  ],
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ]
  },
  "mac": {
    "target": ["dmg"]
  },
  "linux": {
    "target": ["AppImage"]
  }
}
```

### Build Scripts

```json
{
  "scripts": {
    "build": "vite build && electron-builder"
  }
}
```

See `references/electron-vite-guide/electron-builder.md` for complete configuration.

## Environment Variables

Use Vite env variables across all processes:

```properties
# .env
VITE_API_URL=https://api.example.com
```

```ts
// Available in main, preload, and renderer
import.meta.env.VITE_API_URL
```

See `references/electron-vite-guide/env-variables.md`.

## Advanced

### Not Bundle (Development Speed)

Exclude CJS modules from bundling in dev:

```ts
import { notBundle } from 'vite-plugin-electron/plugin'

export default defineConfig(({ command }) => ({
  plugins: [
    electron({
      entry: 'electron/main.ts',
      vite: {
        plugins: [
          command === 'serve' && notBundle(),
        ],
      },
    }),
  ],
}))
```

### Preload Scripts Code Splitting

Prevent code splitting for preload scripts (required when `nodeIntegration: false`):

```ts
electron({
  entry: 'electron/preload/index.ts',
  vite: {
    build: {
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  },
})
```

### Static Resources

- **Service process files**: Use `extraFiles` in `electron-builder.json5`
- **Renderer files**: Place in `public/` directory

See `references/electron-vite-guide/static-resource.md`.

## Templates

For quick-start templates with debug integration:

```bash
# Vue template
git clone https://github.com/electron-vite/electron-vite-vue.git

# React template
git clone https://github.com/electron-vite/electron-vite-react.git
```

See `references/electron-vite-guide/templates.md`.

## References

### electron-vite Documentation

- `references/electron-vite-guide/getting-started.md` - Project setup and overview
- `references/electron-vite-guide/features.md` - Hot restart, HMR, hot reload details
- `references/electron-vite-guide/core-plugins.md` - vite-plugin-electron, vite-plugin-electron-renderer, vite-plugin-electron/simple
- `references/electron-vite-guide/why-electron-vite.md` - Feature comparison and benefits
- `references/electron-vite-guide/templates.md` - Official Vue and React templates
- `references/electron-vite-guide/examples.md` - Community samples including C/C++ addons
- `references/electron-vite-guide/env-variables.md` - Environment variable usage
- `references/electron-vite-guide/dependency-pre-bundling.md` - Pre-bundling for ESM/CJS packages
- `references/electron-vite-guide/cpp-addons.md` - C/C++ native addon configuration
- `references/electron-vite-guide/static-resource.md` - Static asset packaging
- `references/electron-vite-guide/not-bundle.md` - Development speed optimization
- `references/electron-vite-guide/preload-not-split.md` - Preload script configuration
- `references/electron-vite-guide/electron-builder.md` - Packaging configuration

### FAQ

- `references/electron-vite-faq/debug.md` - Debugging configuration
- `references/electron-vite-faq/dependencies.md` - dependencies vs devDependencies

### Vite + React

- `references/README.md` - React + Vite template README
- `references/vite-guide/index.md` - Vite getting started guide
- `references/vite-guide/features.md` - Vite features (HMR, TypeScript, JSX, CSS, assets)

## Project Structure

```
my-electron-app/
├── electron/
│   ├── main.ts           # Main process entry
│   └── preload.ts        # Preload scripts
├── src/                  # Renderer source (React/Vue/JS)
├── public/               # Static assets
├── index.html            # Entry HTML
├── vite.config.ts        # Vite config
├── electron-builder.json5
└── package.json
```

## Common Issues

**C/C++ addon not working**: Add to `external` in main process config or use `resolve: { type: 'cjs' }` in renderer.

**Preload script fails with `nodeIntegration: false`**: Set `inlineDynamicImports: true` in preload's rollup options.

**HMR not working**: Ensure `VITE_DEV_SERVER_URL` is passed to `win.loadURL()` in main process.

**Build fails on C/C++ addons**: Place addon in `dependencies` (not `devDependencies`) for electron-builder builds.
