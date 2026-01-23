# https://www.electron.build/snap

# Snap

The top-level [snap](/configuration#snap) key contains set of options instructing electron-builder on how it should build [Snap](http://snapcraft.io).

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / SnapOptions

#### Extends

* [`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Properties

##### after?

> `readonly` `optional` **after**: `null` | `string`[]

Specifies any [parts](https://snapcraft.io/docs/reference/parts) that should be built before this part.
Defaults to `["desktop-gtk2""]`.

If list contains `default`, it will be replaced to default list, so, `["default", "foo"]` can be used to add custom parts `foo` in addition to defaults.

---

##### allowNativeWayland?

> `readonly` `optional` **allowNativeWayland**: `null` | `boolean`

Allow running the program with native wayland support with –ozone-platform=wayland.
Disabled by default because of this issue in older Electron/Snap versions: https://github.com/electron-userland/electron-builder/issues/4007

---

##### appPartStage?

> `readonly` `optional` **appPartStage**: `null` | `string`[]

Specifies which files from the app part to stage and which to exclude. Individual files, directories, wildcards, globstars, and exclusions are accepted. See [Snapcraft filesets](https://snapcraft.io/docs/snapcraft-filesets) to learn more about the format.

The defaults can be found in [snap.ts](https://github.com/electron-userland/electron-builder/blob/master/packages/app-builder-lib/templates/snap/snapcraft.yaml#L29).

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template).

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### assumes?

> `readonly` `optional` **assumes**: `null` | `string` | `string`[]

The list of features that must be supported by the core in order for this snap to install.

---

##### autoStart?

> `readonly` `optional` **autoStart**: `boolean`

Whether or not the snap should automatically start on login.

###### Default

```
false
```

---

##### base?

> `readonly` `optional` **base**: `null` | `string`

A snap of type base to be used as the execution environment for this snap. Examples: `core`, `core18`, `core20`, `core22`. Defaults to `core20`

---

##### buildPackages?

> `readonly` `optional` **buildPackages**: `null` | `string`[]

The list of debian packages needs to be installed for building this snap.

---

##### category?

> `readonly` `optional` **category**: `null` | `string`

The [application category](https://specifications.freedesktop.org/menu-spec/latest/apa.html#main-category-registry).

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`category`](/app-builder-lib.interface.commonlinuxoptions#category)

---

##### compression?

> `readonly` `optional` **compression**: `null` | `"xz"` | `"lzo"`

Sets the compression type for the snap. Can be xz, lzo, or null.

---

##### confinement?

> `readonly` `optional` **confinement**: `null` | `"devmode"` | `"strict"` | `"classic"`

The type of [confinement](https://snapcraft.io/docs/reference/confinement) supported by the snap.

###### Default

```
strict
```

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

##### environment?

> `readonly` `optional` **environment**: `null` | `object`

The custom environment. Defaults to `{"TMPDIR: "$XDG_RUNTIME_DIR"}`. If you set custom, it will be merged with default.

---

##### executableArgs?

> `readonly` `optional` **executableArgs**: `null` | `string`[]

The executable parameters. Pass to executableName

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`executableArgs`](/app-builder-lib.interface.commonlinuxoptions#executableArgs)

---

##### grade?

> `readonly` `optional` **grade**: `null` | `"devel"` | `"stable"`

The quality grade of the snap. It can be either `devel` (i.e. a development version of the snap, so not to be published to the “stable” or “candidate” channels) or “stable” (i.e. a stable release or release candidate, which can be released to all channels).

###### Default

```
stable
```

---

##### hooks?

> `readonly` `optional` **hooks**: `null` | `string`

The [hooks](https://docs.snapcraft.io/build-snaps/hooks) directory, relative to `build` (build resources directory).

###### Default

```
build/snap-hooks
```

---

##### layout?

> `readonly` `optional` **layout**: `null` | `object`

Specifies any files to make accessible from locations such as `/usr`, `/var`, and `/etc`. See [snap layouts](https://snapcraft.io/docs/snap-layouts) to learn more.

---

##### mimeTypes?

> `readonly` `optional` **mimeTypes**: `null` | `string`[]

The mime types in addition to specified in the file associations. Use it if you don’t want to register a new mime type, but reuse existing.

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`mimeTypes`](/app-builder-lib.interface.commonlinuxoptions#mimeTypes)

---

##### plugs?

> `readonly` `optional` **plugs**: `null` | [`PlugDescriptor`](/app-builder-lib.interface.plugdescriptor) | (`string` | [`PlugDescriptor`](/app-builder-lib.interface.plugdescriptor))[]

The list of [plugs](https://snapcraft.io/docs/reference/interfaces).
Defaults to `["desktop", "desktop-legacy", "home", "x11", "wayland", "unity7", "browser-support", "network", "gsettings", "audio-playback", "pulseaudio", "opengl"]`.

If list contains `default`, it will be replaced to default list, so, `["default", "foo"]` can be used to add custom plug `foo` in addition to defaults.

Additional attributes can be specified using object instead of just name of plug:

```
[
 {
   "browser-sandbox": {
     "interface": "browser-support",
     "allow-sandbox": true
   },
 },
 "another-simple-plug-name"
]
```

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### slots?

> `readonly` `optional` **slots**: `null` | [`PlugDescriptor`](/app-builder-lib.interface.plugdescriptor) | (`string` | [`SlotDescriptor`](/app-builder-lib.interface.slotdescriptor))[]

The list of [slots](https://snapcraft.io/docs/reference/interfaces).

Additional attributes can be specified using object instead of just name of slot:
```
[
{
“mpris”: {
“name”: “chromium”
},
}
]

In case you want your application to be a compliant MPris player, you will need to definie
The mpris slot with “chromium” name.
This electron has it [hardcoded](https://source.chromium.org/chromium/chromium/src/+/master:components/system_media_controls/linux/system_media_controls_linux.cc;l=51;bpv=0;bpt=1),
and we need to pass this name so snap [will allow it](https://forum.snapcraft.io/t/unable-to-use-mpris-interface/15360/7) in strict confinement.

---

##### stagePackages?

> `readonly` `optional` **stagePackages**: `null` | `string`[]

The list of Ubuntu packages to use that are needed to support the `app` part creation. Like `depends` for `deb`.
Defaults to `["libnspr4", "libnss3", "libxss1", "libappindicator3-1", "libsecret-1-0"]`.

If list contains `default`, it will be replaced to default list, so, `["default", "foo"]` can be used to add custom package `foo` in addition to defaults.

---

##### summary?

> `readonly` `optional` **summary**: `null` | `string`

The 78 character long summary. Defaults to [productName](/configuration#productName).

---

##### synopsis?

> `readonly` `optional` **synopsis**: `null` | `string`

The [short description](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Description).

###### Inherited from

[`CommonLinuxOptions`](/app-builder-lib.interface.commonlinuxoptions).[`synopsis`](/app-builder-lib.interface.commonlinuxoptions#synopsis)

---

##### title?

> `readonly` `optional` **title**: `null` | `string`

An optional title for the snap, may contain uppercase letters and spaces. Defaults to `productName`. See [snap format documentation](https://snapcraft.io/docs/snap-format).

---

##### useTemplateApp?

> `readonly` `optional` **useTemplateApp**: `boolean`

Whether to use template snap. Defaults to `true` if `stagePackages` not specified.