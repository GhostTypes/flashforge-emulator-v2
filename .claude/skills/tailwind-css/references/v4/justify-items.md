---
title: justify-items
description: Utilities for controlling how grid items are aligned along their inline axis.
---

## Examples

### Start

Use the `justify-items-start` utility to justify grid items against the start of their inline axis:

```html
<!-- [!code classes:justify-items-start] -->
<div class="grid justify-items-start ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
  <div>06</div>
</div>
```

### End

Use the `justify-items-end` or `justify-items-end-safe` utilities to justify grid items against the end of their inline axis:

```html
<!-- [!code filename:justify-items-end] -->
<!-- [!code classes:justify-items-end] -->
<div class="grid grid-flow-col justify-items-end ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

```html
<!-- [!code filename:justify-items-end-safe] -->
<!-- [!code classes:justify-items-end-safe] -->
<div class="grid grid-flow-col justify-items-end-safe ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

</ CodeExampleStack>

When there is not enough space available, the `justify-items-end-safe` utility will align items to the start of the container instead of the end.

### Center

Use the `justify-items-center` or `justify-items-center-safe` utilities to justify grid items against the end of their inline axis:

```html
<!-- [!code filename:justify-items-center] -->
<!-- [!code classes:justify-items-center] -->
<div class="grid grid-flow-col justify-items-center ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

```html
<!-- [!code filename:justify-items-center-safe] -->
<!-- [!code classes:justify-items-center-safe] -->
<div class="grid grid-flow-col justify-items-center-safe ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

When there is not enough space available, the `justify-items-center-safe` utility will align items to the start of the container instead of the center.

### Stretch

Use the `justify-items-stretch` utility to stretch items along their inline axis:

```html
<!-- [!code classes:justify-items-stretch] -->
<div class="grid justify-items-stretch ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
  <div>06</div>
</div>
```

### Responsive design