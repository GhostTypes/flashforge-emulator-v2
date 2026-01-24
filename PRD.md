# FlashForge Emulator - Final Gap Closure PRD

## Project Context

**Project**: FlashForge Emulator V2 - A complete Electron-based emulator for FlashForge 3D printers

**Purpose**: Fix all remaining protocol compatibility gaps between the emulator and production FlashForge printers to achieve full FlashForgeUI/ff-5mp-api-ts compatibility.

**Tech Stack**:
- Electron + React 19 + TypeScript
- Biome for linting/formatting
- TCP (8899), HTTP (8898), UDP Discovery (48899) protocols

**Current State**: TypeScript strict mode (0 errors), Biome lint (0 errors across 32 files), but 14 gap issues identified by gap analyzer agents.

---

## Tasks

Complete tasks in STRICT ORDER. Each task must be completed and verified before moving to the next.

### Priority 1 (Critical - Field Name Mismatches & Blocking)

- [ ] **P1-01**: Fix field name: `coolingLeftFanSpeed` → `coolingFanLeftSpeed`
  - File: `electron/main/services/HttpServer.ts` (line 449)
  - Production API expects `coolingFanLeftSpeed` for AD5X
  - Change field name in `/detail` response
  - Reference: `ff-5mp-api-ts/src/models/ff-models.ts` uses `CoolingFanLeftSpeed`

- [ ] **P1-02**: Fix nozzleCount for AD5X (should be 2, not 1)
  - File: `electron/main/state/PrinterStateStore.ts` (line 121)
  - AD5X is dual extruder, should report `nozzleCnt: 2`
  - Update: `nozzleCount: profile.hasMaterialStation ? 2 : 1`

- [ ] **P1-03**: Fix machineName for AD5X detection
  - File: `electron/main/state/PrinterStateStore.ts` (line 117)
  - Production detects AD5X by checking `name === "AD5X"`
  - Change to: `machineName: profile.hasMaterialStation ? 'AD5X' : `${profile.name} Emulator``

- [ ] **P1-04**: Make left extruder fields AD5X-only
  - File: `electron/main/services/HttpServer.ts` (lines 466-469, 488)
  - Move `hasLeftFilament`, `leftFilamentType`, `leftTemp`, `leftTargetTemp` inside `if (profile.hasMaterialStation)` block
  - Non-AD5X models should NOT return these fields at all

- [ ] **P1-05**: Populate gcodeListDetail with actual file metadata
  - File: `electron/main/services/HttpServer.ts` (line 672)
  - Build array from files with `gcodeFileName`, `gcodeToolCnt`, `gcodeToolDatas`, `printingTime`, `totalFilamentWeight`, `useMatlStation`
  - Reference: `ff-5mp-api-ts/src/models/ff-models.ts` FFGcodeFileEntry

- [ ] **P1-06**: Fix M105 temperature response format
  - File: `electron/main/services/TcpServer.ts` (lines 496-500)
  - Remove decimal point from nozzle temps: use `toFixed(0)` not `toFixed(1)`
  - Add `@:0` field (nozzle heater PWM)
  - Add `B@:0` field (bed heater PWM)
  - Format: `T0:25/0 T1:25/0 B:28/0 @:0 B@:0`

