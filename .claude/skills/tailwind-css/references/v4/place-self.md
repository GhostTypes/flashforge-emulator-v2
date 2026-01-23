---
title: place-self
description: Utilities for controlling how an individual item is justified and aligned at the same time.
---

## Examples

### Auto

Use `place-self-auto` to align an item based on the value of the container's `place-items` property:

```html
<!-- [!code classes:place-self-auto] -->
<div class="grid grid-cols-3 gap-4 ...">
  <div>01</div>
  <div class="place-self-auto ...">02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
  <div>06</div>
</div>
```

### Start

Use `place-self-start` to align an item to the start on both axes:

```html
<!-- [!code classes:place-self-start] -->
<div class="grid grid-cols-3 gap-4 ...">
  <div>01</div>
  <div class="place-self-start ...">02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
  <div>06</div>
</div>
```

### Center

Use `place-self-center` to align an item at the center on both axes:

```html
<!-- [!code classes:place-self-center] -->
<div class="grid grid-cols-3 gap-4 ...">
  <div>01</div>
  <div class="place-self-center ...">02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
  <div>06</div>
</div>
```

### End

Use `place-self-end` to align an item to the end on both axes:

```html
<!-- [!code classes:place-self-end] -->
<div class="grid grid-cols-3 gap-4 ...">
  <div>01</div>
  <div class="place-self-end ...">02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
  <div>06</div>
</div>
```

### Stretch

Use `place-self-stretch` to stretch an item on both axes:

```html
<!-- [!code classes:place-self-stretch] -->
<div class="grid grid-cols-3 gap-4 ...">
  <div>01</div>
  <div class="place-self-stretch ...">02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
  <div>06</div>
</div>
```

### Responsive design