# https://www.electron.build/win

# Any Windows Target

The top-level [win](/configuration#win) key contains set of options instructing electron-builder on how it should build Windows targets. These options applicable for any Windows target.

---

## Common Questions

## How do delegate code signing?

Use [sign](/app-builder-lib.interface.windowssigntoolconfiguration#sign) option. Please also see [why sign.js is called 8 times](https://github.com/electron-userland/electron-builder/issues/3995).

```
"win": {
  "signtoolOptions": {
    "sign": "./customSign.js"
  }
}
```

File `customSign.js` in the project root directory:

```
exports.default = async function(configuration) {
  // your custom code
}
```

## How do use a custom verify function to enable nsis signature verification alternatives instead of powershell?

Use the `verifyUpdateCodeSignature` interface:

```
/**
*  return null if verify signature succeed
*  return error message if verify signature failed
*/
export type verifyUpdateCodeSignature = (publisherName: string[], path: string) => Promise<string | null>
```

Pass a custom verify function to the nsis updater. For example, if you want to use a native verify function, you can use [win-verify-signature](https://github.com/beyondkmp/win-verify-trust).

```
import { NsisUpdater } from "electron-updater"
import { verifySignatureByPublishName } from "win-verify-signature"
// Or MacUpdater, AppImageUpdater

export default class AppUpdater {
    constructor() {
        const options = {
            requestHeaders: {
                // Any request headers to include here
            },
            provider: 'generic',
            url: 'https://example.com/auto-updates'
        }

        const autoUpdater = new NsisUpdater(options)
        autoUpdater.verifyUpdateCodeSignature = (publisherName: string[], path: string) => {
            const result = verifySignatureByPublishName(path, publisherName);
            if(result.signed) return Promise.resolve(null);
            return Promise.resolve(result.message);
        }
        autoUpdater.addAuthHeader(`Bearer ${token}`)
        autoUpdater.checkForUpdatesAndNotify()
    }
}
```

## How do create Parallels Windows 10 Virtual Machine?

Disable “Share Mac user folders with Windows”

If you use Parallels, you [must not use](https://github.com/electron-userland/electron-builder/issues/865#issuecomment-258105498) “Share Mac user folders with Windows” feature and must not run installers from such folders.

You don’t need to have Windows 10 license. Free is provided (expire after 90 days, but it is not a problem because no additional setup is required).

1. Open Parallels Desktop.
2. File -> New.
3. Select “Modern.IE” in the “Free Systems”.
4. Continue, Continue, Accept software license agreement.
5. Select “Microsoft Edge on Windows 10”.
6. The next steps are general, see [Installing Windows on your Mac using Parallels Desktop](http://kb.parallels.com/4729) from “Step 6: Specify a name and location”.

Parallels Windows 10 VM will be used automatically to build AppX on macOS. No need even start VM — it will be started automatically on demand and suspended after build. No need to specify VM — it will be detected automatically (first Windows 10 VM will be used).

## How do create VirtualBox Windows 10 Virtual Machine?

If you are not on macOS or don’t want to buy [Parallels Desktop](https://www.parallels.com/products/desktop/), you can use free [VirtualBox](https://www.virtualbox.org/wiki/Downloads).

1. Open [Download virtual machines](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/).
2. Select “MSEdge on Win10 (x64) Stable”.
3. Select “VirtualBox” platform.
4. Download. See [installation instructions](https://az792536.vo.msecnd.net/vms/release_notes_license_terms_8_1_15.pdf).

The password to your VM is `Passw0rd!`.

VirtualBox is not supported by electron-builder for now, so, you need to setup build environment on Windows if you want to use VirtualBox to build AppX (and other Windows-only tasks).

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / WindowsConfiguration

#### Extends

* [`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions)

#### Properties

##### appId?

> `readonly` `optional` **appId**: `null` | `string`

The application id. Used as [CFBundleIdentifier](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-102070) for MacOS and as
[Application User Model ID](https://msdn.microsoft.com/en-us/library/windows/desktop/dd378459(v=vs.85).aspx) for Windows (NSIS target only, Squirrel.Windows not supported). It is strongly recommended that an explicit ID is set.

###### Default

```
com.electron.${name}
```

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`appId`](/app-builder-lib.interface.platformspecificbuildoptions#appId)

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template). Defaults to `${productName}-${version}.${ext}` (some target can have other defaults, see corresponding options).

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`artifactName`](/app-builder-lib.interface.platformspecificbuildoptions#artifactName)

---

##### asar?

> `readonly` `optional` **asar**: `null` | `boolean` | [`AsarOptions`](/app-builder-lib.interface.asaroptions)

Whether to package the application’s source code into an archive, using [Electron’s archive format](http://electron.atom.io/docs/tutorial/application-packaging/).

Node modules, that must be unpacked, will be detected automatically, you don’t need to explicitly set [asarUnpack](#asarUnpack) - please file an issue if this doesn’t work.

###### Default

```
true
```

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`asar`](/app-builder-lib.interface.platformspecificbuildoptions#asar)

---

##### asarUnpack?

> `readonly` `optional` **asarUnpack**: `null` | `string` | `string`[]

A [glob patterns](/file-patterns) relative to the [app directory](#directories), which specifies which files to unpack when creating the [asar](http://electron.atom.io/docs/tutorial/application-packaging/) archive.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`asarUnpack`](/app-builder-lib.interface.platformspecificbuildoptions#asarUnpack)

---

##### azureSignOptions?

> `readonly` `optional` **azureSignOptions**: `null` | [`WindowsAzureSigningConfiguration`](/app-builder-lib.interface.windowsazuresigningconfiguration)

Options for usage of Azure Trusted Signing service
Cannot be used in conjunction with `signtoolOptions`, signing will default to Azure Trusted Signing

---

##### compression?

> `readonly` `optional` **compression**: `null` | [`CompressionLevel`](/app-builder-lib.typealias.compressionlevel)

The compression level. If you want to rapidly test build, `store` can reduce build time significantly. `maximum` doesn’t lead to noticeable size difference, but increase build time.

###### Default

```
normal
```

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`compression`](/app-builder-lib.interface.platformspecificbuildoptions#compression)

---

##### cscKeyPassword?

> `optional` **cscKeyPassword**: `null` | `string`

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`cscKeyPassword`](/app-builder-lib.interface.platformspecificbuildoptions#cscKeyPassword)

---

##### cscLink?

> `optional` **cscLink**: `null` | `string`

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`cscLink`](/app-builder-lib.interface.platformspecificbuildoptions#cscLink)

---

##### defaultArch?

> `readonly` `optional` **defaultArch**: `string`

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`defaultArch`](/app-builder-lib.interface.platformspecificbuildoptions#defaultArch)

---

##### detectUpdateChannel?

> `readonly` `optional` **detectUpdateChannel**: `boolean`

Whether to infer update channel from application version pre-release components. e.g. if version `0.12.1-alpha.1`, channel will be set to `alpha`. Otherwise to `latest`.
This does *not* apply to github publishing, which will [never auto-detect the update channel](https://github.com/electron-userland/electron-builder/issues/8589).

###### Default

```
true
```

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`detectUpdateChannel`](/app-builder-lib.interface.platformspecificbuildoptions#detectUpdateChannel)

---

##### disableDefaultIgnoredFiles?

> `optional` **disableDefaultIgnoredFiles**: `null` | `boolean`

Whether to exclude all default ignored files(https://www.electron.build/contents#files) and options. Defaults to `false`.

###### Default

```
false
```

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`disableDefaultIgnoredFiles`](/app-builder-lib.interface.platformspecificbuildoptions#disableDefaultIgnoredFiles)

---

##### electronLanguages?

> `readonly` `optional` **electronLanguages**: `string` | `string`[]

The electron locales to keep. By default, all Electron locales used as-is.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`electronLanguages`](/app-builder-lib.interface.platformspecificbuildoptions#electronLanguages)

---

##### electronUpdaterCompatibility?

> `readonly` `optional` **electronUpdaterCompatibility**: `null` | `string`

The [electron-updater compatibility](/auto-update#compatibility) semver range.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`electronUpdaterCompatibility`](/app-builder-lib.interface.platformspecificbuildoptions#electronUpdaterCompatibility)

---

##### executableName?

> `readonly` `optional` **executableName**: `null` | `string`

The executable name. Defaults to `productName`
Note: Except for Linux, where this would constitute a breaking change in previous behavior and lead to both invalid executable names and Desktop files. Ref comments in: https://github.com/electron-userland/electron-builder/pull/9068

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`executableName`](/app-builder-lib.interface.platformspecificbuildoptions#executableName)

---

##### extraFiles?

> `optional` **extraFiles**: `null` | `string` | [`FileSet`](/app-builder-lib.interface.fileset) | (`string` | [`FileSet`](/app-builder-lib.interface.fileset))[]

The same as [extraResources](#extraresources) but copy into the app’s content directory (`Contents` for MacOS, root directory for Linux and Windows).

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`extraFiles`](/app-builder-lib.interface.platformspecificbuildoptions#extraFiles)

---

##### extraResources?

> `optional` **extraResources**: `null` | `string` | [`FileSet`](/app-builder-lib.interface.fileset) | (`string` | [`FileSet`](/app-builder-lib.interface.fileset))[]

A [glob patterns](/file-patterns) relative to the project directory, when specified, copy the file or directory with matching names directly into the app’s resources directory (`Contents/Resources` for MacOS, `resources` for Linux and Windows).

File patterns (and support for `from` and `to` fields) the same as for [files](#files).

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`extraResources`](/app-builder-lib.interface.platformspecificbuildoptions#extraResources)

---

##### fileAssociations?

> `readonly` `optional` **fileAssociations**: [`FileAssociation`](/app-builder-lib.interface.fileassociation) | [`FileAssociation`](/app-builder-lib.interface.fileassociation)[]

The file associations.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`fileAssociations`](/app-builder-lib.interface.platformspecificbuildoptions#fileAssociations)

---

##### files?

> `optional` **files**: `null` | `string` | [`FileSet`](/app-builder-lib.interface.fileset) | (`string` | [`FileSet`](/app-builder-lib.interface.fileset))[]

A [glob patterns](/file-patterns) relative to the [app directory](/configuration#directories), which specifies which files to include when copying files to create the package.

Defaults to:

```
[
"**/*",
"!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
"!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
"!**/node_modules/*.d.ts",
"!**/node_modules/.bin",
"!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
"!.editorconfig",
"!**/._*",
"!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
"!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
"!**/{appveyor.yml,.travis.yml,circle.yml}",
"!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
]
```

Development dependencies are never copied in any case. You don’t need to ignore it explicitly. Hidden files are not ignored by default, but all files that should be ignored, are ignored by default.

Default pattern `**/*` **is not added to your custom** if some of your patterns is not ignore (i.e. not starts with `!`). `package.json` and `**/node_modules/**/*` (only production dependencies will be copied) is added to your custom in any case. All default ignores are added in any case — you don’t need to repeat it if you configure own patterns.

May be specified in the platform options (e.g. in the [mac](/mac)).

You may also specify custom source and destination directories by using `FileSet` objects instead of simple glob patterns.

```
[
{
 "from": "path/to/source",
 "to": "path/to/destination",
 "filter": ["**/*", "!foo/*.js"]
}
]
```

You can use [file macros](/file-patterns#file-macros) in the `from` and `to` fields as well. `from` and `to` can be files and you can use this to [rename](https://github.com/electron-userland/electron-builder/issues/1119) a file while packaging.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`files`](/app-builder-lib.interface.platformspecificbuildoptions#files)

---

##### forceCodeSigning?

> `readonly` `optional` **forceCodeSigning**: `boolean`

Whether to fail if app will be not code signed.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`forceCodeSigning`](/app-builder-lib.interface.platformspecificbuildoptions#forceCodeSigning)

---

##### generateUpdatesFilesForAllChannels?

> `readonly` `optional` **generateUpdatesFilesForAllChannels**: `boolean`

Please see [Building and Releasing using Channels](https://github.com/electron-userland/electron-builder/issues/1182#issuecomment-324947139).

###### Default

```
false
```

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`generateUpdatesFilesForAllChannels`](/app-builder-lib.interface.platformspecificbuildoptions#generateUpdatesFilesForAllChannels)

---

##### icon?

> `readonly` `optional` **icon**: `null` | `string`

The path to application icon.

###### Default

```
build/icon.ico
```

###### Overrides

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`icon`](/app-builder-lib.interface.platformspecificbuildoptions#icon)

---

##### legalTrademarks?

> `readonly` `optional` **legalTrademarks**: `null` | `string`

The trademarks and registered trademarks.

---

##### protocols?

> `readonly` `optional` **protocols**: [`Protocol`](/app-builder-lib.interface.protocol) | [`Protocol`](/app-builder-lib.interface.protocol)[]

The URL protocol schemes.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`protocols`](/app-builder-lib.interface.platformspecificbuildoptions#protocols)

---

##### publish?

> `optional` **publish**: `Publish`

Publisher configuration. See [Auto Update](/publish) for more information.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`publish`](/app-builder-lib.interface.platformspecificbuildoptions#publish)

---

##### releaseInfo?

> `readonly` `optional` **releaseInfo**: [`ReleaseInfo`](/app-builder-lib.interface.releaseinfo)

The release info. Intended for command line usage:

```
-c.releaseInfo.releaseNotes="new features"
```

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`releaseInfo`](/app-builder-lib.interface.platformspecificbuildoptions#releaseInfo)

---

##### requestedExecutionLevel?

> `readonly` `optional` **requestedExecutionLevel**: `null` | `RequestedExecutionLevel`

The [security level](https://msdn.microsoft.com/en-us/library/6ad1fshk.aspx#Anchor_9) at which the application requests to be executed.
Cannot be specified per target, allowed only in the `win`.

###### Default

```
asInvoker
```

---

##### signAndEditExecutable?

> `readonly` `optional` **signAndEditExecutable**: `boolean`

Whether to sign and add metadata to executable.
Metadata includes information about the app name/description/version, publisher, copyright, etc.
This property also is responsible for adding the app icon and setting execution level.
(Advanced option leveraging `rcedit`)

###### Default

```
true
```

---

##### signExts?

> `readonly` `optional` **signExts**: `null` | `string`[]

Explicit file name/extensions (`str.endsWith`) to also sign. Advanced option.
Supports negative patterns, e.g. example that excludes `.appx` files: `["somefilename", ".dll", "!.appx"]`.

###### See

https://github.com/electron-userland/electron-builder/issues/7329

###### Default

```
null
```

---

##### signtoolOptions?

> `readonly` `optional` **signtoolOptions**: `null` | [`WindowsSigntoolConfiguration`](/app-builder-lib.interface.windowssigntoolconfiguration)

Options for usage with signtool.exe
Cannot be used in conjunction with `azureSignOptions`, signing will default to Azure Trusted Signing

---

##### target?

> `readonly` `optional` **target**: [`TargetConfigType`](/app-builder-lib.typealias.targetconfigtype)

The target package type: list of `nsis`, `nsis-web` (Web installer), `portable` ([portable]./nsis.md#portable) app without installation), `appx`, `msi`, `msi-wrapped`, `squirrel`, `7z`, `zip`, `tar.xz`, `tar.lz`, `tar.gz`, `tar.bz2`, `dir`.
AppX package can be built only on Windows 10.

To use Squirrel.Windows please install `electron-builder-squirrel-windows` dependency.

###### Default

```
nsis
```

###### Overrides

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`target`](/app-builder-lib.interface.platformspecificbuildoptions#target)

---

##### verifyUpdateCodeSignature?

> `readonly` `optional` **verifyUpdateCodeSignature**: `boolean`

Whether to verify the signature of an available update before installation.
The [publisher name](#publisherName) will be used for the signature verification.

###### Default

```
true
```