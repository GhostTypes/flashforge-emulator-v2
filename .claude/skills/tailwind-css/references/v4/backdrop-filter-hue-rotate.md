---
title: backdrop-filter: hue-rotate()
description: Utilities for applying backdrop hue-rotate filters to an element.
---

", "backdrop-filter: hue-rotate(deg);"],
  ["-backdrop-hue-rotate-", "backdrop-filter: hue-rotate(calc(deg * -1));"],
  ["backdrop-hue-rotate-()", "backdrop-filter: hue-rotate(var());"],
  ["backdrop-hue-rotate-[]", "backdrop-filter: hue-rotate();"],
  ]}
/>

## Examples

### Basic example

Use utilities like `backdrop-hue-rotate-90` and `backdrop-hue-rotate-180` to rotate the hue of an element's backdrop:

```html
<!-- [!code classes:backdrop-hue-rotate-90,backdrop-hue-rotate-180,backdrop-hue-rotate-270] -->
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-hue-rotate-90 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-hue-rotate-180 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-hue-rotate-270 ..."></div>
</div>
```

### Using negative values

Use utilities like `-backdrop-hue-rotate-90` and `-backdrop-hue-rotate-180` to set a negative backdrop hue rotation value:

```html
<!-- [!code classes:-backdrop-hue-rotate-15,-backdrop-hue-rotate-45,-backdrop-hue-rotate-90] -->
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 -backdrop-hue-rotate-15 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 -backdrop-hue-rotate-45 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 -backdrop-hue-rotate-90 ..."></div>
</div>
```

### Using a custom value

### Responsive design