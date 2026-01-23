---
name: electron-builder
description: "Electron app packaging and distribution configuration for macOS, Windows, and Linux. Use when: (1) Configuring electron-builder in package.json or electron-builder.{yml,json5}, (2) Setting up code signing for any platform, (3) Creating distributables (dmg, nsis, appimage, etc.), (4) Configuring auto-update/publishing, (5) Debugging build failures or packaging issues."
---

# electron-builder

Complete solution to package and build Electron apps for distribution with auto-update support.

## Quick Start

Install as dev dependency:
```bash
yarn add electron-builder --dev
```

Minimal `package.json` configuration:
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "build": {
    "appId": "com.example.myapp"
  },
  "scripts": {
    "build": "electron-builder"
  }
}
```

Run build:
```bash
yarn build              # Package for current platform
yarn build --mac        # macOS targets
yarn build --win        # Windows targets
yarn build --linux      # Linux targets
```

## Platform Selection

electron-builder builds for the platform you're on by default. Cross-platform builds require platform-specific tooling:

| Target Platform | Build From | Requirements |
|-----------------|------------|--------------|
| macOS | macOS only | Xcode, signing certificate |
| Windows (NSIS/MSI) | Any platform | [code-signing-win.md](references/code-signing-win.md) |
| Linux (AppImage/snap/deb) | Any platform | Docker (included) |

**Cross-platform building**: See [multi-platform-build.md](references/multi-platform-build.md)

## macOS Builds

**Common targets**: `dmg`, `pkg`, `mas` (Mac App Store)

Full options: [mac.md](references/mac.md)

### DMG Configuration
```json
{
  "build": {
    "mac": {
      "target": "dmg",
      "category": "public.app-category.productivity"
    },
    "dmg": {
      "title": "My App ${version}",
      "background": "build/background.png",
      "window": { "width": 540, "height": 380 }
    }
  }
}
```
Full DMG options: [dmg.md](references/dmg.md)

### PKG Configuration
Installer packages for macOS. See [pkg.md](references/pkg.md)

### Mac App Store (mas)
Build for Mac App Store distribution. See [mas.md](references/mas.md)

### Code Signing
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Name (Team ID)",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    }
  }
}
```
See [code-signing-mac.md](references/code-signing-mac.md) for certificates and entitlements.

## Windows Builds

**Common targets**: `nsis` (installer), `portable`, `msi`, `appx`

Full options: [win.md](references/win.md)

### NSIS Installer
```json
{
  "build": {
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "perMachine": true,
      "createDesktopShortcut": true
    }
  }
}
```
Full NSIS options: [nsis.md](references/nsis.md)

### MSI Installer
Windows Installer format. See [msi.md](references/msi.md)

### MSI Wrapped
Wrapper around existing MSI. See [msi-wrapped.md](references/msi-wrapped.md)

### AppX (Windows Store)
Windows Store packaging. See [appx.md](references/appx.md)

### Squirrel.Windows
Squirrel update framework. See [squirrel-windows.md](references/squirrel-windows.md)

### Code Signing
Windows code signing requires a certificate. See [code-signing-win.md](references/code-signing-win.md) for:
- Certificate setup on Windows vs Linux/macOS
- Timestamp server configuration
- SignTool paths

## Linux Builds

**Common targets**: `AppImage`, `snap`, `deb`, `rpm`, `tar.gz`

Full options: [linux.md](references/linux.md)

### AppImage (Recommended)
```json
{
  "build": {
    "linux": {
      "target": "AppImage",
      "category": "Development"
    },
    "appImage": {
      "synopsis": "My Electron App",
      "category": "Development"
    }
  }
}
```
See [appimage.md](references/appimage.md)

### Snap
Snap store packaging. See [snap.md](references/snap.md)

### Flatpak
Flatpak packaging format. See [flatpak.md](references/flatpak.md)

## Auto Update

electron-builder has built-in auto-update support. See [auto-update.md](references/auto-update.md).

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "myorg",
      "repo": "myapp"
    }
  }
}
```

Publish providers: GitHub Releases, S3, DigitalOcean Spaces, Bintray. See [publish.md](references/publish.md).

## Configuration Reference

- **[configuration.md](references/configuration.md)** - All configuration options (appId, productName, files, asar, etc.)
- **[cli.md](references/cli.md)** - Command line interface (all flags and commands)
- **[programmatic-usage.md](references/programmatic-usage.md)** - JavaScript/TypeScript programmatic API
- **[icons.md](references/icons.md)** - Icon requirements per platform (.icns, .ico, .png)
- **[contents.md](references/contents.md)** - File inclusion/exclusion patterns
- **[file-patterns.md](references/file-patterns.md)** - Glob patterns for files (${os}, ${arch}, etc.)
- **[hooks.md](references/hooks.md)** - Build lifecycle hooks (beforeBuild, afterPack, etc.)

## Code Signing

- **[code-signing.md](references/code-signing.md)** - General code signing overview
- **[code-signing-mac.md](references/code-signing-mac.md)** - macOS certificates, entitlements, provisioning
- **[code-signing-win.md](references/code-signing-win.md)** - Windows certificates, signtool, cross-platform signing

## Build Targets by Platform

| Platform | Targets | Documentation |
|----------|---------|---------------|
| macOS | dmg, pkg, mas, zip | [mac.md](references/mac.md), [dmg.md](references/dmg.md), [pkg.md](references/pkg.md), [mas.md](references/mas.md) |
| Windows | nsis, portable, msi, appx, squirrel | [win.md](references/win.md), [nsis.md](references/nsis.md), [msi.md](references/msi.md), [appx.md](references/appx.md), [squirrel-windows.md](references/squirrel-windows.md) |
| Linux | appimage, snap, deb, rpm, flatpak, tar.gz | [linux.md](references/linux.md), [appimage.md](references/appimage.md), [snap.md](references/snap.md), [flatpak.md](references/flatpak.md) |

## Debugging

```bash
# Enable debug output
DEBUG=electron-builder yarn build

