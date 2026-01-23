---
title: backdrop-filter: invert()
description: Utilities for applying backdrop invert filters to an element.
---

", "backdrop-filter: invert(%);"],
  ["backdrop-invert-()", "backdrop-filter: invert(var())"],
  ["backdrop-invert-[]", "backdrop-filter: invert();"],
  ]}
/>

## Examples

### Basic example

Use utilities like `backdrop-invert` and `backdrop-invert-65` to control the color inversion of an element's backdrop:

```html
<!-- [!code classes:backdrop-invert-0,backdrop-invert-65,backdrop-invert] -->
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-invert-0 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-invert-65 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-invert ..."></div>
</div>
```

### Using a custom value

### Responsive design