# https://www.electron.build/mac

# Any macOS Target

The top-level [mac](/configuration#mac) key contains set of options instructing electron-builder on how it should build macOS targets. These options applicable for any macOS target.

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / MacConfiguration

#### Extends

* [`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions)

#### Extended by

* [`MasConfiguration`](/app-builder-lib.interface.masconfiguration)

#### Properties

##### additionalArguments?

> `readonly` `optional` **additionalArguments**: `null` | `string`[]

Array of strings specifying additional arguments to pass to the `codesign` command used to sign a specific file.

Some subresources that you may include in your Electron app may need to be signed with –deep, this is not typically safe to apply to the entire Electron app and therefore should be applied to just your file.
Usage Example: `['--deep']`

---

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

##### binaries?

> `readonly` `optional` **binaries**: `null` | `string`[]

Paths of any extra binaries that need to be signed.

---

##### bundleShortVersion?

> `readonly` `optional` **bundleShortVersion**: `null` | `string`

The `CFBundleShortVersionString`. Do not use it unless you need to.

---

##### bundleVersion?

> `readonly` `optional` **bundleVersion**: `null` | `string`

The `CFBundleVersion`. Do not use it unless [you need to](https://github.com/electron-userland/electron-builder/issues/565#issuecomment-230678643).

---

##### category?

> `readonly` `optional` **category**: `null` | `string`

The application category type, as shown in the Finder via *View -> Arrange by Application Category* when viewing the Applications directory.

For example, `"category": "public.app-category.developer-tools"` will set the application category to *Developer Tools*.

Valid values are listed in [Apple’s documentation](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8).

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

##### darkModeSupport?

> `readonly` `optional` **darkModeSupport**: `boolean`

Whether a dark mode is supported. If your app does have a dark mode, you can make your app follow the system-wide dark mode setting.

###### Default

```
false
```

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

##### entitlements?

> `readonly` `optional` **entitlements**: `null` | `string`

The path to entitlements file for signing the app. `build/entitlements.mac.plist` will be used if exists (it is a recommended way to set).
MAS entitlements is specified in the [mas](/mas).
See [this folder in osx-sign’s repository](https://github.com/electron/osx-sign/tree/main/entitlements) for examples.
Be aware that your app may crash if the right entitlements are not set like `com.apple.security.cs.allow-jit` for example on arm64 builds with Electron 20+.
See [Signing and Notarizing macOS Builds from the Electron documentation](https://www.electronjs.org/docs/latest/tutorial/code-signing#signing--notarizing-macos-builds) for more information.

---

##### entitlementsInherit?

> `readonly` `optional` **entitlementsInherit**: `null` | `string`

The path to child entitlements which inherit the security settings for signing frameworks and bundles of a distribution. `build/entitlements.mac.inherit.plist` will be used if exists (it is a recommended way to set).
See [this folder in osx-sign’s repository](https://github.com/electron/osx-sign/tree/main/entitlements) for examples.

This option only applies when signing with `entitlements` provided.

---

##### entitlementsLoginHelper?

> `readonly` `optional` **entitlementsLoginHelper**: `null` | `string`

Path to login helper entitlement file.
When using App Sandbox, the the `com.apple.security.inherit` key that is normally in the inherited entitlements cannot be inherited since the login helper is a standalone executable.
Defaults to the value provided for `entitlements`. This option only applies when signing with `entitlements` provided.

---

##### executableName?

> `readonly` `optional` **executableName**: `null` | `string`

The executable name. Defaults to `productName`
Note: Except for Linux, where this would constitute a breaking change in previous behavior and lead to both invalid executable names and Desktop files. Ref comments in: https://github.com/electron-userland/electron-builder/pull/9068

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`executableName`](/app-builder-lib.interface.platformspecificbuildoptions#executableName)

---

##### extendInfo?

> `readonly` `optional` **extendInfo**: `any`

The extra entries for `Info.plist`.

---

##### extraDistFiles?

> `readonly` `optional` **extraDistFiles**: `null` | `string` | `string`[]

Extra files to put in archive. Not applicable for `tar.*`.

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

##### gatekeeperAssess?

> `readonly` `optional` **gatekeeperAssess**: `boolean`

Whether to let `@electron/osx-sign` validate the signing or not.

###### Default

```
false
```

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

##### hardenedRuntime?

> `readonly` `optional` **hardenedRuntime**: `boolean`

Whether your app has to be signed with hardened runtime.

###### Default

```
true
```

---

##### helperBundleId?

> `readonly` `optional` **helperBundleId**: `null` | `string`

The bundle identifier to use in the application helper’s plist.

###### Default

```
${appBundleIdentifier}.helper
```

---

##### helperEHBundleId?

> `readonly` `optional` **helperEHBundleId**: `null` | `string`

The bundle identifier to use in the EH helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.EH
```

---

##### helperGPUBundleId?

> `readonly` `optional` **helperGPUBundleId**: `null` | `string`

The bundle identifier to use in the GPU helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.GPU
```

---

##### helperNPBundleId?

> `readonly` `optional` **helperNPBundleId**: `null` | `string`

The bundle identifier to use in the NP helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.NP
```

---

##### helperPluginBundleId?

> `readonly` `optional` **helperPluginBundleId**: `null` | `string`

The bundle identifier to use in the Plugin helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.Plugin
```

---

##### helperRendererBundleId?

> `readonly` `optional` **helperRendererBundleId**: `null` | `string`

The bundle identifier to use in the Renderer helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.Renderer
```

---

##### icon?

> `readonly` `optional` **icon**: `null` | `string`

The path to application icon.
Accepts `.icns` (legacy) or `.icon` (Icon Composer asset).
If a `.icon` asset is provided, it will be preferred and compiled to an asset catalog.

###### Default

```
build/icon.icns
```

###### Overrides

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`icon`](/app-builder-lib.interface.platformspecificbuildoptions#icon)

---

##### identity?

> `readonly` `optional` **identity**: `null` | `string`

The name of certificate to use when signing. Consider using environment variables [CSC\_LINK or CSC\_NAME](/code-signing) instead of specifying this option.
MAS installer identity is specified in the [mas](/mas).

Set to `-` to use an ad-hoc identity for signing. Set to `null` to skip signing entirely.

---

##### mergeASARs?

> `readonly` `optional` **mergeASARs**: `boolean`

Whether to merge ASAR files for different architectures or not.

This option has no effect unless building for “universal” arch.

###### Default

```
true
```

---

##### minimumSystemVersion?

> `readonly` `optional` **minimumSystemVersion**: `null` | `string`

The minimum version of macOS required for the app to run. Corresponds to `LSMinimumSystemVersion`.

---

##### notarize?

> `readonly` `optional` **notarize**: `boolean`

Whether to disable electron-builder’s [@electron/notarize](https://github.com/electron/notarize) integration.

Note: In order to activate the notarization step You MUST specify one of the following via environment variables:

1. `APPLE_API_KEY`, `APPLE_API_KEY_ID` and `APPLE_API_ISSUER`.
2. `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID`
3. `APPLE_KEYCHAIN` and `APPLE_KEYCHAIN_PROFILE`

For security reasons it is recommended to use the first option (see https://github.com/electron-userland/electron-builder/issues/7859)

---

##### preAutoEntitlements?

> `readonly` `optional` **preAutoEntitlements**: `boolean`

Whether to enable entitlements automation from `@electron/osx-sign`.

###### Default

```
true
```

---

##### protocols?

> `readonly` `optional` **protocols**: [`Protocol`](/app-builder-lib.interface.protocol) | [`Protocol`](/app-builder-lib.interface.protocol)[]

The URL protocol schemes.

###### Inherited from

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`protocols`](/app-builder-lib.interface.platformspecificbuildoptions#protocols)

---

##### provisioningProfile?

> `readonly` `optional` **provisioningProfile**: `null` | `string`

The path to the provisioning profile to use when signing, absolute or relative to the app root.

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

##### requirements?

> `readonly` `optional` **requirements**: `null` | `string`

Path of [requirements file](https://developer.apple.com/library/mac/documentation/Security/Conceptual/CodeSigningGuide/RequirementLang/RequirementLang.html) used in signing. Not applicable for MAS.

---

##### sign?

> `readonly` `optional` **sign**: `null` | `string` | [`CustomMacSign`](/app-builder-lib.typealias.custommacsign)

The custom function (or path to file or module id) to sign an app bundle.

---

##### signIgnore?

> `readonly` `optional` **signIgnore**: `null` | `string` | `string`[]

Regex or an array of regex’s that signal skipping signing a file.

---

##### singleArchFiles?

> `readonly` `optional` **singleArchFiles**: `null` | `string`

Minimatch pattern of paths that are allowed to be present in one of the
ASAR files, but not in the other.

This option has no effect unless building for “universal” arch and applies
only if `mergeASARs` is `true`.

---

##### strictVerify?

> `readonly` `optional` **strictVerify**: `boolean`

Whether to let `@electron/osx-sign` verify the contents or not.

###### Default

```
true
```

---

##### target?

> `readonly` `optional` **target**: `null` | [`TargetConfiguration`](/app-builder-lib.interface.targetconfiguration) | [`MacOsTargetName`](/app-builder-lib.typealias.macostargetname) | TargetConfiguration | MacOsTargetName[]

The target package type: list of `default`, `dmg`, `mas`, `mas-dev`, `pkg`, `7z`, `zip`, `tar.xz`, `tar.lz`, `tar.gz`, `tar.bz2`, `dir`. Defaults to `default` (`dmg` and `zip` for Squirrel.Mac). Note: Squirrel.Mac auto update mechanism requires both `dmg` and `zip` to be enabled, even when only `dmg` is used. Disabling `zip` will break auto update in `dmg` packages.

###### Overrides

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`target`](/app-builder-lib.interface.platformspecificbuildoptions#target)

---

##### timestamp?

> `readonly` `optional` **timestamp**: `null` | `string`

Specify the URL of the timestamp authority server

---

##### type?

> `readonly` `optional` **type**: `null` | `"distribution"` | `"development"`

Whether to sign app for development or for distribution.

###### Default

```
distribution
```

---

##### x64ArchFiles?

> `readonly` `optional` **x64ArchFiles**: `null` | `string`

Minimatch pattern of paths that are allowed to be x64 binaries in both
ASAR files

This option has no effect unless building for “universal” arch and applies
only if `mergeASARs` is `true`.