---
title: text-shadow
description: Utilities for controlling the shadow of a text element.
---

import  from "@/components/content.tsx";

)", "text-shadow: var();"],
  ["text-shadow-(color:)", "--tw-shadow-color var();"],
  ["text-shadow-[]", "text-shadow: ;"],
  ["text-shadow-inherit", "--tw-shadow-color inherit;"],
  ["text-shadow-current", "--tw-shadow-color currentColor;"],
  ["text-shadow-transparent", "--tw-shadow-color transparent;"],
  ...Object.entries(colors).map(([name, value]) => [
  `text-shadow-${name}`,
  `--tw-text-shadow-color var(--color-${name}); /* ${value} */`,
  ]),
  ]}
/>

## Examples

### Basic example

Use utilities like `text-shadow-sm` and `shadow-lg` to apply different sized text shadows to a text element:

```html
<!-- [!code classes:text-shadow-2xs,text-shadow-xs,text-shadow-sm,text-shadow-md,text-shadow-lg,text-shadow-xl] -->
<p class="text-shadow-2xs ...">The quick brown fox...</p>
<p class="text-shadow-xs ...">The quick brown fox...</p>
<p class="text-shadow-sm ...">The quick brown fox...</p>
<p class="text-shadow-md ...">The quick brown fox...</p>
<p class="text-shadow-lg ...">The quick brown fox...</p>
```

### Changing the opacity

Use the opacity modifier to adjust the opacity of the text shadow:

```html
<!-- [!code classes:text-shadow-lg/20,text-shadow-lg/30] -->
<p class="text-shadow-lg ...">The quick brown fox...</p>
<p class="text-shadow-lg/20 ...">The quick brown fox...</p>
<p class="text-shadow-lg/30 ...">The quick brown fox...</p>
```

The default text shadow opacities are quite low (20% or less), so increasing the opacity (to like 50%) will make the text shadows more pronounced.

### Setting the shadow color

Use utilities like `text-shadow-indigo-500` and `text-shadow-cyan-500/50` to change the color of a text shadow:

```html
<!-- [!code classes:text-shadow-sky-300] -->
<button class="text-sky-950 text-shadow-2xs text-shadow-sky-300 ...">Book a demo</button>
<button class="text-gray-950 dark:text-white dark:text-shadow-2xs ...">See pricing</button>
```

By default colored shadows have an opacity of 100% but you can adjust this using the opacity modifier.

### Removing a text shadow

Use the `text-shadow-none` utility to remove an existing text shadow from an element:

```html
<!-- [!code classes:dark:text-shadow-none] -->
<p class="text-shadow-lg dark:text-shadow-none">
  <!-- ... -->
</p>
```

### Using a custom value

### Responsive design

## Customizing your theme

### Customizing text shadows

### Customizing shadow colors