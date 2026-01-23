# FlashForge 3D Printer Emulator - Product Requirements Document

## Project Overview

**Project Name:** FlashForge Emulator V2

**Description:** A fully-featured emulator for FlashForge 3D printers that simulates both TCP (legacy) and HTTP (modern) protocol layers. This emulator will allow developers to test client applications without connecting to physical printers.

**Tech Stack:**
- Electron (desktop application)
- Vite (build tool)
- React 19 (UI framework)
- Tailwind CSS v4 (styling)
- TypeScript (strict mode)
- Biome (linter + formatter)

**Session Start Time:** Thursday, January 22, 2026 at 09:31:01 PM EST

---

## Source of Truth

All implementation MUST be based on the documentation in `ai_reference/`:

1. **FlashForge API Docs** (`ai_reference/flashforge-api-docs/`)
   - `README.md` - API overview
   - `http-api.md` - Modern HTTP API (port 8898)
   - `legacy-api.md` - Legacy TCP API (port 8899)
   - `ad5x-api.md` - AD5X (material station) specifics
   - `ad5x-workflow.md` - Multi-material printing workflow

2. **Existing API Implementation** (`ai_reference/ff-5mp-api-ts/`)
   - Reference for TypeScript patterns, data models, and protocol handling

3. **Existing UI Application** (`ai_reference/FlashForgeUI-Electron/`)
   - Reference for Electron + React patterns, IPC structure, UI components

---

## Architecture Overview

### Protocol Modes

The emulator supports two modes:

1. **Legacy Mode (TCP Only)**
   - Port: 8899
   - Protocol: Text-based G/M-code commands
   - Target: Adventurer 3/4 series, basic 5M functionality

2. **Modern Mode (TCP + HTTP)**
   - TCP Port: 8899 (legacy compatibility)
   - HTTP Port: 8898 (JSON REST API)
   - Target: Adventurer 5M/Pro/AD5X series

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    FlashForge Emulator                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   TCP Server     │    │   HTTP Server    │                   │
│  │   (Port 8899)    │    │   (Port 8898)    │                   │
│  │                  │    │                  │                   │
│  │  - M601 Handshake│    │  - /detail       │                   │
│  │  - G/M Codes     │    │  - /control      │                   │
│  │  - State Machine │    │  - /gcodeList    │                   │
│  │  - File Storage  │    │  - /uploadGcode  │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      ▼                                          │
│           ┌──────────────────────┐                              │
│           │   Printer State      │                              │
│           │   (Single Source)    │                              │
│           ├──────────────────────┤                              │
│           │ • Temperatures       │                              │
│           │ • Position           │                              │
│           │ • Print Status       │                              │
│           │ • File List          │                              │
│           │ • Material Station   │                              │
│           │ • Settings           │                              │
│           └──────────────────────┘                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Electron UI                           │  │
│  │  • Mode Selection (Legacy/Modern)                        │  │
│  │  • Port Configuration                                    │  │
│  │  • Printer State Visualization                          │  │
│  │  • Log Viewer                                            │  │
│  │  • File Management                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task Checklist

### Phase 1: Project Setup & Infrastructure

- [x] **1.1 Initialize Electron + Vite Project**
  - Set up package.json with dependencies
  - Configure electron-vite for main/renderer/preload
  - Set up TypeScript configuration (strict mode)
  - Configure Tailwind CSS v4
  - Set up Biome for linting/formatting

- [x] **1.2 Configure Build & Development Scripts**
  - Development mode with hot reload
  - Production build scripts
  - electron-builder configuration for packaging

- [x] **1.3 Set Up Project Structure**
  - Main process (Electron entry)
  - Preload scripts (IPC bridge)
  - Renderer (React UI)
  - Shared types
  - Protocol handlers

### Phase 2: Core State Management

- [x] **2.1 Implement Printer State Store**
  - Single source of truth for all printer state
  - Temperature state (nozzle, bed, chamber)
  - Position state (X, Y, Z, E)
  - Print job state (file, progress, status)
  - File storage state
  - Settings state
  - Full simulation for all states (no G-code parsing required)
  - Support for all printer models (Adventurer 3/4/5M/5M Pro/AD5X)

- [x] **2.2 Implement Printer Profiles**
  - Pre-configured profiles for each model
  - Profile-specific capabilities and defaults
  - Adventurer 3: TCP only, basic features
  - Adventurer 4: TCP only, enhanced features
  - Adventurer 5M: TCP + HTTP, modern features
  - Adventurer 5M Pro: TCP + HTTP, camera, LEDs
  - AD5X: TCP + HTTP, material station (IFS)

