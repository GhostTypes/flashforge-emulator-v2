---
title: backdrop-filter: grayscale()
description: Utilities for applying backdrop grayscale filters to an element.
---

", "backdrop-filter: grayscale(%);"],
  ["backdrop-grayscale-()", "backdrop-filter: grayscale(var());"],
  ["backdrop-grayscale-[]", "backdrop-filter: grayscale();"],
  ]}
/>

## Examples

### Basic example

Use utilities like `backdrop-grayscale-50` and `backdrop-grayscale` to control the grayscale effect applied to an element's backdrop:

```html
<!-- [!code classes:backdrop-grayscale-0,backdrop-grayscale-50,backdrop-grayscale] -->
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-grayscale-0 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-grayscale-50 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-grayscale-200 ..."></div>
</div>
```

### Using a custom value

### Responsive design