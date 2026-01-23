# FlashForge Emulator - Gap Closure PRD

## Project Context

**Project**: FlashForge Emulator V2 - A complete Electron-based emulator for FlashForge 3D printers (Adventurer 3/4/5M/5M Pro/AD5X)

**Purpose**: Close all identified gaps between the emulator and real printer behavior to achieve full FlashForgeUI compatibility.

**Tech Stack**:
- Electron + React 19 + TypeScript
- Biome for linting/formatting
- TCP (8899), HTTP (8898), UDP Discovery (48899) protocols

**Current State**:
- TypeScript strict mode: 0 errors
- Biome lint: 0 errors across 29 files
- All basic endpoints implemented, but many gaps identified via comprehensive analysis

**What We're Doing**: Systematically implementing missing features across 7 phases.

---

## Tasks

Complete tasks in STRICT PHASE ORDER. Do NOT start Phase N until ALL tasks in Phase N-1 are complete.

Each task is scoped to complete within a single iteration (5-15 minutes of work).

### Phase 1: Critical TCP Fixes (Blocks Connection)

- [ ] **PH1-01**: Fix M601 command to accept `~M601 S1` format
  - File: `electron/main/services/TcpServer.ts` (line ~316)
  - Add condition to check for `~M601 S1` in addition to `M601`
  - Reference: ff-5mp-api-ts shows client sends `~M601 S1`

- [ ] **PH1-02**: Implement M112 emergency stop
  - File: `electron/main/services/TcpServer.ts`
  - Add handler for M112 command
  - Set job status to idle, emit state change

- [ ] **PH1-03**: Add tilde prefix support to remaining TCP commands
  - File: `electron/main/services/TcpServer.ts`
  - Commands missing `~` support: M23, M104, M140, M146, M662
  - Refactor: Strip `~` prefix at start of command processing

### Phase 2: Core HTTP API (AD5X Support)

- [ ] **PH2-01**: Extend /gcodeList response with gcodeListDetail
  - File: `electron/main/services/HttpServer.ts` (lines 537-543)
  - Add `gcodeListDetail: FFGcodeFileEntry[]` to response
  - For now, return empty array - structure is key

- [ ] **PH2-02**: Fix /gcodeThumb to return PNG data
  - File: `electron/main/services/HttpServer.ts` (lines 548-566)
  - Return placeholder base64 PNG instead of empty string
  - Use small 1x1 transparent PNG: `"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="`

- [ ] **PH2-03**: Add AD5X parameters to /printGcode handler
  - File: `electron/main/services/HttpServer.ts` (lines 571-598)
  - Parse: flowCalibration, useMatlStation, gcodeToolCnt, materialMappings
  - Store in job state for now (implementation later)

- [ ] **PH2-04**: Process AD5X headers in /uploadGcode
  - File: `electron/main/services/HttpServer.ts` (lines 619-623)
  - Remove `void` statements, actually parse and store the values
  - Base64 decode materialMappings if present

- [ ] **PH2-05**: Add coolingLeftFanSpeed to /detail response
  - File: `electron/main/services/HttpServer.ts`
  - Add property after coolingFanSpeed
  - Return 0 for non-AD5X, state value for AD5X

### Phase 3: State Management - Part 1 (Cumulative Stats)

- [ ] **PH3-01**: Add cumulative stats to PrinterState interface
  - File: `shared/types/printer.ts`
  - Add to PrinterState: `cumulativePrintTime: number`, `cumulativeFilament: number`

- [ ] **PH3-02**: Initialize cumulative stats in StateStore
  - File: `electron/main/state/PrinterStateStore.ts`
  - Initialize to 0 in constructor
  - Load from config if available (persist for lifetime tracking)

- [ ] **PH3-03**: Increment cumulative stats on print complete
  - File: `electron/main/state/PrinterStateStore.ts`
  - In simulatePrintProgress, when progress reaches 100
  - Add elapsed time to cumulativePrintTime
  - Add filament used to cumulativeFilament
  - Emit `cumulative-stats-changed` event

- [ ] **PH3-04**: Return cumulative stats in /detail
  - File: `electron/main/services/HttpServer.ts`
  - Return state.cumulativePrintTime and state.cumulativeFilament
  - Currently hardcoded to 0

### Phase 4: State Management - Part 2 (Filament Estimates)

- [ ] **PH4-01**: Add filament estimate properties to types
  - File: `shared/types/printer.ts`
  - Add to PrinterState: `estimatedRightLen`, `estimatedRightWeight`, `estimatedLeftLen`, `estimatedLeftWeight`

- [ ] **PH4-02**: Initialize filament estimates in StateStore
  - File: `electron/main/state/PrinterStateStore.ts`
  - Initialize all to 0 in constructor

