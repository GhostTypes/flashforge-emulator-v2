---
name: ff-5mp-api-ts
description: |
  Production-grade TypeScript API client for FlashForge 3D printers. Use when
  implementing HTTP/TCP communication with Adventurer 5M/5M Pro/AD5X or legacy
  Adventurer 3/4 printers. Contains FiveMClient (HTTP), FlashForgeClient (TCP),
  UDP discovery, AD5X material station support, file operations, temperature
  control, and complete type definitions.
---

# FlashForge 5MP API TypeScript Client

Production TypeScript library for controlling FlashForge 3D printers via
HTTP (port 8898) and TCP (port 8899) protocols.

## Quick Start

```typescript
import { FiveMClient, FlashForgeClient, FlashForgePrinterDiscovery } from 'ff-api';

// Discovery
const discovery = new FlashForgePrinterDiscovery();
const printers = await discovery.discoverPrintersAsync();

// Modern printers (5M, 5M Pro, AD5X)
const client = new FiveMClient(ip, serialNumber, checkCode);
if (await client.initialize()) {
    await client.initControl();
    // Use client.control, client.jobControl, client.files, etc.
}

// Legacy printers (Adventurer 3/4)
const legacy = new FlashForgeClient(ip);
if (await legacy.initControl()) {
    await legacy.ledOn();
}
```

## Architecture

```
FlashForgePrinterDiscovery (UDP port 48899)
         ↓
    FiveMClient (HTTP port 8898)
    ├── control: Control (homing, LEDs, fans)
    ├── jobControl: JobControl (pause/resume/upload/start)
    ├── info: Info (printer status, details)
    ├── files: Files (list, thumbnails)
    ├── tempControl: TempControl (temperatures)
    └── tcpClient: FlashForgeClient (TCP port 8899)
```

## HTTP Endpoints (FiveMClient)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/detail` | POST | Full printer state |
| `/product` | POST | Capability flags |
| `/control` | POST | Control commands |
| `/gcodeList` | POST | Recent files |
| `/gcodeThumb` | POST | File thumbnail |
| `/printGcode` | POST | Start local print |
| `/uploadGcode` | POST | Upload file |

### Control Commands (via `/control`)

| Command | Args | Purpose |
|---------|------|---------|
| `lightControl_cmd` | `{status: "open"\|"close"}` | LED on/off |
| `printerCtl_cmd` | `{speed, chamberFan, coolingFan}` | Print settings |
| `jobCtl_cmd` | `{action: "pause"\|"continue"\|"cancel"}` | Job control |
| `circulateCtl_cmd` | `{internal, external}` | Filtration fans |
| `streamCtrl_cmd` | `{action: "open"\|"close"}` | Camera stream |

## TCP Commands (FlashForgeClient)

### Handshake
```
1. Connect to port 8899
2. Send: ~M601 S1 (request control)
   → "Control Success V2.1"
3. Keep-alive: ~M27 every 5s
4. Disconnect: ~M602 (release control)
```

### Key Commands

| Command | Code | Purpose |
|---------|------|---------|
| `~M115` | Printer Info | Model, firmware, SN |
| `~M105` | Temperature | Current/target temps |
| `~M119` | Endstop Status | Machine state |
| `~M27` | Print Status | Progress, layer |
| `~M114` | Position | XYZ coordinates |
| `~M661` | File List | Local files |
| `~M662` | Thumbnail | PNG image |
| `~G28` | Home | All axes |
| `~M23` | Start Print | Select file |
| `~M24` / `~M25` / `~M26` | Job Control | Resume/Pause/Stop |
| `~M146` | LED | RGB control |

## AD5X Material Station

### Material Mapping
```typescript
interface AD5XMaterialMapping {
    toolId: number;        // 0-3 (extruder)
    slotId: number;        // 1-4 (material station)
    materialName: string;  // "PLA", "ABS", etc.
    toolMaterialColor: string;  // "#RRGGBB"
    slotMaterialColor: string;  // "#RRGGBB"
}
```

### Upload with Mappings (headers)
```
useMatlStation: true
gcodeToolCnt: 2
materialMappings: <base64 encoded JSON array>
flowCalibration: false
firstLayerInspection: false
timeLapseVideo: false
```

## UDP Discovery

### Discovery Packet (20 bytes)
```
0x77 0x77 0x77 0x2e 0x75 0x73 0x72 0x22  ("www.usr")
0x65 0x36 0xc0 0x00 0x00 0x00 0x00 0x00
0x00 0x00 0x00 0x00
```

### Response (196 bytes min)
- Offset 0x00: Printer name (32 bytes, ASCII)
- Offset 0x92: Serial number (32 bytes, ASCII)

## Data Models

### MachineState Enum
```
Ready, Busy, Calibrating, Error, Heating, Printing,
Pausing, Paused, Cancelled, Completed, Unknown
```

### Key Interfaces
- `FFPrinterDetail`: Raw API response (126 fields)
- `FFMachineInfo`: Structured printer info
- `FFGcodeFileEntry`: File listing with material info
- `MatlStationInfo`: AD5X material station state
- `SlotInfo`: Single material slot

## Special Response Patterns

### M661 File List
- Data sent **after** `ok` response
- Delimited by `::` with `/data/` prefix
- Parse: split by `::`, extract `/data/` paths

### M662 Thumbnail
- Binary PNG sent **after** `ok` response
- Wait 1.5s after `ok` for complete data
- PNG signature: `0x89 50 4E 47`

## Firmware Version Detection

```typescript
// Firmware < 3.1.3
{ fileName, levelingBeforePrint }

// Firmware >= 3.1.3
{
    fileName, levelingBeforePrint,
    flowCalibration, useMatlStation,
    gcodeToolCnt, materialMappings
}
```

## Error Handling

All HTTP responses follow:
```typescript
{
    code: number,    // 0 = success
    message: string  // "Success"
}
```

Use `NetworkUtils.isOk(response)` to validate.

## References

See `/references/` for detailed implementation documentation.
