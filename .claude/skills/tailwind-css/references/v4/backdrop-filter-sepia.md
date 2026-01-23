---
title: backdrop-filter: sepia()
description: Utilities for applying backdrop sepia filters to an element.
---

", "backdrop-filter: sepia(%);"],
  ["backdrop-sepia-()", "backdrop-filter: sepia(var());"],
  ["backdrop-sepia-[]", "backdrop-filter: sepia();"],
  ]}
/>

## Examples

### Basic example

Use utilities like `backdrop-sepia` and `backdrop-sepia-50` to control the sepia effect applied to an element's backdrop:

```html
<!-- [!code classes:backdrop-sepia-0,backdrop-sepia-50,backdrop-sepia] -->
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-sepia-0 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-sepia-50 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-sepia ..."></div>
</div>
```

### Using a custom value

### Responsive design