- [ ] **PH4-03**: Calculate filament estimates during print
  - File: `electron/main/state/PrinterStateStore.ts`
  - In simulatePrintProgress, update estimates based on progress
  - Simple formula: (progress / 100) * estimated total
  - Use crude estimate for now: 100g per job default

- [ ] **PH4-04**: Return filament estimates in /detail
  - File: `electron/main/services/HttpServer.ts`
  - Return the four estimate values from state

### Phase 5: State Management - Part 3 (AD5X Left Extruder)

- [ ] **PH5-01**: Add left extruder temps to TemperatureState
  - File: `shared/types/printer.ts`
  - Add to TemperatureState: `leftNozzleCurrent: number`, `leftNozzleTarget: number`

- [ ] **PH5-02**: Initialize left extruder temps in StateStore
  - File: `electron/main/state/PrinterStateStore.ts`
  - Initialize both to 0 in constructor

- [ ] **PH5-03**: Add left temp simulation for AD5X
  - File: `electron/main/state/PrinterStateStore.ts`
  - When profile.isAD5X, simulate left temps similar to right
  - Update in simulateTemperatures method

- [ ] **PH5-04**: Return left temps in /detail
  - File: `electron/main/services/HttpServer.ts`
  - Add leftTemp and leftTargetTemp to response
  - Return state values

### Phase 6: State Management - Part 4 (Fan and Material Detection)

- [ ] **PH6-01**: Add left cooling fan to FanState
  - File: `shared/types/printer.ts`
  - Add to FanState: `coolingLeftFanSpeed: number`

- [ ] **PH6-02**: Initialize left fan in StateStore
  - File: `electron/main/state/PrinterStateStore.ts`
  - Initialize to 0 in constructor

- [ ] **PH6-03**: Add material detection properties
  - File: `shared/types/printer.ts`
  - Add to PrinterState: `hasLeftFilament`, `hasRightFilament`, `leftFilamentType`, `rightFilamentType`

- [ ] **PH6-04**: Initialize material detection in StateStore
  - File: `electron/main/state/PrinterStateStore.ts`
  - Initialize: hasLeftFilament=false, hasRightFilament=true (default right loaded)
  - Set rightFilamentType='PLA', leftFilamentType=''

- [ ] **PH6-05**: Return material detection in /detail
  - File: `electron/main/services/HttpServer.ts`
  - Add hasLeftFilament, hasRightFilament, leftFilamentType, rightFilamentType
  - Return state values

### Phase 7: State Management - Part 5 (Print Speed and Misc)

- [ ] **PH7-01**: Add print speed properties to types
  - File: `shared/types/printer.ts`
  - Add to PrinterState: `currentPrintSpeed: number`, `printSpeedAdjust: number`

- [ ] **PH7-02**: Initialize print speed in StateStore
  - File: `electron/main/state/PrinterStateStore.ts`
  - Initialize both to 100 (100% speed)

- [ ] **PH7-03**: Add remaining /detail properties to types
  - File: `shared/types/printer.ts`
  - Add: fillAmount, errorCode, tvoc, zAxisCompensation, remainingDiskSpace

- [ ] **PH7-04**: Initialize remaining properties in StateStore
  - File: `electron/main/state/PrinterStateStore.ts`
  - Initialize: fillAmount=0, errorCode='', tvoc=0, zAxisCompensation=0, remainingDiskSpace=1024*1024*1024

- [ ] **PH7-05**: Return all new properties in /detail
  - File: `electron/main/services/HttpServer.ts`
  - Add all missing properties to response
  - Return state values instead of hardcoded

### Phase 8: TCP Wait Commands (M109/M190/M191)

- [ ] **PH8-01**: Implement M109 (set nozzle temp and wait)
  - File: `electron/main/services/TcpServer.ts`
  - Parse temperature from command
  - Set target, then loop/block until within threshold
  - Return ok when ready

- [ ] **PH8-02**: Implement M190 (set bed temp and wait)
  - File: `electron/main/services/TcpServer.ts`
  - Similar to M109 but for bed

- [ ] **PH8-03**: Implement M191 (wait for bed cooling)
  - File: `electron/main/services/TcpServer.ts`
  - Wait until bed temp drops below specified value

### Phase 9: TCP Movement Commands (G90/G1)

- [ ] **PH9-01**: Implement G90 (absolute positioning)
  - File: `electron/main/services/TcpServer.ts`
  - Set a flag in state for positioning mode
  - For now, just return ok (actual positioning in G1)

- [ ] **PH9-02**: Implement G1 (move to XYZ)
  - File: `electron/main/services/TcpServer.ts`
  - Parse X, Y, Z values from command
  - Update position state

- [ ] **PH9-03**: Implement G1 (extrude E)
  - File: `electron/main/services/TcpServer.ts`
  - Parse E value, update position.e

