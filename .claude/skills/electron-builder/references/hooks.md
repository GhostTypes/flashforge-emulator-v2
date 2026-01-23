# https://www.electron.build/hooks

# Build Hooks

## Hooks

Node.js 8

All examples assumed that you use latest Node.js 8.11.x or higher.

[Electron-Builder](/packages) / [app-builder-lib](/app-builder-lib/) / Hooks

#### Extended by

* [`Configuration`](/app-builder-lib.interface.configuration)

#### Properties

##### afterAllArtifactBuild?

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

##### afterExtract?

> `readonly` `optional` **afterExtract**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PackContext`](/app-builder-lib.interface.packcontext), `void`>

The function (or path to file or module id) to be [run after the prebuilt Electron binary has been extracted to the output directory](#afterextract)
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

##### afterPack?

> `readonly` `optional` **afterPack**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PackContext`](/app-builder-lib.interface.packcontext), `void`>

The function (or path to file or module id) to be [run after pack](#afterpack) (but before pack into distributable format and sign).
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

##### afterSign?

> `readonly` `optional` **afterSign**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PackContext`](/app-builder-lib.interface.packcontext), `void`>

The function (or path to file or module id) to be [run after pack and sign](#aftersign) (but before pack into distributable format).
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

##### appxManifestCreated?

> `readonly` `optional` **appxManifestCreated**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<`string`, `void`>

The function (or path to file or module id) to be run after Appx manifest created on disk - not packed into .appx package yet.

---

##### artifactBuildCompleted?

> `readonly` `optional` **artifactBuildCompleted**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`ArtifactCreated`](/app-builder-lib.interface.artifactcreated), `void`>

The function (or path to file or module id) to be run on artifact build completed.
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

##### artifactBuildStarted?

> `readonly` `optional` **artifactBuildStarted**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`ArtifactBuildStarted`](/app-builder-lib.interface.artifactbuildstarted), `void`>

The function (or path to file or module id) to be run on artifact build start.
Same setup as [beforePack](/app-builder-lib.interface.hooks#beforePack)

---

##### beforeBuild?

> `readonly` `optional` **beforeBuild**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`BeforeBuildContext`](/app-builder-lib.interface.beforebuildcontext), `boolean` | `void`>

The function (or path to file or module id) to be run before dependencies are installed or rebuilt. Works when `npmRebuild` is set to `true`. Resolving to `false` will skip dependencies install or rebuild.

If provided and `node_modules` are missing, it will not invoke production dependencies check.

---

##### beforePack?

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

##### electronDist?

> `readonly` `optional` **electronDist**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<[`PrepareApplicationStageDirectoryOptions`](/app-builder-lib.interface.prepareapplicationstagedirectoryoptions), `string`>

The function (or path to file or module id) to be run when staging the electron artifact environment.
Returns the path to custom Electron build (e.g. `~/electron/out/R`) or folder of electron zips.

Zip files must follow the pattern `electron-v${version}-${platformName}-${arch}.zip`, otherwise it will be assumed to be an unpacked Electron app directory

---

##### msiProjectCreated?

> `readonly` `optional` **msiProjectCreated**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<`string`, `void`>

The function (or path to file or module id) to be run after MSI project created on disk - not packed into .msi package yet.

---

##### onNodeModuleFile?

> `readonly` `optional` **onNodeModuleFile**: `null` | `string` | [`Hook`](/app-builder-lib.typealias.hook)<`string`, `boolean` | `void`>

The function (or path to file or module id) to be [run on each node module](#onnodemodulefile) file. Returning `true`/`false` will determine whether to force include or to use the default copier logic