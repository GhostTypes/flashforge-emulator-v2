---
title: background-clip
description: Utilities for controlling the bounding box of an element's background.
---

## Examples

### Basic example

Use the `bg-clip-border`, `bg-clip-padding`, and `bg-clip-content` utilities to control the bounding box of an element's background:

```html
<!-- [!code classes:bg-clip-border,bg-clip-padding,bg-clip-content] -->
<div class="border-4 bg-indigo-500 bg-clip-border p-3"></div>
<div class="border-4 bg-indigo-500 bg-clip-padding p-3"></div>
<div class="border-4 bg-indigo-500 bg-clip-content p-3"></div>
```

### Cropping to text

Use the `bg-clip-text` utility to crop an element's background to match the shape of the text:

```html
<!-- [!code classes:bg-clip-text] -->
<p class="bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-5xl font-extrabold text-transparent ...">
  Hello world
</p>
```

### Responsive design