/**
 * @fileoverview
 * FlashForge Emulator V2 - API Documentation
 *
 * This document describes all TCP and HTTP API endpoints implemented by the emulator.
 * It serves as a reference for testing client applications against the emulator.
 */

# FlashForge Emulator V2 - API Documentation

This document describes all TCP and HTTP API endpoints implemented by the FlashForge Emulator V2. Use this reference when testing client applications against the emulator.

## Overview

The emulator supports two protocol modes:

| Mode               | TCP Port | HTTP Port | Description                          |
|--------------------|----------|-----------|--------------------------------------|
| Legacy             | 8899     | N/A       | TCP-only protocol for Adventurer 3/4 |
| Modern             | 8899     | 8898      | TCP + HTTP for Adventurer 5M series  |
| Modern (HTTP-only) | N/A      | 8898      | HTTP-only for Creator 5 series       |

---

## TCP API (Port 8899)

### Connection Sequence

1. **Connect** to port 8899
2. **Request control** with `M601`
3. **Send commands** to interact with the printer
4. **Release control** with `M602` before disconnecting

### Handshake Commands

#### `M601` - Request Control

Request exclusive control of the printer.

**Request:**
```
M601
```

**Response (Success):**
```
CMD M601 Received.
Control Success V2.1
ok
```

**Response (Failure):**
```
CMD M601 Received.
Control Failed
ok
```

#### `M602` - Release Control

Release control of the printer, allowing other connections to take over.

**Request:**
```
M602
```

**Response:**
```
CMD M602 Received.
Control Release
ok
```

---

### Information Commands

#### `M115` - Get Printer Information

Returns printer model, firmware version, serial number, and build volume.

**Request:**
```
M115
```

**Response Example:**
```
CMD M115 Received.
Machine Type: Flashforge Adventurer 5M Pro
Machine Name: Adventurer 5M Pro
Firmware: v3.1.5
SN: SNMOMC9900728
X: 220 Y: 220 Z: 220
Tool Count: 1
Mac Address: 88:A9:A7:97:B2:BF
ok
```

#### `M105` - Get Temperatures

Returns current and target temperatures for extruder(s) and heated bed.

**Request:**
```
M105
```

**Response (New Format):**
```
CMD M105 Received.
T0:25.0/0.0 T1:0.0/0.0 B:25.0/0.0
ok
```

| Field | Description                              |
|-------|------------------------------------------|
| T0    | Primary extruder (current/target)        |
| T1    | Secondary extruder (current/target)      |
| B     | Heated bed (current/target)              |

#### `M119` - Get Endstop and Printer Status

Returns endstop states, machine status, movement mode, LED status, and current file.

**Request:**
```
M119
```

**Response Example:**
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

**MachineStatus Values:**
- `READY` - Idle and ready
- `BUILDING_FROM_SD` - Printing from local storage
- `BUILDING_COMPLETED` - Print finished
- `PAUSED` - Print paused
- `BUSY` - Performing operation (homing, heating)

#### `M114` - Get Current Position

Returns current X, Y, Z coordinates and extruder positions.

**Request:**
```
M114
```

**Response Example:**
```
CMD M114 Received.
X:110.000 Y:110.000 Z:10.000 E:0.000
ok
```

#### `M27` - Get Print Status

Returns current print job progress.

**Request:**
```
M27
```

**Response Example:**
```
CMD M27 Received.
SD printing byte 12345/100000
Layer: 25/100
ok
```

#### `M661` - Get Local File List

Returns a list of files stored on the printer. Data is sent after the `ok` response.

**Request:**
```
M661
```

**Response Example:**
```
CMD M661 Received.
ok
/data/model1.gcode::/data/model2.3mf::/data/model3.gcode
```

#### `M662` - Get File Thumbnail

Returns a PNG thumbnail for the specified file. Binary data is sent after the `ok` response.

**Request:**
```
M662 /data/model.gcode
```

**Response:**
```
CMD M662 Received.
ok
[binary PNG data]
```

---

### Control Commands

#### `G28` - Home Axes

Initiates the homing sequence for all axes.

**Request:**
```
G28
```

**Response:**
```
CMD G28 Received.
ok
```

#### `M23` - Start Print Job

Starts printing a file from local storage.

**Request:**
```
M23 0:/data/model.gcode
```

**Response:**
```
CMD M23 Received.
ok
```

