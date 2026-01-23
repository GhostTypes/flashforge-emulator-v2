# electron-store API Reference

## Overview

electron-store provides simple data persistence for Electron apps. Data is saved in a JSON file (config.json by default) in `app.getPath('userData')`.

**Key Requirements:**
- Requires Electron 30 or later
- Native ESM only (no CommonJS export)
- Works in both main and renderer process

## Installation

```bash
npm install electron-store
```

## Basic Usage

```js
import Store from 'electron-store';

const store = new Store();

store.set('unicorn', '🦄');
console.log(store.get('unicorn')); // '🦄'

// Dot-notation for nested properties
store.set('foo.bar', true);
console.log(store.get('foo')); // {bar: true}

store.delete('unicorn');
console.log(store.get('unicorn')); // undefined
```

## Constructor Options

### Store(options?)

Returns a new instance.

### options.defaults
Type: `object`

Default values for store items. **Note:** Values in `defaults` will overwrite the `default` key in the `schema` option.

### options.schema
Type: `object`

JSON Schema to validate config data. Uses `ajv` validator with JSON Schema draft-2020-12.

```js
const schema = {
    foo: {
        type: 'number',
        maximum: 100,
        minimum: 1,
        default: 50
    },
    bar: {
        type: 'string',
        format: 'url'
    }
};

const store = new Store({schema});
```

### options.migrations
Type: `object`

**Important:** Known bugs exist, author doesn't provide support. PRs welcome.

Migrations run when version is upgraded. Format: `'version': handler`

```js
const store = new Store({
    migrations: {
        '0.0.1': store => {
            store.set('debugPhase', true);
        },
        '1.0.0': store => {
            store.delete('debugPhase');
            store.set('phase', '1.0.0');
        },
        '>=2.0.0': store => {
            store.set('phase', '>=2.0.0');
        }
    }
});
```

### options.beforeEachMigration
Type: `Function` | Default: `undefined`

Callback before each migration. Receives `(store, context)` where context has:
- `fromVersion` - migrating from version
- `toVersion` - migrating to version
- `finalVersion` - final version after all migrations
- `versions` - all versions with migration steps

### options.name
Type: `string` | Default: `'config'`

Storage file name without extension. Use this for multiple storage files or reusable modules.

### options.cwd
Type: `string` | Default: `app.getPath('userData')`

Storage file location. **Don't specify unless absolutely necessary!** Relative paths are relative to default cwd.

### options.encryptionKey
Type: `string | Buffer | TypedArray | DataView` | Default: `undefined`

**NOT for security purposes** (key is visible in plain-text app). Main use is obscurity to deter users from editing config. Uses `aes-256-cbc` encryption.

### options.fileExtension
Type: `string` | Default: `'json'`

Config file extension. Useful for custom file extensions associated with your app.

### options.clearInvalidConfig
Type: `boolean` | Default: `false`

Clear config if reading causes `SyntaxError`. Good for unimportant data; if users edit config directly, set to `false` to throw errors instead.

### options.serialize
Type: `Function` | Default: `value => JSON.stringify(value, null, '\t')`

Serialize config to UTF-8 string when writing. Use for formats other than JSON.

### options.deserialize
Type: `Function` | Default: `JSON.parse`

Deserialize config from UTF-8 string when reading.

### options.accessPropertiesByDotNotation
Type: `boolean` | Default: `true`

Enable dot-notation for nested properties. Set to `false` to treat entire string as single key.

### options.watch
Type: `boolean` | Default: `false`

Watch config file for changes and call `onDidChange`/`onDidAnyChange` callbacks. Useful when multiple processes change the same config.

## Instance Methods

The instance is iterable (can use in `for…of` loop). Use dot-notation in `key` for nested properties.

### .set(key, value)
Set an item. Value must be JSON serializable. `undefined`, `function`, `symbol` will throw TypeError.

### .set(object)
Set multiple items at once.

### .get(key, defaultValue?)
Get an item or `defaultValue` if not exists.

### .reset(...keys)
Reset items to default values from `defaults` or `schema` option. Use `.clear()` to reset all.

### .has(key)
Check if an item exists.

### .delete(key)
Delete an item.

### .clear()
Delete all items. Resets to default values if defined by `defaults` or `schema`.

### .onDidChange(key, callback)
Watch given key, call callback on changes.
- `callback`: `(newValue, oldValue) => {}`
- Returns unsubscribe function

```js
const unsubscribe = store.onDidChange(key, callback);
unsubscribe();
```

### .onDidAnyChange(callback)
Watch whole config object.
- `callback`: `(newValue, oldValue) => {}`
- Compare `oldValue` to `newValue` to find changes
- Returns unsubscribe function

### .size
Get item count.

### .store
Get all data as object or replace current data:
```js
store.store = {hello: 'world'};
```

### .path
Get path to storage file.

### .openInEditor()
Open storage file in user's editor. Returns promise.

## Static Methods

### Store.initRenderer()
Initialize IPC communication channels for renderer process when Store instance is NOT created in main process.

**Main process:**
```js
import Store from 'electron-store';
Store.initRenderer();
```

**Renderer process:**
```js
import Store from 'electron-store';
const store = new Store();
store.set('unicorn', '🦄');
```

## FAQ

### YAML Serialization
```js
import Store from 'electron-store';
import yaml from 'js-yaml';

const store = new Store({
    fileExtension: 'yaml',
    serialize: yaml.safeDump,
    deserialize: yaml.safeLoad
});
```

### Accessing store from renderer (initialized in main)
Store is not a singleton. Use invoke/handle API:

**Main:**
```js
ipcMain.handle('getStoreValue', (event, key) => {
    return store.get(key);
});
```

**Renderer:**
```js
const foo = await ipcRenderer.invoke('getStoreValue', 'foo');
```

### Large Data
Not a database. JSON file read/written on every change. Use for smaller data like settings, cache, state. For large blobs, save to disk and store the path instead.

## Atomic Writes

Changes are written atomically. Process crashes during write won't corrupt existing config.
