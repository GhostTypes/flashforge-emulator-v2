# CLAUDE.md -- FlashForge Emulator V2

Guidance for AI assistants working in this repo. The emulator simulates FlashForge Adventurer
series printers (3, 4, 5M, 5M Pro, AD5X) over HTTP/TCP/UDP so developers can test client apps
(Android, WebUI, desktop Electron) without real hardware.

## PID model detection

The Android app (`flashforgeui-app`) uses `pid` from `/detail` as the primary model-detection
mechanism via `PrinterModel.fromDetail()`. The emulator maps model strings to correct PID values
via the `PRINTER_PID` constant in `shared/types/printer.ts`:

| Model string | pid |
|---|---|
| `adventurer-5m` | 35 |
| `adventurer-5m-pro` | 36 |
| `adventurer-5x` | 38 |

Adventurer 3 and 4 are TCP-only legacy models -- the Android app has no PID values for them
and doesn't use PID-based detection. They fall back to `0`.

## Tech stack

- **Electron + Vite** (electron-vite) for main/preload/renderer
- **React 19 + Tailwind CSS v4** for the QA console UI (`src/`)
- **TypeScript** strict mode, no `any`
- **Biome** for linting and formatting (not ESLint/Prettier)
- **Express + multer** for the HTTP server
- **Zod** for runtime validation (headless config)

## Build and run

```bash
npm install
npm run dev              # Electron dev mode with QA console UI
npm run build            # Production build
npm run type-check       # TypeScript strict, 0 errors expected
npm run lint             # Biome check
npm run lint:fix         # Biome check --write
npm run smoke:qa         # QA regression smoke test (50+ assertions)
npm run test:unit        # Unit tests (6)
npm run test:integration # Integration tests (2)
npm run build:win / build:mac / build:linux
```

### Headless mode

```bash
npm run headless:instance -- \
  --instance-id test \
  --model adventurer-5m-pro \
  --serial TEST-SN \
  --check-code TEST-CC \
  --tcp-port 28899 \
  --http-port 28898 \
  --discovery-enabled true \
  --simulation-mode auto \
  --simulation-speed 100
```

- Prints `EMULATOR_READY` + JSON config on stdout when servers are up.
- Multi-instance supervisor: `npm run headless:supervisor` with unique enforcement per instance.
- Config file: `scripts/headless/multi-instance.example.json`.

## Project structure

```
flashforge-emulator-v2/
├── electron/main/
│   ├── index.ts           # Electron entry, window creation
│   ├── ipc/StateHandlers  # IPC bridge for renderer
│   ├── services/
│   │   ├── HttpServer     # Express on 8898 -- all HTTP endpoints
│   │   ├── TcpServer      # Raw socket on 8899 -- M/G-code commands
│   │   ├── UdpDiscoveryServer  # Modern + Legacy UDP discovery
│   │   └── SimulationService   # Auto state progression
│   ├── state/
│   │   ├── PrinterStateStore   # Single source of truth for printer state
│   │   └── ProtocolLogStore    # Captures sent/received protocol data
│   └── utils/             # Network utilities
├── electron/preload/      # contextBridge IPC
├── src/                   # React renderer (QA console)
│   ├── components/        # Dashboard, PrintControls, FileManager, Settings, Logs, Sidebar
│   ├── hooks/useEmulatorState.ts
│   └── App.tsx, main.tsx
├── shared/
│   ├── types/printer.ts   # All types, PrinterModel union, PRINTER_PROFILES, EmulatorConfig
│   └── serializers/httpDetail.ts  # Single source of truth for /detail payload
├── scripts/
│   ├── headless/          # Headless runtime + supervisor
│   ├── tests/             # Unit + integration tests
│   └── qa-regression-smoke.ts
├── ai_reference/          # Reference implementations -- READ ONLY, do not modify
├── API.md                 # Emulator API documentation
└── PRD.md                 # Product requirements
```

## What's implemented

### HTTP API (port 8898)

All endpoints are `POST` unless noted. Auth via JSON body `serialNumber` + `checkCode` (default:
`SNEMULATOR001` / `12345`). Upload also accepts header auth.

