# FlashForge Emulator V2 Development Guide for Gemini

## Project Overview
FlashForge Emulator V2 is a complete Electron-based emulator for FlashForge 3D printers, supporting both legacy TCP and modern HTTP protocols. It allows developers to test client applications (such as FlashForgeUI) against simulated printer hardware.

## Architecture Overview

### Core Components
- **Main Process** (`electron/main/`): Manages the Electron lifecycle, TCP Server (8899), HTTP Server (8898), UDP Discovery Server (48899), window creation, and central state simulation.
- **Renderer Process** (`src/`): The User Interface, built with React 19 and Tailwind CSS v4. Features tabs for Dashboard, Controls, Files, Logs, and Settings.
- **Preload Scripts** (`electron/preload/`): Secure IPC bridge using contextBridge. Outputs CommonJS (CJS) for sandbox compatibility.
- **Shared Types** (`shared/`): Common TypeScript definitions (e.g., `printer.ts`) used across Main and Renderer boundaries.
- **AI Reference** (`ai_reference/`): Contains production reference implementations. **DO NOT modify files in this directory; they are strictly for reference.**

### Directory Structure Best Practices
- **`src/` (Renderer):** Keep React components, hooks (e.g., `useEmulatorState`), and UI logic strictly in this folder.
- **`electron/main/services/`:** Place network server logic and protocol handling here.
- **`electron/main/state/`:** Centralized logic for maintaining emulator state (e.g., `PrinterStateStore`). This serves as the single source of truth.
- **`electron/main/ipc/`:** Handlers bridging Main backend logic to Renderer requests.

## Development Workflow

### Essential Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development mode (via electron-vite)
- `npm run build` - Build the application for production
- `npm run type-check` - Run TypeScript strict type-checking
- `npm run lint` - Run Biome lint checks
- `npm run format` - Format code with Biome
- `npm run check` - Run Biome linting and apply auto-fixes (`biome check --write .`)

### Code Quality Standards
- **TypeScript Strict Mode**: The project enforces strict mode with 0 errors. Avoid `any` types.
- **Biome Linter**: This project uses Biome (not ESLint/Prettier). Ensure `npm run check` passes with 0 errors after making logic or syntax changes.
- **Documentation**: Use consistent JSDoc-style block comments on all public APIs and components focusing on purpose and key usage notes.

### AI Constraints and Guidelines
- **Testing Limitations**: As an AI, you cannot visually test or run the Electron app. Rely on `type-check` and `lint` scripts to validate code integrity. Only run builds when explicitly requested or structurally required.
- **Shell Commands**: Avoid using the `&&` operator in shell commands on Windows. Instead, use sequential tool executions or standard PowerShell alternatives.
- **Professional Tone**: Maintain a formal and informative tone when writing documentation. **Never use emojis** in official project files or communication.

## FlashForge Printer Context

When simulating behavior or API responses, adhere strictly to these hardware facts:
- **AD5X**: A special multi-color/multi-material 5M series printer with "IFS". Has 4 slots. NO built-in camera, NO OEM LEDs, NO filtration.
- **Adventurer 5M**: Standard model. NO built-in camera, NO OEM LEDs, NO filtration.
- **Adventurer 5M Pro**: HAS a built-in camera, OEM LEDs, AND internal circulation/filtration (reporting TVOC levels).
- **Creator 5**: HTTP-only 4-head tool changer with a 4-slot material station and a 256x256x256 build volume. NO TCP service (the API is HTTP-only). NO chamber heater or sensor (`/detail` reports the -108 sentinel; chamber commands are acknowledged without effect). NO filtration. Door status is cosmetic (always "close"). TVOC field present but 0.
- **Creator 5 Pro**: As Creator 5, PLUS a real chamber heater (max 80 C) with sensor, a real door sensor, and read-only TVOC. Filtration hardware is present but NOT API-controllable (`circulateCtl_cmd` succeeds without actuating). `/product` over-reports `chamberTempCtrlState` (reads 1 on both models) and under-reports the fan control states (read 0 on both) -- gate capabilities by pid/model, not by `/product` flags.

### Protocol Nuances
- **TCP (8899)**: Implements legacy M-commands and G-codes (e.g., `M601`, `M115`, `M105`, `M27`, `G28`). Data such as JSON payloads and thumbnails might be appended after strings like `ok`.
- **HTTP (8898)**: Modern POST API endpoints (e.g., `/detail`, `/product`, `/control`). Requires headers containing `serialNumber` and `checkCode` for authentication.
- **UDP Discovery (48899)**: Multicast pings starting with `www.usr"`. Be cautious regarding duplicate discovery responses if bound to multiple network interfaces.

## When Extending Capability or Editing Files
1. **Verify Correctness**: **ALWAYS** consult the `ai_reference` code before guessing API layouts or endpoints. 
2. **Event Architecture**: Services extend `EventEmitter` and emit canonical events (e.g., `started`, `stopped`, `error`). The `PrinterStateStore` triggers targeted events upon property updates.
3. **No Placeholders**: If required to generate dummy images/assets or placeholders, ask the user or use accurate representations consistent with a premium mockup look.
