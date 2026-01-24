# FF-5MP API - Data Models Reference

## Type System Overview

The library uses a two-tier data model:

1. **Raw API Models** (`FFPrinterDetail`) - Direct API response representation
2. **Transformed Models** (`FFMachineInfo`) - User-friendly format with calculated properties

## Core Interfaces

### FFPrinterDetail

Raw printer state from API (126 optional fields).

```typescript
interface FFPrinterDetail {
    // Status
    status?: string;                    // "ready", "printing", etc.
    errorCode?: string;

    // Temperatures
    rightTemp?: number;                 // Current nozzle
    rightTargetTemp?: number;           // Target nozzle
    platTemp?: number;                  // Current bed
    platTargetTemp?: number;            // Target bed
    chamberTemp?: number;
    chamberTargetTemp?: number;

    // Print Job
    printFileName?: string;
    printProgress?: number;             // 0.0 - 1.0
    printLayer?: number;
    targetPrintLayer?: number;
    printDuration?: number;             // Seconds
    estimatedTime?: number;             // Seconds remaining

    // Fans
    coolingFanSpeed?: number;           // Percentage
    chamberFanSpeed?: number;
    coolingLeftFanSpeed?: number;

    // Filament
    cumulativeFilament?: number;        // Meters
    rightFilamentType?: string;         // "PLA", "ABS"
    estimatedRightLen?: number;         // Millimeters
    estimatedRightWeight?: number;      // Grams

    // Printer Info
    name?: string;
    firmwareVersion?: string;
    macAddr?: string;
    ipAddr?: string;
    nozzleModel?: string;               // "0.4mm"

    // States (string "open"/"close")
    lightStatus?: string;
    internalFanStatus?: string;
    externalFanStatus?: string;
    doorStatus?: string;

    // Lifetime
    cumulativePrintTime?: number;       // Minutes

    // AD5X Material Station
    hasMatlStation?: boolean;
    matlStationInfo?: MatlStationInfo;
    indepMatlInfo?: IndepMatlInfo;
    hasLeftFilament?: boolean;
    hasRightFilament?: boolean;
    leftFilamentType?: string;
    leftTemp?: number;
    leftTargetTemp?: number;

    // And more...
}
```

### FFMachineInfo

Transformed, user-friendly printer information.

```typescript
interface FFMachineInfo {
    // Printer Identification
    Name: string;
    FirmwareVersion: string;
    IpAddress: string;
    MacAddress: string;
    IsPro: boolean;
    IsAD5X: boolean;
    NozzleSize: string;

    // Temperatures (as objects)
    Extruder: Temperature;    // {current, set}
    PrintBed: Temperature;

    // Machine State
    MachineState: MachineState;
    Status: string;
    ErrorCode: string;

    // Print Job
    PrintFileName: string;
    PrintProgress: number;           // 0.0 - 1.0
    PrintProgressInt: number;        // 0 - 100
    CurrentPrintLayer: number;
    TotalPrintLayers: number;
    PrintDuration: number;           // Seconds
    EstimatedTime: number;           // Seconds
    PrintEta: string;                // "HH:MM"
    CompletionTime: Date;

    // Fans (boolean states)
    LightsOn: boolean;
    InternalFanOn: boolean;
    ExternalFanOn: boolean;

    // Filament
    FilamentType: string;
    EstLength: number;               // Meters
    EstWeight: number;               // Grams

    // Lifetime
    FormattedRunTime: string;         // "Xh:Ym"
    FormattedTotalRunTime: string;

    // Disk Space
    FreeDiskSpace: string;

    // AD5X
    HasMatlStation?: boolean;
    MatlStationInfo?: MatlStationInfo;
    IndepMatlInfo?: IndepMatlInfo;
}
```

### Temperature

```typescript
interface Temperature {
    current: number;    // Current temperature
    set: number;        // Target temperature
}
```

## MachineState Enum

```typescript
enum MachineState {
    Ready,       // Idle, ready for commands
    Busy,        // Performing operation
    Calibrating, // Calibration sequence
    Error,       // Error occurred
    Heating,     // Heating components
    Printing,    // Active print
    Pausing,     // Pausing in progress
    Paused,      // Print paused
    Cancelled,   // Print cancelled
    Completed,   // Print finished
    Unknown      // Unrecognized state
}
```

## AD5X Material Station Types

### MatlStationInfo

```typescript
interface MatlStationInfo {
    currentSlot: number;         // Currently active (0-4)
    currentLoadSlot: number;     // Currently loading (0-4)
    slotCnt: number;             // Total slots (typically 4)
    slotInfos: SlotInfo[];       // Array of slot data
    stateAction: number;         // Current action state
    stateStep: number;           // Step within action
}
```

### SlotInfo

```typescript
interface SlotInfo {
    slotId: number;              // Slot number (1-4)
    hasFilament: boolean;        // Filament present
    materialName: string;        // "PLA", "ABS", etc.
    materialColor: string;       // "#RRGGBB"
}
```

### IndepMatlInfo

