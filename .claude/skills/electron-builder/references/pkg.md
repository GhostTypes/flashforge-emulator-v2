# https://www.electron.build/pkg

# PKG

The top-level [pkg](/configuration#pkg) key contains set of options instructing electron-builder on how it should build [PKG](https://goo.gl/yVvgF6) (macOS installer component package).

## Configuration

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / PkgOptions

macOS product archive options.

#### Extends

* [`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions)

#### Properties

##### allowAnywhere?

> `readonly` `optional` **allowAnywhere**: `null` | `boolean`

Whether can be installed at the root of any volume, including non-system volumes. Otherwise, it cannot be installed at the root of a volume.

Corresponds to [enable\_anywhere](https://developer.apple.com/library/content/documentation/DeveloperTools/Reference/DistributionDefinitionRef/Chapters/Distribution_XML_Ref.html#//apple_ref/doc/uid/TP40005370-CH100-SW70).

###### Default

```
true
```

---

##### allowCurrentUserHome?

> `readonly` `optional` **allowCurrentUserHome**: `null` | `boolean`

Whether can be installed into the current user’s home directory.
A home directory installation is done as the current user (not as root), and it cannot write outside of the home directory.
If the product cannot be installed in the user’s home directory and be not completely functional from user’s home directory.

Corresponds to [enable\_currentUserHome](https://developer.apple.com/library/content/documentation/DeveloperTools/Reference/DistributionDefinitionRef/Chapters/Distribution_XML_Ref.html#//apple_ref/doc/uid/TP40005370-CH100-SW70).

###### Default

```
true
```

---

##### allowRootDirectory?

> `readonly` `optional` **allowRootDirectory**: `null` | `boolean`

Whether can be installed into the root directory. Should usually be `true` unless the product can be installed only to the user’s home directory.

Corresponds to [enable\_localSystem](https://developer.apple.com/library/content/documentation/DeveloperTools/Reference/DistributionDefinitionRef/Chapters/Distribution_XML_Ref.html#//apple_ref/doc/uid/TP40005370-CH100-SW70).

###### Default

```
true
```

---

##### artifactName?

> `readonly` `optional` **artifactName**: `null` | `string`

The [artifact file name template](/configuration#artifact-file-name-template).

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`artifactName`](/app-builder-lib.interface.targetspecificoptions#artifactName)

---

##### background?

> `readonly` `optional` **background**: `null` | [`PkgBackgroundOptions`](/app-builder-lib.interface.pkgbackgroundoptions)

Options for the background image for the installer.

---

##### conclusion?

> `readonly` `optional` **conclusion**: `null` | `string`

The path to the conclusion file. This may be used to customize the text on the final “Summary” page of the installer.

---

##### extraPkgsDir?

> `readonly` `optional` **extraPkgsDir**: `null` | `string`

The extra component packages directory (relative to build resources directory) for MacOS product archive
Autoscans directory for any `.pkg` files and adds to `productbuild` command as `--package-path` and `--package` accordingly

---

##### hasStrictIdentifier?

> `readonly` `optional` **hasStrictIdentifier**: `null` | `boolean`

Require identical bundle identifiers at install path?

###### Default

```
true
```

---

##### identity?

> `readonly` `optional` **identity**: `null` | `string`

The name of certificate to use when signing. Consider using environment variables [CSC\_LINK or CSC\_NAME](/code-signing) instead of specifying this option.

---

##### installLocation?

> `readonly` `optional` **installLocation**: `null` | `string`

The install location. [Do not use it](https://stackoverflow.com/questions/12863944/how-do-you-specify-a-default-install-location-to-home-with-pkgbuild) to create per-user package.
Mostly never you will need to change this option. `/Applications` would install it as expected into `/Applications` if the local system domain is chosen, or into `$HOME/Applications` if the home installation is chosen.

###### Default

```
/Applications
```

---

##### isRelocatable?

> `readonly` `optional` **isRelocatable**: `null` | `boolean`

Install bundle over previous version if moved by user?

###### Default

```
true
```

---

##### isVersionChecked?

> `readonly` `optional` **isVersionChecked**: `null` | `boolean`

Don’t install bundle if newer version on disk?

###### Default

```
true
```

---

##### license?

> `readonly` `optional` **license**: `null` | `string`

The path to EULA license file. Defaults to `license.txt` or `eula.txt` (or uppercase variants). In addition to `txt`, `rtf` and `html` supported (don’t forget to use `target="_blank"` for links).

---

##### mustClose?

> `readonly` `optional` **mustClose**: `null` | `string`[]

Identifies applications that must be closed before the package is installed.

Corresponds to [must-close](https://developer.apple.com/library/archive/documentation/DeveloperTools/Reference/DistributionDefinitionRef/Chapters/Distribution_XML_Ref.html#//apple_ref/doc/uid/TP40005370-CH100-SW77).

---

##### overwriteAction?

> `readonly` `optional` **overwriteAction**: `null` | `"upgrade"` | `"update"`

Specifies how an existing version of the bundle on disk should be handled when the version in
the package is installed.

If you specify upgrade, the bundle in the package atomi-cally replaces any version on disk;
this has the effect of deleting old paths that no longer exist in the new version of
the bundle.

If you specify update, the bundle in the package overwrites the version on disk, and any files
not contained in the package will be left intact; this is appropriate when you are delivering
an update-only package.

Another effect of update is that the package bundle will not be installed at all if there is
not already a version on disk; this allows a package to deliver an update for an app that
the user might have deleted.

###### Default

```
upgrade
```

---

##### publish?

> `optional` **publish**: `Publish`

###### Inherited from

[`TargetSpecificOptions`](/app-builder-lib.interface.targetspecificoptions).[`publish`](/app-builder-lib.interface.targetspecificoptions#publish)

---

##### scripts?

> `readonly` `optional` **scripts**: `null` | `string`

The scripts directory, relative to `build` (build resources directory).
The scripts can be in any language so long as the files are marked executable and have the appropriate shebang indicating the path to the interpreter.
Scripts are required to be executable (`chmod +x file`).

###### Default

```
build/pkg-scripts
```

###### See

[Scripting in installer packages](http://macinstallers.blogspot.de/2012/07/scripting-in-installer-packages.html).

---

##### welcome?

> `readonly` `optional` **welcome**: `null` | `string`

The path to the welcome file. This may be used to customize the text on the Introduction page of the installer.