| Endpoint | Purpose |
|---|---|
| `GET /__health` | Health check |
| `POST /detail` | Full printer state -- 40+ fields |
| `POST /product` | Capability flags per model |
| `POST /control` | 7 core commands (see below) |
| `POST /gcodeList` | File listing |
| `POST /gcodeThumb` | File thumbnail |
| `POST /printGcode` | Start a print job |
| `POST /uploadGcode` | Multipart file upload |
| `POST /deleteGcode` | Delete a file |

**`/control` commands**: `lightControl_cmd`, `printerCtl_cmd`, `jobCtl_cmd`, `circulateCtl_cmd`,
`streamCtrl_cmd`, `stateCtrl_cmd`, `temperatureCtl_cmd`.

### Internal control API (unauthenticated)

Admin-level routes for external orchestrators (AI agents, CI scripts) to control the emulator
at runtime. All are unauthenticated and use the `/__` prefix to distinguish from printer protocol.

| Route | Method | Purpose |
|---|---|---|
| `/__health` | GET | Health check + identity (existing) |
| `/__state` | GET | Full internal state dump -- config, simulation status, files, presets |
| `/__scenario` | POST | Apply a named preset or raw `PrinterScenario` object |
| `/__simulate` | POST | Pause/resume/restart simulation tick, change speed at runtime |
| `/__reset` | POST | Wipe state back to initial idle |

**`POST /__scenario`** accepts either `{ "preset": "printing" }` or
`{ "scenario": { "machineStatus": "idle", ... } }` (mutually exclusive). Available presets:
`idle`, `heating`, `printing`, `paused`, `pausing`, `completed`, `cancelled`, `error`,
`cooling-after-completion`.

**`POST /__simulate`** accepts `{ "action": "pause"|"resume"|"restart", "speed": 1-1000 }`.
Both fields optional, can be combined.

### Legacy models have NO HTTP printer API

Adventurer 3/4 (`protocolMode: 'legacy'`) have no HTTP REST server on real hardware -- they
are TCP-only. To preserve test fidelity, `HttpServer` gates on `#isLegacyModel()`: legacy
models still bind 8898 and serve the internal `/__*` orchestration routes (so CI/agents can
drive them), but every printer protocol route (`/detail`, `/product`, `/control`, ...) returns
a plain-text **HTTP 404** (`No HTTP endpoint: <method> <path> (legacy TCP-only model)`).

This is deliberate: the Android app's `getDetail()` must FAIL on these models so it falls
through to TCP `~M115` identification (`identifyViaTcp()`), exactly as against real hardware.
If the emulator answered `/detail` (pid 0 -> UNKNOWN -> modern backend), the legacy TCP path
would never be exercised. The 404 body is plain text, not a `{code,...}` envelope, so the app
cannot mistake it for a valid-but-error API response. Do not add a `forceLegacy` crutch on the
app side -- HTTP-fails -> TCP-fallback is the real detection flow we are testing.

### TCP protocol (port 8899)

Full M601/M602 handshake (request/release control). Commands that require control must be
preceded by `M601`.

| Category | Commands |
|---|---|
| Handshake | `M601`, `M602` |
| Info | `M115`, `M105`, `M119`, `M114`, `M27` |
| Files | `M661` (list), `M662` (thumbnail) |
| Job control | `M23` (select), `M24` (start), `M25` (pause), `M26` (cancel) |
| Temperature | `M104`, `M109` (nozzle, async), `M140`, `M190` (bed, async), `M191` (chamber, async) |
| LED | `M146` |
| Motion | `G28` (home), `G1` (move), `G90`/`G91` (abs/rel) |
| Extras | `M405`/`M406` (quick stop resume), `M240` (photo), `M112` (emergency stop) |

#### Adventurer 3 legacy TCP wire formats

A3 (`#isA3()` -> `model === 'adventurer-3'`) responses differ from modern (5M/5M Pro/AD5X)
formats and are aligned **byte-for-byte to the canonical docs**
(`flashforge-api-docs/endpoints/networkserver_commands_adventurer3.yaml`, FW v1.3.7). The
prior emulator formats were wrong in several places; the canonical docs always win over
emulator/app agreement (see `memory/trust-canonical-api-docs.md`). Authoritative A3 frames
(`\n`-separated; no `~` in responses):

