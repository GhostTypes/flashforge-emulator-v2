# https://www.electron.build/appx

# AppX

The top-level [appx](/configuration#appx) key contains set of options instructing electron-builder on how it should build AppX (Windows Store).

All options are optional. All required for AppX configuration is inferred and computed automatically.

## AppX Package Code Signing

* If the AppX package is meant for enterprise or self-made distribution (manually install the app without using the Store for testing or for enterprise distribution), it must be [signed](/code-signing).
* If the AppX package is meant for Windows Store distribution, no need to sign the package with any certificate. The Windows Store will take care of signing it with a Microsoft certificate during the submission process.

## AppX Assets

AppX assets need to be placed in the `appx` folder in the [build](/configuration#MetadataDirectories-buildResources) directory.

The assets should follow these naming conventions:

* Logo: `StoreLogo.png`
* Square150x150Logo: `Square150x150Logo.png`
* Square44x44Logo: `Square44x44Logo.png`
* Wide310x150Logo: `Wide310x150Logo.png`
* *Optional* BadgeLogo: `BadgeLogo.png`
* *Optional* Square310x310Logo: `LargeTile.png`
* *Optional* Square71x71Logo: `SmallTile.png`
* *Optional* SplashScreen: `SplashScreen.png`

All official AppX asset types are supported by the build process. These assets can include scaled assets by using `target size` and `scale` in the name.
See [Guidelines for tile and icon assets](https://docs.microsoft.com/en-us/windows/uwp/controls-and-patterns/tiles-and-notifications-app-assets) for more information.

Default assets will be used for `Logo`, `Square150x150Logo`, `Square44x44Logo` and `Wide310x150Logo` if not provided. For assets marked `Optional`, these assets will not be listed in the manifest file if not provided.

## How to publish your Electron App to the Windows App Store

1. You’ll need a microsoft developer account (pay some small fee). Use your favourite search engine to find the registration form.
2. Register you app for the desktop bridge [here](https://developer.microsoft.com/en-us/windows/projects/campaigns/desktop-bridge).
3. Wait for MS to answer and further guide you.
4. In the meantime, build and test your appx. It’s dead simple.

`json
"win": {
"target": "appx",
},`
5. The rest should be pretty straight forward — upload the appx to the store and wait for approval.

## Building AppX on macOS

The only solution for now — using [Parallels Desktop for Mac](http://www.parallels.com/products/desktop/) ([Pro Edition](https://forum.parallels.com/threads/prlctl-is-now-a-pro-or-business-version-tool-only.330290/) is required). Create Windows 10 virtual machine and start it. It will be detected and used automatically to build AppX on your macOS machine. Nothing is required to setup on Windows. It allows you to not copy project to Windows and to not setup build environment on Windows.

## Common Questions

#### How do install AppX without trusted certificate?

If you use self-signed certificate, you need to add it to “Trusted People”. See [Install the certificate](https://stackoverflow.com/a/24372483/1910191).

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / AppXOptions

#### Extends

* [`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Properties

##### addAutoLaunchExtension?

> `readonly` `optional` **addAutoLaunchExtension**: `boolean`

Whether to add auto launch extension. Defaults to `true` if [electron-winstore-auto-launch](https://github.com/felixrieseberg/electron-winstore-auto-launch) in the dependencies.

---

##### applicationId?

> `readonly` `optional` **applicationId**: `string`

The application id. Defaults to `identityName`. This string contains alpha-numeric fields separated by periods. Each field must begin with an ASCII alphabetic character.

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template).

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### backgroundColor?

> `readonly` `optional` **backgroundColor**: `null` | `string`

The background color of the app tile. See [Visual Elements](https://msdn.microsoft.com/en-us/library/windows/apps/br211471.aspx).

###### Default

```
###464646
```

---

##### customExtensionsPath?

> `readonly` `optional` **customExtensionsPath**: `string`

Relative path to custom extensions xml to be included in an `appmanifest.xml`.

---

##### customManifestPath?

> `readonly` `optional` **customManifestPath**: `string`

(Advanced Option) Relative path to custom `appmanifest.xml` (file name doesn’t matter, it’ll be renamed) located in build resources directory.
Supports the following template macros:

* ${publisher}
* ${publisherDisplayName}
* ${version}
* ${applicationId}
* ${identityName}
* ${executable}
* ${displayName}
* ${description}
* ${backgroundColor}
* ${logo}
* ${square150x150Logo}
* ${square44x44Logo}
* ${lockScreen}
* ${defaultTile}
* ${splashScreen}
* ${arch}
* ${resourceLanguages}
* ${extensions}
* ${minVersion}
* ${maxVersionTested}

---

##### displayName?

> `readonly` `optional` **displayName**: `null` | `string`

A friendly name that can be displayed to users. Corresponds to [Properties.DisplayName](https://msdn.microsoft.com/en-us/library/windows/apps/br211432.aspx).
Defaults to the application product name.

---

##### identityName?

> `readonly` `optional` **identityName**: `null` | `string`

The name. Corresponds to [Identity.Name](https://msdn.microsoft.com/en-us/library/windows/apps/br211441.aspx). Defaults to the [application name](/configuration#metadata).

---

##### languages?

> `readonly` `optional` **languages**: `null` | `string` | `string`[]

The list of [supported languages](https://docs.microsoft.com/en-us/windows/uwp/globalizing/manage-language-and-region#specify-the-supported-languages-in-the-apps-manifest) that will be listed in the Windows Store.
The first entry (index 0) will be the default language.
Defaults to en-US if omitted.

---

##### maxVersionTested?

> `readonly` `optional` **maxVersionTested**: `null` | `string`

Set the `MaxVersionTested` field in the appx manifest.xml

###### Default

```
arch === Arch.arm64 ? "10.0.16299.0" : "10.0.14316.0"
```

---

##### minVersion?

> `readonly` `optional` **minVersion**: `null` | `string`

Set the MinVersion field in the appx manifest.xml

###### Default

```
arch === Arch.arm64 ? "10.0.16299.0" : "10.0.14316.0"
```

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### publisher?

> `readonly` `optional` **publisher**: `null` | `string`

The Windows Store publisher. Not used if AppX is build for testing. See [AppX Package Code Signing](#appx-package-code-signing) below.

---

##### publisherDisplayName?

> `readonly` `optional` **publisherDisplayName**: `null` | `string`

A friendly name for the publisher that can be displayed to users. Corresponds to [Properties.PublisherDisplayName](https://msdn.microsoft.com/en-us/library/windows/apps/br211460.aspx).
Defaults to company name from the application metadata.

---

##### setBuildNumber?

> `readonly` `optional` **setBuildNumber**: `boolean`

Whether to set build number. See https://github.com/electron-userland/electron-builder/issues/3875

###### Default

```
false
```

---

##### showNameOnTiles?

> `readonly` `optional` **showNameOnTiles**: `boolean`

Whether to overlay the app’s name on top of tile images on the Start screen. Defaults to `false`. (https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-uap-shownameontiles) in the dependencies.

###### Default

```
false
```