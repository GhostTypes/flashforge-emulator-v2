# FlashForge Emulator V2

A complete Electron-based emulator for FlashForge 3D printers, supporting both legacy TCP and modern HTTP protocols. Allows developers to test FlashForge client applications without physical hardware.

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

## Project Overview

**Purpose**: Emulate FlashForge Adventurer series 3D printers (3, 4, 5M, 5M Pro, AD5X) with full protocol compatibility

**Development Time**: 1h 36m (Jan 22, 2026)

**Tech Stack**: Electron + React 19 + TypeScript + Tailwind CSS v4 + Biome

**Code Quality**: TypeScript strict mode (0 errors), Biome lint (0 errors across 29 files)

## Architecture

### Electron Three-Process Model

```
┌─────────────────────────────────────────────────────────────────┐
│ Main Process (electron/main/)                                  │
│  • Creates windows, manages lifecycle                          │
│  • Runs TCP Server (8899), HTTP Server (8898), UDP Discovery   │
│  • State management via PrinterStateStore                       │
│  • IPC handlers for renderer communication                     │
└─────────────────────────────────────────────────────────────────┘
                              ↕ IPC
┌─────────────────────────────────────────────────────────────────┐
│ Preload Process (electron/preload/)                            │
│  • Secure bridge using contextBridge                            │
│  • Exposes safe APIs to renderer (no direct Node.js access)      │
└─────────────────────────────────────────────────────────────────┘
                              ↕ API
┌─────────────────────────────────────────────────────────────────┐
│ Renderer Process (src/)                                        │
│  • React 19 + Tailwind CSS v4 UI                               │
│  • Real-time state updates via IPC                              │
│  • Tabs: Dashboard, Controls, Files, Logs, Settings             │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
flashforge-emulator-v2/
├── src/                      # React renderer (UI)
│   ├── components/             # UI components
│   ├── hooks/                  # React hooks (useEmulatorState)
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
│
├── electron/                  # Electron main process
│   ├── main/                   # Main process code
│   │   ├── index.ts            # Entry point, window creation
│   │   ├── ipc/                # IPC handlers (StateHandlers)
│   │   ├── services/           # Servers (TCP, HTTP, UDP, Simulation)
│   │   ├── state/              # PrinterStateStore (single source of truth)
│   │   └── utils/              # Network utilities
│   └── preload/                # Preload script (IPC bridge)
│
├── shared/                    # Shared TypeScript types
│   └── types/printer.ts        # ALL type definitions (379 lines)
│
└── ai_reference/              # Production reference implementations
    └── ff-5mp-api-ts/        # FlashForge 5MP API (TypeScript)
```

## Supported Printer Models

| Model | TCP | HTTP | Camera | Material Station | Chamber Temp | Build Volume |
|-------|-----|------|--------|------------------|-------------|--------------|
| Adventurer 3 | ✓ | ✗ | ✗ | ✗ | ✗ | 150×150×150 |
| Adventurer 4 | ✓ | ✗ | ✗ | ✗ | ✗ | 220×220×250 |
| Adventurer 5M | ✓ | ✓ | ✗ | ✗ | ✓ | 220×220×220 |
| Adventurer 5M Pro | ✓ | ✓ | ✓ | ✗ | ✓ | 220×220×220 |
| AD5X | ✓ | ✓ | ✗ | ✓ | ✓ | 220×220×220 |

## Protocol Implementation

### TCP Protocol (Legacy) - Port 8899

**Implemented Commands**:
- `M601/M602` - Request/release control
- `M115` - Printer information
- `M105` - Temperatures
- `M119` - Endstops and status
- `M114` - Position
- `M27` - Print status
- `M661/M662` - File listing/thumbnails
- `G28` - Home axes
- `M23/M24/M25/M26` - Print job control
- `M104/M140/M146` - Temperature/LED control

**File**: `electron/main/services/TcpServer.ts`

### HTTP API (Modern) - Port 8898

**Implemented Endpoints**:
- `POST /detail` - Printer details with 40+ properties
- `POST /product` - Capability flags
- `POST /control` - Control commands (LED, fans, job, etc.)
- `POST /gcodeList` - File listing
- `POST /gcodeThumb` - File thumbnails
- `POST /printGcode` - Start print
- `POST /uploadGcode` - Upload with multipart/form-data

**Authentication**: Requires `serialNumber` and `checkCode` headers

**File**: `electron/main/services/HttpServer.ts`

### UDP Discovery - Port 48899

**Discovery Packet**: 20 bytes starting with `www.usr"` followed by specific bytes

