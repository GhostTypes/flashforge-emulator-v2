# https://www.electron.build/mas

# MAS

The top-level [mas](/configuration#mas) key contains set of options instructing electron-builder on how it should build MAS (Mac Application Store) target.
Inherits [macOS options](/mac).

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / MasConfiguration

#### Extends

* [`MacConfiguration`](/app-builder-lib.interface.macconfiguration)

#### Properties

##### additionalArguments?

> `readonly` `optional` **additionalArguments**: `null` | `string`[]

Array of strings specifying additional arguments to pass to the `codesign` command used to sign a specific file.

Some subresources that you may include in your Electron app may need to be signed with –deep, this is not typically safe to apply to the entire Electron app and therefore should be applied to just your file.
Usage Example: `['--deep']`

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`additionalArguments`](/app-builder-lib.interface.macconfiguration#additionalArguments)

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

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`appId`](/app-builder-lib.interface.macconfiguration#appId)

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template). Defaults to `${productName}-${version}.${ext}` (some target can have other defaults, see corresponding options).

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`artifactName`](/app-builder-lib.interface.macconfiguration#artifactName)

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

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`asar`](/app-builder-lib.interface.macconfiguration#asar)

---

##### asarUnpack?

> `readonly` `optional` **asarUnpack**: `null` | `string` | `string`[]

A [glob patterns](/file-patterns) relative to the [app directory](#directories), which specifies which files to unpack when creating the [asar](http://electron.atom.io/docs/tutorial/application-packaging/) archive.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`asarUnpack`](/app-builder-lib.interface.macconfiguration#asarUnpack)

---

##### binaries?

> `readonly` `optional` **binaries**: `null` | `string`[]

Paths of any extra binaries that need to be signed.

###### Overrides

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`binaries`](/app-builder-lib.interface.macconfiguration#binaries)

---

##### bundleShortVersion?

> `readonly` `optional` **bundleShortVersion**: `null` | `string`

The `CFBundleShortVersionString`. Do not use it unless you need to.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`bundleShortVersion`](/app-builder-lib.interface.macconfiguration#bundleShortVersion)

---

##### bundleVersion?

> `readonly` `optional` **bundleVersion**: `null` | `string`

The `CFBundleVersion`. Do not use it unless [you need to](https://github.com/electron-userland/electron-builder/issues/565#issuecomment-230678643).

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`bundleVersion`](/app-builder-lib.interface.macconfiguration#bundleVersion)

---

##### category?

> `readonly` `optional` **category**: `null` | `string`

The application category type, as shown in the Finder via *View -> Arrange by Application Category* when viewing the Applications directory.

For example, `"category": "public.app-category.developer-tools"` will set the application category to *Developer Tools*.

Valid values are listed in [Apple’s documentation](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8).

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`category`](/app-builder-lib.interface.macconfiguration#category)

---

##### compression?

> `readonly` `optional` **compression**: `null` | [`CompressionLevel`](/app-builder-lib.typealias.compressionlevel)

The compression level. If you want to rapidly test build, `store` can reduce build time significantly. `maximum` doesn’t lead to noticeable size difference, but increase build time.

###### Default

```
normal
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`compression`](/app-builder-lib.interface.macconfiguration#compression)

---

##### cscKeyPassword?

> `optional` **cscKeyPassword**: `null` | `string`

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`cscKeyPassword`](/app-builder-lib.interface.macconfiguration#cscKeyPassword)

---

##### cscLink?

> `optional` **cscLink**: `null` | `string`

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`cscLink`](/app-builder-lib.interface.macconfiguration#cscLink)

---

##### darkModeSupport?

> `readonly` `optional` **darkModeSupport**: `boolean`

Whether a dark mode is supported. If your app does have a dark mode, you can make your app follow the system-wide dark mode setting.

###### Default

```
false
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`darkModeSupport`](/app-builder-lib.interface.macconfiguration#darkModeSupport)

---

##### defaultArch?

> `readonly` `optional` **defaultArch**: `string`

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`defaultArch`](/app-builder-lib.interface.macconfiguration#defaultArch)

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

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`detectUpdateChannel`](/app-builder-lib.interface.macconfiguration#detectUpdateChannel)

---

##### disableDefaultIgnoredFiles?

> `optional` **disableDefaultIgnoredFiles**: `null` | `boolean`

Whether to exclude all default ignored files(https://www.electron.build/contents#files) and options. Defaults to `false`.

###### Default

```
false
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`disableDefaultIgnoredFiles`](/app-builder-lib.interface.macconfiguration#disableDefaultIgnoredFiles)

---

##### electronLanguages?

> `readonly` `optional` **electronLanguages**: `string` | `string`[]

The electron locales to keep. By default, all Electron locales used as-is.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`electronLanguages`](/app-builder-lib.interface.macconfiguration#electronLanguages)

---

##### electronUpdaterCompatibility?

> `readonly` `optional` **electronUpdaterCompatibility**: `null` | `string`

The [electron-updater compatibility](/auto-update#compatibility) semver range.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`electronUpdaterCompatibility`](/app-builder-lib.interface.macconfiguration#electronUpdaterCompatibility)

---

##### entitlements?

> `readonly` `optional` **entitlements**: `null` | `string`

The path to entitlements file for signing the app. `build/entitlements.mas.plist` will be used if exists (it is a recommended way to set).
See [this folder in osx-sign’s repository](https://github.com/electron/osx-sign/tree/main/entitlements) for examples.
Be aware that your app may crash if the right entitlements are not set like `com.apple.security.cs.allow-jit` for example on arm64 builds with Electron 20+.
See [Signing and Notarizing macOS Builds from the Electron documentation](https://www.electronjs.org/docs/latest/tutorial/code-signing#signing--notarizing-macos-builds) for more information.

###### Overrides

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`entitlements`](/app-builder-lib.interface.macconfiguration#entitlements)

---

##### entitlementsInherit?

> `readonly` `optional` **entitlementsInherit**: `null` | `string`

The path to child entitlements which inherit the security settings for signing frameworks and bundles of a distribution. `build/entitlements.mas.inherit.plist` will be used if exists (it is a recommended way to set).
See [this folder in osx-sign’s repository](https://github.com/electron/osx-sign/tree/main/entitlements) for examples.

###### Overrides

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`entitlementsInherit`](/app-builder-lib.interface.macconfiguration#entitlementsInherit)

---

##### entitlementsLoginHelper?

> `readonly` `optional` **entitlementsLoginHelper**: `null` | `string`

Path to login helper entitlement file.
When using App Sandbox, the the `com.apple.security.inherit` key that is normally in the inherited entitlements cannot be inherited since the login helper is a standalone executable.
Defaults to the value provided for `entitlements`. This option only applies when signing with `entitlements` provided.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`entitlementsLoginHelper`](/app-builder-lib.interface.macconfiguration#entitlementsLoginHelper)

---

##### executableName?

> `readonly` `optional` **executableName**: `null` | `string`

The executable name. Defaults to `productName`
Note: Except for Linux, where this would constitute a breaking change in previous behavior and lead to both invalid executable names and Desktop files. Ref comments in: https://github.com/electron-userland/electron-builder/pull/9068

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`executableName`](/app-builder-lib.interface.macconfiguration#executableName)

---

##### extendInfo?

> `readonly` `optional` **extendInfo**: `any`

The extra entries for `Info.plist`.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`extendInfo`](/app-builder-lib.interface.macconfiguration#extendInfo)

---

##### extraDistFiles?

> `readonly` `optional` **extraDistFiles**: `null` | `string` | `string`[]

Extra files to put in archive. Not applicable for `tar.*`.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`extraDistFiles`](/app-builder-lib.interface.macconfiguration#extraDistFiles)

---

##### extraFiles?

> `optional` **extraFiles**: `null` | `string` | [`FileSet`](/app-builder-lib.interface.fileset) | (`string` | [`FileSet`](/app-builder-lib.interface.fileset))[]

The same as [extraResources](#extraresources) but copy into the app’s content directory (`Contents` for MacOS, root directory for Linux and Windows).

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`extraFiles`](/app-builder-lib.interface.macconfiguration#extraFiles)

---

##### extraResources?

> `optional` **extraResources**: `null` | `string` | [`FileSet`](/app-builder-lib.interface.fileset) | (`string` | [`FileSet`](/app-builder-lib.interface.fileset))[]

A [glob patterns](/file-patterns) relative to the project directory, when specified, copy the file or directory with matching names directly into the app’s resources directory (`Contents/Resources` for MacOS, `resources` for Linux and Windows).

File patterns (and support for `from` and `to` fields) the same as for [files](#files).

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`extraResources`](/app-builder-lib.interface.macconfiguration#extraResources)

---

##### fileAssociations?

> `readonly` `optional` **fileAssociations**: [`FileAssociation`](/app-builder-lib.interface.fileassociation) | [`FileAssociation`](/app-builder-lib.interface.fileassociation)[]

The file associations.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`fileAssociations`](/app-builder-lib.interface.macconfiguration#fileAssociations)

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

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`files`](/app-builder-lib.interface.macconfiguration#files)

---

##### forceCodeSigning?

> `readonly` `optional` **forceCodeSigning**: `boolean`

Whether to fail if app will be not code signed.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`forceCodeSigning`](/app-builder-lib.interface.macconfiguration#forceCodeSigning)

---

##### gatekeeperAssess?

> `readonly` `optional` **gatekeeperAssess**: `boolean`

Whether to let `@electron/osx-sign` validate the signing or not.

###### Default

```
false
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`gatekeeperAssess`](/app-builder-lib.interface.macconfiguration#gatekeeperAssess)

---

##### generateUpdatesFilesForAllChannels?

> `readonly` `optional` **generateUpdatesFilesForAllChannels**: `boolean`

Please see [Building and Releasing using Channels](https://github.com/electron-userland/electron-builder/issues/1182#issuecomment-324947139).

###### Default

```
false
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`generateUpdatesFilesForAllChannels`](/app-builder-lib.interface.macconfiguration#generateUpdatesFilesForAllChannels)

---

##### hardenedRuntime?

> `readonly` `optional` **hardenedRuntime**: `boolean`

Whether your app has to be signed with hardened runtime.

###### Default

```
true
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`hardenedRuntime`](/app-builder-lib.interface.macconfiguration#hardenedRuntime)

---

##### helperBundleId?

> `readonly` `optional` **helperBundleId**: `null` | `string`

The bundle identifier to use in the application helper’s plist.

###### Default

```
${appBundleIdentifier}.helper
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`helperBundleId`](/app-builder-lib.interface.macconfiguration#helperBundleId)

---

##### helperEHBundleId?

> `readonly` `optional` **helperEHBundleId**: `null` | `string`

The bundle identifier to use in the EH helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.EH
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`helperEHBundleId`](/app-builder-lib.interface.macconfiguration#helperEHBundleId)

---

##### helperGPUBundleId?

> `readonly` `optional` **helperGPUBundleId**: `null` | `string`

The bundle identifier to use in the GPU helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.GPU
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`helperGPUBundleId`](/app-builder-lib.interface.macconfiguration#helperGPUBundleId)

---

##### helperNPBundleId?

> `readonly` `optional` **helperNPBundleId**: `null` | `string`

The bundle identifier to use in the NP helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.NP
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`helperNPBundleId`](/app-builder-lib.interface.macconfiguration#helperNPBundleId)

---

##### helperPluginBundleId?

> `readonly` `optional` **helperPluginBundleId**: `null` | `string`

The bundle identifier to use in the Plugin helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.Plugin
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`helperPluginBundleId`](/app-builder-lib.interface.macconfiguration#helperPluginBundleId)

---

##### helperRendererBundleId?

> `readonly` `optional` **helperRendererBundleId**: `null` | `string`

The bundle identifier to use in the Renderer helper’s plist.

###### Default

```
${appBundleIdentifier}.helper.Renderer
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`helperRendererBundleId`](/app-builder-lib.interface.macconfiguration#helperRendererBundleId)

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

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`icon`](/app-builder-lib.interface.macconfiguration#icon)

---

##### identity?

> `readonly` `optional` **identity**: `null` | `string`

The name of certificate to use when signing. Consider using environment variables [CSC\_LINK or CSC\_NAME](/code-signing) instead of specifying this option.
MAS installer identity is specified in the [mas](/mas).

Set to `-` to use an ad-hoc identity for signing. Set to `null` to skip signing entirely.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`identity`](/app-builder-lib.interface.macconfiguration#identity)

---

##### mergeASARs?

> `readonly` `optional` **mergeASARs**: `boolean`

Whether to merge ASAR files for different architectures or not.

This option has no effect unless building for “universal” arch.

###### Default

```
true
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`mergeASARs`](/app-builder-lib.interface.macconfiguration#mergeASARs)

---

##### minimumSystemVersion?

> `readonly` `optional` **minimumSystemVersion**: `null` | `string`

The minimum version of macOS required for the app to run. Corresponds to `LSMinimumSystemVersion`.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`minimumSystemVersion`](/app-builder-lib.interface.macconfiguration#minimumSystemVersion)

---

##### notarize?

> `readonly` `optional` **notarize**: `boolean`

Whether to disable electron-builder’s [@electron/notarize](https://github.com/electron/notarize) integration.

Note: In order to activate the notarization step You MUST specify one of the following via environment variables:

1. `APPLE_API_KEY`, `APPLE_API_KEY_ID` and `APPLE_API_ISSUER`.
2. `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID`
3. `APPLE_KEYCHAIN` and `APPLE_KEYCHAIN_PROFILE`

For security reasons it is recommended to use the first option (see https://github.com/electron-userland/electron-builder/issues/7859)

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`notarize`](/app-builder-lib.interface.macconfiguration#notarize)

---

##### preAutoEntitlements?

> `readonly` `optional` **preAutoEntitlements**: `boolean`

Whether to enable entitlements automation from `@electron/osx-sign`.

###### Default

```
true
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`preAutoEntitlements`](/app-builder-lib.interface.macconfiguration#preAutoEntitlements)

---

##### protocols?

> `readonly` `optional` **protocols**: [`Protocol`](/app-builder-lib.interface.protocol) | [`Protocol`](/app-builder-lib.interface.protocol)[]

The URL protocol schemes.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`protocols`](/app-builder-lib.interface.macconfiguration#protocols)

---

##### provisioningProfile?

> `readonly` `optional` **provisioningProfile**: `null` | `string`

The path to the provisioning profile to use when signing, absolute or relative to the app root.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`provisioningProfile`](/app-builder-lib.interface.macconfiguration#provisioningProfile)

---

##### publish?

> `optional` **publish**: `Publish`

Publisher configuration. See [Auto Update](/publish) for more information.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`publish`](/app-builder-lib.interface.macconfiguration#publish)

---

##### releaseInfo?

> `readonly` `optional` **releaseInfo**: [`ReleaseInfo`](/app-builder-lib.interface.releaseinfo)

The release info. Intended for command line usage:

```
-c.releaseInfo.releaseNotes="new features"
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`releaseInfo`](/app-builder-lib.interface.macconfiguration#releaseInfo)

---

##### requirements?

> `readonly` `optional` **requirements**: `null` | `string`

Path of [requirements file](https://developer.apple.com/library/mac/documentation/Security/Conceptual/CodeSigningGuide/RequirementLang/RequirementLang.html) used in signing. Not applicable for MAS.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`requirements`](/app-builder-lib.interface.macconfiguration#requirements)

---

##### sign?

> `readonly` `optional` **sign**: `null` | `string` | [`CustomMacSign`](/app-builder-lib.typealias.custommacsign)

The custom function (or path to file or module id) to sign an app bundle.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`sign`](/app-builder-lib.interface.macconfiguration#sign)

---

##### signIgnore?

> `readonly` `optional` **signIgnore**: `null` | `string` | `string`[]

Regex or an array of regex’s that signal skipping signing a file.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`signIgnore`](/app-builder-lib.interface.macconfiguration#signIgnore)

---

##### singleArchFiles?

> `readonly` `optional` **singleArchFiles**: `null` | `string`

Minimatch pattern of paths that are allowed to be present in one of the
ASAR files, but not in the other.

This option has no effect unless building for “universal” arch and applies
only if `mergeASARs` is `true`.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`singleArchFiles`](/app-builder-lib.interface.macconfiguration#singleArchFiles)

---

##### strictVerify?

> `readonly` `optional` **strictVerify**: `boolean`

Whether to let `@electron/osx-sign` verify the contents or not.

###### Default

```
true
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`strictVerify`](/app-builder-lib.interface.macconfiguration#strictVerify)

---

##### target?

> `readonly` `optional` **target**: `null` | [`TargetConfiguration`](/app-builder-lib.interface.targetconfiguration) | [`MacOsTargetName`](/app-builder-lib.typealias.macostargetname) | TargetConfiguration | MacOsTargetName[]

The target package type: list of `default`, `dmg`, `mas`, `mas-dev`, `pkg`, `7z`, `zip`, `tar.xz`, `tar.lz`, `tar.gz`, `tar.bz2`, `dir`. Defaults to `default` (`dmg` and `zip` for Squirrel.Mac). Note: Squirrel.Mac auto update mechanism requires both `dmg` and `zip` to be enabled, even when only `dmg` is used. Disabling `zip` will break auto update in `dmg` packages.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`target`](/app-builder-lib.interface.macconfiguration#target)

---

##### timestamp?

> `readonly` `optional` **timestamp**: `null` | `string`

Specify the URL of the timestamp authority server

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`timestamp`](/app-builder-lib.interface.macconfiguration#timestamp)

---

##### type?

> `readonly` `optional` **type**: `null` | `"distribution"` | `"development"`

Whether to sign app for development or for distribution.

###### Default

```
distribution
```

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`type`](/app-builder-lib.interface.macconfiguration#type)

---

##### x64ArchFiles?

> `readonly` `optional` **x64ArchFiles**: `null` | `string`

Minimatch pattern of paths that are allowed to be x64 binaries in both
ASAR files

This option has no effect unless building for “universal” arch and applies
only if `mergeASARs` is `true`.

###### Inherited from

[`MacConfiguration`](/app-builder-lib.interface.macconfiguration).[`x64ArchFiles`](/app-builder-lib.interface.macconfiguration#x64ArchFiles)