---
title: accent-color
description: Utilities for controlling the accented color of a form control.
---

import  from "@/components/content.tsx";

 [
  `accent-${name}`,
  `accent-color: var(--color-${name}); /* ${value} */`,
  ]),
  ["accent-", "accent-color: var();"],
  ["accent-[]", "accent-color: ;"],
  ]}
/>

## Examples

### Setting the accent color

Use utilities like `accent-rose-500` and `accent-lime-600` to change the accent color of an element:

```html
<!-- [!code classes:accent-pink-500] -->
<label>
  <input type="checkbox" checked />
  Browser default
</label>
<label>
  <input class="accent-pink-500" type="checkbox" checked />
  Customized
</label>
```

This is helpful for styling elements like checkboxes and radio groups by overriding the browser's default color.

### Changing the opacity

Use the color opacity modifier to control the opacity of an element's accent color:

```html
<!-- [!code word:/25] -->
<!-- [!code word:/75] -->
<input class="accent-purple-500/25" type="checkbox" checked />
<input class="accent-purple-500/75" type="checkbox" checked />
```

Setting the accent color opacity has limited browser-support and only works in Firefox at this time.

### Using a custom value

### Applying on hover

```html
<!-- [!code classes:hover:accent-pink-500] -->
<input class="accent-black hover:accent-pink-500" type="checkbox" />
```

### Responsive design

## Customizing your theme