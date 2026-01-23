---
title: place-content
description: Utilities for controlling how content is justified and aligned at the same time.
---

## Examples

### Center

Use `place-content-center` to pack items in the center of the inline and block axes:

```html
<!-- [!code classes:place-content-center] -->
<div class="grid h-48 grid-cols-2 place-content-center gap-4 ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
</div>
```

### Start

Use `place-content-start` to pack items against the start of the inline and block axes:

```html
<!-- [!code classes:place-content-start] -->
<div class="grid h-48 grid-cols-2 place-content-start gap-4 ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
</div>
```

### End

Use `place-content-end` to pack items against the end of the inline and block axes:

```html
<!-- [!code classes:place-content-end] -->
<div class="grid h-48 grid-cols-2 place-content-end gap-4 ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
</div>
```

### Space between

Use `place-content-between` to distribute grid items along the inline and block axes so that there is an equal amount of space between each row and column on each axis respectively:

```html
<!-- [!code classes:place-content-between] -->
<div class="grid h-48 grid-cols-2 place-content-between gap-4 ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
</div>
```

### Space around

Use `place-content-around` to distribute grid items along the inline and block axes so that there is an equal amount of space around each row and column on each axis respectively:

```html
<!-- [!code classes:place-content-around] -->
<div class="grid h-48 grid-cols-2 place-content-around gap-4 ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
</div>
```

### Space evenly

Use `place-content-evenly` to distribute grid items such that they are evenly spaced on the inline and block axes:

```html
<!-- [!code classes:place-content-evenly] -->
<div class="grid h-48 grid-cols-2 place-content-evenly gap-4 ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
</div>
```

### Stretch

Use `place-content-stretch` to stretch grid items along their grid areas on the inline and block axes:

```html
<!-- [!code classes:place-content-stretch] -->
<div class="grid h-48 grid-cols-2 place-content-stretch gap-4 ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
</div>
```

### Responsive design