| Cmd | A3 response | Notes vs modern |
|---|---|---|
| `M115` | `echo: Machine Type: FlashForge Adventurer III` + `Machine Name:` / `Firmware:` / `Serial Number:` / `X: Y: Z:` / `Tool Count:` / `Mac Address:<colons>` | **No** `CMD` prefix, **no** trailing `ok`. MAC keeps colons. Type is literal `FlashForge Adventurer III` (roman). |
| `M105` | `CMD M105 Received.\nok T0:<c>/<t> B:<c>/<t>` | Prefix **IS** present. Single extruder (T0 only). |
| `M119` | `echo: Endstop: ...\nMachineStatus: <s>\nMoveMode: 0.0\nFilamentStatus: ok\nLEDStatus: <on/off>\nPrintFileName: <f>` | **No** `CMD` prefix, **no** `ok`. |
| `M27` | `CMD M27 Received.\nSD printing byte <c>/100\nok` | NOT `ack: "...\r\n"`. No Layer line. |
| `M661` | `CMD M661 Received.\ninfo_list.size: <n>\n<files>` | Single response, **no** `ok`. Empty list -> `CMD M661 Error.` |
| `M662` | `CMD M662 Received.\nack header length: <len>\n` + binary: magic `0xA2 0xA2 0x2A 0x2A`, BE uint32 length, PNG | Missing file -> `CMD M662 Received.\nError: File not exists`. Sent after 500ms. |
| `M146` | `ack: "M146 1"` / `ack: "M146 0"` | Quoted echo, **no** `ok`. |
| `M23` | `File opened: /data/<name> Size: <n>\nDone printing file\nok` | **No** `CMD` prefix. Path normalized to `/data/`; accepts bare, `/data/`, or `0:/user/` input. |
| `G1`/`G28`/`G90`/`G91` | (no response) | Fire-and-forget; dispatch only writes if a response string is returned. |

Two doc ambiguities deliberately **not guessed** (kept `\n`, flag for hardware verification):
line terminators (docs say `\r\n`; emulator emits `\n`) and the exact semantic of M662
`ack header length` (frame off the `0xA2A22A2A` magic + BE length, not this header value).

### UDP discovery

- **Modern mode**: 276-byte response on `225.0.0.9:19000` (multicast) + `255.255.255.255:48899` (broadcast).
- **Legacy mode**: 140-byte response on `225.0.0.9:8899` (multicast only).
- Any UDP payload triggers a response (matches real firmware behavior).

### Multi-model support

| Model | HTTP | TCP | Camera | Material Station | Chamber Temp |
|---|---|---|---|---|---|
| Adventurer 3 | no | yes | no | no | no |
| Adventurer 4 | no | yes | no | no | no |
| Adventurer 5M | yes | yes | no | no | yes |
| Adventurer 5M Pro | yes | yes | yes | no | yes |
| AD5X | yes | yes | no | yes (4 slots) | yes |

Model profiles live in `shared/types/printer.ts` (`PRINTER_PROFILES`).

### State simulation

- **Auto mode**: print jobs progress automatically (progress, layers, temperatures converge).
- **Manual mode**: state changes only via explicit commands from the QA console or API calls.
- **Sticky terminal states**: `completed`, `cancelled`, `error` block new prints until
  `stateCtrl_cmd` with `setClearPlatform` is sent.
- **Temperature convergence**: current temps drift toward target temps over time.

### AD5X material station

Full material station state in `/detail`: `hasMatlStation`, `matlStationInfo` (4 slots with
filament/color), `indepMatlInfo`. Print/upload endpoints accept material slot mappings.

### Authentication

- JSON body auth: `serialNumber` + `checkCode` in POST body.
- Header auth: `serialNumber` + `checkCode` headers (used for uploadGcode).
- Configurable via headless CLI flags. Defaults: `SNEMULATOR001` / `12345`.

### Tests

