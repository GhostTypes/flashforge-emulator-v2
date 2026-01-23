---
title: backdrop-filter: brightness()
description: Utilities for applying backdrop brightness filters to an element.
---

", "backdrop-filter: brightness(%);"],
  ["backdrop-brightness-()", "backdrop-filter: brightness(var());"],
  ["backdrop-brightness-[]", "backdrop-filter: brightness();"],
  ]}
/>

## Examples

### Basic example

Use utilities like `backdrop-brightness-50` and `backdrop-brightness-100` to control an element's backdrop brightness:

```html
<!-- [!code classes:backdrop-brightness-50,backdrop-brightness-150] -->
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-brightness-50 ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)]">
  <div class="bg-white/30 backdrop-brightness-150 ..."></div>
</div>
```

### Using a custom value

### Responsive design