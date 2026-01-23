# https://www.electron.build/linux

# Any Linux Target

The top-level [linux](/configuration#linux) key contains set of options instructing electron-builder on how it should build Linux targets. These options applicable for any Linux target.

## Base Linux Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / LinuxConfiguration

#### Extends

* [`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions)

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

##### category?

> `readonly` `optional` **category**: `null` | `string`

The [application category](https://specifications.freedesktop.org/menu-spec/latest/apa.html#main-category-registry).

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`category`](/app-builder-lib.interface.commonlinuxoptions#category)

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

##### description?

> `readonly` `optional` **description**: `null` | `string`

As [description](/configuration#description) from application package.json, but allows you to specify different for Linux.

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`description`](/app-builder-lib.interface.commonlinuxoptions#description)

---

##### desktop?

> `readonly` `optional` **desktop**: `null` | [`LinuxDesktopFile`](/app-builder-lib.interface.linuxdesktopfile)

The [Desktop file](https://developer.gnome.org/documentation/guidelines/maintainer/integrating.html#desktop-files)

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`desktop`](/app-builder-lib.interface.commonlinuxoptions#desktop)

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

##### executableArgs?

> `readonly` `optional` **executableArgs**: `null` | `string`[]

The executable parameters. Pass to executableName

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`executableArgs`](/app-builder-lib.interface.commonlinuxoptions#executableArgs)

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

> `readonly` `optional` **icon**: `string`

The path to icon set directory or one png file, relative to the [build resources](/contents#extraresources) or to the project directory. The icon filename must contain the size (e.g. 32x32.png) of the icon.
By default will be generated automatically based on the macOS icns file.

###### Overrides

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`icon`](/app-builder-lib.interface.platformspecificbuildoptions#icon)

---

##### maintainer?

> `readonly` `optional` **maintainer**: `null` | `string`

The maintainer. Defaults to [author](/configuration#author).

---

##### mimeTypes?

> `readonly` `optional` **mimeTypes**: `null` | `string`[]

The mime types in addition to specified in the file associations. Use it if you don’t want to register a new mime type, but reuse existing.

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`mimeTypes`](/app-builder-lib.interface.commonlinuxoptions#mimeTypes)

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

##### synopsis?

> `readonly` `optional` **synopsis**: `null` | `string`

The [short description](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Description).

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`synopsis`](/app-builder-lib.interface.commonlinuxoptions#synopsis)

---

##### target?

> `readonly` `optional` **target**: [`TargetConfigType`](/app-builder-lib.typealias.targetconfigtype)

Target package type: list of `AppImage`, `flatpak`, `snap`, `deb`, `rpm`, `freebsd`, `pacman`, `p5p`, `apk`, `7z`, `zip`, `tar.xz`, `tar.lz`, `tar.gz`, `tar.bz2`, `dir`.

electron-builder [docker image](/multi-platform-build#docker) can be used to build Linux targets on any platform.

Please [do not put an AppImage into another archive](https://github.com/probonopd/AppImageKit/wiki/Creating-AppImages#common-mistake) like a .zip or .tar.gz.

###### Default

```
AppImage
```

###### Overrides

[`PlatformSpecificBuildOptions`](/app-builder-lib.interface.platformspecificbuildoptions).[`target`](/app-builder-lib.interface.platformspecificbuildoptions#target)

---

##### vendor?

> `readonly` `optional` **vendor**: `null` | `string`

The vendor. Defaults to [author](/configuration#author).

## Debian Package Options

The top-level [deb](/configuration#deb) key contains set of options instructing electron-builder on how it should build Debian package.

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / DebOptions

#### Extends

* [`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions)

#### Properties

##### afterInstall?

> `readonly` `optional` **afterInstall**: `null` | `string`

File path to script to be passed to FPM for `--after-install` arg.

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`afterInstall`](/app-builder-lib.interface.linuxtargetspecificoptions#afterInstall)

---

##### afterRemove?

> `readonly` `optional` **afterRemove**: `null` | `string`

File path to script to be passed to FPM for `--after-remove` arg.

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`afterRemove`](/app-builder-lib.interface.linuxtargetspecificoptions#afterRemove)

---

##### appArmorProfile?

> `readonly` `optional` **appArmorProfile**: `null` | `string`

File path to custom AppArmor profile (Ubuntu 24+)

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`appArmorProfile`](/app-builder-lib.interface.linuxtargetspecificoptions#appArmorProfile)

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template).

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`artifactName`](/app-builder-lib.interface.linuxtargetspecificoptions#artifactName)

---

##### category?

> `readonly` `optional` **category**: `null` | `string`

The [application category](https://specifications.freedesktop.org/menu-spec/latest/apa.html#main-category-registry).

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`category`](/app-builder-lib.interface.linuxtargetspecificoptions#category)

---

##### compression?

> `readonly` `optional` **compression**: `null` | `"gz"` | `"bzip2"` | `"xz"` | `"lzo"`

The compression type.

###### Default

```
xz
```

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`compression`](/app-builder-lib.interface.linuxtargetspecificoptions#compression)

---

##### depends?

> `readonly` `optional` **depends**: `null` | `string`[]

Package dependencies.
If need to support Debian, `libappindicator1` should be removed, it is [deprecated in Debian](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=895037).
If need to support KDE, `gconf2` and `gconf-service` should be removed as it’s no longer used [by GNOME](https://packages.debian.org/bullseye/gconf2).

###### Default

```
["libgtk-3-0", "libnotify4", "libnss3", "libxss1", "libxtst6", "xdg-utils", "libatspi2.0-0", "libuuid1", "libsecret-1-0"]
```

###### Overrides

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`depends`](/app-builder-lib.interface.linuxtargetspecificoptions#depends)

---

##### description?

> `readonly` `optional` **description**: `null` | `string`

As [description](/configuration#description) from application package.json, but allows you to specify different for Linux.

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`description`](/app-builder-lib.interface.linuxtargetspecificoptions#description)

---

##### desktop?

> `readonly` `optional` **desktop**: `null` | [`LinuxDesktopFile`](/app-builder-lib.interface.linuxdesktopfile)

The [Desktop file](https://developer.gnome.org/documentation/guidelines/maintainer/integrating.html#desktop-files)

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`desktop`](/app-builder-lib.interface.linuxtargetspecificoptions#desktop)

---

##### executableArgs?

> `readonly` `optional` **executableArgs**: `null` | `string`[]

The executable parameters. Pass to executableName

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`executableArgs`](/app-builder-lib.interface.linuxtargetspecificoptions#executableArgs)

---

##### fpm?

> `readonly` `optional` **fpm**: `null` | `string`[]

*Advanced only* The [fpm](https://fpm.readthedocs.io/en/latest/cli-reference.html) options.

Example: `["--before-install=build/deb-preinstall.sh", "--after-upgrade=build/deb-postinstall.sh"]`

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`fpm`](/app-builder-lib.interface.linuxtargetspecificoptions#fpm)

---

##### icon?

> `readonly` `optional` **icon**: `string`

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`icon`](/app-builder-lib.interface.linuxtargetspecificoptions#icon)

---

##### maintainer?

> `readonly` `optional` **maintainer**: `null` | `string`

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`maintainer`](/app-builder-lib.interface.linuxtargetspecificoptions#maintainer)

---

##### mimeTypes?

> `readonly` `optional` **mimeTypes**: `null` | `string`[]

The mime types in addition to specified in the file associations. Use it if you don’t want to register a new mime type, but reuse existing.

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`mimeTypes`](/app-builder-lib.interface.linuxtargetspecificoptions#mimeTypes)

---

##### packageCategory?

> `readonly` `optional` **packageCategory**: `null` | `string`

The [package category](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Section).

###### Overrides

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`packageCategory`](/app-builder-lib.interface.linuxtargetspecificoptions#packageCategory)

---

##### packageName?

> `readonly` `optional` **packageName**: `null` | `string`

The name of the package.

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`packageName`](/app-builder-lib.interface.linuxtargetspecificoptions#packageName)

---

##### priority?

> `readonly` `optional` **priority**: `null` | `string`

The [Priority](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Priority) attribute.

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`publish`](/app-builder-lib.interface.linuxtargetspecificoptions#publish)

---

##### recommends?

> `readonly` `optional` **recommends**: `null` | `string`[]

The [recommended package dependencies](https://www.debian.org/doc/debian-policy/ch-relationships.html#s-binarydeps).

###### Default

```
["libappindicator3-1"]
```

---

##### synopsis?

> `readonly` `optional` **synopsis**: `null` | `string`

The [short description](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Description).

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`synopsis`](/app-builder-lib.interface.linuxtargetspecificoptions#synopsis)

---

##### vendor?

> `readonly` `optional` **vendor**: `null` | `string`

###### Inherited from

[`LinuxTargetSpecificOptions`](/app-builder-lib.interface.linuxtargetspecificoptions).[`vendor`](/app-builder-lib.interface.linuxtargetspecificoptions#vendor)

All [LinuxTargetSpecificOptions](/linux#linuxtargetspecificoptions-apk-freebsd-pacman-p5p-and-rpm-options) can be also specified in the `deb` to customize Debian package.

## `LinuxTargetSpecificOptions` APK, FreeBSD, Pacman, P5P and RPM Options

The top-level `apk`, `freebsd`, `pacman`, `p5p` and `rpm` keys contains set of options instructing electron-builder on how it should build corresponding Linux target.

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / LinuxTargetSpecificOptions

#### Extends

* [`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Extended by

* [`DebOptions`](/app-builder-lib.interface.deboptions)

#### Properties

##### afterInstall?

> `readonly` `optional` **afterInstall**: `null` | `string`

File path to script to be passed to FPM for `--after-install` arg.

---

##### afterRemove?

> `readonly` `optional` **afterRemove**: `null` | `string`

File path to script to be passed to FPM for `--after-remove` arg.

---

##### appArmorProfile?

> `readonly` `optional` **appArmorProfile**: `null` | `string`

File path to custom AppArmor profile (Ubuntu 24+)

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template).

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### category?

> `readonly` `optional` **category**: `null` | `string`

The [application category](https://specifications.freedesktop.org/menu-spec/latest/apa.html#main-category-registry).

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`category`](/app-builder-lib.interface.commonlinuxoptions#category)

---

##### compression?

> `readonly` `optional` **compression**: `null` | `"gz"` | `"bzip2"` | `"xz"` | `"lzo"`

The compression type.

###### Default

```
xz
```

---

##### depends?

> `readonly` `optional` **depends**: `null` | `string`[]

Package dependencies.
`rpm` defaults to `["gtk3", "libnotify", "nss", "libXScrnSaver", "(libXtst or libXtst6)", "xdg-utils", "at-spi2-core", "(libuuid or libuuid1)"]`
`pacman` defaults to `["c-ares", "ffmpeg", "gtk3", "http-parser", "libevent", "libvpx", "libxslt", "libxss", "minizip", "nss", "re2", "snappy", "libnotify", "libappindicator-gtk3"]`

---

##### description?

> `readonly` `optional` **description**: `null` | `string`

As [description](/configuration#description) from application package.json, but allows you to specify different for Linux.

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`description`](/app-builder-lib.interface.commonlinuxoptions#description)

---

##### desktop?

> `readonly` `optional` **desktop**: `null` | [`LinuxDesktopFile`](/app-builder-lib.interface.linuxdesktopfile)

The [Desktop file](https://developer.gnome.org/documentation/guidelines/maintainer/integrating.html#desktop-files)

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`desktop`](/app-builder-lib.interface.commonlinuxoptions#desktop)

---

##### executableArgs?

> `readonly` `optional` **executableArgs**: `null` | `string`[]

The executable parameters. Pass to executableName

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`executableArgs`](/app-builder-lib.interface.commonlinuxoptions#executableArgs)

---

##### fpm?

> `readonly` `optional` **fpm**: `null` | `string`[]

*Advanced only* The [fpm](https://fpm.readthedocs.io/en/latest/cli-reference.html) options.

Example: `["--before-install=build/deb-preinstall.sh", "--after-upgrade=build/deb-postinstall.sh"]`

---

##### icon?

> `readonly` `optional` **icon**: `string`

---

##### maintainer?

> `readonly` `optional` **maintainer**: `null` | `string`

---

##### mimeTypes?

> `readonly` `optional` **mimeTypes**: `null` | `string`[]

The mime types in addition to specified in the file associations. Use it if you don’t want to register a new mime type, but reuse existing.

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`mimeTypes`](/app-builder-lib.interface.commonlinuxoptions#mimeTypes)

---

##### packageCategory?

> `readonly` `optional` **packageCategory**: `null` | `string`

The package category.

---

##### packageName?

> `readonly` `optional` **packageName**: `null` | `string`

The name of the package.

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### synopsis?

> `readonly` `optional` **synopsis**: `null` | `string`

The [short description](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Description).

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`synopsis`](/app-builder-lib.interface.commonlinuxoptions#synopsis)

---

##### vendor?

> `readonly` `optional` **vendor**: `null` | `string`