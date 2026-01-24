---
name: flashforge-ui-reference
description: |
  FlashForgeUI-Electron reference application knowledge. Use when analyzing what
  features the official FlashForge UI expects from printers, which endpoints it
  calls, what state it displays, and model-specific capabilities. Reference for
  gap analysis against the emulator.
---

# FlashForgeUI-Electron Reference

Official FlashForge desktop application reference for understanding what features
real clients expect from printers.

## Architecture Overview

**Three-process Electron model:**
- **Main**: IPC handlers, backend management, server coordination
- **Preload**: Secure IPC bridge (`window.api`)
- **Renderer**: Component-based UI with grid layout

**Key Pattern:** Model-specific backends (Legacy, Adventurer5M, Adventurer5M Pro, AD5X)

## UI Components & Data Requirements

### Core Dashboard Components

| Component | Data Required | Commands Sent |
|-----------|---------------|---------------|
| **PrinterStatus** | `printerStatus.state`, `cumulativeStats` | - |
| **JobInfo** | `currentJob`, `progress`, `thumbnailData` | pause, resume, cancel |
| **TemperatureControls** | `temperatures`, `fans` | set-bed-temp, set-extruder-temp, turn-off-* |
| **ControlsGrid** | `printerStatus.state` (for button enable) | 12 different commands |
| **CameraPreview** | Camera stream URL | stream control |
| **LogPanel** | Event logs | - |
| **MaterialInfo** | `materialStation` (AD5X) | slot operations |

### ControlsGrid Commands (12 buttons)

| Button | Command/Action |
|--------|----------------|
| LED On | `lightControl_cmd` with status="open" |
| LED Off | `lightControl_cmd` with status="close" |
| Clear Status | `stateCtrl_cmd` with action="setClearPlatform" |
| Home Axes | TCP `G28` |
| Pause | `jobCtl_cmd` with action="pause" |
| Resume | `jobCtl_cmd` with action="continue" |
| Stop | `jobCtl_cmd` with action="cancel" |
| Upload Job | File upload dialog |
| Start Recent | Job picker → local file print |
| Start Local | Job picker → local file print |
| Swap Filament | AD5X material swap |
| Send Cmds | Custom G-code dialog |

## HTTP API Usage (Port 8898)

### Endpoints Called by FlashForgeUI

| Endpoint | Purpose | Response Used For |
|----------|---------|-------------------|
| `/detail` | Main polling (40+ properties) | All dashboard components |
| `/product` | Capability detection | Feature availability |
| `/control` | All control commands | Button actions |
| `/gcodeList` | File listing | Job picker, recent jobs |
| `/gcodeThumb` | File thumbnails | Job picker visual preview |
| `/printGcode` | Start print | Starting local jobs |
| `/uploadGcode` | Upload file | Adding new prints |

### Critical `/detail` Properties Used

FlashForgeUI reads these properties from `/detail`:

**Status & State:**
- `status` → Machine state (Ready, Printing, Paused, etc.)
- `printFileName` → Current job name
- `printProgress` → Progress percentage (0.0 - 1.0)

**Temperatures:**
- `rightTemp` / `rightTargetTemp` → Nozzle current/target
- `platTemp` / `platTargetTemp` → Bed current/target
- `chamberTemp` / `chamberTargetTemp` → Chamber (5M Pro/AD5X)

**Fans:**
- `coolingFanSpeed` → Part cooling fan %
- `chamberFanSpeed` → Chamber fan %
- `coolingLeftFanSpeed` → Left fan (AD5X)

**Time & Progress:**
- `printDuration` → Current print time (seconds)
- `estimatedTime` → Time remaining (seconds)
- `printLayer` / `targetPrintLayer` → Layer progress
- `cumulativePrintTime` → Lifetime total (seconds)
- `cumulativeFilament` → Lifetime filament (meters)

**States (string "open"/"close"):**
- `lightStatus` → LED state
- `internalFanStatus` / `externalFanStatus` → Filtration
- `doorStatus` → Door sensor