### Phase 10: TCP Response Format Fixes

- [ ] **PH10-01**: Fix M662 to send binary PNG
  - File: `electron/main/services/TcpServer.ts` (lines 530-547)
  - After ok, write PNG bytes to socket
  - Use setTimeout for delay

- [ ] **PH10-02**: Fix M661 timing (delay file list)
  - File: `electron/main/services/TcpServer.ts`
  - Send ok immediately, file list after 500ms delay

- [ ] **PH10-03**: Fix M114 format (use A/B instead of E)
  - File: `electron/main/services/TcpServer.ts`
  - Change response to use A: and B: for extruders

- [ ] **PH10-04**: Fix M105 format (add T1)
  - File: `electron/main/services/TcpServer.ts`
  - Add T1:0.0/0.0 to response

### Phase 11: TCP Sensor Commands (M405/M406/M240)

- [ ] **PH11-01**: Implement M405 (enable runout sensor)
  - File: `electron/main/services/TcpServer.ts`
  - Set state flag for sensor enabled
  - For 5M Pro only

- [ ] **PH11-02**: Implement M406 (disable runout sensor)
  - File: `electron/main/services/TcpServer.ts`
  - Clear state flag

- [ ] **PH11-03**: Implement M240 (take picture)
  - File: `electron/main/services/TcpServer.ts`
  - Return ok (no actual camera in emulator)

### Phase 12: Print Simulation Enhancements

- [ ] **PH12-01**: Implement Z-axis updates during print
  - File: `electron/main/state/PrinterStateStore.ts`
  - In simulatePrintProgress, update position.z
  - Formula: (currentLayer / totalLayers) * 220 (max height)

- [ ] **PH12-02**: Implement E-axis updates during print
  - File: `electron/main/state/PrinterStateStore.ts`
  - In simulatePrintProgress, update position.e
  - Increment based on progress

- [ ] **PH12-03**: Auto fan ramp-up during print
  - File: `electron/main/state/PrinterStateStore.ts`
  - When status is 'printing', set coolingFanSpeed to 100
  - Return to 0 when idle

- [ ] **PH12-04**: Implement pausing state transition
  - File: `electron/main/state/PrinterStateStore.ts`
  - In pausePrint, set status to 'pausing' first
  - Use setTimeout to transition to 'paused' after 500ms

### Phase 13: File Operations

- [ ] **PH13-01**: Fix FileManager file extension
  - File: `src/components/FileManager.tsx` (line 42)
  - Remove the .replace() that strips extension
  - Preserve full filename with .gcode

- [ ] **PH13-02**: Add /deleteGcode endpoint
  - File: `electron/main/services/HttpServer.ts`
  - New POST endpoint
  - Accept { fileName } body
  - Remove from state.files

- [ ] **PH13-03**: Extend PrinterFile type
  - File: `shared/types/printer.ts`
  - Add: gcodeToolCnt, gcodeToolDatas, useMatlStation, totalFilamentWeight, thumbnail

- [ ] **PH13-04**: Extract thumbnails from uploaded G-code
  - File: `electron/main/services/HttpServer.ts` (upload handler)
  - Parse for `; thumbnail begin` comments
  - Decode base64 and store with file

### Phase 14: Control Commands

- [ ] **PH14-01**: Add temperatureCtl_cmd to /control
  - File: `electron/main/services/HttpServer.ts`
  - Handle temperature control commands
  - Update state temperatures

- [ ] **PH14-02**: Add zAxisCompensation to printerCtl_cmd
  - File: `electron/main/services/HttpServer.ts`
  - Parse args.zAxisCompensation
  - Update state

- [ ] **PH14-03**: Add coolingLeftFan to printerCtl_cmd
  - File: `electron/main/services/HttpServer.ts`
  - Parse args.coolingLeftFan
  - Update state.fan.coolingLeftFanSpeed

### Phase 15: Material Station Fixes

- [ ] **PH15-01**: Fix slot indexing inconsistency
  - File: `electron/main/services/HttpServer.ts` (line 412)
  - Document 0-based vs 1-based convention
  - Fix the slotId - 1 calculation

- [ ] **PH15-02**: Add indepMatlInfo properties
  - File: `shared/types/printer.ts`
  - Add materialColor and materialName to IndepMatlInfo

- [ ] **PH15-03**: Return complete indepMatlInfo in /detail
  - File: `electron/main/services/HttpServer.ts`
  - Populate materialColor and materialName from current slot

### Phase 16: M119 Status Mapping

- [ ] **PH16-01**: Add pausing to M119 status map
  - File: `electron/main/services/TcpServer.ts` (lines 461-472)
  - Map 'pausing' status