#### `M24` - Resume Print

Resumes a paused print job.

**Request:**
```
M24
```

**Response:**
```
CMD M24 Received.
ok
```

#### `M25` - Pause Print

Pauses the current print job.

**Request:**
```
M25
```

**Response:**
```
CMD M25 Received.
ok
```

#### `M26` - Stop Print

Stops and cancels the current print job.

**Request:**
```
M26
```

**Response:**
```
CMD M26 Received.
ok
```

#### `M104` - Set Extruder Temperature

Sets the target temperature for the primary extruder.

**Request:**
```
M104 S210
```

| Parameter | Description               |
|-----------|---------------------------|
| S         | Target temperature (C)    |
| S0        | Turn off heating          |

**Response:**
```
CMD M104 Received.
ok
```

#### `M140` - Set Bed Temperature

Sets the target temperature for the heated bed.

**Request:**
```
M140 S60
```

| Parameter | Description               |
|-----------|---------------------------|
| S         | Target temperature (C)    |
| S0        | Turn off heating          |

**Response:**
```
CMD M140 Received.
ok
```

#### `M146` - LED Control

Controls the printer's internal LED lights.

**Request:**
```
M146 r255 g255 b255 F0
```

| Parameter | Description               |
|-----------|---------------------------|
| r         | Red intensity (0-255)     |
| g         | Green intensity (0-255)   |
| b         | Blue intensity (0-255)    |
| F         | Flag (typically 0)        |

**Examples:**
- LEDs ON (white): `M146 r255 g255 b255 F0`
- LEDs OFF: `M146 r0 g0 b0 F0`

**Response:**
```
CMD M146 Received.
ok
```

---

## HTTP API (Port 8898)

### Authentication

All HTTP endpoints require authentication credentials.

**Request Headers (uploadGcode):**
- `serialNumber`: Your serial number
- `checkCode`: Your check code

**Request Payload (all other endpoints):**
```json
{
  "serialNumber": "YOUR_SERIAL_NUMBER",
  "checkCode": "YOUR_CHECK_CODE"
}
```

### Endpoints

#### `POST /detail` - Get Printer Details

Retrieves comprehensive printer status including temperatures, print job progress, and settings.

**Request Payload:**
```json
{
  "serialNumber": "YOUR_SERIAL_NUMBER",
  "checkCode": "YOUR_CHECK_CODE"
}
```

**Response Example:**
```json
{
  "code": 0,
  "message": "Success",
  "detail": {
    "autoShutdown": "close",
    "autoShutdownTime": 30,
    "cameraStreamUrl": "",
    "chamberFanSpeed": 100,
    "chamberTargetTemp": 0,
    "chamberTemp": 25,
    "coolingFanSpeed": 100,
    "cumulativeFilament": 0,
    "cumulativePrintTime": 0,
    "currentPrintSpeed": 100,
    "doorStatus": "close",
    "errorCode": "",
    "estimatedLeftLen": 0,
    "estimatedLeftWeight": 0,
    "estimatedRightLen": 0,
    "estimatedRightWeight": 0,
    "estimatedTime": 3600,
    "externalFanStatus": "close",
    "fillAmount": 100,
    "firmwareVersion": "v3.1.5",
    "flashRegisterCode": "ABCDEFGH",
    "internalFanStatus": "open",
    "ipAddr": "192.168.1.100",
    "leftFilamentType": "",
    "leftTargetTemp": 0,
    "leftTemp": 25,
    "lightStatus": "open",
    "location": "Emulator",
    "macAddr": "00:11:22:33:44:55",
    "name": "FlashForge Emulator",
    "nozzleCnt": 1,
    "nozzleModel": "0.4mm",
    "nozzleStyle": 1,
    "pid": 0,
    "platTargetTemp": 0,
    "platTemp": 25,
    "polarRegisterCode": "IJKLMNOP",
    "printDuration": 0,
    "printFileName": "",
    "printFileThumbUrl": "",
    "printLayer": 0,
    "printProgress": 0,
    "printSpeedAdjust": 100,
    "remainingDiskSpace": 1024,
    "rightFilamentType": "PLA",
    "rightTargetTemp": 0,
    "rightTemp": 25,
    "status": "ready",
    "targetPrintLayer": 0,
    "tvoc": 0,
    "zAxisCompensation": 0
  }
}
```

