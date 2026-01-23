---
title: text-underline-offset
description: Utilities for controlling the offset of a text underline.
---

", "text-underline-offset: px;"],
  ["-underline-offset-", "text-underline-offset: calc(px * -1);"],
  ["underline-offset-auto", "text-underline-offset: auto;"],
  ["underline-offset-()", "text-underline-offset: var();"],
  ["underline-offset-[]", "text-underline-offset: ;"],
  ]}
/>

## Examples

### Basic example

Use `underline-offset-<number>` utilities like `underline-offset-2` and `underline-offset-4` to change the offset of a text underline:

```html
<!-- [!code classes:underline-offset-1] -->
<p class="underline underline-offset-1">The quick brown fox...</p>
<!-- [!code classes:underline-offset-2] -->
<p class="underline underline-offset-2">The quick brown fox...</p>
<!-- [!code classes:underline-offset-4] -->
<p class="underline underline-offset-4">The quick brown fox...</p>
<!-- [!code classes:underline-offset-8] -->
<p class="underline underline-offset-8">The quick brown fox...</p>
```

### Using a custom value

### Responsive design