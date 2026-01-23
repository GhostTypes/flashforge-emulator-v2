# https://www.electron.build/configuration

# Common Configuration

electron-builder [configuration](#configuration) can be defined

* in the `package.json` file of your project using the `build` key on the top level:

  ```
  "build": {
    "appId": "com.example.app"
  }
  ```
* or through the `--config <path/to/yml-or-json5-or-toml-or-js>` option. Defaults to `electron-builder.yml`.

  ```
  appId: "com.example.app"
  ```

  `json`, [json5](http://json5.org), [toml](https://github.com/toml-lang/toml) or `js`/`ts` (exported configuration or function that produces configuration) formats also supported.

  Tip

  If you want to use `js` file, do not name it `electron-builder.js`. It will [conflict](https://github.com/electron-userland/electron-builder/issues/6227) with `electron-builder` package name.

  Tip

  If you want to use [toml](https://en.wikipedia.org/wiki/TOML), please install `yarn add toml --dev`.

Most of the options accept `null` — for example, to explicitly set that DMG icon must be default volume icon from the OS and default rules must be not applied (i.e. use application icon as DMG icon), set `dmg.icon` to `null`.

## Artifact File Name Template

`${ext}` macro is supported in addition to [file macros](/file-patterns#file-macros).

## Environment Variables from File

Env file `electron-builder.env` in the current dir ([example](https://github.com/motdotla/dotenv-expand/blob/1cc80d02e1f8aa749253a04a2061c0fecb9bdb69/tests/.env)). Supported only for CLI usage.

## How to Read Docs

* Name of optional property is normal, **required** is bold.
* Type is specified after property name: `Array<String> | String`. Union like this means that you can specify or string (`**/*`), or array of strings (`["**/*", "!foo.js"]`).

### Common Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / CommonConfiguration

Configuration Options

##### Extended by

* [`Configuration`](/app-builder-lib.interface.configuration)

##### Properties

###### apk?

> `readonly` `optional` **apk**: `null` | [`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions)

---

###### appId?

> `readonly` `optional` **appId**: `null` | `string`

The application id. Used as [CFBundleIdentifier](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-102070) for MacOS and as
[Application User Model ID](https://msdn.microsoft.com/en-us/library/windows/desktop/dd378459(v=vs.85).aspx) for Windows (NSIS target only, Squirrel.Windows not supported). It is strongly recommended that an explicit ID is set.

###### # Default

```
com.electron.${name}
```

---

###### appImage?

> `readonly` `optional` **appImage**: `null` | [`AppImageOptions`](/app-builder-lib.interface.appimageoptions)

AppImage options.

---

###### appx?

> `readonly` `optional` **appx**: `null` | [`AppXOptions`](/app-builder-lib.interface.appxoptions)

---

###### buildDependenciesFromSource?

> `optional` **buildDependenciesFromSource**: `boolean`

Whether to build the application native dependencies from source.

###### # Default

```
false
```

---

###### buildNumber?

> `readonly` `optional` **buildNumber**: `null` | `string`

The build number. Maps to the `--iteration` flag for builds using FPM on Linux.
If not defined, then it will fallback to `BUILD_NUMBER` or `TRAVIS_BUILD_NUMBER` or `APPVEYOR_BUILD_NUMBER` or `CIRCLE_BUILD_NUM` or `BUILD_BUILDNUMBER` or `CI_PIPELINE_IID` env.

---

###### buildVersion?

> `readonly` `optional` **buildVersion**: `null` | `string`

The build version. Maps to the `CFBundleVersion` on macOS, and `FileVersion` metadata property on Windows. Defaults to the `version`.
If `buildVersion` is not defined and `buildNumber` (or one of the `buildNumber` envs) is defined, it will be used as a build version (`version.buildNumber`).

---

###### concurrency?

> `readonly` `optional` **concurrency**: `null` | `Concurrency`

[Experimental] Configuration for concurrent builds.

---

###### copyright?

> `readonly` `optional` **copyright**: `null` | `string`

The human-readable copyright line for the app.

###### # Default

```
Copyright © year ${author}
```

---

###### deb?

> `readonly` `optional` **deb**: `null` | [`DebOptions`](/app-builder-lib.interface.deboptions)

Debian package options.

---

###### directories?

> `readonly` `optional` **directories**: `null` | [`MetadataDirectories`](/app-builder-lib.interface.metadatadirectories)

Directories for build resources

---

###### dmg?

> `readonly` `optional` **dmg**: `null` | [`DmgOptions`](/app-builder-lib.interface.dmgoptions)

macOS DMG options.

---

###### downloadAlternateFFmpeg?

> `readonly` `optional` **downloadAlternateFFmpeg**: `boolean`

Whether to download the alternate FFmpeg library from Electron’s release assets and replace the default FFmpeg library prior to signing

---

###### electronFuses?

> `readonly` `optional` **electronFuses**: `null` | [`FuseOptionsV1`](/app-builder-lib.interface.fuseoptionsv1)

Options to pass to `@electron/fuses`
Ref: https://github.com/electron/fuses

---

###### extraMetadata?

> `readonly` `optional` **extraMetadata**: `any`

Inject properties to `package.json`.

---

###### flatpak?

> `readonly` `optional` **flatpak**: `null` | [`FlatpakOptions`](/app-builder-lib.interface.flatpakoptions)

Flatpak options.

---

###### forceCodeSigning?

> `readonly` `optional` **forceCodeSigning**: `boolean`

Whether to fail if the application is not signed (to prevent unsigned app if code signing configuration is not correct).

###### # Default

```
false
```

---

###### freebsd?

> `readonly` `optional` **freebsd**: `null` | [`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions)

---

###### includePdb?

> `readonly` `optional` **includePdb**: `boolean`

Whether to include PDB files.

###### # Default

```
false
```

---

###### linux?

> `readonly` `optional` **linux**: `null` | [`LinuxConfiguration`](/app-builder-lib.interface.linuxconfiguration)

Options related to how build Linux targets.

---

###### mac?

> `readonly` `optional` **mac**: `null` | [`MacConfiguration`](/app-builder-lib.interface.macconfiguration)

Options related to how build macOS targets.

---

###### mas?

> `readonly` `optional` **mas**: `null` | [`MasConfiguration`](/app-builder-lib.interface.masconfiguration)

MAS (Mac Application Store) options.

---

###### masDev?

> `readonly` `optional` **masDev**: `null` | [`MasConfiguration`](/app-builder-lib.interface.masconfiguration)

MAS (Mac Application Store) development options (`mas-dev` target).

---

###### nativeRebuilder?

> `readonly` `optional` **nativeRebuilder**: `null` | `"legacy"` | `"sequential"` | `"parallel"`

Use `legacy` app-builder binary for installing native dependencies, or `@electron/rebuild` in `sequential` or `parallel` compilation modes.

###### # Default

```
sequential
```

---

###### nodeGypRebuild?

> `readonly` `optional` **nodeGypRebuild**: `boolean`

Whether to execute `node-gyp rebuild` before starting to package the app.

Don’t [use](https://github.com/electron-userland/electron-builder/issues/683#issuecomment-241214075) [npm](http://electron.atom.io/docs/tutorial/using-native-node-modules/#using-npm) (neither `.npmrc`) for configuring electron headers. Use `electron-builder node-gyp-rebuild` instead.

###### # Default

```
false
```

---

###### npmArgs?

> `readonly` `optional` **npmArgs**: `null` | `string` | `string`[]

Additional command line arguments to use when installing app native deps.

---

###### npmRebuild?

> `readonly` `optional` **npmRebuild**: `boolean`

Whether to [rebuild](https://docs.npmjs.com/cli/rebuild) native dependencies before starting to package the app.

###### # Default

```
true
```

---

###### nsis?

> `readonly` `optional` **nsis**: `null` | [`NsisOptions`](/app-builder-lib.interface.nsisoptions)

---

###### nsisWeb?

> `readonly` `optional` **nsisWeb**: `null` | [`NsisWebOptions`](/app-builder-lib.interface.nsisweboptions)

---

###### p5p?

> `readonly` `optional` **p5p**: `null` | [`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions)

---

###### pacman?

> `readonly` `optional` **pacman**: `null` | [`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions)

---

###### pkg?

> `readonly` `optional` **pkg**: `null` | [`PkgOptions`](/app-builder-lib.interface.pkgoptions)

macOS PKG options.

---

###### portable?

> `readonly` `optional` **portable**: `null` | [`PortableOptions`](/app-builder-lib.interface.portableoptions)

---

###### productName?

> `readonly` `optional` **productName**: `null` | `string`

As [name](#metadata), but allows you to specify a product name for your executable which contains spaces and other special characters not allowed in the [name property](https://docs.npmjs.com/files/package.json#name).
If not specified inside of the `build` configuration, `productName` property defined at the top level of `package.json` is used. If not specified at the top level of `package.json`, [name property](https://docs.npmjs.com/files/package.json#name) is used.

---

###### removePackageKeywords?

> `readonly` `optional` **removePackageKeywords**: `boolean`

Whether to remove `keywords` field from `package.json` files.

###### # Default

```
true
```

---

###### removePackageScripts?

> `readonly` `optional` **removePackageScripts**: `boolean`

Whether to remove `scripts` field from `package.json` files.

###### # Default

```
true
```

---

###### rpm?

> `readonly` `optional` **rpm**: `null` | [`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions)

---

###### snap?

> `readonly` `optional` **snap**: `null` | [`SnapOptions`](/app-builder-lib.interface.snapoptions)

Snap options.

---

###### squirrelWindows?

> `readonly` `optional` **squirrelWindows**: `null` | [`SquirrelWindowsOptions`](/app-builder-lib.interface.squirrelwindowsoptions)

---

###### win?

> `readonly` `optional` **win**: `null` | [`WindowsConfiguration`](/app-builder-lib.interface.windowsconfiguration)

Options related to how build Windows targets.

---

## Overridable per Platform Options

Following options can be set also per platform (top-level keys [mac](/mac), [linux](/linux) and [win](/win)) if need.

## Base Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / PlatformSpecificBuildOptions

#### Extends

* [`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`FilesBuildOptions`](/app-builder-lib.interface.filesbuildoptions)

#### Extended by

* [`Configuration`](/app-builder-lib.interface.configuration)
* [`LinuxConfiguration`](/app-builder-lib.interface.linuxconfiguration)
* [`MacConfiguration`](/app-builder-lib.interface.macconfiguration)
* [`WindowsConfiguration`](/app-builder-lib.interface.windowsconfiguration)

#### Properties

##### appId?

> `readonly` `optional` **appId**: `null` | `string`

The application id. Used as [CFBundleIdentifier](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-102070) for MacOS and as
[Application User Model ID](https://msdn.microsoft.com/en-us/library/windows/desktop/dd378459(v=vs.85).aspx) for Windows (NSIS target only, Squirrel.Windows not supported). It is strongly recommended that an explicit ID is set.

###### Default

```
com.electron.${name}
```

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template). Defaults to `${productName}-${version}.${ext}` (some target can have other defaults, see corresponding options).

###### Overrides

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### asar?

> `readonly` `optional` **asar**: `null` | `boolean` | [`AsarOptions`](/app-builder-lib.interface.asaroptions)

Whether to package the application’s source code into an archive, using [Electron’s archive format](http://electron.atom.io/docs/tutorial/application-packaging/).

Node modules, that must be unpacked, will be detected automatically, you don’t need to explicitly set [asarUnpack](#asarUnpack) - please file an issue if this doesn’t work.

###### Default

```
true
```

---

##### asarUnpack?

> `readonly` `optional` **asarUnpack**: `null` | `string` | `string`[]

A [glob patterns](/file-patterns) relative to the [app directory](#directories), which specifies which files to unpack when creating the [asar](http://electron.atom.io/docs/tutorial/application-packaging/) archive.

---

##### compression?

> `readonly` `optional` **compression**: `null` | [`CompressionLevel`](/app-builder-lib.typealias.compressionlevel)

The compression level. If you want to rapidly test build, `store` can reduce build time significantly. `maximum` doesn’t lead to noticeable size difference, but increase build time.

###### Default

```
normal
```

---

##### cscKeyPassword?

> `optional` **cscKeyPassword**: `null` | `string`

---

##### cscLink?

> `optional` **cscLink**: `null` | `string`

---

##### defaultArch?

> `readonly` `optional` **defaultArch**: `string`

---

##### detectUpdateChannel?

> `readonly` `optional` **detectUpdateChannel**: `boolean`

Whether to infer update channel from application version pre-release components. e.g. if version `0.12.1-alpha.1`, channel will be set to `alpha`. Otherwise to `latest`.
This does *not* apply to github publishing, which will [never auto-detect the update channel](https://github.com/electron-userland/electron-builder/issues/8589).

###### Default

```
true
```

---

##### disableDefaultIgnoredFiles?

> `optional` **disableDefaultIgnoredFiles**: `null` | `boolean`

Whether to exclude all default ignored files(https://www.electron.build/contents#files) and options. Defaults to `false`.

###### Default

```
false
```

---

##### electronLanguages?

> `readonly` `optional` **electronLanguages**: `string` | `string`[]

The electron locales to keep. By default, all Electron locales used as-is.

---

##### electronUpdaterCompatibility?

> `readonly` `optional` **electronUpdaterCompatibility**: `null` | `string`

The [electron-updater compatibility](/auto-update#compatibility) semver range.

---

##### executableName?

> `readonly` `optional` **executableName**: `null` | `string`

The executable name. Defaults to `productName`
Note: Except for Linux, where this would constitute a breaking change in previous behavior and lead to both invalid executable names and Desktop files. Ref comments in: https://github.com/electron-userland/electron-builder/pull/9068

---

##### extraFiles?

> `optional` **extraFiles**: `null` | `string` | [`FileSet`](/app-builder-lib.interface.fileset) | (`string` | [`FileSet`](/app-builder-lib.interface.fileset))[]

The same as [extraResources](#extraresources) but copy into the app’s content directory (`Contents` for MacOS, root directory for Linux and Windows).

###### Inherited from

[`FilesBuildOptions`](/app-builder-lib.interface.filesbuildoptions).[`extraFiles`](/app-builder-lib.interface.filesbuildoptions#extraFiles)

---

##### extraResources?

> `optional` **extraResources**: `null` | `string` | [`FileSet`](/app-builder-lib.interface.fileset) | (`string` | [`FileSet`](/app-builder-lib.interface.fileset))[]

A [glob patterns](/file-patterns) relative to the project directory, when specified, copy the file or directory with matching names directly into the app’s resources directory (`Contents/Resources` for MacOS, `resources` for Linux and Windows).

File patterns (and support for `from` and `to` fields) the same as for [files](#files).

###### Inherited from

[`FilesBuildOptions`](/app-builder-lib.interface.filesbuildoptions).[`extraResources`](/app-builder-lib.interface.filesbuildoptions#extraResources)

---

##### fileAssociations?

> `readonly` `optional` **fileAssociations**: [`FileAssociation`](/app-builder-lib.interface.fileassociation) | [`FileAssociation`](/app-builder-lib.interface.fileassociation)[]

The file associations.

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

[`FilesBuildOptions`](/app-builder-lib.interface.filesbuildoptions).[`files`](/app-builder-lib.interface.filesbuildoptions#files)

---

##### forceCodeSigning?

> `readonly` `optional` **forceCodeSigning**: `boolean`

Whether to fail if app will be not code signed.

---

##### generateUpdatesFilesForAllChannels?

> `readonly` `optional` **generateUpdatesFilesForAllChannels**: `boolean`

Please see [Building and Releasing using Channels](https://github.com/electron-userland/electron-builder/issues/1182#issuecomment-324947139).

###### Default

```
false
```

---

##### icon?

> `readonly` `optional` **icon**: `null` | `string`

---

##### protocols?

> `readonly` `optional` **protocols**: [`Protocol`](/app-builder-lib.interface.protocol) | [`Protocol`](/app-builder-lib.interface.protocol)[]

The URL protocol schemes.

---

##### publish?

> `optional` **publish**: `Publish`

Publisher configuration. See [Auto Update](/publish) for more information.

###### Overrides

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### releaseInfo?

> `readonly` `optional` **releaseInfo**: [`ReleaseInfo`](/app-builder-lib.interface.releaseinfo)

The release info. Intended for command line usage:

```
-c.releaseInfo.releaseNotes="new features"
```

---

##### target?

> `readonly` `optional` **target**: `null` | `string` | [`TargetConfiguration`](/app-builder-lib.interface.targetconfiguration) | (`string` | [`TargetConfiguration`](/app-builder-lib.interface.targetconfiguration))[]

## Metadata

Some standard fields should be defined in the `package.json`.

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / Metadata

#### Properties

##### author?

> `readonly` `optional` **author**: `null` | [`AuthorMetadata`](/app-builder-lib.interface.authormetadata)

---

##### build?

> `readonly` `optional` **build**: [`Configuration`](/app-builder-lib.interface.configuration)

The electron-builder configuration.

---

##### description?

> `readonly` `optional` **description**: `string`

The application description.

---

##### homepage?

> `readonly` `optional` **homepage**: `null` | `string`

The url to the project [homepage](https://docs.npmjs.com/files/package.json#homepage) (NuGet Package `projectUrl` (optional) or Linux Package URL (required)).

If not specified and your project repository is public on GitHub, it will be `https://github.com/${user}/${project}` by default.

---

##### license?

> `readonly` `optional` **license**: `null` | `string`

*linux-only.* The [license](https://docs.npmjs.com/files/package.json#license) name.

---

##### name?

> `readonly` `optional` **name**: `string`

The application name.

###### Required

---

##### repository?

> `readonly` `optional` **repository**: `null` | `string` | [`RepositoryInfo`](/app-builder-lib.interface.repositoryinfo)

The [repository](https://docs.npmjs.com/files/package.json#repository).

## Proton Native

To package [Proton Native](https://proton-native.js.org/) app, set `protonNodeVersion` option to `current` or specific NodeJS version that you are packaging for.
Currently, only macOS and Linux supported.

## Build Version Management

`CFBundleVersion` (macOS) and `FileVersion` (Windows) will be set automatically to `version.build_number` on CI server (Travis, AppVeyor, CircleCI and Bamboo supported).

## Build Hooks

#### Hooks

Node.js 8

All examples assumed that you use latest Node.js 8.11.x or higher.

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / Hooks

###### Extended by

* [`Configuration`](/app-builder-lib.interface.configuration)

###### Properties

###### # afterAllArtifactBuild?

> `readonly` `optional` **afterAllArtifactBuild**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`BuildResult`](/app-builder-lib.interface.buildresult), `string`[]>

The function (or path to file or module id) to be run after all artifacts are built.

```
(buildResult: BuildResult): Promise<Array<string>> | Array<string>
```

Configuration in the same way as `afterPack` (see above).

myAfterAllArtifactBuild.js

```
exports.default = function () {
  // you can return additional files to publish
  return ["/path/to/additional/result/file"]
}
```

---

###### # afterExtract?

> `readonly` `optional` **afterExtract**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PackContext`](/app-builder-lib.interface.packcontext), `void`>

The function (or path to file or module id) to be [run after the prebuilt Electron binary has been extracted to the output directory](#afterextract)
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

###### # afterPack?

> `readonly` `optional` **afterPack**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PackContext`](/app-builder-lib.interface.packcontext), `void`>

The function (or path to file or module id) to be [run after pack](#afterpack) (but before pack into distributable format and sign).
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

###### # afterSign?

> `readonly` `optional` **afterSign**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PackContext`](/app-builder-lib.interface.packcontext), `void`>

The function (or path to file or module id) to be [run after pack and sign](#aftersign) (but before pack into distributable format).
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

###### # appxManifestCreated?

> `readonly` `optional` **appxManifestCreated**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<`string`, `void`>

The function (or path to file or module id) to be run after Appx manifest created on disk - not packed into .appx package yet.

---

###### # artifactBuildCompleted?

> `readonly` `optional` **artifactBuildCompleted**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`ArtifactCreated`](/app-builder-lib.interface.artifactcreated), `void`>

The function (or path to file or module id) to be run on artifact build completed.
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

###### # artifactBuildStarted?

> `readonly` `optional` **artifactBuildStarted**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`ArtifactBuildStarted`](/app-builder-lib.interface.artifactbuildstarted), `void`>

The function (or path to file or module id) to be run on artifact build start.
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

###### # beforeBuild?

> `readonly` `optional` **beforeBuild**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`BeforeBuildContext`](/app-builder-lib.interface.beforebuildcontext), `boolean` | `void`>

The function (or path to file or module id) to be run before dependencies are installed or rebuilt. Works when `npmRebuild` is set to `true`. Resolving to `false` will skip dependencies install or rebuild.

If provided and `node_modules` are missing, it will not invoke production dependencies check.

---

###### # beforePack?

> `readonly` `optional` **beforePack**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PackContext`](/app-builder-lib.interface.packcontext), `void`>

The function (or path to file or module id) to be run before pack.

```
(context: BeforePackContext): Promise<any> | any
```

As function

```
beforePack: async (context) => {
  // your code
}
```

Because in a configuration file you cannot use JavaScript, can be specified as a path to file or module id. Function must be exported as default export.

```
"build": {
  "beforePack": "./myBeforePackHook.js"
}
```

File `myBeforePackHook.js` in the project root directory:

myBeforePackHook.js

```
exports.default = async function(context) {
  // your custom code
}
```

---

###### # electronDist?

> `readonly` `optional` **electronDist**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PrepareApplicationStageDirectoryOptions`](/app-builder-lib.interface.prepareapplicationstagedirectoryoptions), `string`>

The function (or path to file or module id) to be run when staging the electron artifact environment.
Returns the path to custom Electron build (e.g. `~/electron/out/R`) or folder of electron zips.

Zip files must follow the pattern `electron-v${version}-${platformName}-${arch}.zip`, otherwise it will be assumed to be an unpacked Electron app directory

---

###### # msiProjectCreated?

> `readonly` `optional` **msiProjectCreated**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<`string`, `void`>

The function (or path to file or module id) to be run after MSI project created on disk - not packed into .msi package yet.

---

###### # onNodeModuleFile?

> `readonly` `optional` **onNodeModuleFile**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<`string`, `boolean` | `void`>

The function (or path to file or module id) to be [run on each node module](#onnodemodulefile) file. Returning `true`/`false` will determine whether to force include or to use the default copier logic