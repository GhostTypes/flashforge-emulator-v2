---
title: backdrop-filter: saturate()
description: Utilities for applying backdrop saturation filters to an element.
---

", "backdrop-filter: saturate(%);"],
  ["backdrop-saturate-()", "backdrop-filter: saturate(var());"],
  ["backdrop-saturate-[]", "backdrop-filter: saturate();"],
  ]}
/>

## Examples

### Basic example

Use utilities like `backdrop-saturate-50` and `backdrop-saturate-100` utilities to control the saturation of an element's backdrop:

```html
<!-- [!code classes:backdrop-saturate-50,backdrop-saturate-125,backdrop-saturate-200] -->
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-saturate-50 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-saturate-125 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-saturate-200 ..."></div>
</div>
```

### Using a custom value

### Responsive design