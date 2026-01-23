---
title: flex-grow
description: Utilities for controlling how flex items grow.
---

", "flex-grow: ;"],
  ["grow-[]", "flex-grow: ;"],
  ["grow-()", "flex-grow: var();"],
  ]}
/>

## Examples

### Allowing items to grow

Use `grow` to allow a flex item to grow to fill any available space:

```html
<!-- [!code classes:grow] -->
<div class="flex ...">
  <div class="size-14 flex-none ...">01</div>
  <div class="size-14 grow ...">02</div>
  <div class="size-14 flex-none ...">03</div>
</div>
```

### Growing items based on factor

Use `grow-<number>` utilities like `grow-3` to make flex items grow proportionally based on their growth factor, allowing them to fill the available space relative to each other:

```html
<!-- [!code classes:grow-3,grow-7] -->
<div class="flex ...">
  <div class="size-14 grow-3 ...">01</div>
  <div class="size-14 grow-7 ...">02</div>
  <div class="size-14 grow-3 ...">03</div>
</div>
```

### Preventing items from growing

Use `grow-0` to prevent a flex item from growing:

```html
<!-- [!code classes:grow-0] -->
<div class="flex ...">
  <div class="size-14 grow ...">01</div>
  <div class="size-14 grow-0 ...">02</div>
  <div class="size-14 grow ...">03</div>
</div>
```

### Using a custom value

### Responsive design