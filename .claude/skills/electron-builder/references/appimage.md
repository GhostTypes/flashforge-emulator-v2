# https://www.electron.build/appimage

# AppImage

The top-level [appImage](/configuration#appImage) key contains set of options instructing electron-builder on how it should build [AppImage](https://appimage.org/).

Desktop Integration

Since electron-builder 21 desktop integration is not a part of produced AppImage file. [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) is the recommended way to integrate AppImages.

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / AppImageOptions

#### Extends

* [`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Properties

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

##### license?

> `readonly` `optional` **license**: `null` | `string`

The path to EULA license file. Defaults to `license.txt` or `eula.txt` (or uppercase variants). Only plain text is supported.

---

##### mimeTypes?

> `readonly` `optional` **mimeTypes**: `null` | `string`[]

The mime types in addition to specified in the file associations. Use it if you don’t want to register a new mime type, but reuse existing.

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`mimeTypes`](/app-builder-lib.interface.commonlinuxoptions#mimeTypes)

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