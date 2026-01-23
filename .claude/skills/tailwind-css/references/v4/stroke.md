---
title: stroke
description: Utilities for styling the stroke of SVG elements.
---

[
  `stroke-${name}`,
  `stroke: var(--color-${name}); /* ${value} */`,
  ]),
  ["stroke-()", "stroke: var();"],
  ["stroke-[]", "stroke: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `stroke-indigo-500` and `stroke-lime-600` to change the stroke color of an SVG:

```html
<!-- [!code classes:stroke-cyan-500] -->
<svg class="stroke-cyan-500 ...">
  <!-- ... -->
</svg>
```

This can be useful for styling icon sets like [Heroicons](https://heroicons.com).

### Using the current color

Use the `stroke-current` utility to set the stroke color to the current text color:

  stroke="currentColor">

  Download file

  }

```html
<!-- [!code classes:stroke-current] -->
<button class="bg-white text-pink-600 hover:bg-pink-600 hover:text-white ...">
  <svg class="size-5 stroke-current ..." fill="none">
  <!-- ... -->
  </svg>
  Download file
</button>
```

### Using a custom value

### Responsive design

## Customizing your theme