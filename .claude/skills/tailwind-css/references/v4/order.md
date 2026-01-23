---
title: order
description: Utilities for controlling the order of flex and grid items.
---

", "order: ;"],
  ["-order-", "order: calc( * -1);"],
  ["order-first", "order: -9999;"],
  ["order-last", "order: 9999;"],
  ["order-none", "order: 0;"],
  ["order-()", "order: var();"],
  ["order-[]", "order: ;"],
  ]}
/>

## Examples

### Explicitly setting a sort order

Use `order-<number>` utilities like `order-1` and `order-3` to render flex and grid items in a different order than they appear in the document:

```html
<!-- [!code classes:order-1,order-2,order-3] -->
<div class="flex justify-between ...">
  <div class="order-3 ...">01</div>
  <div class="order-1 ...">02</div>
  <div class="order-2 ...">03</div>
</div>
```

### Ordering items first or last

Use the `order-first` and `order-last` utilities to render flex and grid items first or last:

```html
<!-- [!code classes:order-first,order-last] -->
<div class="flex justify-between ...">
  <div class="order-last ...">01</div>
  <div class="...">02</div>
  <div class="order-first ...">03</div>
</div>
```

### Using negative values

To use a negative order value, prefix the class name with a dash to convert it to a negative value:

```html
<!-- [!code classes:-order-1] -->
<div class="-order-1">
  <!-- ... -->
</div>
```

### Using a custom value

### Responsive design