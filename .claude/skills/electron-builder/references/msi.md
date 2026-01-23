# https://www.electron.build/msi

# MSI

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / MsiOptions

#### Extends

* [`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Properties

##### additionalLightArgs?

> `readonly` `optional` **additionalLightArgs**: `null` | `string`[]

Any additional arguments to be passed to the light.ext, such as `["-cultures:ja-jp"]`

---

##### additionalWixArgs?

> `readonly` `optional` **additionalWixArgs**: `null` | `string`[]

Any additional arguments to be passed to the WiX installer compiler, such as `["-ext", "WixUtilExtension"]`

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template).

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### createDesktopShortcut?

> `readonly` `optional` **createDesktopShortcut**: `boolean` | `"always"`

Whether to create desktop shortcut. Set to `always` if to recreate also on reinstall (even if removed by user).

###### Default

```
true
```

###### Inherited from

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`createDesktopShortcut`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#createDesktopShortcut)

---

##### createStartMenuShortcut?

> `readonly` `optional` **createStartMenuShortcut**: `boolean`

Whether to create start menu shortcut.

###### Default

```
true
```

###### Inherited from

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`createStartMenuShortcut`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#createStartMenuShortcut)

---

##### menuCategory?

> `readonly` `optional` **menuCategory**: `string` | `boolean`

Whether to create submenu for start menu shortcut and program files directory. If `true`, company name will be used. Or string value.

###### Default

```
false
```

###### Inherited from

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`menuCategory`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#menuCategory)

---

##### oneClick?

> `readonly` `optional` **oneClick**: `boolean`

One-click installation.

###### Default

```
true
```

###### Overrides

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`oneClick`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#oneClick)

---

##### perMachine?

> `readonly` `optional` **perMachine**: `boolean`

Whether to install per all users (per-machine).

###### Default

```
false
```

###### Inherited from

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`perMachine`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#perMachine)

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### runAfterFinish?

> `readonly` `optional` **runAfterFinish**: `boolean`

Whether to run the installed application after finish. For assisted installer corresponding checkbox will be removed.

###### Default

```
true
```

###### Inherited from

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`runAfterFinish`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#runAfterFinish)

---

##### shortcutName?

> `readonly` `optional` **shortcutName**: `null` | `string`

The name that will be used for all shortcuts. Defaults to the application name.

###### Inherited from

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`shortcutName`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#shortcutName)

---

##### upgradeCode?

> `readonly` `optional` **upgradeCode**: `null` | `string`

The [upgrade code](https://msdn.microsoft.com/en-us/library/windows/desktop/aa372375(v=vs.85).aspx). Optional, by default generated using app id.

---

##### warningsAsErrors?

> `readonly` `optional` **warningsAsErrors**: `boolean`

If `warningsAsErrors` is `true` (default): treat warnings as errors. If `warningsAsErrors` is `false`: allow warnings.

###### Default

```
true
```