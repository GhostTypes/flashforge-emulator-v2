# https://www.electron.build/nsis

# NSIS

The top-level [nsis](/configuration#nsis) key contains set of options instructing electron-builder on how it should build NSIS target (default target for Windows).

These options also applicable for [Web installer](#web-installer), use top-level `nsisWeb` key.

---

Unicode enabled by default. Large strings are supported (maximum string length of 8192 bytes instead of the default of 1024 bytes).

## 32 bit + 64 bit

If you build both ia32 and x64 arch (`--x64 --ia32`), you in any case get one installer. Appropriate arch will be installed automatically.
The same applied to web installer (`nsis-web` [target](/win#WindowsConfiguration-target)).

## Web Installer

To build web installer, set [target](/win#WindowsConfiguration-target) to `nsis-web`. Web Installer automatically detects OS architecture and downloads corresponding package file. So, user don’t need to guess what installer to download and in the same time you don’t bundle package files for all architectures in the one installer (as in case of default `nsis` target). It doesn’t matter for common Electron application (due to superb LZMA compression, size difference is acceptable), but if your application is huge, Web Installer is a solution.

To customize web installer, use the top-level `nsisWeb` key (not `nsis`).

If for some reasons web installer cannot download (antivirus, offline):

* Download package file into the same directory where installer located. It will be detected automatically and used instead of downloading from the Internet. Please note — only original package file is allowed (checksum is checked).
* Specify any local package file using `--package-file=path_to_file`.

## Custom NSIS script

Two options are available — [include](#NsisOptions-include) and [script](#NsisOptions-script). `script` allows you to provide completely different NSIS script. For most cases it is not required as you need only to customise some aspects, but still use well-tested and maintained default NSIS script. So, `include` is recommended.

Keep in mind — if you customize NSIS script, you should always state about it in the issue reports. And don’t expect that your issue will be resolved.

1. Add file `build/installer.nsh`.
2. Define wanted macro to customise: `customHeader`, `preInit`, `customInit`, `customUnInit`, `customInstall`, `customUnInstall`, `customRemoveFiles`, `customInstallMode`, `customWelcomePage`, `customUnWelcomePage`, `customUnInstallSection`.

   Example

   ```
   !macro customHeader
     !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
   !macroend

   !macro preInit
     ; This macro is inserted at the beginning of the NSIS .OnInit callback
     !system "echo '' > ${BUILD_RESOURCES_DIR}/preInit"
   !macroend

   !macro customInit
     !system "echo '' > ${BUILD_RESOURCES_DIR}/customInit"
   !macroend

   !macro customInstall
     !system "echo '' > ${BUILD_RESOURCES_DIR}/customInstall"
   !macroend

   !macro customInstallMode
     # set $isForceMachineInstall or $isForceCurrentInstall
     # to enforce one or the other modes.
   !macroend

   !macro customWelcomePage
     # Welcome Page is not added by default for installer.
     !insertMacro MUI_PAGE_WELCOME
   !macroend

   !macro customUnWelcomePage
     !define MUI_WELCOMEPAGE_TITLE "custom title for uninstaller welcome page"
     !define MUI_WELCOMEPAGE_TEXT "custom text for uninstaller welcome page $\r$\n more"
     !insertmacro MUI_UNPAGE_WELCOME
   !macroend

   !macro customUnInstallSection
     Section /o "un.Some cool checkbox"
       ; You can add some uninstall section as component page
       ; If defined, then always run after `customUnInstall`
     SectionEnd
   !macroend
   ```
3. `BUILD_RESOURCES_DIR` and `PROJECT_DIR` are defined.
4. `build` is added as `addincludedir` (i.e. you don’t need to use `BUILD_RESOURCES_DIR` to include files).
5. `build/x86-unicode` and `build/x86-ansi` are added as `addplugindir`.
6. File associations macro `registerFileAssociations` and `unregisterFileAssociations` are still defined.
7. All other electron-builder specific flags (e.g. `ONE_CLICK`) are still defined.

If you want to include additional resources for use during installation, such as scripts or additional installers, you can place them in the `build` directory and include them with `File`. For example, to include and run `extramsi.msi` during installation, place it in the `build` directory and use the following:

```
!macro customInstall
  File /oname=$PLUGINSDIR\extramsi.msi "${BUILD_RESOURCES_DIR}\extramsi.msi"
  ExecWait '"msiexec" /i "$PLUGINSDIR\extramsi.msi" /passive'
!macroend
```

Is there a way to call just when the app is installed (or uninstalled) manually and not on update?

Use `${isUpdated}`.

```
${ifNot} ${isUpdated}
  # your code
${endIf}
```

## GUID vs Application Name

Windows requires to use registry keys (e.g. INSTALL/UNINSTALL info). Squirrel.Windows simply uses application name as key.
But it is not robust — Google can use key Google Chrome SxS, because it is a Google.

So, it is better to use [GUID](http://stackoverflow.com/a/246935/1910191).
You are not forced to explicitly specify it — name-based [UUID v5](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_5_.28SHA-1_hash_.26_namespace.29) will be generated from your [appId](/configuration#appId) or [name](/configuration#metadata).
It means that you **should not change appId** once your application in use (or name if `appId` was not set). Application product name (title) or description can be safely changed.

You can explicitly set guid using option [nsis.guid](#NsisOptions-guid), but it is not recommended — consider using [appId](/configuration#appId).

It is also important to set the Application User Model ID (AUMID) to the [appId](/configuration#appId) of the application, in order for notifications on Windows 8/8.1 to function and for Window 10 notifications to display the app icon within the notifications by default. The AUMID should be set within the Main process and before any BrowserWindows have been opened, it is normally the first piece of code executed: `app.setAppUserModelId(appId)`

## Portable

To build portable app, set target to `portable` (or pass `--win portable`).

For portable app, following environment variables are available:

* `PORTABLE_EXECUTABLE_FILE` - path to the portable executable.
* `PORTABLE_EXECUTABLE_DIR` - directory where the portable executable is located.
* `PORTABLE_EXECUTABLE_APP_FILENAME` - sanitized app name to use in [file paths](https://github.com/electron-userland/electron-builder/issues/3186#issue-345489962).

## Common Questions

How do change the default installation directory to custom?

It is very specific requirement. Do not do if you are not sure. Add [custom macro](#custom-nsis-script):

```
!macro preInit
  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\MyApp"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\MyApp"
  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\MyApp"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\MyApp"
!macroend
```

Is it possible to made single installer that will allow configuring user/machine installation?

Yes, you need to switch to assisted installer (not default one-click).

package.json

```
"build": {
  "nsis": {
    "oneClick": false
  }
}
```

electron-builder.yml

```
nsis:
  oneClick: false
```

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / NsisOptions

#### Extends

* [`CommonNsisOptions`](/app-builder-lib.interface.commonnsisoptions).[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Extended by

* [`NsisWebOptions`](/app-builder-lib.interface.nsisweboptions)

#### Properties

##### allowElevation?

> `readonly` `optional` **allowElevation**: `boolean`

*assisted installer only.* Allow requesting for elevation. If false, user will have to restart installer with elevated permissions.

###### Default

```
true
```

---

##### allowToChangeInstallationDirectory?

> `readonly` `optional` **allowToChangeInstallationDirectory**: `boolean`

*assisted installer only.* Whether to allow user to change installation directory.

###### Default

```
false
```

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template). Defaults to `${productName} Setup ${version}.${ext}`.

###### Overrides

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### buildUniversalInstaller?

> `readonly` `optional` **buildUniversalInstaller**: `boolean`

Disable building an universal installer of the archs specified in the target configuration
*Not supported for nsis-web*

###### Default

```
true
```

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

##### customNsisBinary?

> `readonly` `optional` **customNsisBinary**: `null` | [`CustomNsisBinary`](/app-builder-lib.interface.customnsisbinary)

Allows you to provide your own `makensis`, such as one with support for debug logging via LogSet and LogText. (Logging also requires option `debugLogging = true`)

###### Inherited from

[`CommonNsisOptions`](/app-builder-lib.interface.commonnsisoptions).[`customNsisBinary`](/app-builder-lib.interface.commonnsisoptions#customNsisBinary)

---

##### customNsisResources?

> `readonly` `optional` **customNsisResources**: `null` | `CustomNsisResources`

Allows you to provide your own `nsis-resources`

###### Inherited from

[`CommonNsisOptions`](/app-builder-lib.interface.commonnsisoptions).[`customNsisResources`](/app-builder-lib.interface.commonnsisoptions#customNsisResources)

---

##### deleteAppDataOnUninstall?

> `readonly` `optional` **deleteAppDataOnUninstall**: `boolean`

*one-click installer only.* Whether to delete app data on uninstall.

###### Default

```
false
```

---

##### displayLanguageSelector?

> `readonly` `optional` **displayLanguageSelector**: `boolean`

Whether to display a language selection dialog. Not recommended (by default will be detected using OS language).

###### Default

```
false
```

---

##### guid?

> `readonly` `optional` **guid**: `null` | `string`

See [GUID vs Application Name](/nsis#guid-vs-application-name).

###### Inherited from

[`CommonNsisOptions`](/app-builder-lib.interface.commonnsisoptions).[`guid`](/app-builder-lib.interface.commonnsisoptions#guid)

---

##### include?

> `readonly` `optional` **include**: `null` | `string`

The path to NSIS include script to customize installer. Defaults to `build/installer.nsh`. See [Custom NSIS script](#custom-nsis-script).

---

> `readonly` `optional` **installerHeader**: `null` | `string`

*assisted installer only.* `MUI_HEADERIMAGE`, relative to the [build resources](/contents#extraresources) or to the project directory.

###### Default

```
build/installerHeader.bmp
```

---

> `readonly` `optional` **installerHeaderIcon**: `null` | `string`

*one-click installer only.* The path to header icon (above the progress bar), relative to the [build resources](/contents#extraresources) or to the project directory.
Defaults to `build/installerHeaderIcon.ico` or application icon.

---

##### installerIcon?

> `readonly` `optional` **installerIcon**: `null` | `string`

The path to installer icon, relative to the [build resources](/contents#extraresources) or to the project directory.
Defaults to `build/installerIcon.ico` or application icon.

---

##### installerLanguages?

> `readonly` `optional` **installerLanguages**: `null` | `string` | `string`[]

The installer languages (e.g. `en_US`, `de_DE`). Change only if you understand what do you do and for what.

---

> `readonly` `optional` **installerSidebar**: `null` | `string`

*assisted installer only.* `MUI_WELCOMEFINISHPAGE_BITMAP`, relative to the [build resources](/contents#extraresources) or to the project directory.
Defaults to `build/installerSidebar.bmp` or `${NSISDIR}\\Contrib\\Graphics\\Wizard\\nsis3-metro.bmp`. Image size 164 × 314 pixels.

---

##### language?

> `readonly` `optional` **language**: `null` | `string`

[LCID Dec](https://msdn.microsoft.com/en-au/goglobal/bb964664.aspx), defaults to `1033`(`English - United States`).

---

##### license?

> `readonly` `optional` **license**: `null` | `string`

The path to EULA license file. Defaults to `license.txt` or `eula.txt` (or uppercase variants). In addition to `txt`, `rtf` and `html` supported (don’t forget to use `target="_blank"` for links).

Multiple license files in different languages are supported — use lang postfix (e.g. `_de`, `_ru`). For example, create files `license_de.txt` and `license_en.txt` in the build resources.
If OS language is german, `license_de.txt` will be displayed. See map of [language code to name](https://github.com/meikidd/iso-639-1/blob/master/src/data.js).

Appropriate license file will be selected by user OS language.

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

##### multiLanguageInstaller?

> `readonly` `optional` **multiLanguageInstaller**: `boolean`

Whether to create multi-language installer. Defaults to `unicode` option value.

---

##### oneClick?

> `readonly` `optional` **oneClick**: `boolean`

Whether to create one-click installer or assisted.

###### Default

```
true
```

###### Overrides

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`oneClick`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#oneClick)

---

##### packElevateHelper?

> `readonly` `optional` **packElevateHelper**: `boolean`

Whether to pack the elevate executable (required for electron-updater if per-machine installer used or can be used in the future). Ignored if `perMachine` is set to `true`.

###### Default

```
true
```

---

##### perMachine?

> `readonly` `optional` **perMachine**: `boolean`

Whether to show install mode installer page (choice per-machine or per-user) for assisted installer. Or whether installation always per all users (per-machine).

If `oneClick` is `true` (default): Whether to install per all users (per-machine).

If `oneClick` is `false` and `perMachine` is `true`: no install mode installer page, always install per-machine.

If `oneClick` is `false` and `perMachine` is `false` (default): install mode installer page.

###### Default

```
false
```

###### Overrides

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`perMachine`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#perMachine)

---

##### preCompressedFileExtensions?

> `readonly` `optional` **preCompressedFileExtensions**: `null` | `string` | `string`[]

The file extension of files that will be not compressed. Applicable only for `extraResources` and `extraFiles` files.

###### Default

```
[".avi", ".mov", ".m4v", ".mp4", ".m4p", ".qt", ".mkv", ".webm", ".vmdk"]
```

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### removeDefaultUninstallWelcomePage?

> `readonly` `optional` **removeDefaultUninstallWelcomePage**: `boolean`

*assisted installer only.* remove the default uninstall welcome page.

###### Default

```
false
```

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

##### script?

> `readonly` `optional` **script**: `null` | `string`

The path to NSIS script to customize installer. Defaults to `build/installer.nsi`. See [Custom NSIS script](#custom-nsis-script).

---

##### selectPerMachineByDefault?

> `readonly` `optional` **selectPerMachineByDefault**: `boolean`

Whether to set per-machine or per-user installation as default selection on the install mode installer page.

###### Default

```
false
```

---

##### shortcutName?

> `readonly` `optional` **shortcutName**: `null` | `string`

The name that will be used for all shortcuts. Defaults to the application name.

###### Inherited from

[`CommonWindowsInstallerConfiguration`](/app-builder-lib.interface.commonwindowsinstallerconfiguration).[`shortcutName`](/app-builder-lib.interface.commonwindowsinstallerconfiguration#shortcutName)

---

##### unicode?

> `readonly` `optional` **unicode**: `boolean`

Whether to create [Unicode installer](http://nsis.sourceforge.net/Docs/Chapter1.html#intro-unicode).

###### Default

```
true
```

###### Inherited from

[`CommonNsisOptions`](/app-builder-lib.interface.commonnsisoptions).[`unicode`](/app-builder-lib.interface.commonnsisoptions#unicode)

---

##### uninstallDisplayName?

> `readonly` `optional` **uninstallDisplayName**: `null` | `string`

The uninstaller display name in the control panel.

###### Default

```
${productName} ${version}
```

---

##### uninstallerIcon?

> `readonly` `optional` **uninstallerIcon**: `null` | `string`

The path to uninstaller icon, relative to the [build resources](/contents#extraresources) or to the project directory.
Defaults to `build/uninstallerIcon.ico` or application icon.

---

> `readonly` `optional` **uninstallerSidebar**: `null` | `string`

*assisted installer only.* `MUI_UNWELCOMEFINISHPAGE_BITMAP`, relative to the [build resources](/contents#extraresources) or to the project directory.
Defaults to `installerSidebar` option or `build/uninstallerSidebar.bmp` or `build/installerSidebar.bmp` or `${NSISDIR}\\Contrib\\Graphics\\Wizard\\nsis3-metro.bmp`

---

##### uninstallUrlHelp?

> `readonly` `optional` **uninstallUrlHelp**: `null` | `string`

The URL to the uninstaller help page in the control panel. Defaults to [homepage](/configuration#homepage) from application package.json.

---

##### uninstallUrlInfoAbout?

> `readonly` `optional` **uninstallUrlInfoAbout**: `null` | `string`

The URL to the uninstaller info about page in the control panel. Defaults to [homepage](/configuration#homepage) from application package.json.

---

##### uninstallUrlReadme?

> `readonly` `optional` **uninstallUrlReadme**: `null` | `string`

The URL to the uninstaller readme page in the control panel. Defaults to [homepage](/configuration#homepage) from application package.json.

---

##### uninstallUrlUpdateInfo?

> `readonly` `optional` **uninstallUrlUpdateInfo**: `null` | `string`

The URL to the uninstaller update info page in the control panel. Defaults to [homepage](/configuration#homepage) from application package.json.

---

##### warningsAsErrors?

> `readonly` `optional` **warningsAsErrors**: `boolean`

If `warningsAsErrors` is `true` (default): NSIS will treat warnings as errors. If `warningsAsErrors` is `false`: NSIS will allow warnings.

###### Default

```
true
```

###### Inherited from

[`CommonNsisOptions`](/app-builder-lib.interface.commonnsisoptions).[`warningsAsErrors`](/app-builder-lib.interface.commonnsisoptions#warningsAsErrors)