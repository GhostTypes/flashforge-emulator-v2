---
title: outline-offset
description: Utilities for controlling the offset of an element's outline.
---

", "outline-offset: px;"],
  ["-outline-offset-", "outline-offset: calc(px * -1);"],
  ["outline-offset-()", "outline-offset: var();"],
  ["outline-offset-[]", "outline-offset: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `outline-offset-2` and `outline-offset-4` to change the offset of an element's outline:

```html
<!-- [!code classes:outline-offset-0,outline-offset-2,outline-offset-4] -->
<button class="outline-2 outline-offset-0 ...">Button A</button>
<button class="outline-2 outline-offset-2 ...">Button B</button>
<button class="outline-2 outline-offset-4 ...">Button C</button>
```

### Using a custom value

### Responsive design