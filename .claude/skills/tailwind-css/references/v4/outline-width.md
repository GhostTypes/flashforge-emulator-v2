---
title: outline-width
description: Utilities for controlling the width of an element's outline.
---

", "outline-width: px;"],
  ["outline-(length:)", "outline-width: var();"],
  ["outline-[]", "outline-width: ;"],
  ]}
/>

## Examples

### Basic example

Use `outline` or `outline-<number>` utilities like `outline-2` and `outline-4` to set the width of an element's outline:

```html
<!-- [!code classes:outline,outline-2,outline-4] -->
<button class="outline outline-offset-2 ...">Button A</button>
<button class="outline-2 outline-offset-2 ...">Button B</button>
<button class="outline-4 outline-offset-2 ...">Button C</button>
```

### Applying on focus

```html
<!-- [!code classes:focus:outline-2] -->
<button class="outline-offset-2 outline-sky-500 focus:outline-2 ...">Save Changes</button>
```

### Using a custom value

### Responsive design