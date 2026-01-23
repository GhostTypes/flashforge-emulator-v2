---
title: filter: drop-shadow()
description: Utilities for applying drop-shadow filters to an element.
---

import  from "@/components/content.tsx";

)", "filter: drop-shadow(var());"],
  ["drop-shadow-(color:)", "--tw-drop-shadow-color: var();"],
  ["drop-shadow-[]", "filter: drop-shadow();"],
  ["drop-shadow-inherit", "--tw-drop-shadow-color: inherit;"],
  ["drop-shadow-current", "--tw-drop-shadow-color: currentColor;"],
  ["drop-shadow-transparent", "--tw-drop-shadow-color: transparent;"],
  ...Object.entries(colors).map(([name, value]) => [
  `drop-shadow-${name}`,
  `--tw-drop-shadow-color: var(--color-${name}); /* ${value} */`,
  ]),
  ]}
/>

## Examples

### Basic example

Use utilities like `drop-shadow-sm` and `drop-shadow-xl` to add a drop shadow to an element:

```html
<!-- [!code classes:drop-shadow-md,drop-shadow-lg,drop-shadow-xl] -->
<svg class="drop-shadow-md ...">
  <!-- ... -->
</svg>
<svg class="drop-shadow-lg ...">
  <!-- ... -->
</svg>
<svg class="drop-shadow-xl ...">
  <!-- ... -->
</svg>
```

This is useful for applying shadows to irregular shapes, like text and SVG elements. For applying shadows to regular elements, you probably want to use [box shadow](/docs/box-shadow) instead.

### Changing the opacity

Use the opacity modifier to adjust the opacity of the drop shadow:

```html
<!-- [!code classes:drop-shadow-xl,drop-shadow-xl/25,drop-shadow-xl/50] -->
<svg class="fill-white drop-shadow-xl ...">...</svg>
<svg class="fill-white drop-shadow-xl/25 ...">...</svg>
<svg class="fill-white drop-shadow-xl/50 ...">...</svg>
```

The default drop shadow opacities are quite low (15% or less), so increasing the opacity (to like 50%) will make the drop shadows more pronounced.

### Setting the shadow color

Use utilities like `drop-shadow-indigo-500` and `drop-shadow-cyan-500/50` to change the color of a drop shadow:

```html
<!-- [!code classes:drop-shadow-cyan-500/50,drop-shadow-indigo-500/50] -->
<svg class="fill-cyan-500 drop-shadow-lg drop-shadow-cyan-500/50 ...">...</svg>
<svg class="fill-indigo-500 drop-shadow-lg drop-shadow-indigo-500/50 ...">...</svg>
```

By default colored shadows have an opacity of 100% but you can adjust this using the opacity modifier.

### Removing a drop shadow

Use the `drop-shadow-none` utility to remove an existing drop shadow from an element:

```html
<!-- [!code classes:dark:drop-shadow-none] -->
<svg class="drop-shadow-lg dark:drop-shadow-none">
  <!-- ... -->
</svg>
```

### Using a custom value

### Responsive design

## Customizing your theme

### Customizing drop shadows

### Customizing shadow colors