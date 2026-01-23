---
title: user-select
description: Utilities for controlling whether the user can select text in an element.
---

## Examples

### Disabling text selection

Use the `select-none` utility to prevent selecting text in an element and its children:

```html
<!-- [!code classes:select-none] -->
<div class="select-none ...">The quick brown fox jumps over the lazy dog.</div>
```

### Allowing text selection

Use the `select-text` utility to allow selecting text in an element and its children:

```html
<!-- [!code classes:select-text] -->
<div class="select-text ...">The quick brown fox jumps over the lazy dog.</div>
```

### Selecting all text in one click

Use the `select-all` utility to automatically select all the text in an element when a user clicks:

```html
<!-- [!code classes:select-all] -->
<div class="select-all ...">The quick brown fox jumps over the lazy dog.</div>
```

### Using auto select behavior

Use the `select-auto` utility to use the default browser behavior for selecting text:

```html
<!-- [!code classes:select-auto] -->
<div class="select-auto ...">The quick brown fox jumps over the lazy dog.</div>
```

### Responsive design