# macOS DMG debugging
DEBUG_DMG=true yarn build --mac

# Linux FPM details (except snap/appimage)
FPM_DEBUG=1 yarn build --linux
```

## Templates

Template configurations in `assets/`:
- `assets/electron-builder.yml` - YAML config template with all platforms
- `assets/package.json-snippet.json` - Full package.json example with scripts

## Tutorials

Step-by-step guides for common tasks:
- **[tutorials/two-package-structure.md](references/tutorials-two-package-structure.md)** - Using two package.json structure
- **[tutorials/release-using-channels.md](references/tutorials-release-using-channels.md)** - Channel-based releases
- **[tutorials/adding-electron-fuses.md](references/tutorials-adding-electron-fuses.md)** - Electron fuses configuration
- **[tutorials/code-signing-windows-apps-on-unix.md](references/tutorials-code-signing-windows-apps-on-unix.md)** - Cross-platform Windows signing
- **[tutorials/loading-app-dependencies-manually.md](references/tutorials-loading-app-dependencies-manually.md)** - Manual dependency loading
- **[tutorials/macos-kernel-extensions.md](references/tutorials-macos-kernel-extensions.md)** - macOS kernel extensions
- **[tutorials/test-update-on-s3-locally.md](references/tutorials-test-update-on-s3-locally.md)** - Testing S3 updates locally

## API Globals

TypeScript definitions and programmatic usage:
- **[electron-builder-globals.md](references/electron-builder-globals.md)** - Main electron-builder API
- **[app-builder-lib-globals.md](references/app-builder-lib-globals.md)** - Core library interfaces
- **[electron-publish-globals.md](references/electron-publish-globals.md)** - Publish automation
- **[electron-updater-globals.md](references/electron-updater-globals.md)** - Auto-update API

## Other Documentation

- **[index.md](references/index.md)** - Main documentation landing page
- **[donate.md](references/donate.md)** - Support the project

## Complete File Index

All reference documentation files:

**Configuration & API:**
- [configuration.md](references/configuration.md)
- [cli.md](references/cli.md)
- [programmatic-usage.md](references/programmatic-usage.md)
- [hooks.md](references/hooks.md)
- [contents.md](references/contents.md)
- [file-patterns.md](references/file-patterns.md)
- [icons.md](references/icons.md)

**Platform - macOS:**
- [mac.md](references/mac.md)
- [dmg.md](references/dmg.md)
- [pkg.md](references/pkg.md)
- [mas.md](references/mas.md)
- [code-signing-mac.md](references/code-signing-mac.md)

**Platform - Windows:**
- [win.md](references/win.md)
- [nsis.md](references/nsis.md)
- [msi.md](references/msi.md)
- [msi-wrapped.md](references/msi-wrapped.md)
- [appx.md](references/appx.md)
- [squirrel-windows.md](references/squirrel-windows.md)
- [code-signing-win.md](references/code-signing-win.md)

**Platform - Linux:**
- [linux.md](references/linux.md)
- [appimage.md](references/appimage.md)
- [snap.md](references/snap.md)
- [flatpak.md](references/flatpak.md)

**Code Signing:**
- [code-signing.md](references/code-signing.md)
- [code-signing-mac.md](references/code-signing-mac.md)
- [code-signing-win.md](references/code-signing-win.md)

**Publishing & Updates:**
- [auto-update.md](references/auto-update.md)
- [publish.md](references/publish.md)
- [multi-platform-build.md](references/multi-platform-build.md)

**Tutorials:**
- [tutorials-adding-electron-fuses.md](references/tutorials-adding-electron-fuses.md)
- [tutorials-code-signing-windows-apps-on-unix.md](references/tutorials-code-signing-windows-apps-on-unix.md)
- [tutorials-loading-app-dependencies-manually.md](references/tutorials-loading-app-dependencies-manually.md)
- [tutorials-macos-kernel-extensions.md](references/tutorials-macos-kernel-extensions.md)
- [tutorials-release-using-channels.md](references/tutorials-release-using-channels.md)
- [tutorials-test-update-on-s3-locally.md](references/tutorials-test-update-on-s3-locally.md)
- [tutorials-two-package-structure.md](references/tutorials-two-package-structure.md)

**API Globals:**
- [electron-builder-globals.md](references/electron-builder-globals.md)
- [app-builder-lib-globals.md](references/app-builder-lib-globals.md)
- [electron-publish-globals.md](references/electron-publish-globals.md)
- [electron-updater-globals.md](references/electron-updater-globals.md)

**Other:**
- [index.md](references/index.md)
- [donate.md](references/donate.md)
