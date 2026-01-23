---
title: flex-shrink
description: Utilities for controlling how flex items shrink.
---

", "flex-shrink: ;"],
  ["shrink-[]", "flex-shrink: ;"],
  ["shrink-()", "flex-shrink: var();"],
  ]}
/>

## Examples

### Allowing flex items to shrink

Use `shrink` to allow a flex item to shrink if needed:

```html
<!-- [!code classes:shrink] -->
<div class="flex ...">
  <div class="h-14 w-14 flex-none ...">01</div>
  <div class="h-14 w-64 shrink ...">02</div>
  <div class="h-14 w-14 flex-none ...">03</div>
</div>
```

### Preventing items from shrinking

Use `shrink-0` to prevent a flex item from shrinking:

```html
<!-- [!code classes:shrink-0] -->
<div class="flex ...">
  <div class="h-16 flex-1 ...">01</div>
  <div class="h-16 w-32 shrink-0 ...">02</div>
  <div class="h-16 flex-1 ...">03</div>
</div>
```

### Using a custom value

### Responsive design