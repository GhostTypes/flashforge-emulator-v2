# https://www.electron.build/squirrel-windows

# Squirrel.Windows

The top-level [squirrelWindows](/configuration#squirrelWindows) key contains set of options instructing electron-builder on how it should build Squirrel.Windows.

Squirrel.Windows target is maintained, but deprecated. Please use [nsis](/nsis) instead.

To use Squirrel.Windows please install `electron-builder-squirrel-windows` dependency.
To build for Squirrel.Windows on macOS, please install `mono` (`brew install mono`).

Your app must be able to handle Squirrel.Windows startup events that occur during install and uninstall. See [electron-squirrel-startup](https://github.com/mongodb-js/electron-squirrel-startup).

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / SquirrelWindowsOptions

#### Extends

* [`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Properties

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template).

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### customSquirrelVendorDir?

> `readonly` `optional` **customSquirrelVendorDir**: `string`

The custom squirrel vendor dir. If not specified will use the Squirrel.Windows that is shipped with electron-installer(https://github.com/electron/windows-installer/tree/main/vendor).
After https://github.com/electron-userland/electron-builder-binaries/pull/56 merged, will add `electron-builder-binaries` to get the latest version of squirrel.

---

##### iconUrl?

> `readonly` `optional` **iconUrl**: `null` | `string`

A URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features). Defaults to the Electron icon.

Please note — [local icon file url is not accepted](https://github.com/atom/grunt-electron-installer/issues/73), must be https/http.

If you don’t plan to build windows installer, you can omit it.
If your project repository is public on GitHub, it will be `https://github.com/${u}/${p}/blob/master/build/icon.ico?raw=true` by default.

---

##### loadingGif?

> `readonly` `optional` **loadingGif**: `null` | `string`

The path to a .gif file to display during install. `build/install-spinner.gif` will be used if exists (it is a recommended way to set)
(otherwise [default](https://github.com/electron/windows-installer/blob/master/resources/install-spinner.gif)).

---

##### msi?

> `readonly` `optional` **msi**: `boolean`

Whether to create an MSI installer. Defaults to `false` (MSI is not created).

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### remoteReleases?

> `readonly` `optional` **remoteReleases**: `null` | `string` | `boolean`

A URL to your existing updates. Or `true` to automatically set to your GitHub repository. If given, these will be downloaded to create delta updates.

---

##### remoteToken?

> `readonly` `optional` **remoteToken**: `null` | `string`

Authentication token for remote updates

---

##### useAppIdAsId?

> `readonly` `optional` **useAppIdAsId**: `boolean`

Use `appId` to identify package instead of `name`.