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
  --simulation-speed 100 \
  --strict-control false
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

### Strict `/control` mode (optional)

Real firmware silently ACKs unrecognized `/control` commands with `{"code":0,"message":"Success"}` (verified on Creator 5). The emulator reproduces that by default — which means client test-suites can false-pass when they send a typo'd or unsupported `cmd`. For that case, instances can opt into stricter behavior:

```bash
npm run headless:instance -- \
  --instance-id strict-a \
  --model adventurer-5m-pro \
  --serial E2E-SN-A \
  --check-code E2E-CODE-A \
  --strict-control true \
  ... # a bare --strict-control also works
```

With `--strict-control` on, a `/control` cmd that is neither implemented by the emulator nor documented for that model (per `DOCUMENTED_CONTROL_COMMANDS` in `shared/types/printer.ts`, transcribed from the firmware-verified API docs) is rejected with `{"code":-1,"message":"Unknown command '<cmd>' rejected by strict control mode"}` instead of the silent ACK. Commands that real firmware documents but the emulator does not implement (e.g. `delayClose_cmd`, `userProfile_cmd`) are still ACK'd — rejecting real commands would false-fail legitimate clients. The flag is also accepted per-instance in the supervisor config JSON (`"strictControl": true`) and is visible in `/__state` under `config.strictControl`.

### Spoolman mock sidecar (optional)

FlashForgeWebUI and FlashForgeUI-Electron talk to a real [Spoolman](https://github.com/Donkie/Spoolman)
server for spool selection and filament-usage deduction. For e2e runs, this repo ships a
standalone mocked Spoolman sidecar that speaks exactly the API subset those frontends use
(derived from their `SpoolmanService`). It is one process per test run — it is not part of a
printer instance, registers nothing in `.emulator/instances.json`, and has no Electron
dependency, so it runs in plain CI containers.

```bash
npm run headless:spoolman -- --port 7912                  # default seed (6 spools)
npm run headless:spoolman -- --seed spools.json           # seed from a JSON file
npm run headless:spoolman -- --seed '[{"id":1,"filament":{"name":"PLA"}}]'  # inline JSON
```

On startup it prints a single readiness marker plus a JSON payload (mirroring
`EMULATOR_READY`):

```text
SPOOLMAN_READY
{"port":7912,"spoolCount":6,"seedSource":"default"}
```

Spoolman-faithful routes (same JSON field names and status codes as the real service —
spool objects match the frontends' `SpoolResponse` type, with `remaining_weight`,
`used_weight`, `filament.color_hex`, etc.):

| Route | Description |
|---|---|
| `GET /api/v1/spool` | List spools. Supports `filament.name`, `filament.material`, `filament.vendor.name`, `location`, `lot_nr` (case-insensitive substring, comma-separated any-of), `allow_archived` (default `false`), `sort` (`-field` for descending), `limit`, `offset`. |
| `GET /api/v1/spool/:id` | Fetch one spool. `404` with `{"message":...,"type":"spool"}` when unknown; non-numeric ids are `422`. |
| `PUT /api/v1/spool/:id/use` | Deduct usage. Body `{"use_weight": <g>}` XOR `{"use_length": <mm>}` (422 otherwise or when ≤ 0); decrements `remaining_weight`, increments `used_weight`, converts between weight and length via the filament's `density`/`diameter`, stamps `first_used`/`last_used`, returns the updated spool. |

Test-control routes (internal, non-Spoolman by design, same `__` conventions as the
emulator's orchestration API):

| Route | Description |
|---|---|
| `GET /__requests` | Ordered ledger of accepted usage PUTs: `{ok:true, requests:[{spoolId, useWeight, useLength, timestamp}]}`. Rejected (404/422) PUTs are not recorded. |
| `POST /__reset` | Restore spool state to seed values and clear the ledger. |
| `POST /__shutdown` | Graceful exit (responds, then exits 0; SIGINT/SIGTERM do the same). |

State is in memory only. Seeds accept a lenient subset of spool fields (`id` and
`filament.name` required; `vendor` may be a plain string); everything else defaults
Spoolman-shaped (`density` 1.24, `diameter` 1.75, `weight` 1000, lengths derived from
weights). `remaining_weight` defaults to `weight - used_weight`. Invalid seeds, unknown
options, and port conflicts fail loudly with a non-zero exit and a clear stderr message.

Run headless tests:

```bash
npm run test:unit
npm run test:integration
```

Stop every running headless instance (Windows-safe tree kill):

```bash
npm run kill:all
```

Instances register themselves in `.emulator/instances.json` (gitignored) when they reach readiness. `kill:all` tree-kills each registered process — plain PID kills on Windows leave the `tsx` grandchild alive holding the ports — and prunes entries whose process is already gone. `POST /__shutdown` on an instance's HTTP port also stops it gracefully from outside.

## Running the Emulator in CI

Downstream repos that drive the emulator in E2E (e.g. FlashForgeUI-Electron) should:

1. **Pin the emulator checkout to a release tag** (e.g. `ref: v0.2.0`) instead of a branch head, so an emulator change cannot silently break — or silently change — downstream CI.
2. **Skip the Electron binary download** when only headless instances are used. The headless runtime never touches Electron, so set `ELECTRON_SKIP_BINARY_DOWNLOAD: '1'` on the emulator's `npm ci` step. This avoids a ~110 MB download per CI run and is a supported Electron installer flag, not a hack. The emulator's own CI and `npm run dev` do not set it.

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
