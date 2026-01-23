---
title: backdrop-filter
description: Utilities for applying backdrop filters to an element.
---

)", "backdrop-filter: var();"],
  ["backdrop-filter-[]", "backdrop-filter: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `backdrop-blur-xs` and `backdrop-grayscale` to apply filters to an element's backdrop:

```html
<!-- [!code classes:backdrop-blur-xs,backdrop-grayscale] -->
<div class="bg-[url(/img/mountains.jpg)] ...">
  <div class="backdrop-blur-xs ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)] ...">
  <div class="backdrop-grayscale ..."></div>
</div>
<div class="bg-[url(/img/mountains.jpg)] ...">
  <div class="backdrop-blur-xs backdrop-grayscale ..."></div>
</div>
```

You can combine the following backdrop filter utilities: [blur](/docs/backdrop-filter-blur), [brightness](/docs/backdrop-filter-brightness), [contrast](/docs/backdrop-filter-contrast), [grayscale](/docs/backdrop-filter-grayscale), [hue-rotate](/docs/backdrop-filter-hue-rotate), [invert](/docs/backdrop-filter-invert), [opacity](/docs/backdrop-filter-opacity), [saturate](/docs/backdrop-filter-saturate), and [sepia](/docs/backdrop-filter-sepia).

### Removing filters

Use the `backdrop-filter-none` utility to remove all of the backdrop filters applied to an element:

```html
<!-- [!code classes:md:backdrop-filter-none] -->
<div class="backdrop-blur-md backdrop-brightness-150 md:backdrop-filter-none"></div>
```

### Using a custom value

### Applying on hover

### Responsive design