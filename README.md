# FlashForge Emulator V2

Fully-featured emulator for FlashForge 3D printers with TCP and HTTP protocol support.

## Features

- **Multi-Model Support**: Adventurer 3, 4, 5M, 5M Pro, AD5X, Creator 5, and Creator 5 Pro
- **Dual Protocol**: TCP (legacy port 8899) and HTTP (modern port 8898)
- **Full State Simulation**: Temperatures, positions, print jobs, material station
- **Interactive UI**: Real-time status monitoring and control
- **Auto/Manual Simulation**: Choose how print jobs progress

## Supported Models

| Model | Protocols | Capability summary |
|---|---|---|
| Adventurer 3 / 4 | TCP only | Legacy M/G-code protocol |
| Adventurer 5M | HTTP + TCP | Single tool head |
| Adventurer 5M Pro | HTTP + TCP | Camera, LEDs, chamber heater, filtration |
| AD5X | HTTP + TCP | HTTP + TCP| 4-slot material station |
| Creator 5 | HTTP only | 4-head tool changer, 4-slot material station, 256x256x256 build volume |
| Creator 5 Pro | HTTP only | As Creator 5, plus chamber heater (80 C max), door sensor, and TVOC sensing; filtration is present but not controllable over the API |

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

## Headless + Multi-instance for E2E

Run one headless emulator instance (no Electron UI):

```bash
npm run headless:instance -- \
  --instance-id printer-a \
  --model adventurer-5m-pro \
  --serial E2E-SN-A \
  --check-code E2E-CODE-A \
  --machine-name "E2E Printer A" \
  --tcp-port 28899 \
  --http-port 28898 \
  --discovery-enabled true \
  --simulation-mode auto \
  --simulation-speed 100
```

When startup is complete, the process prints:

```text
EMULATOR_READY
{"instanceId":"printer-a","ip":"...","tcpPort":28899,"httpPort":28898,"serial":"E2E-SN-A","model":"adventurer-5m-pro"}
```

Health/readiness endpoint:

```bash
curl http://127.0.0.1:28898/__health
```

Run multiple instances from JSON:

```bash
npm run headless:supervisor -- --config scripts/headless/multi-instance.example.json
```

Supervisor enforces unique instance IDs, serials, and runtime ports (`tcpPort` + `httpPort`), emits `EMULATOR_READY` lines per instance, and exits non-zero if any instance fails startup.

Run headless tests:

```bash
npm run test:unit
npm run test:integration
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
└── shared/           # Shared TypeScript types
```
## Tech Stack

- **Electron** - Desktop application framework
- **Vite** - Build tool with hot reload
- **React 19** - UI framework
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Biome** - Linting and formatting
- **Lucide React** - Icons

## License

[MIT](./LICENSE)

## Disclaimer

This is an independent, unofficial project. It is not affiliated with, authorized by,
endorsed by, or in any way connected to Zhejiang Flashforge 3D Technology Co., Ltd.
"FlashForge", "Adventurer", and any related product names are trademarks of their
respective owners and are used here only to describe which printers this software
emulates.

The emulator reimplements observed network protocol behaviour for interoperability and
testing. It contains no FlashForge firmware, source code, or other proprietary
material.