**Status Values:**
- `ready` - Idle and ready
- `busy` - Performing operation
- `heating` - Heating nozzle/bed
- `printing` - actively printing
- `paused` - print paused
- `pausing` - pausing in progress
- `cancel` - print canceled
- `completed` - print finished
- `error` - error occurred

---

#### `POST /product` - Get Feature Availability

Returns which printer features are available/controllable.

**Request Payload:**
```json
{
  "serialNumber": "YOUR_SERIAL_NUMBER",
  "checkCode": "YOUR_CHECK_CODE"
}
```

**Response Example:**
```json
{
  "code": 0,
  "message": "Success",
  "product": {
    "chamberTempCtrlState": 0,
    "externalFanCtrlState": 1,
    "internalFanCtrlState": 1,
    "lightCtrlState": 1,
    "nozzleTempCtrlState": 1,
    "platformTempCtrlState": 1
  }
}
```

| Field                  | Description                           |
|------------------------|---------------------------------------|
| lightCtrlState         | LED control available (1=yes, 0=no)   |
| nozzleTempCtrlState    | Nozzle heating available              |
| platformTempCtrlState  | Bed heating available                 |
| internalFanCtrlState   | Internal fan control available        |
| externalFanCtrlState   | External fan control available        |
| chamberTempCtrlState   | Chamber heating available (AD5X)      |

---

#### `POST /control` - Send Control Commands

Sends various control commands to the printer.

**Request Payload Format:**
```json
{
  "serialNumber": "YOUR_SERIAL_NUMBER",
  "checkCode": "YOUR_CHECK_CODE",
  "payload": {
    "cmd": "COMMAND_NAME",
    "args": { }
  }
}
```

##### Available Commands

**`lightControl_cmd`** - Control LED
```json
{
  "payload": {
    "cmd": "lightControl_cmd",
    "args": {
      "status": "open"
    }
  }
}
```
| status | Description     |
|--------|-----------------|
| open   | Turn on LEDs    |
| close  | Turn off LEDs   |

**`printerCtl_cmd`** - Adjust printer settings
```json
{
  "payload": {
    "cmd": "printerCtl_cmd",
    "args": {
      "speed": 100,
      "chamberFan": 100,
      "coolingFan": 100,
      "coolingLeftFan": 0
    }
  }
}
```

**`jobCtl_cmd`** - Control print job
```json
{
  "payload": {
    "cmd": "jobCtl_cmd",
    "args": {
      "jobID": "",
      "action": "pause"
    }
  }
}
```
| action    | Description              |
|-----------|--------------------------|
| pause     | Pause the print          |
| continue  | Resume the print         |
| cancel    | Cancel the print         |

**`circulateCtl_cmd`** - Control fans
```json
{
  "payload": {
    "cmd": "circulateCtl_cmd",
    "args": {
      "internal": "open",
      "external": "close"
    }
  }
}
```

**`streamCtrl_cmd`** - Control camera stream
```json
{
  "payload": {
    "cmd": "streamCtrl_cmd",
    "args": {
      "action": "open"
    }
  }
}
```

**`stateCtrl_cmd`** - Clear completed state
```json
{
  "payload": {
    "cmd": "stateCtrl_cmd",
    "args": {
      "action": "setClearPlatform"
    }
  }
}
```

**Response (all commands):**
```json
{
  "code": 0,
  "message": "Success"
}
```

---

#### `POST /gcodeList` - Get Recent Files

Returns the 10 most recently used files.

**Request Payload:**
```json
{
  "serialNumber": "YOUR_SERIAL_NUMBER",
  "checkCode": "YOUR_CHECK_CODE"
}
```

**Response Example:**
```json
{
  "code": 0,
  "message": "Success",
  "gcodeList": [
    "model1.gcode",
    "model2.3mf",
    "model3.gcode"
  ]
}
```

---

#### `POST /gcodeThumb` - Get File Thumbnail

Returns a base64-encoded thumbnail for a file.

**Request Payload:**
```json
{
  "serialNumber": "YOUR_SERIAL_NUMBER",
  "checkCode": "YOUR_CHECK_CODE",
  "fileName": "model.gcode"
}
```

**Response Example:**
```json
{
  "code": 0,
  "message": "Success",
  "imageData": "BASE64_ENCODED_PNG_DATA"
}
```

---

#### `POST /printGcode` - Print Local File

Starts printing a file already stored on the printer.