```typescript
interface IndepMatlInfo {
    materialName: string;        // "?" if unknown
    materialColor: string;
    stateAction: number;
    stateStep: number;
}
```

## File Management Types

### FFGcodeFileEntry

```typescript
interface FFGcodeFileEntry {
    gcodeFileName: string;
    gcodeToolCnt?: number;           // Number of tools
    gcodeToolDatas?: FFGcodeToolData[];
    printingTime: number;            // Seconds
    totalFilamentWeight?: number;    // Grams
    useMatlStation?: boolean;
}
```

### FFGcodeToolData

```typescript
interface FFGcodeToolData {
    toolId: number;              // Tool/extruder number
    slotId: number;              // Material station slot
    materialName: string;
    materialColor: string;       // "#RRGGBB"
    filamentWeight: number;      // Weight for this tool
}
```

## AD5X Job Control Types

### AD5XMaterialMapping

```typescript
interface AD5XMaterialMapping {
    toolId: number;              // 0-3 (extruder)
    slotId: number;              // 1-4 (material station)
    materialName: string;        // "PLA", "SILK", etc.
    toolMaterialColor: string;   // "#RRGGBB"
    slotMaterialColor: string;   // "#RRGGBB"
}
```

### AD5XLocalJobParams

```typescript
interface AD5XLocalJobParams {
    fileName: string;
    levelingBeforePrint: boolean;
    materialMappings: AD5XMaterialMapping[];  // 1-4 items
}
```

### AD5XSingleColorJobParams

```typescript
interface AD5XSingleColorJobParams {
    fileName: string;
    levelingBeforePrint: boolean;
}
```

### AD5XUploadParams

```typescript
interface AD5XUploadParams {
    filePath: string;
    startPrint: boolean;
    levelingBeforePrint: boolean;
    flowCalibration: boolean;
    firstLayerInspection: boolean;
    timeLapseVideo: boolean;
    materialMappings: AD5XMaterialMapping[];  // 1-4 items
}
```

## Response Types

### GenericResponse

```typescript
interface GenericResponse {
    code: number;        // 0 = success
    message: string;     // "Success" for success
}
```

### DetailResponse

```typescript
interface DetailResponse extends GenericResponse {
    detail: FFPrinterDetail;
}
```

### ProductResponse

```typescript
interface ProductResponse extends GenericResponse {
    product: Product;
}

interface Product {
    chamberTempCtrlState: number;
    externalFanCtrlState: number;
    internalFanCtrlState: number;
    lightCtrlState: number;
    nozzleTempCtrlState: number;
    platformTempCtrlState: number;
}
```

## TCP Replay Types

### PrinterInfo (from M115)

```typescript
class PrinterInfo {
    TypeName: string;       // "Flashforge Adventurer 5M Pro"
    Name: string;           // User-configured name
    FirmwareVersion: string;
    SerialNumber: string;
    X: number; Y: number; Z: number;  // Build volume
    MacAddress: string;
    ToolCount: number;
}
```

### TempInfo (from M105)

```typescript
class TempInfo {
    getExtruderTemp(): TempData  // {current, set}
    getBedTemp(): TempData
}

class TempData {
    _current: string;
    _set: string | null;
    getCurrent(): number
    getSet(): number
}
```

### EndstopStatus (from M119)

```typescript
class EndstopStatus {
    _Endstop: string;        // "X-max: 110 Y-max: 110 Z-min: 0"
    _MachineStatus: MachineStatus;
    _MoveMode: MoveMode;
    _Status: string;         // "S:1 L:0 J:0 F:0"
    _LedEnabled: number;     // 0 or 1
    _CurrentFile: string;
}

enum MachineStatus {
    BUILDING_FROM_SD,
    BUILDING_COMPLETED,
    PAUSED,
    READY,
    BUSY,
    DEFAULT
}

enum MoveMode {
    MOVING, PAUSED, READY, WAIT_ON_TOOL, HOMING, DEFAULT
}
```

### PrintStatus (from M27)

```typescript
class PrintStatus {
    _sdCurrent: number;      // Current byte
    _sdTotal: number;        // Total bytes
    _layerCurrent: number;   // Current layer
    _layerTotal: number;     // Total layers

    getPrintPercent(): number
    getLayerProgress(): string
    getSdProgress(): string
}
```

### LocationInfo (from M114)

```typescript
class LocationInfo {
    X: number; Y: number; Z: number;
    A: number; B: number;     // Extruder positions
}
```

## Utility Types

### Filament

```typescript
class Filament {
    name: string;      // "PLA", "ABS", etc.
    loadTemp: number;  // Recommended loading temperature
}
```

### ScientificNotationFloatConverter

Converts very small or large numbers to scientific notation:
- |value| < 0.001 or |value| ≥ 10000

## Data Transformations

The `MachineInfo` class handles transformations:

| Raw Value | Transformed |
|-----------|-------------|
| "open" / "close" | boolean true/false |
| Seconds | HH:MM format |
| Bytes progress | Percentage (0-100) |
| Raw status | MachineState enum |
| Meters | Formatted string |
| Minutes | "Xh Ym" format |