- [ ] **P1-07**: Fix MAC address format (don't strip colons)
  - File: `electron/main/services/HttpServer.ts` (line 471)
  - Change from: `macAddr: state.macAddress.replace(/:/g, '')`
  - Change to: `macAddr: state.macAddress`
  - Real printer returns MAC with colons: `"88:A9:A7:9D:2A:70"`

### Priority 2 (High - Functional)

- [ ] **P2-01**: Add G91 relative positioning command
  - File: `electron/main/services/TcpServer.ts` (after line 371)
  - Add handler for `G91` command
  - Update state to set `positioningMode: 'relative'`
  - Return ok response

- [ ] **P2-02**: Fix indepMatlInfo structure
  - File: `electron/main/services/HttpServer.ts` (lines 521-529)
  - Remove `currentLoadSlot` and `currentSlot` from indepMatlInfo
  - Should only contain: `materialColor`, `materialName`, `stateAction`, `stateStep`
  - Reference: `ff-5mp-api-ts/src/models/ff-models.ts` lines 164-173

- [ ] **P2-03**: Add measure field to /detail response
  - File: `electron/main/services/HttpServer.ts` (around line 475)
  - Add: `measure: `${profile.buildVolume.x}X${profile.buildVolume.y}X${profile.buildVolume.z}``
  - Example: `"measure": "220X220X220"`

- [ ] **P2-04**: Use extracted thumbnail for TCP M662
  - File: `electron/main/services/TcpServer.ts` (lines 612-620)
  - Use `file.thumbnail` instead of hardcoded PNG
  - Fallback to placeholder if thumbnail empty

- [ ] **P2-05**: Persist speed parameter in printerCtl_cmd
  - File: `electron/main/services/HttpServer.ts` (lines 573-575)
  - Store speed value to state: `printerStateStore.updatePrintSpeed(args.speed)`
  - Add method to PrinterStateStore if needed

- [ ] **P2-06**: Add heating state transition on temperature changes
  - File: `electron/main/services/HttpServer.ts` (temperatureCtl_cmd handler)
  - When target temps > current temps and status is idle, transition to 'heating'
  - Matches real printer behavior

- [ ] **P2-07**: Omit hasMatlStation for non-AD5X models
  - File: `electron/main/services/HttpServer.ts` (line 531)
  - Remove: `detail['hasMatlStation'] = false;`
  - Non-AD5X should not include this field at all

---

## Constraints (Do NOT Violate)

The agent MUST NOT:

1. **Type Safety**: No `any` types, explicit types required
2. **Lint Errors**: Must NOT push with `npm run lint` errors
3. **Type Errors**: Must NOT push with `npm run type-check` errors
4. **Breaking Changes**: Update all usages when changing types
5. **New Dependencies**: No new npm packages
6. **Co-Authored Lines**: Do NOT include in commits
7. **Modify TIMELOG.md**: Preserve the existing timelog file
8. **Change production reference code**: Only read from `ff-5mp-api-ts`, never modify

---

## Pass Conditions (MUST Be True for Completion)

The workflow is complete ONLY when ALL of these are true:

- [ ] All 14 tasks above are marked complete
- [ ] `npm run type-check` passes (0 errors)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] All TCP/HTTP responses match production API format
- [ ] AD5X-specific fields only appear for AD5X model
- [ ] Single-extruder models don't advertise left extruder

---

## Verification Commands

Run these after each task to validate your work:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Git status (should be clean after push)
git status
```

**IF ANY FAIL**: Fix before committing. Do NOT push with errors.

---

## Available Skills (Read When Needed)

> Skills use **progressive disclosure**. Don't bulk-read all skill files.
> Start with the SKILL.md file and branch out based on what you need.

| Skill Name | When to Use | Path |
|------------|-------------|------|
| ff-5mp-api-ts | Reference for production API format | `.claude/skills/ff-5mp-api-ts/SKILL.md` |
| flashforge-api-docs | TCP/HTTP protocol specifications | `.claude/skills/flashforge-api-docs/SKILL.md` |
| typescript-best-practices | Type safety patterns | `.claude/skills/typescript-best-practices/SKILL.md` |
| biome | Linting/formatting | `.claude/skills/biome/SKILL.md` |
| best-practices | SOLID, DRY, KISS principles | `.claude/skills/best-practices/SKILL.md` |

**How to reference production code:**
- Read from: `C:\Users\Cope\Documents\GitHub\ff-5mp-api-ts\`
- Key files: `src/models/ff-models.ts`, `src/models/MachineInfo.ts`, `src/api/controls/`
- Match field names, types, and structure EXACTLY

---

## Git Workflow

- Branch: `feature/emulator-gap-closures` (already exists)
- Commit after each task with descriptive message
- Push after each commit
- Format: `fix(scope): description` or `feat(scope): description`
- Do NOT include "Co-Authored-By" lines in commits

---

## Time Tracking

After each task:
1. Get current time
2. Update TIMELOG.md with task completion
3. Commit TIMELOG.md separately: `git add TIMELOG.md && git commit -m "chore: update timelog" && git push`
4. Commit work: `git add . && git commit -m "message" && git push`

TIMELOG.md format:
```markdown
### 2026-01-23 - Final Gap Closure
| Start | End | Task | Duration |
|-------|-----|------|----------|
| timestamp | timestamp | P1-01: description | ~X minutes |
```
