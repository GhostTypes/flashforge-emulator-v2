# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

This file starts at the change below. For anything earlier, read the git history.

## [Unreleased]

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
