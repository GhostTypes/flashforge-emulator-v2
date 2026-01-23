---
title: background-origin
description: Utilities for controlling how an element's background is positioned relative to borders, padding, and content.
---

## Examples

### Basic example

Use the `bg-origin-border`, `bg-origin-padding`, and `bg-origin-content` utilities to control where an element's background is rendered:

```html
<!-- [!code classes:bg-origin-border,bg-origin-padding,bg-origin-content] -->
<div class="border-4 bg-[url(/img/mountains.jpg)] bg-origin-border p-3 ..."></div>
<div class="border-4 bg-[url(/img/mountains.jpg)] bg-origin-padding p-3 ..."></div>
<div class="border-4 bg-[url(/img/mountains.jpg)] bg-origin-content p-3 ..."></div>
```

### Responsive design