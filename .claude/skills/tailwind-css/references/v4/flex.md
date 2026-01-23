---
title: flex
description: Utilities for controlling how flex items both grow and shrink.
---

", "flex: ;"],
  ["flex-", "flex: calc( * 100%);"],
  ["flex-auto", "flex: auto;"],
  ["flex-initial", "flex: 0 auto;"],
  ["flex-none", "flex: none;"],
  ["flex-()", "flex: var();"],
  ["flex-[]", "flex: ;"],
  ]}
/>

## Examples

### Basic example

Use `flex-<number>` utilities like `flex-1` to allow a flex item to grow and shrink as needed, ignoring its initial size:

```html
<!-- [!code word:flex-1] -->
<div class="flex">
  <div class="w-14 flex-none ...">01</div>
  <div class="w-64 flex-1 ...">02</div>
  <div class="w-32 flex-1 ...">03</div>
</div>
```

### Initial

Use `flex-initial` to allow a flex item to shrink but not grow, taking into account its initial size:

```html
<!-- [!code word:flex-initial] -->
<div class="flex">
  <div class="w-14 flex-none ...">01</div>
  <div class="w-64 flex-initial ...">02</div>
  <div class="w-32 flex-initial ...">03</div>
</div>
```

### Auto

Use `flex-auto` to allow a flex item to grow and shrink, taking into account its initial size:

```html
<!-- [!code word:flex-auto] -->
<div class="flex ...">
  <div class="w-14 flex-none ...">01</div>
  <div class="w-64 flex-auto ...">02</div>
  <div class="w-32 flex-auto ...">03</div>
</div>
```

### None

Use `flex-none` to prevent a flex item from growing or shrinking:

```html
<!-- [!code word:flex-none] -->
<div class="flex ...">
  <div class="w-14 flex-none ...">01</div>
  <div class="w-32 flex-none ...">02</div>
  <div class="flex-1 ...">03</div>
</div>
```

### Using a custom value

### Responsive design