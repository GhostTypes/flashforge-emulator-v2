---
title: mix-blend-mode
description: Utilities for controlling how an element should blend with the background.
---

## Examples

### Basic example

Use utilities like `mix-blend-overlay` and `mix-blend-soft-light` to control how an element's content and background is blended with other content in the same stacking context:

```html
<!-- [!code classes:mix-blend-multiply] -->
<div class="flex justify-center -space-x-14">
  <div class="bg-blue-500 mix-blend-multiply ..."></div>
  <div class="bg-pink-500 mix-blend-multiply ..."></div>
</div>
```

### Isolating blending

Use the `isolate` utility on the parent element to create a new stacking context and prevent blending with content behind it:

```html
<!-- [!code classes:mix-blend-multiply,isolate] -->
<div class="isolate flex justify-center -space-x-14">
  <div class="bg-yellow-500 mix-blend-multiply ..."></div>
  <div class="bg-green-500 mix-blend-multiply ..."></div>
</div>

<div class="flex justify-center -space-x-14">
  <div class="bg-yellow-500 mix-blend-multiply ..."></div>
  <div class="bg-green-500 mix-blend-multiply ..."></div>
</div>
```

### Responsive design