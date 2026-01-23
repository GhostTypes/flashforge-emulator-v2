---
title: fill
description: Utilities for styling the fill of SVG elements.
---

[`fill-${name}`, `fill: var(--color-${name}); /* ${value} */`]),
  ["fill-()", "fill: var();"],
  ["fill-[]", "fill: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `fill-indigo-500` and `fill-lime-600` to change the fill color of an SVG:

```html
<!-- [!code classes:fill-blue-500] -->
<svg class="fill-blue-500 ...">
  <!-- ... -->
</svg>
```

This can be useful for styling icon sets like [Heroicons](https://heroicons.com).

### Using the current color

Use the `fill-current` utility to set the fill color to the current text color:

```html
<!-- [!code classes:fill-current] -->
<button class="bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white ...">
  <svg class="size-5 fill-current ...">
  <!-- ... -->
  </svg>
  Check for updates
</button>
```

### Using a custom value

### Responsive design

## Customizing your theme