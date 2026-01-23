# https://www.electron.build/dmg

# DMG

The top-level [dmg](/configuration#dmg) key contains set of options instructing electron-builder on how it should build [DMG](https://en.wikipedia.org/wiki/Apple_Disk_Image).

## DMG License

To add license to DMG, create file `license_LANG_CODE.txt` in the build resources. Multiple license files in different languages are supported — use lang postfix (e.g. `_de`, `_ru`)). For example, create files `license_de.txt` and `license_en.txt` in the build resources.
If OS language is german, `license_de.txt` will be displayed. See map of [language code to name](https://github.com/meikidd/iso-639-1/blob/master/src/data.js).

You can also change the default button labels of the DMG by passing a json file named `licenseButtons_LANG_CODE.json`. The german file would be named: `licenseButtons_de.json`.
The contain file should have the following format:

```
{
  "lang": "English",
  "agree": "Agree",
  "disagree": "Disagree",
  "print": "Print",
  "save": "Save",
  "description": "Here is my own description"
}
```

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / DmgOptions

#### Extends

* [`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Properties

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template).

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### background?

> `optional` **background**: `null` | `string`

The path to background image (default: `build/background.tiff` or `build/background.png` if exists). The resolution of this file determines the resolution of the installer window.
If background is not specified, use `window.size`. Default locations expected background size to be 540x380.

###### See

[DMG with Retina background support](http://stackoverflow.com/a/11204769/1910191).

---

##### backgroundColor?

> `optional` **backgroundColor**: `null` | `string`

The background color (accepts css colors). Defaults to `#ffffff` (white) if no background image.

---

##### contents?

> `optional` **contents**: [`DmgContent`](/app-builder-lib.interface.dmgcontent)[]

The content — to customize icon locations. The x and y coordinates refer to the position of the **center** of the icon (at 1x scale), and do not take the label into account.

---

##### format?

> `optional` **format**: `"UDRW"` | `"UDRO"` | `"UDCO"` | `"UDZO"` | `"UDBZ"` | `"ULFO"`

The disk image format. `ULFO` (lzfse-compressed image (OS X 10.11+ only)).

###### Default

```
UDZO
```

---

##### icon?

> `optional` **icon**: `null` | `string`

The path to DMG icon (volume icon), which will be shown when mounted, relative to the [build resources](/contents#extraresources) or to the project directory.
Defaults to the application icon (`build/icon.icns`).

---

##### iconSize?

> `readonly` `optional` **iconSize**: `null` | `number`

The size of all the icons inside the DMG.

###### Default

```
80
```

---

##### iconTextSize?

> `readonly` `optional` **iconTextSize**: `null` | `number`

The size of all the icon texts inside the DMG.

###### Default

```
12
```

---

##### internetEnabled?

> `readonly` `optional` **internetEnabled**: `boolean`

Whether to create internet-enabled disk image (when it is downloaded using a browser it will automatically decompress the image, put the application on the desktop, unmount and remove the disk image file).

###### Default

```
false
```

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### sign?

> `readonly` `optional` **sign**: `boolean`

Whether to sign the DMG or not. Signing is not required and will lead to unwanted errors in combination with notarization requirements.

###### Default

```
false
```

---

##### title?

> `readonly` `optional` **title**: `null` | `string`

The title of the produced DMG, which will be shown when mounted (volume name).

Macro `${productName}`, `${version}` and `${name}` are supported.

###### Default

```
${productName} ${version}
```

---

##### window?

> `optional` **window**: [`DmgWindow`](/app-builder-lib.interface.dmgwindow)

The DMG window position and size. With y co-ordinates running from bottom to top.

The Finder makes sure that the window will be on the user’s display, so if you want your window at the top left of the display you could use `"x": 0, "y": 100000` as the x, y co-ordinates.
It is not to be possible to position the window relative to the [top left](https://github.com/electron-userland/electron-builder/issues/3990#issuecomment-512960957) or relative to the center of the user’s screen.