- [x] **2.3 Implement State Persistence**
  - Save state to disk (electron-store)
  - Load state on startup
  - Reset state functionality
  - Clean slate on startup

- [x] **2.4 Create State Machine for Print Jobs**
  - States: idle, heating, printing, paused, completed, error
  - Transitions and validation
  - Event emission for state changes
  - Auto-simulation mode: Automatically advance progress, temperatures
  - Manual mode: User controls each state transition

### Phase 3: TCP Protocol Server

- [x] **3.1 TCP Server Setup**
  - Create TCP server on port 8899
  - Handle multiple connections
  - Connection cleanup on disconnect

- [x] **3.2 Implement Handshake (M601/M602)**
  - M601 request control flow
  - Control state tracking
  - M602 release control
  - "Control Success V2.1" response

- [x] **3.3 Implement Information Commands**
  - M115 - Get printer information
  - M105 - Get temperatures
  - M119 - Get endstop and printer status
  - M114 - Get current position
  - M27 - Get print status
  - M661 - Get local file list
  - M662 - Get file thumbnail (PNG)

- [x] **3.4 Implement Control Commands**
  - G28 - Home axes
  - M23 - Start print job
  - M24 - Resume print
  - M25 - Pause print
  - M26 - Stop print
  - M104 - Set extruder temperature
  - M140 - Set bed temperature
  - M146 - LED control

- [x] **3.5 Implement Keep-Alive**
  - Send periodic commands to maintain connection
  - Detect stale connections

### Phase 4: HTTP Protocol Server

- [x] **4.1 HTTP Server Setup**
  - Create Express server on port 8898
  - Configure JSON body parsing
  - Configure multipart/form-data for file uploads

- [x] **4.2 Implement Authentication**
  - Validate serialNumber and checkCode
  - Return auth errors (code 3)

- [x] **4.3 Implement /detail Endpoint**
  - Return full printer state as JSON
  - Match exact response format from API docs

- [x] **4.4 Implement /product Endpoint**
  - Return feature availability flags
  - LED, fan, temperature control states

- [x] **4.5 Implement /control Endpoint**
  - lightControl_cmd
  - printerCtl_cmd
  - jobCtl_cmd
  - circulateCtl_cmd
  - streamCtrl_cmd
  - stateCtrl_cmd

- [x] **4.6 Implement File Operations**
  - /gcodeList - Get recent files
  - /gcodeThumb - Get file thumbnail
  - /uploadGcode - Upload file (multipart)
  - /printGcode - Start print job

### Phase 5: AD5X Material Station Support

- [x] **5.1 Implement Material Station State**
  - Slot tracking (1-4)
  - Filament detection
  - Material type and color per slot

- [x] **5.2 Extend /detail for AD5X**
  - hasMatlStation flag
  - matlStationInfo structure
  - slotInfos array

- [x] **5.3 Implement Material Mapping**
  - Validate materialMappings in upload/print
  - Tool ID to slot ID mapping

### Phase 6: User Interface

- [x] **6.1 Create Main Layout**
  - Sidebar navigation
  - Status dashboard
  - Log viewer panel

- [x] **6.2 Implement Status Dashboard**
  - Connection status indicator
  - Temperature displays
  - Position display
  - Current job info

- [x] **6.3 Implement Settings Panel**
  - Printer profile selector (dropdown with all models)
  - Pre-configured profiles: Adventurer 3, Adventurer 4, Adventurer 5M, Adventurer 5M Pro, AD5X
  - Mode selection (Legacy/Modern) - auto-selected based on profile
  - Port configuration
  - Authentication settings (serial/check code)
  - Material station configuration (AD5X only)
  - Clean slate on startup with profile selection

- [x] **6.4 Implement Print Simulation Controls**
  - Toggle between auto-simulation and manual control
  - Auto-simulation: Automatically advance print progress, temperatures, etc.
  - Manual control: User controls state transitions

- [x] **6.5 Implement File Manager**
  - Upload files
  - View file list
  - Delete files
  - Set active job

- [x] **6.6 Implement Log Viewer**
  - Real-time TCP command log
  - HTTP request/response log
  - Filterable by type

### Phase 7: Testing & Quality Assurance

- [x] **7.1 Type Safety**
  - Ensure all TypeScript files use strict mode
  - No `any` types
  - Explicit return types on public APIs

- [x] **7.2 Code Quality**
  - Pass Biome lint (zero errors)
  - Pass Biome format check
  - No console.log in production code

- [x] **7.3 Build Verification**
  - Successful development build
  - Successful production build
  - electron-builder packaging works