- [ ] **PH16-02**: Add cancel to M119 status map
  - File: `electron/main/services/TcpServer.ts`
  - Map 'cancel' status if it exists

---

## Constraints (Do NOT Violate)

The agent MUST NOT:

1. Type Safety: No `any` types, explicit types required
2. Lint Errors: Must NOT push with `npm run lint` errors
3. Format Errors: Must NOT push with `npm run check` errors
4. Type Errors: Must NOT push with `npm run type-check` errors
5. Breaking Changes: Update all usages when changing types
6. New Dependencies: No new npm packages
7. Co-Authored Lines: Do NOT include in commits

---

## Pass Conditions

Workflow complete ONLY when:

- [ ] All tasks above marked complete
- [ ] `npm run type-check` passes (0 errors)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` succeeds

---

## Verification Commands

After EACH task, run ALL of these:

```bash
npm run type-check
npm run lint
npm run check
npm run build
```

**IF ANY FAIL**: Fix before committing. Do NOT push with errors.

---

## Time Tracking Workflow

1. **Get start time**: Record when task starts (use get-time skill or read TIMELOG.md)
2. **Complete task**: Implement, verify commands pass
3. **Get end time**: Use get-time skill
4. **Update TIMELOG.md**: Append entry with date, task ID, description, start, end, duration
5. **Commit TIMELOG.md**: `git add TIMELOG.md && git commit -m "chore: update timelog" && git push`
6. **Commit work**: `git add . && git commit -m "[message]" && git push`

---

## Available Skills

Skills use **progressive disclosure**. Read SKILL.md first, branch out as needed.

### Best Practices & Code Quality

| Skill | When to Use | Path |
|-------|-------------|------|
| best-practices | SOLID, DRY, KISS, YAGNI, architectural principles | `.claude/skills/best-practices/SKILL.md` |
| typescript-best-practices | Type safety, discriminated unions, type guards | `.claude/skills/typescript-best-practices/SKILL.md` |
| biome | Linting, formatting, Biome configuration | `.claude/skills/biome/SKILL.md` |

### Project References (CRITICAL for this work)

| Skill | When to Use | Path |
|-------|-------------|------|
| ff-5mp-api-ts | Production FlashForge 5MP API client (FiveMClient, FlashForgeClient, types) | `.claude/skills/ff-5mp-api-ts/SKILL.md` |
| flashforge-api-docs | Raw TCP/HTTP/UDP protocol specifications | `.claude/skills/flashforge-api-docs/SKILL.md` |
| flashforge-ui-reference | What FlashForgeUI expects from printers | `.claude/skills/flashforge-ui-reference/SKILL.md` |

### Time Tracking

| Skill | When to Use | Path |
|-------|-------------|------|
| get-time | Get current timestamp for TIMELOG.md entries | `.claude/skills/get-time/SKILL.md` |

### Electron & Build Tools

| Skill | When to Use | Path |
|-------|-------------|------|
| electron | Electron APIs, main/renderer/preload processes | `.claude/skills/electron/SKILL.md` |
| electron-vite | Electron + Vite build configuration | `.claude/skills/electron-vite/SKILL.md` |
| electron-builder | Electron app packaging and distribution | `.claude/skills/electron-builder/SKILL.md` |
| electron-store | Data persistence in Electron apps | `.claude/skills/electron-store/SKILL.md` |

### React & Frontend

| Skill | When to Use | Path |
|-------|-------------|------|
| react-19 | React 19 features, hooks, Server Components | `.claude/skills/react-19/SKILL.md` |
| modern-frontend-design | High-quality frontend interfaces, design patterns | `.claude/skills/modern-frontend-design/SKILL.md` |
| tailwind-css | Tailwind CSS v3/v4 utilities and styling | `.claude/skills/tailwind-css/SKILL.md` |
| lucide-react | Icon components | `.claude/skills/lucide-react/SKILL.md` |

### Utilities

| Skill | When to Use | Path |
|-------|-------------|------|
| skill-factory | Create skills from codebases | `.claude/skills/skill-factory/SKILL.md` |
| agent-factory | Create agents for codebases | `.claude/skills/agent-factory/SKILL.md` |

---

## Git Workflow

- **Branch**: `feature/emulator-gap-closures`
- **Commit**: After each task
- **Push**: After each commit
- **Format**: `[phase]: [description]`
- **NO Co-Authored-By**

Time log commits separate: `chore: update timelog`

---

## Key Files

| File | Purpose |
|------|---------|
| `electron/main/services/TcpServer.ts` | TCP commands |
| `electron/main/services/HttpServer.ts` | HTTP endpoints |
| `electron/main/state/PrinterStateStore.ts` | State |
| `shared/types/printer.ts` | Types |
| `src/components/FileManager.tsx` | File UI |