**Printer Info:**
- `name`, `firmwareVersion`, `macAddr`, `ipAddr`
- `nozzleModel` → Nozzle size
- `rightFilamentType` → Current material

**AD5X Only:**
- `hasMatlStation` → Material station present
- `matlStationInfo` → Slot details
- `hasLeftFilament` / `hasRightFilament` → Filament detection

**5M Pro Only:**
- `cameraStreamUrl` → Camera address

## TCP Commands Used

| Command | Purpose |
|---------|---------|
| `M601` | Request control |
| `M602` | Release control |
| `M115` | Printer info (model, firmware) |
| `M105` | Temperature query |
| `M119` | Endstop/status |
| `M27` | Print status (layer, byte progress) |
| `M114` | Position (XYZ) |
| `M661` | File list |
| `M662` | Thumbnail (PNG) |
| `G28` | Home axes |
| `M23` | Start print |
| `M24/M25/M26` | Resume/Pause/Stop |
| `M146` | LED control |
| `M104/M140` | Temperature control |

## Model-Specific Features

### Adventurer 5M Pro
- **Camera**: Built-in (RTSP/MJPEG), `cameraStreamUrl` in `/detail`
- **LED**: Built-in, `lightStatus` in `/detail`
- **Filtration**: Built-in, `internalFanStatus`/`externalFanStatus`
- **Chamber Temp**: `chamberTemp`/`chamberTargetTemp`

### AD5X
- **Material Station**: `matlStationInfo` with 4 slots
- **No Camera**: Custom URL only
- **Custom LED**: No built-in LED
- **No Filtration**: `internalFanStatus` = "close" always
- **Multi-color**: `materialMappings` for print jobs

### Legacy (Adventurer 3/4)
- TCP only, no HTTP API
- Basic features only
- No camera, LED, filtration, or material station

## IPC Channels Used

**Polling:**
- `get-printer-status` → Returns full printer state
- `get-local-jobs` → File list via TCP
- `get-recent-jobs` → Recent files via HTTP

**Control:**
- `set-bed-temp` / `set-extruder-temp`
- `turn-off-bed-temp` / `turn-off-extruder-temp`
- `pause-print` / `resume-print` / `cancel-print`
- `home-axes`
- `led-on` / `led-off`
- `clear-status`
- `turn-on-filtration` / `turn-off-filtration`

**Job:**
- `job-picker:show` → Open job picker dialog
- `job-picker:start-local` → Start selected file
- `job-picker:start-recent` → Start recent job

**Material (AD5X):**
- `material-station:get-info` → Get slot status
- `material-station:swap` → Swap filament

## State Management Pattern

```
Polling (1s interval)
    ↓
Printer Backend (FiveMClient/FlashForgeClient)
    ↓
PrinterStateStore (single source of truth)
    ↓
IPC to Renderer
    ↓
Component Updates (all dashboard components)
```

## Key Gap Analysis Areas

When comparing against emulator, check:

1. **`/detail` completeness** - Are all 40+ properties present?
2. **`/product` flags** - Are capability flags correct?
3. **`/control` commands** - Do all 12 control commands work?
4. **File operations** - Do list/thumb/upload work?
5. **Model detection** - Does IsPro/IsAD5X match actual capabilities?
6. **Polling updates** - Does state refresh properly?
7. **AD5X material station** - Is `matlStationInfo` complete?
8. **Camera stream** - Does `cameraStreamUrl` work for Pro?
9. **Filtration state** - Are fan states correct?
10. **Cumulative stats** - Do lifetime counters work?

## Common Client Expectations

1. **`/detail` polling every 1-2 seconds** - State must stay fresh
2. **`status` enum values** - Must match expected strings
3. **Progress as 0.0-1.0** - Not 0-100
4. **Temperature pairs** - Both current AND target required
5. **Boolean states** - "open"/"close" strings, not true/false
6. **Layer numbers** - Both current AND total required
7. **Time in seconds** - Durations and estimates
8. **File paths** - Should include `/data/` prefix for consistency
