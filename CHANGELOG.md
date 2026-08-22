# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

This file starts at the change below. For anything earlier, read the git history.

## [Unreleased]

## [0.2.0] - 2026-08-21

### Added

- **`npm run kill:all` — reliable headless-instance cleanup.** Every headless instance now registers itself (pid, ports, serial, model) in `.emulator/instances.json` when it reaches readiness, and deregisters on graceful shutdown. `kill:all` tree-kills every registered instance and prunes entries whose process is already gone; it exits 0 when nothing is running. This closes the Windows footgun where killing the parent npm process leaves the `tsx` grandchild alive holding ports 8898/8899 — a numeric-PID kill never reaches it.
- **`POST /__shutdown` internal route.** Stops a headless instance gracefully over HTTP using the same path as SIGTERM (stop servers, deregister, exit 0), so a stuck instance can be told to die from anything that can reach its port. In the desktop app the route answers 501 — the QA console owns those servers there.
- **Jump-to-percent print control.** `POST /__simulate` now accepts `{ "action": "jump", "percent": 0-100 }`, and the QA console gains a "Jump to %" control. A jump fast-forwards the active job's derived fields — elapsed seconds, remaining minutes, firmware ETA string, layer, Z/E position — using the same math as the auto simulation, so `/detail`, `/__state`, and the QA console all agree. Jumping to 100 completes the job through the real completion path. Sticky terminal states (completed/cancelled/error) refuse jumps with 409, and there is no job to jump without a current file.
- **`GET /thumb/:filename` route** (non-Creator-5 models). `/detail` has always advertised `printFileThumbUrl` pointing here, but nothing served it and clients fell back to `/gcodeThumb`. The route now serves the stored thumbnail bytes for the named file (404 for unknown names). The Creator 5 series keeps using `/getThum`, matching that firmware.
- README section **Running the Emulator in CI**: pin downstream checkouts to release tags, and set `ELECTRON_SKIP_BINARY_DOWNLOAD=1` on the emulator `npm ci` step when only headless instances are needed (skips the ~110 MB Electron download; the headless runtime never touches it).

### Fixed

- **`/uploadGcode` boolean headers now parse firmware-style `"1"/"0"`.** Real firmware and the TS reference client send `"1"/`"0"`; the emulator only recognised `"true"`/absent. All upload boolean headers (`printNow`, `levelingBeforePrint`, `flowCalibration`, `useMatlStation`) accept both `"1"` and `"true"` as true, everything else as false.
- The integration suite had an off-by-one in its stale-instance argument mapping (it replaced `--model` instead of the instance ID), which made the new registry/`kill:all` test fail spuriously on every run.

### Removed

- **`API.md` is no longer in the repo.** The 894-line protocol reference was removed during cleanup and its content now lives as an internal agent skill (`emulator-test-harness`, in the workspace-level `.pi/skills/` directory — not part of this repo). The file's coverage — TCP frames, HTTP endpoints, error codes, the AD5X material station rules, and the Creator 5 series quirks — moved verbatim; nothing about the emulator's behavior changed. For public, canonical API documentation, use `flashforge-api-docs` (docs-wiki) in the same workspace. The historical entry under Documentation below describes changes made while the file still existed.

### Fixed

- **The emulator now checks material slot IDs instead of accepting whatever a client sends.** Slots are 1-based on the wire (`slotId` 1-4) and tools are 0-based (`toolId` 0..toolCount-1). A client that forgets to convert its 0-based slot index sends `slotId: 0`, and real firmware rejects that. The emulator answered `{"code": 0, "message": "Success"}`, so a broken client passed here and failed on hardware — which is the exact bug an emulator exists to catch.

  `materialMappings` payloads are now validated on `/uploadGcode` (the AD5X maps materials at upload) and on `/printGcode` (the Creator 5 series maps them at print-start). The emulator rejects a `slotId` below 1 or above the station slot count, a `toolId` outside the model's tool range, a duplicate `toolId` or `slotId`, more entries than the station has slots, an empty `materialName`, and a colour that is not `#RRGGBB`. A rejected payload does not start a job.

  Rejections answer `{"code": 2, "message": "Invalid parameter"}`, or `{"code": -1, "message": "Parameter is error."}` on the Creator 5 series, which matches that firmware. Both carry an extra `detail` string that names the bad field. Real firmware does not send that string; it is there so a developer can see the reason instead of guessing.

  Printers with no material station are left alone. Nobody has captured what their firmware does with a stray mapping payload, so the emulator does not invent a rejection.

- **`/gcodeList` no longer reports slot 0 for every tool on a material-station printer.** When an upload carried no `materialMappings`, the emulator synthesized one tool entry per tool and gave each one `slotId: 0`. That value means "no slot" and belongs only to direct-feed printers. Synthesized entries are now 1-based on a material-station printer, and keep `slotId: 0` on a printer without one.

### Testing

- New integration test: **AD5X `/uploadGcode` rejects off-by-one material slot IDs.** It covers `slotId: 0`, an out-of-range slot, an out-of-range tool, a duplicate slot, the accepted case round-tripping as slots `[1, 2]`, and the synthesized fallback.
- The Creator 5 integration test now also pins the `/printGcode` slot-ID rules, including that a rejected mapping starts nothing.

### Documentation

- `API.md` gains a **Slot and Tool ID Bases** section with the full rule set and the rejection codes. The AD5X material-mapping example there was stale — it showed a three-field entry with a `materialType` key, instead of the five-field entry with `materialName`, `toolMaterialColor`, and `slotMaterialColor` that the API actually takes. It also now says that the AD5X sends mappings as a base64 header on `/uploadGcode`, while the Creator 5 series sends them in the `/printGcode` body.
