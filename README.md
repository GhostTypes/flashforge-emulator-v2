# FlashForge Emulator V2

Fully-featured emulator for FlashForge 3D printers with TCP and HTTP protocol support.

## Features

- **Multi-Model Support**: Adventurer 3, 4, 5M, 5M Pro, and AD5X
- **Dual Protocol**: TCP (legacy port 8899) and HTTP (modern port 8898)
- **Full State Simulation**: Temperatures, positions, print jobs, material station
- **Interactive UI**: Real-time status monitoring and control
- **Auto/Manual Simulation**: Choose how print jobs progress

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build
npm run build

# Regression smoke test
npm run smoke:qa

# Package
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Manual QA Checklist

- Set the printer to `completed` in the QA Console and confirm that state stays visible and a new print cannot start from the File Manager or `Run Auto Lifecycle`.
- Trigger `setClearPlatform` through the HTTP control path or click `Clear to Ready`, then confirm a new print can start again.
- Compare the QA Console live `/detail.detail` preview against `POST /detail` and confirm the status, `estimatedTime`, `printDuration`, and `printEta` values match.
- Verify time units stay correct: `elapsedTimeSeconds` and `printDuration` are seconds, `remainingTime` is minutes, and `formattedEta` / `printEta` stays a firmware-style string or an empty string when intentionally blank.

## Regression Smoke Test

Run `npm run smoke:qa` to validate sticky terminal state blocking, live `/detail` status mapping, ETA/time units, blank firmware ETA handling, and completed-state persistence.

## Project Structure

```
├── electron/          # Electron main and preload processes
│   ├── main/         # Main process (server logic)
│   └── preload/      # Preload scripts (IPC bridge)
├── src/              # React renderer (UI)
├── shared/           # Shared TypeScript types
├── ai_reference/     # Reference documentation (read-only)
├── .claude/          # Claude Code configuration
├── API.md            # Complete API reference (TCP + HTTP)
├── PRD.md            # Product requirements document
└── TIMELOG.md        # Development time log
```

## API Documentation

See [API.md](./API.md) for complete documentation of:
- TCP Protocol (Port 8899) - All G/M-code commands
- HTTP API (Port 8898) - All JSON endpoints
- Authentication
- Error codes
- AD5X material station support

## Source of Truth

All implementation is based on the API documentation in `ai_reference/flashforge-api-docs/`:
- `http-api.md` - Modern HTTP API
- `legacy-api.md` - Legacy TCP API
- `ad5x-api.md` - AD5X material station
- `ad5x-workflow.md` - Multi-material printing

## Tech Stack

- **Electron** - Desktop application framework
- **Vite** - Build tool with hot reload
- **React 19** - UI framework
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Biome** - Linting and formatting
- **Lucide React** - Icons

## License

MIT
