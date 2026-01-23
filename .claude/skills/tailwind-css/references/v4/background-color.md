---
title: background-color
description: Utilities for controlling an element's background color.
---

import  from "@/components/content.tsx";

 [
  `bg-${name}`,
  `background-color: var(--color-${name}); /* ${value} */`,
  ]),
  ["bg-()", "background-color: var();"],
  ["bg-[]", "background-color: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `bg-white`, `bg-indigo-500` and `bg-transparent` to control the background color of an element:

```html
<!-- [!code classes:bg-blue-500,bg-cyan-500,bg-pink-500] -->
<button class="bg-blue-500 ...">Button A</button>
<button class="bg-cyan-500 ...">Button B</button>
<button class="bg-pink-500 ...">Button C</button>
```

### Changing the opacity

Use the color opacity modifier to control the opacity of an element's background color:

```html
<!-- [!code word:/100] -->
<!-- [!code word:/75] -->
<!-- [!code word:/50] -->
<button class="bg-sky-500/100 ..."></button>
<button class="bg-sky-500/75 ..."></button>
<button class="bg-sky-500/50 ..."></button>
```

### Using a custom value

### Applying on hover

```html
<!-- [!code classes:hover:bg-fuchsia-500] -->
<button class="bg-indigo-500 hover:bg-fuchsia-500 ...">Save changes</button>
```

### Responsive design

## Customizing your theme