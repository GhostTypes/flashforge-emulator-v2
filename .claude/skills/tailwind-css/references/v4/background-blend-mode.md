---
title: background-blend-mode
description: Utilities for controlling how an element's background image should blend with its background color.
---

## Examples

### Basic example

Use utilities like `bg-blend-difference` and `bg-blend-saturation` to control how the background image and color of an element are blended:

```html
<!-- [!code classes:bg-blend-multiply,bg-blend-soft-light,bg-blend-overlay] -->
<div class="bg-blue-500 bg-[url(/img/mountains.jpg)] bg-blend-multiply ..."></div>
<div class="bg-blue-500 bg-[url(/img/mountains.jpg)] bg-blend-soft-light ..."></div>
<div class="bg-blue-500 bg-[url(/img/mountains.jpg)] bg-blend-overlay ..."></div>
```

### Responsive design