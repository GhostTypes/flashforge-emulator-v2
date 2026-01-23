---
title: mask-mode
description: Utilities for controlling an element's mask mode.
---

## Examples

### Basic example

Use the `mask-alpha`, `mask-luminance` and `mask-match` utilities to control the mode of an element's mask:

```html
<!-- [!code classes:mask-alpha,mask-luminance] -->
<div class="mask-alpha mask-r-from-black mask-r-from-50% mask-r-to-transparent bg-[url(/img/mountains.jpg)] ..."></div>
<div class="mask-luminance mask-r-from-white mask-r-from-50% mask-r-to-black bg-[url(/img/mountains.jpg)] ..."></div>
```

When using `mask-luminance` the luminance value of the mask determines visibility, so sticking with grayscale colors will produce the most predictable results. With `mask-alpha`, the opacity of the mask determines the visibility of the masked element.

### Responsive design