**Request Payload:**
```json
{
  "serialNumber": "YOUR_SERIAL_NUMBER",
  "checkCode": "YOUR_CHECK_CODE",
  "fileName": "model.gcode",
  "levelingBeforePrint": true,
  "flowCalibration": false,
  "useMatlStation": false,
  "gcodeToolCnt": 0,
  "materialMappings": []
}
```

**Response:**
```json
{
  "code": 0,
  "message": "Success"
}
```

---

#### `POST /uploadGcode` - Upload File

Uploads a file to the printer. Uses `multipart/form-data`.

**Request Headers:**
- `serialNumber`: YOUR_SERIAL_NUMBER
- `checkCode`: YOUR_CHECK_CODE
- `fileSize`: FILE_SIZE_IN_BYTES
- `printNow`: true or false
- `levelingBeforePrint`: true or false
- `flowCalibration`: false
- `useMatlStation`: false
- `gcodeToolCnt`: 0
- `materialMappings`: []
- `Expect`: 100-continue
- `Content-Type`: multipart/form-data; boundary=...

**Request Body:**
The file as form data with field name `gcodeFile`.

**Response:**
```json
{
  "code": 0,
  "message": "Success"
}
```

---

## Error Codes

| Code | Message           | Description                               |
|------|-------------------|-------------------------------------------|
| 0    | Success           | Operation completed successfully          |
| 1    | Error             | Generic error occurred                    |
| 2    | Invalid parameter | Invalid request parameters                |
| 3    | Unauthorized      | Authentication failed                     |
| 4    | Not found         | Resource/file not found                   |
| 5    | Busy              | Printer busy with another operation       |

---

## AD5X Material Station (AD5X Models Only)

### Extended /detail Response

For AD5X models, the `/detail` response includes additional fields:

```json
{
  "detail": {
    // ... standard fields ...
    "hasMatlStation": true,
    "matlStationInfo": {
      "leftSlotState": "unload",
      "rightSlotState": "load",
      "slotInfos": [
        {
          "slotId": 1,
          "state": "ready",
          "materialType": "PLA",
          "color": "FF0000",
          "diameter": 1.75,
          "temp": 210
        },
        // ... slots 2-4 ...
      ]
    }
  }
}
```

### Material Mapping

The AD5X maps materials at **upload** time: `materialMappings` travels as a base64-encoded
JSON array in the `materialMappings` request header of `/uploadGcode` (the Creator 5 series
maps at print-start instead -- see below). Each entry carries five fields:

```json
[
  {
    "toolId": 0,
    "slotId": 1,
    "materialName": "PLA",
    "toolMaterialColor": "#4DA3FF",
    "slotMaterialColor": "#4DA3FF"
  }
]
```

### Slot and Tool ID Bases

**Slots are 1-based (`slotId` 1-4); tools are 0-based (`toolId` 0..toolCount-1).** The same
bases apply to the `slotInfos` in `/detail` and to the `gcodeToolDatas` in `/gcodeList`. A
`slotId` of `0` in `gcodeToolDatas` means "no slot" and only appears on direct-feed printers
that have no material station.

The emulator validates every `materialMappings` payload rather than accepting it blindly, so
a client that forgot to convert a 0-based UI index fails here the way it fails on hardware.
Rejected cases:

| Case | Reason |
|---|---|
| `slotId` below 1 or above the station slot count | Slots are 1-based |
| `toolId` below 0 or above `toolCount - 1` | Tools are 0-based |
| Duplicate `toolId` or duplicate `slotId` | One tool per slot |
| More entries than the station has slots | Station capacity |
| Empty `materialName`, or a colour that is not `#RRGGBB` | Malformed entry |

Rejections answer `{ "code": 2, "message": "Invalid parameter" }` (`{ "code": -1, "message":
"Parameter is error." }` on the Creator 5 series, matching that firmware). Both carry an extra
`detail` string naming the offending field -- an emulator-only convenience that real firmware
does not send.

Printers with no material station are left alone: what their firmware does with a stray
`materialMappings` payload has never been captured, so the emulator does not invent a rejection.

---

## Creator 5 Series (Creator 5 / Creator 5 Pro)

The Creator 5 series speaks the modern HTTP API with several differences from the 5M family. The series is HTTP-only: real firmware runs no TCP service on port 8899, so the emulator binds no TCP server. The `--tcp-port` flag is accepted and advertised (in `/__health` and the discovery command-port field), but nothing listens.

