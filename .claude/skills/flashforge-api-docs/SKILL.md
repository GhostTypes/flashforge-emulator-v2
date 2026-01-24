---
name: flashforge-api-docs
description: |
  Raw FlashForge 3D printer protocol documentation. Use when implementing TCP/HTTP
  communication with FlashForge Adventurer 3/4/5M/5M Pro/AD5X printers. Contains
  complete endpoint specifications, command formats, response parsing, authentication,
  and printer model compatibility. Reference for emulator implementation or client
  library development.
---

# FlashForge API Documentation

Complete protocol documentation for FlashForge 3D printers, compiled from network
traffic analysis and community testing.

## Quick Reference

| Protocol | Port | Printer Models | Purpose |
|----------|------|----------------|---------|
| Legacy TCP | 8899 | Adventurer 3/4/5M/5M Pro/AD5X | G-code commands, status, basic control |
| HTTP API | 8898 | Adventurer 5M/5M Pro/AD5X (firmware 3.1.3+) | Modern REST API, file operations, advanced control |
| UDP Discovery | 48899 | All models | Network discovery |

## Key Design Patterns

### TCP Connection Handshake

```
1. Connect to port 8899
2. Send: M601 (request control)
   → Response: "Control Success V2.1" + "ok"
3. Send commands periodically for keep-alive
4. Disconnect: Send M602 (release control)
```

**Critical**: Always send M602 before closing the TCP connection, or subsequent
connections will fail with "Control Failed."

### HTTP Authentication

All HTTP endpoints require authentication in the JSON payload:

```json
{
  "serialNumber": "YOUR_SERIAL",
  "checkCode": "YOUR_CHECK_CODE"
}
```

**Exception**: `/uploadGcode` uses headers instead:
- `serialNumber`: value in header
- `checkCode`: value in header
- `fileSize`: file size in bytes
- `printNow`: true/false
- `levelingBeforePrint`: true/false

### Response Format

All HTTP responses follow this structure:
```json
{
  "code": 0,        // 0 = success, non-zero = error
  "message": "Success"
}
```

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Generic error |
| 2 | Invalid parameter |
| 3 | Unauthorized (bad serial/check code) |
| 4 | Not found |
| 5 | Printer busy |

## Protocol Comparison

| Feature | TCP (Legacy) | HTTP (Modern) |
|---------|--------------|---------------|
| Printer Info | M115 | `/detail` |
| Temperatures | M105 | Included in `/detail` |
| File List | M661 | `/gcodeList` |
| Thumbnails | M662 (slow) | `/gcodeThumb` (fast) |
| Print Job | M23 | `/printGcode` |
| Job Control | M24/M25/M26 | `/control` with `jobCtl_cmd` |
| LED Control | M146 | `/control` with `lightControl_cmd` |
| File Upload | Not available | `/uploadGcode` |
| Time Estimates | Not available | Included in `/detail` |

## Important Implementation Notes

### M661 File List (TCP)

**Unique behavior**: Data is sent **after** the `ok` response. The initial
response only contains `CMD M661 Received.` and `ok`, followed by a raw string
with file paths delimited by special characters (`::��`).

### M662 Thumbnail (TCP)

**Unique behavior**: Binary PNG data is sent **after** the `ok` response.
Must read raw bytes from the socket after receiving the initial text response.

### AD5X Material Station

For AD5X printers, both `/printGcode` and `/uploadGcode` require additional
parameters in firmware 3.1.3+:

```json
{
  "flowCalibration": false,
  "useMatlStation": true,
  "gcodeToolCnt": 2,           // Number of tools used
  "materialMappings": [
    {
      "toolId": 0,
      "slotId": 1,
      "materialName": "PLA",
      "toolMaterialColor": "#FF0000",
      "slotMaterialColor": "#FF0000"
    }
  ]
}
```

For `/uploadGcode`, `materialMappings` is Base64-encoded in the header.

### Machine States

| Status | Description |
|--------|-------------|
| `ready` | Idle, ready for commands |
| `busy` | Performing non-printing operation |
| `calibrate_doing` | Calibrating |
| `error` | Error state |
| `heating` | Heating nozzle/bed |
| `printing` | Active print |
| `pausing` | Pausing print |
| `paused` | Print paused |
| `cancel` | Print canceled |
| `completed` | Print finished |

### TCP Keep-Alive

The printer closes idle TCP connections. Send any command (typically M27 for
print status) every few seconds to maintain connection.

## Common Commands

### TCP Commands

| Command | Purpose | Format |
|---------|---------|--------|
| M601 | Request control | `M601` |
| M602 | Release control | `M602` |
| M115 | Printer info | `M115` |
| M105 | Temperatures | `M105` |
| M119 | Endstops + status | `M119` |
| M114 | Position | `M114` |
| M27 | Print status | `M27` |
| M661 | File list | `M661` |
| M662 | Thumbnail | `M662 /data/file.gcode` |
| G28 | Home all | `G28` |
| M23 | Start print | `M23 0:/data/file.gcode` |
| M24 | Resume | `M24` |
| M25 | Pause | `M25` |
| M26 | Stop | `M26` |
| M146 | LED | `M146 r255 g255 b255 F0` |
| M104 | Nozzle temp | `M104 S210` |
| M140 | Bed temp | `M140 S60` |

### HTTP Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/detail` | Full printer state |
| `/product` | Feature availability flags |
| `/control` | Send control commands |
| `/gcodeList` | Recent files (max 10) |
| `/gcodeThumb` | File thumbnail (not AD5X) |
| `/printGcode` | Start local file print |
| `/uploadGcode` | Upload file (multipart) |

### Control Commands (via `/control`)

| Command | Purpose |
|---------|---------|
| `lightControl_cmd` | LED on/off |
| `printerCtl_cmd` | Speed, fan adjustment |
| `jobCtl_cmd` | pause/continue/cancel |
| `circulateCtl_cmd` | Internal/external fans |
| `streamCtrl_cmd` | Camera stream |
| `stateCtrl_cmd` | Clear platform state |

## References

See `/references/` for detailed documentation:
- `http-api.md` - Complete HTTP API specification
- `legacy-api.md` - Complete TCP command reference
- `ad5x-api.md` - AD5X material station details
- `ad5x-workflow.md` - Multi-color printing workflow
