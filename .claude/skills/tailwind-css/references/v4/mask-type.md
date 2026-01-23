---
title: mask-type
description: Utilities for controlling how an SVG mask is interpreted.
---

## Examples

### Basic example

Use the `mask-type-alpha` and `mask-type-luminance` utilities to control the type of an SVG mask:

```html
<!-- [!code classes:mask-type-alpha,mask-type-luminance] -->
<svg>
  <mask id="blob1" class="mask-type-alpha fill-gray-700/70">
  <path d="..."></path>
  </mask>
  <image href="/img/mountains.jpg" height="100%" width="100%" mask="url(#blob1)" />
</svg>

<svg>
  <mask id="blob2" class="mask-type-luminance fill-gray-700/70">
  <path d="..."></path>
  </mask>
  <image href="/img/mountains.jpg" height="100%" width="100%" mask="url(#blob2)" />
</svg>
```

When using `mask-type-luminance` the luminance value of the SVG mask determines visibility, so sticking with grayscale colors will produce the most predictable results. With `mask-alpha`, the opacity of the SVG mask determines the visibility of the masked element.

### Responsive design