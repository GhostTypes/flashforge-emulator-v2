# FF-5MP API - TCP Client Reference

## Overview

The TCP API client (`FlashForgeClient`) provides control of FlashForge printers via the legacy G-code protocol on port 8899.

## Connection Architecture

```
FlashForgeTcpClient (base)
    └── FlashForgeClient (high-level)
            └── GCodeController (commands)
            └── Response Parsers (M115, M105, M119, etc.)
```

## Connection Handshake

```
1. Connect to port 8899
2. Send: ~M601 S1
   → "CMD M601 Received."
   → "Control Success V2.1."
   → "ok"
3. Keep-alive: Send ~M27 every 5 seconds
4. Disconnect: Send ~M602 before closing
```

**Critical**: Always send M602 before closing, or next connection fails.

## Socket Management

- **Default timeout**: 5 seconds
- **Keep-alive interval**: 5 seconds (increases with errors)
- **Max wait for socket**: 10 seconds
- **Auto-reconnect**: On null/destroyed socket

## G/M-Code Commands

### Control Commands

| Command | Code | Description |
|---------|------|-------------|
| Login | `~M601 S1` | Request control |
| Logout | `~M602` | Release control |
| Emergency Stop | `~M112` | Halt all activity |

### Status Commands

| Command | Code | Response | Parser |
|---------|------|----------|--------|
| Printer Info | `~M115` | Machine details | PrinterInfo |
| Temperature | `~M105` | Temps (current/target) | TempInfo |
| Endstop | `~M119` | Endstops + state | EndstopStatus |
| Print Status | `~M27` | Job progress | PrintStatus |
| Position | `~M114` | XYZ coordinates | LocationInfo |
| File List | `~M661` | Local files | Special parsing |
| Thumbnail | `~M662 /data/file.gcode` | PNG image | Binary parsing |

### Job Control

| Command | Code | Description |
|---------|------|-------------|
| Start Print | `~M23 0:/user/filename.gcode` | Select file for printing |
| Resume | `~M24` | Resume paused print |
| Pause | `~M25` | Pause current print |
| Stop | `~M26` | Cancel print |

### Temperature

| Command | Code | Description |
|---------|------|-------------|
| Set Nozzle | `~M104 S210` | Set nozzle to 210°C |
| Set Bed | `~M140 S60` | Set bed to 60°C |
| Wait Nozzle | `~M109 S210` | Wait for nozzle temp |
| Wait Bed | `~M190 S60` | Wait for bed temp |

### Movement

| Command | Code | Description |
|---------|------|-------------|
| Home All | `~G28` | Home XYZ axes |
| Move | `~G1 X10 Y20 Z5 F3000` | Move to position |
| Extrude | `~G1 E50 F450` | Extrude 50mm |

### LED Control

| Command | Code | Description |
|---------|------|-------------|
| LED On | `~M146 r255 g255 b255 F0` | White (on) |
| LED Off | `~M146 r0 g0 b0 F0` | Off |

### Filament Runout (5M Pro only)

| Command | Code | Description |
|---------|------|-------------|
| Enable | `~M405` | Turn on sensor |
| Disable | `~M406` | Turn off sensor |

## Special Response Handling

### M661 File List

**Unique**: Data sent **after** `ok` response.

**Parsing**:
1. Response split by `::`
2. Extract segments containing `/data/`
3. Remove `/data/` prefix
4. Trim at first invalid character

**Example response segment**:
```
::��#/data/Mason Jar.3mf::��/data/test.gcode::��
```

### M662 Thumbnail

**Unique**: Binary PNG sent **after** `ok` response.

**Parsing**:
1. Wait 1.5 seconds after receiving `ok`
2. Search for PNG signature: `0x89 50 4E 47 0D 0A 1A 0A`
3. Extract binary data

## Response Parsers

### PrinterInfo (M115)

```
CMD M115 Received.
Machine Type: Flashforge Adventurer 5M Pro
Machine Name: Adventurer 5M Pro
Firmware: v3.1.5
SN: SNMOMC9900728
X: 220 Y: 220 Z: 220
Tool Count: 1
Mac Address:88:A9:A7:97:B2:BF
ok
```

### TempInfo (M105)

**New format**:
```
T0:17.9/0.0 T1:0.0/0.0 B:18.5/0.0
```

**Old format**:
```
T0:22 /0 B:11/0
```

### EndstopStatus (M119)

```
CMD M119 Received.
Endstop: X-max: 110 Y-max: 110 Z-min: 0
MachineStatus: READY
MoveMode: READY
Status: S:1 L:0 J:0 F:0
LED: 1
CurrentFile:
ok
```

**MachineStatus**: BUILDING_FROM_SD, BUILDING_COMPLETED, PAUSED, READY, BUSY
**MoveMode**: MOVING, PAUSED, READY, WAIT_ON_TOOL, HOMING

### PrintStatus (M27)

```
CMD M27 Received.
SD printing byte 1234/10000
Layer: 50/200
ok
```

### LocationInfo (M114)

```
CMD M114 Received.
X:110.050 Y:110.050 Z:200.000 A:0.000 B:0
ok
```

## Command-Specific Timeouts

| Command | Timeout |
|---------|---------|
| Default | 5 seconds |
| M661 (files) | 10 seconds |
| M662 (thumbnail) | 10 seconds |
| G28 (homing) | 15 seconds |

## Error Codes

| Code | Description |
|------|-------------|
| ENETUNREACH | No route to host |
| ENOTFOUND | Unknown host |
| ETIMEDOUT | Connection timeout |

## Client Methods

### FlashForgeClient Methods

```typescript
// Connection
await initControl(): Promise<boolean>
await dispose(): Promise<void>

// Printer Info
await getPrinterInfo(): Promise<PrinterInfo | null>
await getTempInfo(): Promise<TempInfo | null>
await getEndstopInfo(): Promise<EndstopStatus | null>
await getPrintStatus(): Promise<PrintStatus | null>
await getLocationInfo(): Promise<LocationInfo | null>
await getThumbnail(fileName): Promise<ThumbnailInfo | null>

// Control
await ledOn(): Promise<boolean>
await ledOff(): Promise<boolean>
await homeAxes(): Promise<boolean>
await rapidHome(): Promise<boolean>

// Job Control
await startJob(name): Promise<boolean>
await pauseJob(): Promise<boolean>
await resumeJob(): Promise<boolean>
await stopJob(): Promise<boolean>

// Temperature
await setExtruderTemp(temp, waitFor?): Promise<boolean>
await setBedTemp(temp, waitFor?): Promise<boolean>
await cancelExtruderTemp(): Promise<boolean>
await cancelBedTemp(waitForCool?): Promise<boolean>

// Filament (5M Pro only)
await turnRunoutSensorOn(): Promise<boolean>
await turnRunoutSensorOff(): Promise<boolean>

// Direct G-code
await gCode(): GCodeController
await sendCmdOk(cmd): Promise<boolean>
await sendRawCmd(cmd): Promise<string>
```

## Filament Workflow

```typescript
// 1. Prepare for loading
await prepareFilamentLoad(filament: Filament)
// → Cancel temp, absolute mode, home, move to (0,0), heat, purge

// 2. Load filament
await loadFilament()
// → Extrude 250mm (if nozzle > 210°C)

// 3. Finish loading
await finishFilamentLoad()
// → Cancel temp, wait 5s, home
```
