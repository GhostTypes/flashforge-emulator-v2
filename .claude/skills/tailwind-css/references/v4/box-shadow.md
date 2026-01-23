---
title: box-shadow
description: Utilities for controlling the box shadow of an element.
---

import  from "@/components/content.tsx";

)", "box-shadow: var();"],
  ["shadow-(color:)", "--tw-shadow-color: var();"],
  ["shadow-[]", "box-shadow: ;"],
  // Shadow colors
  ["shadow-inherit", "--tw-shadow-color: inherit;"],
  ["shadow-current", "--tw-shadow-color: currentColor;"],
  ["shadow-transparent", "--tw-shadow-color: transparent;"],
  ...Object.entries(colors).map(([name, value]) => [
  `shadow-${name}`,
  `--tw-shadow-color: var(--color-${name}); /* ${value} */`,
  ]),
  // Inset shadows
  ["inset-shadow-2xs", "box-shadow: var(--inset-shadow-2xs); /* inset 0 1px rgb(0 0 0 / 0.05) */"],
  ["inset-shadow-xs", "box-shadow: var(--inset-shadow-xs); /* inset 0 1px 1px rgb(0 0 0 / 0.05) */"],
  ["inset-shadow-sm", "box-shadow: var(--inset-shadow-sm); /* inset 0 2px 4px rgb(0 0 0 / 0.05) */"],
  ["inset-shadow-none", "box-shadow: inset 0 0 #0000;"],
  ["inset-shadow-()", "box-shadow: var();"],
  ["inset-shadow-[]", "box-shadow: ;"],
  // Inset shadow colors
  ["inset-shadow-inherit", "--tw-inset-shadow-color: inherit;"],
  ["inset-shadow-current", "--tw-inset-shadow-color: currentColor;"],
  ["inset-shadow-transparent", "--tw-inset-shadow-color: transparent;"],
  ...Object.entries(colors).map(([name, value]) => [
  `inset-shadow-${name}`,
  `--tw-inset-shadow-color: var(--color-${name}); /* ${value} */`,
  ]),
  // Rings
  ["ring", "--tw-ring-shadow: 0 0 0 1px;"],
  ["ring-", "--tw-ring-shadow: 0 0 0 px;"],
  ["ring-()", "--tw-ring-shadow: 0 0 0 var();"],
  ["ring-[]", "--tw-ring-shadow: 0 0 0 ;"],
  // Ring colors
  ["ring-inherit", "--tw-ring-color: inherit;"],
  ["ring-current", "--tw-ring-color: currentColor;"],
  ["ring-transparent", "--tw-ring-color: transparent;"],
  ...Object.entries(colors).map(([name, value]) => [
  `ring-${name}`,
  `--tw-ring-color: var(--color-${name}); /* ${value} */`,
  ]),
  // Inset rings
  ["inset-ring", "--tw-inset-ring-shadow: inset 0 0 0 1px"],
  ["inset-ring-", "--tw-inset-ring-shadow: inset 0 0 0 px"],
  ["inset-ring-()", "--tw-inset-ring-shadow: inset 0 0 0 var();"],
  ["inset-ring-[]", "--tw-inset-ring-shadow: inset 0 0 0 ;"],
  // Inset ring colors
  ["inset-ring-inherit", "--tw-inset-ring-color: inherit;"],
  ["inset-ring-current", "--tw-inset-ring-color: currentColor;"],
  ["inset-ring-transparent", "--tw-inset-ring-color: transparent;"],
  ...Object.entries(colors).map(([name, value]) => [
  `inset-ring-${name}`,
  `--tw-inset-ring-color: var(--color-${name}); /* ${value} */`,
  ]),
  ]}
/>

## Examples

### Basic example

Use utilities like `shadow-sm` and `shadow-lg` to apply different sized outer box shadows to an element:

```html
<!-- [!code classes:shadow-md,shadow-lg,shadow-xl] -->
<div class="shadow-md ..."></div>
<div class="shadow-lg ..."></div>
<div class="shadow-xl ..."></div>
```

### Changing the opacity

Use the opacity modifier to adjust the opacity of the box shadow:

```html
<!-- [!code classes:shadow-xl,shadow-xl/20,shadow-xl/30] -->
<div class="shadow-xl ..."></div>
<div class="shadow-xl/20 ..."></div>
<div class="shadow-xl/30 ..."></div>
```