### Phase 8: Documentation

- [x] **8.1 Create README.md**
  - Installation instructions
  - Development guide
  - Usage guide

- [x] **8.2 Document API Endpoints**
  - TCP commands reference
  - HTTP endpoints reference

- [x] **8.3 Create TIMELOG.md**
  - Track time spent on each phase
  - Session summaries

---

## Available Skills (Reference During Development)

### Core Skills (Always Use)
- **best-practices** - SOLID, DRY, KISS, YAGNI, SoC, SSOT
- **typescript-best-practices** - Strict types, discriminated unions, type guards

### Technology Skills (Invoke When Needed)
- **electron** - Electron APIs, IPC, security, sandbox
- **electron-vite** - Build configuration, HMR, hot reload
- **electron-store** - Data persistence
- **electron-builder** - Packaging and distribution
- **react-19** - React components, hooks, forms
- **tailwind-css** - Utility classes, styling
- **lucide-react** - Icons (always use for icons)

### Design Skills
- **modern-frontend-design** - UI design, NO emojis, unique aesthetics

### Utility Skills
- **biome** - Linting and formatting
- **get-time** - Timestamp tracking for TIMELOG.md

---

## Constraints (Hard Boundaries)

### Files NOT to Modify
- `ai_reference/` - Read-only reference material
- `.claude/` - Claude configuration (except PRD.md, progress.txt, TIMELOG.md)

### Actions Forbidden
- Do NOT deploy to production stores
- Do NOT connect to real physical printers during development
- Do NOT use emojis anywhere in the UI
- Do NOT use default purple/indigo gradients
- Do NOT create generic three-column layouts
- Do NOT skip TypeScript strict mode
- Do NOT use `any` types

### Code Style Requirements
- All `.ts` and `.tsx` files must have `@fileoverview` block
- Use `import type` for type-only imports
- Prefer named exports over default exports
- Use `readonly` for immutable interfaces
- Use discriminated unions for state
- Use Result types for error handling

---

## Pass Conditions (When Is This Complete?)

### Must Be True
1. All Phase 1-7 tasks are complete
2. `npm run lint` passes with zero errors
3. `npm run type-check` passes with zero errors
4. `npm run build` completes successfully
5. Application launches in both development and production modes
6. TCP server accepts connections on port 8899
7. HTTP server accepts requests on port 8898
8. All documented commands/endpoints are implemented
9. UI displays real-time state changes
10. TIMELOG.md is complete with all sessions

### Verification Commands
```bash
npm run lint          # Biome lint check
npm run type-check    # TypeScript type check
npm run build         # Production build
npm run dev           # Development mode
```

---

## Git Workflow

### Branch Strategy
- Main branch: `main`
- Development branch: `develop`
- Feature branches: `feature/phase-{N}-{description}`

### Commit Convention
- After each phase/task completion
- Commit message format:
  ```
  {phase}: {description}

  - {detail 1}
  - {detail 2}

  Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
  ```

### Push Strategy
- Push after each significant task completion
- Never push broken builds
- Always run lint/type-check before push

---

## Iteration Settings

### Maximum Iterations: 100

This is a large project with multiple phases. Estimated iterations:
- Phase 1 (Setup): 5-10 iterations
- Phase 2 (State): 10-15 iterations
- Phase 3 (TCP): 15-20 iterations
- Phase 4 (HTTP): 15-20 iterations
- Phase 5 (AD5X): 5-10 iterations
- Phase 6 (UI): 20-25 iterations
- Phase 7 (Testing): 5-10 iterations
- Phase 8 (Docs): 5-10 iterations

### Max-Turns Per Iteration: 50

Allows for complex multi-file changes within a single iteration.

---

## Time Tracking

**Start Time:** Thursday, January 22, 2026 at 09:31:01 PM EST

All time entries will be recorded in `TIMELOG.md` following this format:

```markdown
### Session {N}: {Date}

**Start:** {timestamp}
**End:** {timestamp}
**Duration:** {calculated duration}

**Tasks Completed:**
- [x] {task 1}
- [x] {task 2}

**Accomplishments:**
- {what was built/achieved}

**Total Time: {duration}**
```

---

## Notes

- This is a greenfield project - build from scratch
- Reference existing implementations in `ai_reference/` for patterns
- Always invoke skills when working on related technologies
- Keep code DRY and follow SOLID principles
- Test via manual runtime (user will handle)
- Static checks (lint, type-check) must pass

---

**Last Updated:** Thursday, January 22, 2026 at 09:31:01 PM EST