**Response**: 196 bytes with printer name (offset 0x00) and serial (offset 0x92)

**Configurable**: Can bind to specific network interface to avoid duplicate entries

**File**: `electron/main/services/UdpDiscoveryServer.ts`

## State Management

### PrinterStateStore (Single Source of Truth)

Located in `electron/main/state/PrinterStateStore.ts`

**Emulated State**:
- Temperatures (nozzle, bed, chamber with targets)
- Position (X, Y, Z, E)
- Print job (status, progress, layers, file, time)
- Material station (AD5X slots)
- LED (enabled, RGB values)
- Fans (cooling, chamber, external, internal)
- Endstops
- Files list

**Events Emitted**: `state-changed`, `temperature-changed`, `position-changed`, `job-changed`

### Configuration

**Default Config** (`shared/types/printer.ts`):
```typescript
{
  selectedModel: 'adventurer-5m-pro',
  tcpPort: 8899,
  httpPort: 8898,
  serialNumber: 'SNEMULATOR001',
  checkCode: '12345',
  simulationMode: 'auto',
  simulationSpeed: 100,
  autoStart: false,
  discoveryInterface: '',  // Empty = all interfaces
}
```

## UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Dashboard | `src/components/Dashboard.tsx` | Status overview, visual representation |
| PrintControls | `src/components/PrintControls.tsx` | Manual printer operations |
| FileManager | `src/components/FileManager.tsx` | File upload/management |
| Settings | `src/components/Settings.tsx` | Configuration, server controls |
| Logs | `src/components/Logs.tsx` | Real-time event logging |
| Sidebar | `src/components/Sidebar.tsx` | Navigation |

## Development Reference

### Key Types (`shared/types/printer.ts`)

- `PrinterModel` - Supported models union type
- `EmulatorConfig` - Configuration interface
- `PrinterState` - Complete printer state
- `NetworkInterface` - Network interface for discovery
- `PrinterProfile` - Model-specific capabilities

### Services Architecture

All services follow EventEmitter pattern with these standard events:
- `started` - Server started
- `stopped` - Server stopped
- `error` - Error occurred
- Plus service-specific events for data flow

### AI Reference (`ai_reference/`)

Production-grade FlashForge API implementations:
- **ff-5mp-api-ts**: TypeScript client library with UDP discovery, HTTP/TCP clients
- **FlashForgeUI-Electron**: Reference Electron application

**Key Reference Files**:
- `PrinterDiscovery.ts` - UDP discovery implementation
- `FiveMClient.ts` - Modern HTTP API client
- `Endpoints.ts` - All HTTP API endpoints
- `ff-models.ts` - Data type definitions

## Build Configuration

- **Build Tool**: electron-vite
- **Output**:
  - Main: `dist-electron/main/`
  - Preload: `dist-electron/preload/`
  - Renderer: `dist/`
- **Plugins**: React, Tailwind CSS v4 (`@tailwindcss/vite`)
- **Format**: Preload outputs CommonJS (CJS) for sandbox compatibility

## Running the Emulator

1. Start with `npm run dev`
2. Select printer model in Settings
3. Start TCP/HTTP servers (optional - discovery is always on)
4. Configure discovery interface if you have multiple network adapters
5. Connect via FlashFinderUI or FlashForgeUI

**Default Ports**:
- TCP: 8899
- HTTP: 8898
- UDP Discovery: 48899

## Testing with FlashForgeUI/FlashFinderUI

1. **Discovery**: Should appear automatically when scanning network
2. **Connection**: Uses serial number `SNEMULATOR001` and check code `12345`
3. **File Upload**: Supported via HTTP `/uploadGcode` endpoint
4. **Print Control**: Full start/pause/resume/stop control

## Troubleshooting

**Issue**: Multiple printer entries in FlashForgeUI
- **Cause**: Multiple network adapters (Wi-Fi + vEthernet/Hyper-V)
- **Fix**: Select specific interface in Settings > Discovery Interface

**Issue**: TCP/HTTP not connecting
- **Check**: Servers must be started manually in Settings
- **Verification**: Green indicators in header show server status

**Issue**: Discovery not working
- **Verify**: UDP discovery server auto-starts on app launch
- **Check**: Firewall allows port 48899

## Code Quality Standards

- **TypeScript**: Strict mode, no `any` types
- **Linting**: Biome with auto-fix
- **Formatting**: Biome with consistent style
- **File Organization**: Co-located features, clear separation of concerns
- **Documentation**: JSDoc comments on all public APIs
