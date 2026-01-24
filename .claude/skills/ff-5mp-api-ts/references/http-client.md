# FF-5MP API - HTTP Client Reference

## Overview

The HTTP API client (`FiveMClient`) provides a complete TypeScript interface for controlling FlashForge Adventurer 5M/5M Pro/AD5X printers via port 8898.

## Base Configuration

- **Port**: 8898
- **Timeout**: 5 seconds
- **Base URL**: `http://<ip>:8898`

## Authentication

All HTTP requests require authentication:

```typescript
{
    serialNumber: string,
    checkCode: string
}
```

Exception: `/uploadGcode` uses headers instead of payload.

## Endpoints

### 1. `/detail` - Printer Information

**Request:**
```typescript
POST /detail
{
    serialNumber: string,
    checkCode: string
}
```

**Response:**
```typescript
{
    code: number,
    message: string,
    detail: FFPrinterDetail
}
```

FFPrinterDetail contains 126+ fields including:
- Temperatures (nozzle, bed, chamber)
- Fan speeds (cooling, chamber, left/right)
- Print job status (progress, layer, time remaining)
- Filament estimates (length, weight)
- Machine state (status, door, error)
- Lifetime statistics

### 2. `/product` - Capability Flags

**Request:**
```typescript
POST /product
{
    serialNumber: string,
    checkCode: string
}
```

**Response:**
```typescript
{
    code: number,
    message: string,
    product: {
        chamberTempCtrlState: number,
        externalFanCtrlState: number,
        internalFanCtrlState: number,
        lightCtrlState: number,
        nozzleTempCtrlState: number,
        platformTempCtrlState: number
    }
}
```

Values: 0 = unavailable, 1 = available

### 3. `/control` - Control Commands

**Request:**
```typescript
POST /control
{
    serialNumber: string,
    checkCode: string,
    payload: {
        cmd: string,
        args: any
    }
}
```

#### Available Commands

| Command | Args | Purpose |
|---------|------|---------|
| `lightControl_cmd` | `{status: "open"\|"close"}` | LED control |
| `printerCtl_cmd` | `{speed, chamberFan, coolingFan, coolingLeftFan}` | Print settings |
| `jobCtl_cmd` | `{jobID?, action}` | Job control |
| `circulateCtl_cmd` | `{internal, external}` | Filtration |
| `streamCtrl_cmd` | `{action: "open"\|"close"}` | Camera |
| `stateCtrl_cmd` | `{action: "setClearPlatform"}` | Clear state |

### 4. `/gcodeList` - Recent Files

**Request:**
```typescript
POST /gcodeList
{
    serialNumber: string,
    checkCode: string
}
```

**Response (AD5X):**
```typescript
{
    code: number,
    message: string,
    gcodeListDetail: FFGcodeFileEntry[]
}
```

**Response (older):**
```typescript
{
    code: number,
    message: string,
    gcodeList: string[]
}
```

### 5. `/gcodeThumb` - File Thumbnail

**Request:**
```typescript
POST /gcodeThumb
{
    serialNumber: string,
    checkCode: string,
    fileName: string
}
```

**Response:**
```typescript
{
    code: number,
    message: string,
    imageData: string  // Base64
}
```

Note: NOT available on AD5X printers.

### 6. `/printGcode` - Start Local Print

**Firmware < 3.1.3:**
```typescript
{
    serialNumber: string,
    checkCode: string,
    fileName: string,
    levelingBeforePrint: boolean
}
```

**Firmware >= 3.1.3:**
```typescript
{
    serialNumber: string,
    checkCode: string,
    fileName: string,
    levelingBeforePrint: boolean,
    flowCalibration: boolean,
    useMatlStation: boolean,
    gcodeToolCnt: number,
    materialMappings: AD5XMaterialMapping[]
}
```

### 7. `/uploadGcode` - Upload File

**Headers:**
```
serialNumber: <value>
checkCode: <value>
fileSize: <bytes>
printNow: true|false
levelingBeforePrint: true|false
Expect: 100-continue
Content-Type: multipart/form-data
```

**Additional headers (firmware >= 3.1.3):**
```
flowCalibration: false
useMatlStation: false
gcodeToolCnt: 0
materialMappings: W10=  // Base64 of []
```

**AD5X headers:**
```
useMatlStation: true
gcodeToolCnt: 4
materialMappings: <base64 json>
flowCalibration: false
firstLayerInspection: false
timeLapseVideo: false
```

**Body:** Multipart/form-data with `gcodeFile` field.

## Control Modules

### Control Class
- `homeAxes()` / `rapidHome()`
- `ledOn()` / `ledOff()`
- `setPrintSpeed(percent)`
- `setChamberFan(percent)`
- `setCoolingFan(percent)`
- `turnOnFiltration()` / `turnOffFiltration()`
- `startCameraStream()` / `stopCameraStream()`
- `clearPlatform()`

### JobControl Class
- `pausePrintJob()`
- `resumePrintJob()`
- `cancelPrintJob()`
- `uploadFile(path, startPrint, levelBeforePrint)`
- `uploadFileAD5X(params)`
- `printLocalFile(name, levelBeforePrint)`
- `startAD5XMultiColorJob(params)`
- `startAD5XSingleColorJob(params)`

### Info Class
- `getDetailResponse()` - Full printer details
- `getProductResponse()` - Capability flags
- `getDetail()` - Transformed machine info

### Files Class
- `getLocalFiles()` - Via TCP (M661)
- `getRecentFiles()` - Via HTTP (gcodeList)
- `getFileThumbnail(fileName)` - Via HTTP

### TempControl Class
- Uses TCP client for commands
- `setExtruderTemp(temp, waitFor?)`
- `setBedTemp(temp, waitFor?)`
- `cancelExtruderTemp()`
- `cancelBedTemp(waitForCool?)`

## AD5X Material Types

```typescript
interface AD5XMaterialMapping {
    toolId: number;        // 0-3
    slotId: number;        // 1-4
    materialName: string;
    toolMaterialColor: string;  // "#RRGGBB"
    slotMaterialColor: string;  // "#RRGGBB"
}

interface AD5XLocalJobParams {
    fileName: string;
    levelingBeforePrint: boolean;
    materialMappings: AD5XMaterialMapping[];
}

interface AD5XSingleColorJobParams {
    fileName: string;
    levelingBeforePrint: boolean;
}

interface AD5XUploadParams {
    filePath: string;
    startPrint: boolean;
    levelingBeforePrint: boolean;
    flowCalibration: boolean;
    firstLayerInspection: boolean;
    timeLapseVideo: boolean;
    materialMappings: AD5XMaterialMapping[];
}
```

## Error Handling

```typescript
interface GenericResponse {
    code: number;     // 0 = success
    message: string;  // "Success"
}

// Check utility
NetworkUtils.isOk(response): boolean
```

## Important Patterns

1. **HTTP Client Busy Flag**: Prevents overlapping requests
2. **Firmware Detection**: Commands adapt based on version
3. **Model Detection**: Special handling for Pro/AD5X
4. **Response Validation**: Always check with `NetworkUtils.isOk()`