### Identity

| Field | Creator 5 | Creator 5 Pro |
|---|---|---|
| Model string | `creator-5` | `creator-5-pro` |
| pid | 40 (0x0028) | 41 (0x0029) |
| Default firmware | 1.7.8-1.1.7 | 1.9.4-1.2.6 |
| Default machine name | Creator 5 Emulator | Creator 5 Pro Emulator |
| Tool heads | 4 (tool changer) | 4 (tool changer) |
| Build volume | 256x256x256 | 256x256x256 |

VID is `0x2B71` and `productType` is `0x5A02` -- shared with the 5M family. The `pid` is the only reliable model discriminator.

UDP discovery answers with the standard 276-byte modern packet. The model pid sits at offset `0x88`.

### /detail Differences

- Reports `nozzleCnt` 4, `nozzleTemps[4]`, `nozzleTargetTemps[4]`, `nozzleStyle` 0, and `measure` `256X256X256`. The four heads are a tool changer, not independent dual nozzles.
- Includes `matlStationInfo` (4 slots on both models) but omits `hasMatlStation` and the AD5X-only `leftTemp`/`indepMatlInfo` fields. Derive station presence from `slotCnt`/`slotInfos`.
- Creator 5 (base) only: no chamber heater or sensor. `chamberTemp` and `chamberTargetTemp` report `-108` (out-of-band sentinel). `doorStatus` is cosmetic (always `close`). The `tvoc` field is present but reads 0.
- Creator 5 Pro only: chamber heater (0-80 C) with sensor, real door sensor, and read-only TVOC.

### temperatureCtl_cmd

Tool control goes only through the `nozzles` array:

- Send exactly 4 integers, or the whole block is skipped.
- `0` = tool off, `-200` = no change, `-100` is ignored and the tool keeps heating (firmware quirk).
- `rightNozzle`/`leftNozzle` are never read on this series.
- `platform` scalar: `-200` = no change, `-100` = off, otherwise 0-130 target.
- `chamber` scalar: same sentinels, range 0-80, Pro only. The base model ACKs silently with no effect.

### Files and Printing

- `/gcodeList` returns bare file names only -- no `gcodeListDetail`. Parse tool data at upload time.
- `/printGcode` requires both `fileName` and `levelingBeforePrint`. Otherwise it returns `{ "code": -1, "message": "Parameter is error." }`.
- `/uploadGcode` headers: `serialNumber`, `checkCode`, `fileSize`, `printNow`, `levelingBeforePrint`, `flowCalibration`, `timeLapseVideo`, `useMatlStation`, `gcodeToolCnt`. Booleans are sent as `"true"`/`"false"`.
- `materialMappings` belong in the `/printGcode` body, not the upload headers. Each entry has five fields: `toolId` (0-3), `slotId` (1-4), `materialName`, `toolMaterialColor`, `slotMaterialColor`. Maximum 4 entries, multi-tool prints only. The emulator validates them (see "Slot and Tool ID Bases" above) and rejects a bad payload with `{ "code": -1, "message": "Parameter is error." }` without starting the job.
- `GET /getThum` serves the current print thumbnail without credentials. `printFileThumbUrl` points at it.
- `POST /deleteGcode` does not exist on this series. Unmatched routes return 404.

### /product Flags (Bug-Compatible)

The emulator copies two real-firmware misreports on purpose:

- `chamberTempCtrlState` reads 1 on both models -- an over-report on the heater-less base.
- `internalFanCtrlState` and `externalFanCtrlState` read 0 on both -- an under-report on the filtration-equipped Pro.

Filtration is not API-controllable. `circulateCtl_cmd` returns success but never actuates the fans, even on the Pro. Gate capabilities by `pid`/model, not by `/product` flags.

### Controls That Behave Normally

- `lightControl_cmd` works on both models.
- `jobCtl_cmd` pause/continue/cancel works.
- `msConfig_cmd` metadata updates are accepted.

---

## Default Emulator Credentials

When starting fresh, the emulator uses these default credentials:

| Field   | Default Value              |
|---------|----------------------------|
| TCP Port | 8899                       |
| HTTP Port | 8898                       |
| Serial Number | EMULATOR-5M-PRO-001    |
| Check Code | 12345678                  |

These can be changed via the Settings panel in the UI.
