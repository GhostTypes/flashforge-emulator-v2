---
title: align-self
description: Utilities for controlling how an individual flex or grid item is positioned along its container's cross axis.
---

## Examples

### Auto

Use the `self-auto` utility to align an item based on the value of the container's `align-items` property:

```html
<!-- [!code classes:self-auto] -->
<div class="flex items-stretch ...">
  <div>01</div>
  <div class="self-auto ...">02</div>
  <div>03</div>
</div>
```

### Start

Use the `self-start` utility to align an item to the start of the container's cross axis, despite the container's `align-items` value:

```html
<!-- [!code classes:self-start] -->
<div class="flex items-stretch ...">
  <div>01</div>
  <div class="self-start ...">02</div>
  <div>03</div>
</div>
```

### Center

Use the `self-center` utility to align an item along the center of the container's cross axis, despite the container's `align-items` value:

```html
<!-- [!code classes:self-center] -->
<div class="flex items-stretch ...">
  <div>01</div>
  <div class="self-center ...">02</div>
  <div>03</div>
</div>
```

### End

Use the `self-end` utility to align an item to the end of the container's cross axis, despite the container's `align-items` value:

```html
<!-- [!code classes:self-end] -->
<div class="flex items-stretch ...">
  <div>01</div>
  <div class="self-end ...">02</div>
  <div>03</div>
</div>
```

### Stretch

Use the `self-stretch` utility to stretch an item to fill the container's cross axis, despite the container's `align-items` value:

```html
<!-- [!code classes:self-stretch] -->
<div class="flex items-stretch ...">
  <div>01</div>
  <div class="self-stretch ...">02</div>
  <div>03</div>
</div>
```

### Baseline

Use the `self-baseline` utility to align an item such that its baseline aligns with the baseline of the flex container's cross axis:

```html
<!-- [!code classes:self-baseline] -->
<div class="flex ...">
  <div class="self-baseline pt-2 pb-6">01</div>
  <div class="self-baseline pt-8 pb-12">02</div>
  <div class="self-baseline pt-12 pb-4">03</div>
</div>
```

### Last baseline

Use the `self-baseline-last` utility to align an item along the container's cross axis such that its baseline aligns with the last baseline in the container:

```html
<!-- [!code classes:self-baseline-last] -->
<div class="grid grid-cols-[1fr_auto]">
  <div>
  <img src="img/spencer-sharp.jpg" />
  <h4>Spencer Sharp</h4>
  <p class="self-baseline-last">Working on the future of astronaut recruitment at Space Recruit.</p>
  </div>
  <p class="self-baseline-last">spacerecruit.com</p>
</div>
```

This is useful for ensuring that text items align with each other, even if they have different heights.

### Responsive design