- **6 unit tests** (`scripts/tests/unit-headless.test.ts`)
- **2 integration tests** (`scripts/tests/integration-multi-instance.test.ts`)
- **1 QA smoke test** (`scripts/qa-regression-smoke.ts`) -- 50+ assertions covering HTTP/TCP/UDP

## Conventions

- **`shared/serializers/httpDetail.ts` is the single source of truth** for `/detail` wire payload.
  The HTTP server, QA console preview, and smoke tests all use `serializeHttpDetail()`. Do not
  construct `/detail` responses inline in the HTTP server.
- **`shared/types/printer.ts`** holds all shared types, the `PrinterModel` union, `PRINTER_PROFILES`,
  and `EmulatorConfig`. Both main and renderer import from here.
- **`PrinterStateStore`** (`electron/main/state/PrinterStateStore.ts`) is the single source of
  truth for printer state. Services read from it; it emits `state-changed` events.
- **Services extend `EventEmitter`** with canonical events: `started`, `stopped`, `error`, plus
  service-specific events.
- **TypeScript strict mode**, zero errors. Biome for linting and formatting (not ESLint/Prettier).
  Run `npm run lint:fix` before committing.
- **`ai_reference/` is read-only.** Contains production reference implementations
  (`ff-5mp-api-ts`). Consult before guessing API layouts or endpoint behavior. Never modify.
- **JSDoc on all public APIs.** No `any` types. No TODO-stub placeholders.

## Out of scope (by design)

These items are intentionally not implemented. They are either too complex for the win, or are
better tested on real hardware. **Do not re-discover or re-propose these without explicit user
request.**

- **MJPEG camera emulation (port 8080)**: No MJPEG server. Camera features require real hardware.
  The emulator sets `cameraStreamUrl` in `/detail` to the expected URL but nothing serves it.
- **Missing HTTP control commands**: `reName_cmd`, `delayClose_cmd`, `calibration_cmd`,
  `userProfile_cmd`, `msConfig_cmd`, `ms_cmd`, `moveCtrl_cmd`, `extrudeCtrl_cmd`,
  `homingCtrl_cmd`, `errorCodeCtrl_cmd` are not implemented. The emulator's `/control` handler
  silently returns success for unknown commands so clients won't crash.
- **`GET /thumb/:filename` endpoint**: `/detail` sets `printFileThumbUrl` to point at this route,
  but no actual handler exists. Clients fall back to `/gcodeThumb` which works.
- **TCP legacy file upload (`M28`/`M29`)**: Not needed -- modern printers use HTTP upload.
- **TCP `M610` (rename), `M106`/`M107` (fan)**: Low priority -- these go through HTTP in
  modern clients.
- **`uploadGcode` boolean header parsing**: Emulator checks for `"true"` but real firmware uses
  `"0"/"1"`. The TS reference lib sends `"0"/"1"`. Minor -- low priority.
- **Per-printer `customLedEnabled` flag**: Emulator always returns `lightCtrlState: 1` in
  `/product`, so the Android app always uses HTTP LED control. TCP LED path (`~M146`) can't be
  tested through normal app flow.
- **`temperatureCtl_cmd` arg names**: Emulator uses `rightTemp`/`leftTemp`/`platformTemp`/
  `chamberTemp` (matches Android app), while canonical API docs use `rightNozzle`/`leftNozzle`/
  `platform`/`chamber`. Not a bug for Android testing.

## External references

When in doubt about protocol behavior, check these in order:

1. **`ai_reference/`** in this repo -- local copy of the TS reference library.
2. **Canonical API docs**: `C:\Users\coper\Documents\GitHub\1flashforge_printers\flashforge-api-docs\docs-wiki\`
3. **TypeScript API library**: `C:\Users\coper\Documents\GitHub\1flashforge_printers\ff-5mp-api-ts`
4. **Android app**: `C:\Users\coper\Documents\Prototyping\flashforgeui-app` -- primary consumer
5. **Desktop Electron app**: `C:\Users\coper\Documents\GitHub\1flashforge_printers\FlashForgeUI-Electron`
6. **WebUI**: `C:\Users\coper\Documents\GitHub\1flashforge_printers\FlashForgeWebUI`
