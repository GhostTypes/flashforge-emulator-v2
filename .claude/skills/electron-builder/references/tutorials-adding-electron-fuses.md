# https://www.electron.build/tutorials/adding-electron-fuses

# Configuring Electron Fuses

Note

Information below has been partially copied from integration with [@electron/fuses](https://github.com/electron/fuses) and [electron tutorial](https://raw.githubusercontent.com/electron/electron/refs/heads/main/docs/tutorial/fuses.md) for easier reading/access.

## What are fuses?

For a subset of Electron functionality it makes sense to disable certain features for an entire application. For example, 99% of apps don’t make use of `ELECTRON_RUN_AS_NODE`, these applications want to be able to ship a binary that is incapable of using that feature. We also don’t want Electron consumers building Electron from source as that is both a massive technical challenge and has a high cost of both time and money.

Fuses are the solution to this problem, at a high level they are “magic bits” in the Electron binary that can be flipped when packaging your Electron app to enable / disable certain features / restrictions. Because they are flipped at package time before you code sign your app the OS becomes responsible for ensuring those bits aren’t flipped back via OS level code signing validation (Gatekeeper / App Locker).

## How do I flip the fuses?

Under-the-hood, electron-builder leverages the official [`@electron/fuses`](https://npmjs.com/package/@electron/fuses) module to make flipping these fuses easy. Previously, electron fuses could only be flipped within the `afterPack` hook (this is still a supported method). Now, you can instead set electron-builder configuration property `electronFuses: FuseOptionsV1` to activate electron-builder’s integration.

### Example

Note

The true/false below are just an example, customize your configuration to your own requirements

```
electronFuses: {
  runAsNode: false,
  enableCookieEncryption: true,
  enableNodeOptionsEnvironmentVariable: false,
  enableNodeCliInspectArguments: false,
  enableEmbeddedAsarIntegrityValidation: true,
  onlyLoadAppFromAsar: true,
  loadBrowserProcessSpecificV8Snapshot: false,
  grantFileProtocolExtraPrivileges: false
}
```

It also is still possible to continue to keep your current logic flow in `afterPack` hook, so a convience method has been exposed in the `PlatformPackager` for easy customization of the flags on your own. It directly accepts an `AfterPackContext` and a `FuseConfig` object of [type](https://github.com/electron/fuses/blob/main/src/config.ts).
This convience method was opened so that custom FuseConfig’s could be provided, allow usage of `strictlyRequireAllFuses` to monitor your fuses and stay up-to-date with fuses as they’re released, and/or force override the version of @electron/fuses in electron-builder if there’s an update you’d like to leverage.

afterPack.ts

```
const { FuseConfig, FuseVersion, FuseV1Options } = require("@electron/fuses")

exports.default = function (context: AfterPackContext) {
  const fuses: FuseConfig = {
    version: FuseVersion.V1,
    strictlyRequireAllFuses: true,
    [FuseV1Options.RunAsNode]: false,
    ... // all other flags must be specified since `strictlyRequireAllFuses = true`
  }
  await context.packager.addElectronFuses(context, fuses)
}
```

## Validating Fuses

You can validate the fuses have been flipped or check the fuse status of an arbitrary Electron app using the fuses CLI.

```
npx @electron/fuses read --app /Applications/Foo.app
```

## Typedoc

[Electron-Builder](packages.md) / [app-builder-lib](app-builder-lib/README.md) / FuseOptionsV1

All options come from [@electron/fuses](https://github.com/electron/fuses)
Ref: https://raw.githubusercontent.com/electron/electron/refs/heads/main/docs/tutorial/fuses.md

#### Properties

##### enableCookieEncryption?

> `optional` **enableCookieEncryption**: `boolean`

The cookieEncryption fuse toggles whether the cookie store on disk is encrypted using OS level cryptography keys. By default the sqlite database that Chromium uses to store cookies stores the values in plaintext. If you wish to ensure your apps cookies are encrypted in the same way Chrome does then you should enable this fuse. Please note it is a one-way transition, if you enable this fuse existing unencrypted cookies will be encrypted-on-write but if you then disable the fuse again your cookie store will effectively be corrupt and useless. Most apps can safely enable this fuse.

---

##### enableEmbeddedAsarIntegrityValidation?

> `optional` **enableEmbeddedAsarIntegrityValidation**: `boolean`

The embeddedAsarIntegrityValidation fuse toggles an experimental feature on macOS that validates the content of the `app.asar` file when it is loaded. This feature is designed to have a minimal performance impact but may marginally slow down file reads from inside the `app.asar` archive.
Currently, ASAR integrity checking is supported on:

* macOS as of electron>=16.0.0
* Windows as of electron>=30.0.0

For more information on how to use asar integrity validation please read the [Asar Integrity](https://github.com/electron/electron/blob/main/docs/tutorial/asar-integrity.md) documentation.

---

##### enableNodeCliInspectArguments?

> `optional` **enableNodeCliInspectArguments**: `boolean`

The nodeCliInspect fuse toggles whether the `--inspect`, `--inspect-brk`, etc. flags are respected or not. When disabled it also ensures that `SIGUSR1` signal does not initialize the main process inspector. Most apps can safely disable this fuse.

---

##### enableNodeOptionsEnvironmentVariable?

> `optional` **enableNodeOptionsEnvironmentVariable**: `boolean`

The nodeOptions fuse toggles whether the [`NODE_OPTIONS`](https://nodejs.org/api/cli.html#node_optionsoptions) and [`NODE_EXTRA_CA_CERTS`](https://github.com/nodejs/node/blob/main/doc/api/cli.md#node_extra_ca_certsfile) environment variables are respected. The `NODE_OPTIONS` environment variable can be used to pass all kinds of custom options to the Node.js runtime and isn’t typically used by apps in production. Most apps can safely disable this fuse.

---

##### grantFileProtocolExtraPrivileges?

> `optional` **grantFileProtocolExtraPrivileges**: `boolean`

The grantFileProtocolExtraPrivileges fuse changes whether pages loaded from the `file://` protocol are given privileges beyond what they would receive in a traditional web browser. This behavior was core to Electron apps in original versions of Electron but is no longer required as apps should be [serving local files from custom protocols](https://github.com/electron/electron/blob/main/docs/tutorial/security.md#18-avoid-usage-of-the-file-protocol-and-prefer-usage-of-custom-protocols) now instead. If you aren’t serving pages from `file://` you should disable this fuse.
The extra privileges granted to the `file://` protocol by this fuse are incompletely documented below:

* `file://` protocol pages can use `fetch` to load other assets over `file://`
* `file://` protocol pages can use service workers
* `file://` protocol pages have universal access granted to child frames also running on `file://` protocols regardless of sandbox settings

---

##### loadBrowserProcessSpecificV8Snapshot?

> `optional` **loadBrowserProcessSpecificV8Snapshot**: `boolean`

The loadBrowserProcessSpecificV8Snapshot fuse changes which V8 snapshot file is used for the browser process. By default Electron’s processes will all use the same V8 snapshot file. When this fuse is enabled the browser process uses the file called `browser_v8_context_snapshot.bin` for its V8 snapshot. The other processes will use the V8 snapshot file that they normally do.

---

##### onlyLoadAppFromAsar?

> `optional` **onlyLoadAppFromAsar**: `boolean`

The onlyLoadAppFromAsar fuse changes the search system that Electron uses to locate your app code. By default Electron will search in the following order `app.asar` -> `app` -> `default_app.asar`. When this fuse is enabled the search order becomes a single entry `app.asar` thus ensuring that when combined with the `embeddedAsarIntegrityValidation` fuse it is impossible to load non-validated code.

---

##### resetAdHocDarwinSignature?

> `optional` **resetAdHocDarwinSignature**: `boolean`

Resets the app signature, specifically used for macOS.
Note: This should be unneeded since electron-builder signs the app directly after flipping the fuses.
Ref: https://github.com/electron/fuses?tab=readme-ov-file#apple-silicon

---

##### runAsNode?

> `optional` **runAsNode**: `boolean`

The runAsNode fuse toggles whether the `ELECTRON_RUN_AS_NODE` environment variable is respected or not. Please note that if this fuse is disabled then `process.fork` in the main process will not function as expected as it depends on this environment variable to function. Instead, we recommend that you use [Utility Processes](https://github.com/electron/electron/blob/main/docs/api/utility-process.md), which work for many use cases where you need a standalone Node.js process (like a Sqlite server process or similar scenarios).