The default box shadow opacities are quite low (25% or less), so increasing the opacity (to like 50%) will make the box shadows more pronounced.

### Setting the shadow color

Use utilities like `shadow-indigo-500` and `shadow-cyan-500/50` to change the color of a box shadow:

```html
<!-- [!code classes:shadow-cyan-500/50,shadow-blue-500/50,shadow-indigo-500/50] -->
<button class="bg-cyan-500 shadow-lg shadow-cyan-500/50 ...">Subscribe</button>
<button class="bg-blue-500 shadow-lg shadow-blue-500/50 ...">Subscribe</button>
<button class="bg-indigo-500 shadow-lg shadow-indigo-500/50 ...">Subscribe</button>
```

By default colored shadows have an opacity of 100% but you can adjust this using the opacity modifier.

### Adding an inset shadow

Use utilities like `inset-shadow-xs` and `inset-shadow-sm` to apply an inset box shadow to an element:

```html
<!-- [!code classes:inset-shadow-2xs,inset-shadow-xs,inset-shadow-sm] -->
<div class="inset-shadow-2xs ..."></div>
<div class="inset-shadow-xs ..."></div>
<div class="inset-shadow-sm ..."></div>
```

You can adjust the opacity of an inset shadow using the opacity modifier, like `inset-shadow-sm/50`. The default inset shadow opacities are quite low (5%), so increasing the opacity (to like 50%) will make the inset shadows more pronounced.

### Setting the inset shadow color

Use utilities like `inset-shadow-indigo-500` and `inset-shadow-cyan-500/50` to change the color of an inset box shadow:

```html
<!-- [!code classes:inset-shadow-indigo-500,inset-shadow-indigo-500/75] -->
<div class="inset-shadow-sm inset-shadow-indigo-500 ..."></div>
<div class="inset-shadow-sm inset-shadow-indigo-500/50 ..."></div>
```

By default colored shadows have an opacity of 100% but you can adjust this using the opacity modifier.

### Adding a ring

Use `ring` or `ring-<number>` utilities like `ring-2` and `ring-4` to apply a solid box-shadow to an element:

```html
<!-- [!code classes:ring,ring-2,ring-4] -->
<button class="ring ...">Subscribe</button>
<button class="ring-2 ...">Subscribe</button>
<button class="ring-4 ...">Subscribe</button>
```

By default rings match the `currentColor` of the element they are applied to.

### Setting the ring color

Use utilities like `ring-indigo-500` and `ring-cyan-500/50` to change the color of a ring:

```html
<!-- [!code classes:ring-blue-500,ring-blue-500/50] -->
<button class="ring-2 ring-blue-500 ...">Subscribe</button>
<button class="ring-2 ring-blue-500/50 ...">Subscribe</button>
```

By default rings have an opacity of 100% but you can adjust this using the opacity modifier.

### Adding an inset ring

Use `inset-ring` or `inset-ring-<number>` utilities like `inset-ring-2` and `inset-ring-4` to apply a solid inset box-shadow to an element:

```html
<!-- [!code classes:inset-ring,inset-ring-2,inset-ring-4] -->
<button class="inset-ring ...">Subscribe</button>
<button class="inset-ring-2 ...">Subscribe</button>
<button class="inset-ring-4 ...">Subscribe</button>
```

By default inset rings match the `currentColor` of the element they are applied to.

### Setting the inset ring color

Use utilities like `inset-ring-indigo-500` and `inset-ring-cyan-500/50` to change the color of an inset ring:

```html
<!-- [!code classes:inset-ring-blue-500,inset-ring-blue-500/50] -->
<button class="inset-ring-2 inset-ring-blue-500 ...">Subscribe</button>
<button class="inset-ring-2 inset-ring-blue-500/50 ...">Subscribe</button>
```

By default inset rings have an opacity of 100% but you can adjust this using the opacity modifier.

### Removing a box shadow

Use the `shadow-none`, `inset-shadow-none`,`ring-0`, and `inset-ring-0` utilities to remove an existing box shadow from an element:

```html
<!-- [!code classes:shadow-none] -->
<div class="shadow-none ..."></div>
```

### Using a custom value

### Responsive design

## Customizing your theme

### Customizing shadows

### Customizing inset shadows

### Customizing shadow colors