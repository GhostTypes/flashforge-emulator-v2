---
title: box-decoration-break
description: Utilities for controlling how element fragments should be rendered across multiple lines, columns, or pages.
---

## Examples

### Basic example

Use the `box-decoration-slice` and `box-decoration-clone` utilities to control whether properties like background, border, border-image, box-shadow, clip-path, margin, and padding should be rendered as if the element were one continuous fragment, or distinct blocks:

```html
<!-- [!code classes:box-decoration-slice,box-decoration-clone] -->
<span class="box-decoration-slice bg-linear-to-r from-indigo-600 to-pink-500 px-2 text-white ...">
  Hello<br />World
</span>
<span class="box-decoration-clone bg-linear-to-r from-indigo-600 to-pink-500 px-2 text-white ...">
  Hello<br />World
</span>
```

### Responsive design