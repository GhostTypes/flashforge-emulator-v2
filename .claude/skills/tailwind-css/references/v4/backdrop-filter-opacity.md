---
title: backdrop-filter: opacity()
description: Utilities for applying backdrop opacity filters to an element.
---

", "backdrop-filter: opacity(%);"],
  ["backdrop-opacity-()", "backdrop-filter: opacity(var());"],
  ["backdrop-opacity-[]", "backdrop-filter: opacity();"],
  ]}
/>

## Examples

### Basic example

Use utilities like `backdrop-opacity-50` and `backdrop-opacity-75` to control the opacity of all the backdrop filters applied to an element:

```html
<!-- [!code classes:backdrop-opacity-10,backdrop-opacity-60,backdrop-opacity-95] -->
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-invert backdrop-opacity-10 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-invert backdrop-opacity-60 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-invert backdrop-opacity-95 ..."></div>
</div>
```

### Using a custom value

### Responsive design