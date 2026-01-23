---
name: electron-store
description: Data persistence library for Electron apps. Use when implementing user settings, app state, cache, or configuration storage in Electron applications. Handles JSON file persistence, schema validation, migrations, encryption, and main/renderer process communication.
---

# electron-store

Simple data persistence for Electron applications. Data is saved atomically to a JSON file in `app.getPath('userData')`.

## Requirements

- **Electron 30 or later**
- **ESM only** (no CommonJS export)
- Works in both main and renderer process

## Installation

```bash
npm install electron-store
```

## Quick Start

```js
import Store from 'electron-store';

const store = new Store();

// Set values
store.set('unicorn', '🦄');
store.set('foo.bar', true);  // Dot-notation for nested

// Get values
store.get('unicorn');  // '🦄'
store.get('foo');      // {bar: true}
store.get('missing', 'default');  // 'default'

// Delete
store.delete('unicorn');

// Check existence
store.has('unicorn');  // false

// Clear all (resets to defaults if defined)
store.clear();
```

## Common Patterns

### Multiple Storage Files

Use `name` option for separate stores:

```js
const userStore = new Store({name: 'user'});
const cacheStore = new Store({name: 'cache'});
```

### Schema Validation

```js
const store = new Store({
    schema: {
        volume: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            default: 50
        },
        theme: {
            type: 'string',
            enum: ['light', 'dark'],
            default: 'dark'
        }
    }
});
```

### Defaults

```js
const store = new Store({
    defaults: {
        port: 8080,
        host: 'localhost'
    }
});
```

### Watch for Changes

```js
const store = new Store({watch: true});

// Watch specific key
const unsubscribe = store.onDidChange('port', (newValue, oldValue) => {
    console.log(`Port changed from ${oldValue} to ${newValue}`);
});

// Watch all changes
store.onDidAnyChange((newValue, oldValue) => {
    console.log('Config changed:', newValue);
});

unsubscribe();
```

### Renderer Process

**Option 1 - Create instance in main process:**
```js
// Main
import Store from 'electron-store';
const store = new Store();
```

Use `invoke/handle` to access from renderer (see FAQ in references).

**Option 2 - Use initRenderer:**
```js
// Main
import Store from 'electron-store';
Store.initRenderer();

// Renderer
import Store from 'electron-store';
const store = new Store();
```

### Encrypted Store

Obscurity (not security) to deter user editing:

```js
const store = new Store({
    encryptionKey: 'my-secret-key'
});
```

### Custom Serialization (YAML)

```js
import yaml from 'js-yaml';

const store = new Store({
    fileExtension: 'yaml',
    serialize: yaml.safeDump,
    deserialize: yaml.safeLoad
});
```

## Reference Documentation

- **API Reference**: `references/api.md` - Complete API documentation including all options, methods, and FAQ

## Resources

| Resource | Purpose |
|----------|---------|
| `references/api.md` | Complete API documentation with all options, methods, and usage patterns |
