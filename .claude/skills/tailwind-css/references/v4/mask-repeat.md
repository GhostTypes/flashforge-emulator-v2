---
title: mask-repeat
description: Utilities for controlling the repetition of an element's mask image.
---

## Examples

### Basic example

Use the `mask-repeat` utility to repeat the mask image both vertically and horizontally:

```html
<!-- [!code classes:mask-repeat] -->
<div class="mask-repeat mask-[url(/img/circle.png)] mask-size-[50px_50px] bg-[url(/img/mountains.jpg)] ..."></div>
```

### Repeating horizontally

Use the `mask-repeat-x` utility to only repeat the mask image horizontally:

```html
<!-- [!code classes:mask-repeat-x] -->
<div class="mask-repeat-x mask-[url(/img/circle.png)] mask-size-[50px_50px] bg-[url(/img/mountains.jpg)]..."></div>
```

### Repeating vertically

Use the `mask-repeat-y` utility to only repeat the mask image vertically:

```html
<!-- [!code classes:mask-repeat-y] -->
<div class="mask-repeat-y mask-[url(/img/circle.png)] mask-size-[50px_50px] bg-[url(/img/mountains.jpg)]..."></div>
```

### Preventing clipping

Use the `mask-repeat-space` utility to repeat the mask image without clipping:

```html
<!-- [!code classes:mask-repeat-space] -->
<div class="mask-repeat-space mask-[url(/img/circle.png)] mask-size-[50px_50px] bg-[url(/img/mountains.jpg)] ..."></div>
```

### Preventing clipping and gaps

Use the `mask-repeat-round` utility to repeat the mask image without clipping, stretching if needed to avoid gaps:

```html
<!-- [!code classes:mask-repeat-round] -->
<div class="mask-repeat-round mask-[url(/img/circle.png)] mask-size-[50px_50px] bg-[url(/img/mountains.jpg)] ..."></div>
```

### Disabling repeating

Use the `mask-no-repeat` utility to prevent a mask image from repeating:

```html
<!-- [!code classes:mask-no-repeat] -->
<div class="mask-no-repeat mask-[url(/img/circle.png)] mask-size-[50px_50px] bg-[url(/img/mountains.jpg)] ..."></div>
```

### Responsive design