---
title: perspective
description: Utilities for controlling an element's perspective when placed in 3D space.
---

)", "perspective: var();"],
  ["perspective-[]", "perspective: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `perspective-normal` and `perspective-distant` to control how close or how far away the z-plane is from the screen:

```html
<!-- [!code classes:perspective-dramatic,perspective-normal] -->
<div class="size-20 perspective-dramatic ...">
  <div class="translate-z-12 rotate-x-0 bg-sky-300/75 ...">1</div>
  <div class="-translate-z-12 rotate-y-18 bg-sky-300/75 ...">2</div>
  <div class="translate-x-12 rotate-y-90 bg-sky-300/75 ...">3</div>
  <div class="-translate-x-12 -rotate-y-90 bg-sky-300/75 ...">4</div>
  <div class="-translate-y-12 rotate-x-90 bg-sky-300/75 ...">5</div>
  <div class="translate-y-12 -rotate-x-90 bg-sky-300/75 ...">6</div>
</div>

<div class="size-20 perspective-normal ...">
  <div class="translate-z-12 rotate-x-0 bg-sky-300/75 ...">1</div>
  <div class="-translate-z-12 rotate-y-18 bg-sky-300/75 ...">2</div>
  <div class="translate-x-12 rotate-y-90 bg-sky-300/75 ...">3</div>
  <div class="-translate-x-12 -rotate-y-90 bg-sky-300/75 ...">4</div>
  <div class="-translate-y-12 rotate-x-90 bg-sky-300/75 ...">5</div>
  <div class="translate-y-12 -rotate-x-90 bg-sky-300/75 ...">6</div>
</div>
```

This is like moving a camera closer to or further away from an object.

### Removing a perspective

Use the `perspective-none` utility to remove a perspective transform from an element:

```html
<!-- [!code classes:perspective-none] -->
<div class="perspective-none ...">
  <!-- ... -->
</div>
```

### Using a custom value

### Responsive design

## Customizing your theme