---
title: outline-color
description: Utilities for controlling the color of an element's outline.
---

[
  `outline-${name}`,
  `outline-color: var(--color-${name}); /* ${value} */`,
  ]),
  ["outline-()", "outline-color: var();"],
  ["outline-[]", "outline-color: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `outline-rose-500` and `outline-lime-100` to control the color of an element's outline:

```html
<!-- [!code classes:outline-blue-500,outline-cyan-500,outline-pink-500] -->
<button class="outline-2 outline-offset-2 outline-blue-500 ...">Button A</button>
<button class="outline-2 outline-offset-2 outline-cyan-500 ...">Button B</button>
<button class="outline-2 outline-offset-2 outline-pink-500 ...">Button C</button>
```

### Changing the opacity

Use the color opacity modifier to control the opacity of an element's outline color:

```html
<!-- [!code word:/100] -->
<!-- [!code word:/75] -->
<!-- [!code word:/50] -->
<button class="outline-2 outline-blue-500/100 ...">Button A</button>
<button class="outline-2 outline-blue-500/75 ...">Button B</button>
<button class="outline-2 outline-blue-500/50 ...">Button C</button>
```

### Using a custom value

### Responsive design

## Customizing your theme