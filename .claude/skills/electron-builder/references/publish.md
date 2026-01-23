# https://www.electron.build/publish

The [publish](/configuration#publish) key contains a set of options instructing electron-builder on how it should publish artifacts and build update info files for [auto update](/auto-update).

`String | Object | Array<Object | String>` where `Object` it is [Keygen](#keygen), [Generic Server](#byo-generic-create-your-own), [GitHub](#github), [S3](#s3), [Spaces](#spaces) or [Snap Store](#snap-store) options. Order is important — first item will be used as a default auto-update server. Can be specified in the [top-level configuration](/configuration#configuration) or any platform- ([mac](/mac), [linux](/linux), [win](/win)) or target- (e.g. [nsis](/nsis)) specific configuration.

Note that when using a generic server, you have to upload the built application and metadata files yourself.

Travis and AppVeyor support publishing artifacts. But it requires additional configuration for each CI and you need to configure what to publish.
`electron-builder` makes publishing dead simple.

If `GH_TOKEN` or `GITHUB_TOKEN` is defined — defaults to `[{provider: "github"}]`.

If `KEYGEN_TOKEN` is defined and `GH_TOKEN` or `GITHUB_TOKEN` is not — defaults to `[{provider: "keygen"}]`.

If `GITHUB_RELEASE_TOKEN` is defined, it will be used instead of (`GH_TOKEN` or `GITHUB_TOKEN`) to publish your release.
- e.g. mac: `export GITHUB_RELEASE_TOKEN=<my token>`
- the `GITHUB_TOKEN` will still be used when your app checks for updates, etc.
- you could make your `GITHUB_TOKEN` “Read-only” when creating a fine-grained personal access token, and “Read and write” for the `GITHUB_RELEASE_TOKEN`.
- “Contents” fine-grained permission was sufficient. (at time of writing - Apr 2024)

Deprecation Notice: Implicit Publishing

electron-builder currently auto-detects when to publish based on CI environment conditions:

* Running via `npm run release` → publishes always
* Git tag detected in CI → publishes on tag
* CI environment detected → publishes to draft releases

**This implicit publishing behavior is deprecated and will be disabled in electron-builder v27.**

To prepare for this change, please explicitly specify your publish intent using the `--publish` CLI flag (e.g., `--publish always`, `--publish onTag`) or set the `publish` configuration in your `package.json` or `electron-builder.yml`.

Snap store

`snap` target by default publishes to snap store (the app store for Linux). To force publishing to another providers, explicitly specify publish configuration for `snap`.

You can publish to multiple providers. For example, to publish Windows artifacts to both GitHub and Bitbucket (order is important — first item will be used as a default auto-update server, so, in this example app will use github as auto-update provider):

```
{
  "build": {
    "win": {
      "publish": ["github", "bitbucket"]
    }
  }
}
```

```
win:
  publish:
      # an object provider for github with additional options
    - provider: github
      protocol: https
      # a string provider for bitbucket that will use default options
    - bitbucket
```

You can also configure publishing using CLI arguments, for example, to force publishing snap not to Snap Store, but to GitHub: `-c.snap.publish=github`

[Custom](https://github.com/electron-userland/electron-builder/issues/3261) publish provider can be used if need.

Macros

In all publish options [File Macros](/file-patterns#file-macros) are supported.

## How to Publish

Excerpt from [CLI Usage](/cli) of `electron-builder` command:

```
Publishing:
  --publish, -p  [choices: "onTag", "onTagOrDraft", "always", "never"]
```

CLI `--publish` option values:

| Value | Description |
| --- | --- |
| `onTag` | on tag push only |
| `onTagOrDraft` | on tag push or if draft release exists |
| `always` | always publish |
| `never` | never publish |

But please consider using automatic rules instead of explicitly specifying `publish`:

* If CI server detected, — `onTagOrDraft`.
* If CI server reports that tag was pushed, — `onTag`.

Release will be drafted (if doesn’t already exist) and artifacts published only if tag was pushed.

* If [npm script](https://docs.npmjs.com/misc/scripts) named `release`, — `always`.

Add to `scripts` in the development `package.json`:

```
"release": "electron-builder"
```

and if you run `yarn release`, a release will be drafted (if doesn’t already exist) and artifacts published.

### Recommended GitHub Releases Workflow

1. [Draft a new release](https://help.github.com/articles/creating-releases/). Set the “Tag version” to the value of `version` in your application `package.json`, and prefix it with `v`. “Release title” can be anything you want.

   For example, if your application `package.json` version is `1.0`, your draft’s “Tag version” would be `v1.0`.
2. Push some commits. Every CI build will update the artifacts attached to this draft.
3. Once you are done, publish the release. GitHub will tag the latest commit for you.

The benefit of this workflow is that it allows you to always have the latest artifacts, and the release can be published once it is ready.

### Continuous Deployment Workflow on Amazon S3 and other non-GitHub

This example workflow is modelled on how releases are handled in maven (it is an example of one of many possible workflows, you are not forced to follow it).

1. Setup your CI to publish on each commit. E.g. `"dist": "electron-builder --publish always"` in your `package.json`.
2. Set your version in your application `package.json` to `1.9.0-snapshot` (or `1.9.0-master` or whatever you want your development channel to be named). This will publish a file named `snapshot.yml` and a build named `something-snapshot.exe` (and corresponding for mac) to S3.
3. When you are ready to deploy, simply change you package version to `1.9.0` and push. This will then produce a `latest.yml` and `something.exe` on s3. Usually you’ll git-tag this version as well (just to keep track of it).
4. Change the version back to a snapshot version right after, i.e. `1.10.0-snapshot`, and commit it.

## GitHub Repository

Detected automatically using:

* [repository](https://docs.npmjs.com/files/package.json#repository) in the application or development `package.json`,
* if not set, env
  + `TRAVIS_REPO_SLUG`
  + or `APPVEYOR_REPO_NAME`
  + or `CIRCLE_PROJECT_USERNAME`/`CIRCLE_PROJECT_REPONAME`,
* if no env, from `.git/config` origin url.

# Publishers

## Bitbucket

[Electron-Builder](/packages) / [builder-util-runtime](/builder-util-runtime/) / BitbucketOptions

Bitbucket options.
https://bitbucket.org/
Define `BITBUCKET_TOKEN` environment variable.

For converting an app password to a usable token, you can utilize this

```
convertAppPassword(owner: string, appPassword: string) {
 const base64encodedData = Buffer.from(`${owner}:${appPassword.trim()}`).toString("base64")
 return `Basic ${base64encodedData}`
}
```

#### Extends

* [`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration)

#### Properties

##### channel?

> `readonly` `optional` **channel**: `null` | `string`

The channel.

###### Default

```
latest
```

---

##### owner

> `readonly` **owner**: `string`

Repository owner

---

##### provider

> `readonly` **provider**: `"bitbucket"`

The provider. Must be `bitbucket`.

###### Overrides

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`provider`](/builder-util-runtime.interface.publishconfiguration#provider)

---

##### publishAutoUpdate?

> `readonly` `optional` **publishAutoUpdate**: `boolean`

Whether to publish auto update info files.

Auto update relies only on the first provider in the list (you can specify several publishers).
Thus, probably, there`s no need to upload the metadata files for the other configured providers. But by default will be uploaded.

###### Default

```
true
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`publishAutoUpdate`](/builder-util-runtime.interface.publishconfiguration#publishAutoUpdate)

---

> `readonly` `optional` **requestHeaders**: `OutgoingHttpHeaders`

Any custom request headers

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`requestHeaders`](/builder-util-runtime.interface.publishconfiguration#requestHeaders)

---

##### slug

> `readonly` **slug**: `string`

Repository slug/name

---

##### timeout?

> `readonly` `optional` **timeout**: `null` | `number`

Request timeout in milliseconds. (Default is 2 minutes; O is ignored)

###### Default

```
120000
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`timeout`](/builder-util-runtime.interface.publishconfiguration#timeout)

---

##### token?

> `readonly` `optional` **token**: `null` | `string`

The [app password](https://bitbucket.org/account/settings/app-passwords) to support auto-update from private bitbucket repositories.

---

##### username?

> `readonly` `optional` **username**: `null` | `string`

The user name to support auto-update from private bitbucket repositories.

## Github

[Electron-Builder](/packages) / [builder-util-runtime](/builder-util-runtime/) / GithubOptions

[GitHub](https://help.github.com/articles/about-releases/) options.

GitHub [personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) is required. You can generate by going to <https://github.com/settings/tokens/new>. The access token should have the repo scope/permission.
Define `GH_TOKEN` environment variable.

#### Extends

* [`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration)

#### Properties

##### channel?

> `readonly` `optional` **channel**: `null` | `string`

The channel.

###### Default

```
latest
```

---

##### host?

> `readonly` `optional` **host**: `null` | `string`

The host (including the port if need).

###### Default

```
github.com
```

---

##### owner?

> `readonly` `optional` **owner**: `null` | `string`

The owner.

---

##### private?

> `readonly` `optional` **private**: `null` | `boolean`

Whether to use private github auto-update provider if `GH_TOKEN` environment variable is defined. See [Private GitHub Update Repo](/auto-update#private-github-update-repo).

---

##### protocol?

> `readonly` `optional` **protocol**: `null` | `"https"` | `"http"`

The protocol. GitHub Publisher supports only `https`.

###### Default

```
https
```

---

##### provider

> `readonly` **provider**: `"github"`

The provider. Must be `github`.

###### Overrides

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`provider`](/builder-util-runtime.interface.publishconfiguration#provider)

---

##### publishAutoUpdate?

> `readonly` `optional` **publishAutoUpdate**: `boolean`

Whether to publish auto update info files.

Auto update relies only on the first provider in the list (you can specify several publishers).
Thus, probably, there`s no need to upload the metadata files for the other configured providers. But by default will be uploaded.

###### Default

```
true
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`publishAutoUpdate`](/builder-util-runtime.interface.publishconfiguration#publishAutoUpdate)

---

##### releaseType?

> `optional` **releaseType**: `null` | `"draft"` | `"prerelease"` | `"release"`

The type of release. By default `draft` release will be created.

Also you can set release type using environment variable. If `EP_DRAFT`is set to `true` — `draft`, if `EP_PRE_RELEASE`is set to `true` — `prerelease`.

###### Default

```
draft
```

---

##### repo?

> `readonly` `optional` **repo**: `null` | `string`

The repository name. [Detected automatically](#github-repository-and-bintray-package).

---

> `readonly` `optional` **requestHeaders**: `OutgoingHttpHeaders`

Any custom request headers

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`requestHeaders`](/builder-util-runtime.interface.publishconfiguration#requestHeaders)

---

##### tagNamePrefix?

> `readonly` `optional` **tagNamePrefix**: `string`

If defined, sets the prefix of the tag name that comes before the semver number.
e.g. “v” in “v1.2.3” or “test” of “test1.2.3”.
Overrides `vPrefixedTagName`

---

##### timeout?

> `readonly` `optional` **timeout**: `null` | `number`

Request timeout in milliseconds. (Default is 2 minutes; O is ignored)

###### Default

```
120000
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`timeout`](/builder-util-runtime.interface.publishconfiguration#timeout)

---

##### token?

> `readonly` `optional` **token**: `null` | `string`

The access token to support auto-update from private github repositories. Never specify it in the configuration files. Only for [setFeedURL](/auto-update#appupdatersetfeedurloptions).

---

##### ~~vPrefixedTagName?~~

> `readonly` `optional` **vPrefixedTagName**: `boolean`

Whether to use `v`-prefixed tag name.

###### Default

```
true
```

###### Deprecated

please use #tagNamePrefix instead.

## Keygen

[Electron-Builder](/packages) / [builder-util-runtime](/builder-util-runtime/) / KeygenOptions

Keygen options.
https://keygen.sh/
Define `KEYGEN_TOKEN` environment variable.

#### Extends

* [`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration)

#### Properties

##### account

> `readonly` **account**: `string`

Keygen account’s UUID

---

##### channel?

> `readonly` `optional` **channel**: `null` | `"stable"` | `"rc"` | `"beta"` | `"alpha"` | `"dev"`

The channel.

###### Default

```
stable
```

---

##### host?

> `readonly` `optional` **host**: `string`

Keygen host for self-hosted instances

###### Default

```
"api.keygen.sh"
```

---

##### platform?

> `readonly` `optional` **platform**: `null` | `string`

The target Platform. Is set programmatically explicitly during publishing.

---

##### product

> `readonly` **product**: `string`

Keygen product’s UUID

---

##### provider

> `readonly` **provider**: `"keygen"`

The provider. Must be `keygen`.

###### Overrides

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`provider`](/builder-util-runtime.interface.publishconfiguration#provider)

---

##### publishAutoUpdate?

> `readonly` `optional` **publishAutoUpdate**: `boolean`

Whether to publish auto update info files.

Auto update relies only on the first provider in the list (you can specify several publishers).
Thus, probably, there`s no need to upload the metadata files for the other configured providers. But by default will be uploaded.

###### Default

```
true
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`publishAutoUpdate`](/builder-util-runtime.interface.publishconfiguration#publishAutoUpdate)

---

> `readonly` `optional` **requestHeaders**: `OutgoingHttpHeaders`

Any custom request headers

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`requestHeaders`](/builder-util-runtime.interface.publishconfiguration#requestHeaders)

---

##### timeout?

> `readonly` `optional` **timeout**: `null` | `number`

Request timeout in milliseconds. (Default is 2 minutes; O is ignored)

###### Default

```
120000
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`timeout`](/builder-util-runtime.interface.publishconfiguration#timeout)

## S3

[Electron-Builder](/packages) / [builder-util-runtime](/builder-util-runtime/) / S3Options

[Amazon S3](https://aws.amazon.com/s3/) options.
AWS credentials are required, please see [getting your credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html).
To set credentials define `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` [environment variables](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html) directly,
or use [~/.aws/credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html) file,
or use [~/.aws/config](https://docs.aws.amazon.com/sdkref/latest/guide/file-format.html) file. For the last method to work you will also need to define `AWS_SDK_LOAD_CONFIG=1` environment variable.

Example configuration:

```
{
 "build":
   "publish": {
     "provider": "s3",
     "bucket": "bucket-name"
   }
 }
}
```

#### Extends

* [`BaseS3Options`](/builder-util-runtime.interface.bases3options)

#### Properties

##### accelerate?

> `readonly` `optional` **accelerate**: `boolean`

If set to true, this will enable the s3 accelerated endpoint
These endpoints have a particular format of:
${bucketname}.s3-accelerate.amazonaws.com

---

##### acl?

> `readonly` `optional` **acl**: `null` | `"private"` | `"public-read"`

The ACL. Set to `null` to not [add](https://github.com/electron-userland/electron-builder/issues/1822).

Please see [required permissions for the S3 provider](https://github.com/electron-userland/electron-builder/issues/1618#issuecomment-314679128).

###### Default

```
public-read
```

###### Overrides

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`acl`](/builder-util-runtime.interface.bases3options#acl)

---

##### bucket

> `readonly` **bucket**: `string`

The bucket name.

---

##### channel?

> `optional` **channel**: `null` | `string`

The update channel.

###### Default

```
latest
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`channel`](/builder-util-runtime.interface.bases3options#channel)

---

##### encryption?

> `readonly` `optional` **encryption**: `null` | `"AES256"` | `"aws:kms"`

Server-side encryption algorithm to use for the object.

---

##### endpoint?

> `readonly` `optional` **endpoint**: `null` | `string`

The endpoint URI to send requests to. The default endpoint is built from the configured region.
The endpoint should be a string like `https://{service}.{region}.amazonaws.com`.

---

##### forcePathStyle?

> `readonly` `optional` **forcePathStyle**: `boolean`

When true, force a path-style endpoint to be used where the bucket name is part of the path.
[Path-style Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#path-style-access)

---

##### path?

> `readonly` `optional` **path**: `null` | `string`

The directory path.

###### Default

```
/
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`path`](/builder-util-runtime.interface.bases3options#path)

---

##### provider

> `readonly` **provider**: `"s3"`

The provider. Must be `s3`.

###### Overrides

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`provider`](/builder-util-runtime.interface.bases3options#provider)

---

##### publishAutoUpdate?

> `readonly` `optional` **publishAutoUpdate**: `boolean`

Whether to publish auto update info files.

Auto update relies only on the first provider in the list (you can specify several publishers).
Thus, probably, there`s no need to upload the metadata files for the other configured providers. But by default will be uploaded.

###### Default

```
true
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`publishAutoUpdate`](/builder-util-runtime.interface.bases3options#publishAutoUpdate)

---

##### region?

> `optional` **region**: `null` | `string`

The region. Is determined and set automatically when publishing.

---

> `readonly` `optional` **requestHeaders**: `OutgoingHttpHeaders`

Any custom request headers

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`requestHeaders`](/builder-util-runtime.interface.bases3options#requestHeaders)

---

##### storageClass?

> `readonly` `optional` **storageClass**: `null` | `"STANDARD"` | `"REDUCED_REDUNDANCY"` | `"STANDARD_IA"`

The type of storage to use for the object.

###### Default

```
STANDARD
```

---

##### timeout?

> `readonly` `optional` **timeout**: `null` | `number`

Request timeout in milliseconds. (Default is 2 minutes; O is ignored)

###### Default

```
120000
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`timeout`](/builder-util-runtime.interface.bases3options#timeout)

## Snap Store

[Electron-Builder](/packages) / [builder-util-runtime](/builder-util-runtime/) / SnapStoreOptions

[Snap Store](https://snapcraft.io/) options. To publish directly to Snapcraft, see [Snapcraft authentication options](https://snapcraft.io/docs/snapcraft-authentication) for local or CI/CD authentication options.

#### Extends

* [`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration)

#### Properties

##### channels?

> `readonly` `optional` **channels**: `null` | `string` | `string`[]

The list of channels the snap would be released.

###### Default

```
["edge"]
```

---

##### provider

> `readonly` **provider**: `"snapStore"`

The provider. Must be `snapStore`.

###### Overrides

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`provider`](/builder-util-runtime.interface.publishconfiguration#provider)

---

##### publishAutoUpdate?

> `readonly` `optional` **publishAutoUpdate**: `boolean`

Whether to publish auto update info files.

Auto update relies only on the first provider in the list (you can specify several publishers).
Thus, probably, there`s no need to upload the metadata files for the other configured providers. But by default will be uploaded.

###### Default

```
true
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`publishAutoUpdate`](/builder-util-runtime.interface.publishconfiguration#publishAutoUpdate)

---

##### repo?

> `readonly` `optional` **repo**: `string`

snapcraft repo name

---

> `readonly` `optional` **requestHeaders**: `OutgoingHttpHeaders`

Any custom request headers

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`requestHeaders`](/builder-util-runtime.interface.publishconfiguration#requestHeaders)

---

##### timeout?

> `readonly` `optional` **timeout**: `null` | `number`

Request timeout in milliseconds. (Default is 2 minutes; O is ignored)

###### Default

```
120000
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`timeout`](/builder-util-runtime.interface.publishconfiguration#timeout)

## Spaces

[Electron-Builder](/packages) / [builder-util-runtime](/builder-util-runtime/) / SpacesOptions

[DigitalOcean Spaces](https://www.digitalocean.com/community/tutorials/an-introduction-to-digitalocean-spaces) options.
Access key is required, define `DO_KEY_ID` and `DO_SECRET_KEY` environment variables.

#### Extends

* [`BaseS3Options`](/builder-util-runtime.interface.bases3options)

#### Properties

##### acl?

> `readonly` `optional` **acl**: `null` | `"private"` | `"public-read"`

The ACL. Set to `null` to not [add](https://github.com/electron-userland/electron-builder/issues/1822).

###### Default

```
public-read
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`acl`](/builder-util-runtime.interface.bases3options#acl)

---

##### channel?

> `optional` **channel**: `null` | `string`

The update channel.

###### Default

```
latest
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`channel`](/builder-util-runtime.interface.bases3options#channel)

---

##### name

> `readonly` **name**: `string`

The space name.

---

##### path?

> `readonly` `optional` **path**: `null` | `string`

The directory path.

###### Default

```
/
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`path`](/builder-util-runtime.interface.bases3options#path)

---

##### provider

> `readonly` **provider**: `"spaces"`

The provider. Must be `spaces`.

###### Overrides

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`provider`](/builder-util-runtime.interface.bases3options#provider)

---

##### publishAutoUpdate?

> `readonly` `optional` **publishAutoUpdate**: `boolean`

Whether to publish auto update info files.

Auto update relies only on the first provider in the list (you can specify several publishers).
Thus, probably, there`s no need to upload the metadata files for the other configured providers. But by default will be uploaded.

###### Default

```
true
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`publishAutoUpdate`](/builder-util-runtime.interface.bases3options#publishAutoUpdate)

---

##### region

> `readonly` **region**: `string`

The region (e.g. `nyc3`).

---

> `readonly` `optional` **requestHeaders**: `OutgoingHttpHeaders`

Any custom request headers

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`requestHeaders`](/builder-util-runtime.interface.bases3options#requestHeaders)

---

##### timeout?

> `readonly` `optional` **timeout**: `null` | `number`

Request timeout in milliseconds. (Default is 2 minutes; O is ignored)

###### Default

```
120000
```

###### Inherited from

[`BaseS3Options`](/builder-util-runtime.interface.bases3options).[`timeout`](/builder-util-runtime.interface.bases3options#timeout)

## BYO Generic (create-your-own)

(And maybe submit it upstream in a PR!)
[Electron-Builder](/packages) / [builder-util-runtime](/builder-util-runtime/) / GenericServerOptions

Generic (any HTTP(S) server) options.
In all publish options [File Macros](/file-patterns#file-macros) are supported.

#### Extends

* [`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration)

#### Properties

##### channel?

> `readonly` `optional` **channel**: `null` | `string`

The channel.

###### Default

```
latest
```

---

##### provider

> `readonly` **provider**: `"generic"`

The provider. Must be `generic`.

###### Overrides

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`provider`](/builder-util-runtime.interface.publishconfiguration#provider)

---

##### publishAutoUpdate?

> `readonly` `optional` **publishAutoUpdate**: `boolean`

Whether to publish auto update info files.

Auto update relies only on the first provider in the list (you can specify several publishers).
Thus, probably, there`s no need to upload the metadata files for the other configured providers. But by default will be uploaded.

###### Default

```
true
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`publishAutoUpdate`](/builder-util-runtime.interface.publishconfiguration#publishAutoUpdate)

---

> `readonly` `optional` **requestHeaders**: `OutgoingHttpHeaders`

Any custom request headers

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`requestHeaders`](/builder-util-runtime.interface.publishconfiguration#requestHeaders)

---

##### timeout?

> `readonly` `optional` **timeout**: `null` | `number`

Request timeout in milliseconds. (Default is 2 minutes; O is ignored)

###### Default

```
120000
```

###### Inherited from

[`PublishConfiguration`](/builder-util-runtime.interface.publishconfiguration).[`timeout`](/builder-util-runtime.interface.publishconfiguration#timeout)

---

##### url

> `readonly` **url**: `string`

The base url. e.g. `https://bucket_name.s3.amazonaws.com`.

---

##### useMultipleRangeRequest?

> `readonly` `optional` **useMultipleRangeRequest**: `boolean`

Whether to use multiple range requests for differential update. Defaults to `true` if `url` doesn’t contain `s3.amazonaws.com`.