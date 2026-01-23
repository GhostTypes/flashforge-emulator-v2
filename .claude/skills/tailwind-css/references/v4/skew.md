---
title: skew
description: Utilities for skewing elements with transform.
---

", "transform: skewX(deg) skewY(deg);"],
  ["-skew-", "transform: skewX(-deg) skewY(-deg);"],
  ["skew-()", "transform: skewX(var()) skewY(var());"],
  ["skew-[]", "transform: skewX() skewY();"],
  ["skew-x-", "transform: skewX(deg));"],
  ["-skew-x-", "transform: skewX(-deg));"],
  ["skew-x-()", "transform: skewX(var());"],
  ["skew-x-[]", "transform: skewX());"],
  ["skew-y-", "transform: skewY(deg);"],
  ["-skew-y-", "transform: skewY(-deg);"],
  ["skew-y-()", "transform: skewY(var());"],
  ["skew-y-[]", "transform: skewY();"],
  ]}
/>

## Examples

### Basic example

Use `skew-<number>` utilities like `skew-4` and `skew-10` to skew an element on both axes:

```html
<!-- [!code classes:skew-3,skew-6,skew-12] -->
<img class="skew-3 ..." src="/img/mountains.jpg" />
<img class="skew-6 ..." src="/img/mountains.jpg" />
<img class="skew-12 ..." src="/img/mountains.jpg" />
```

### Using negative values

Use `-skew-<number>` utilities like `-skew-4` and `-skew-10` to skew an element on both axes:

```html
<!-- [!code classes:-skew-3,-skew-6,-skew-12] -->
<img class="-skew-3 ..." src="/img/mountains.jpg" />
<img class="-skew-6 ..." src="/img/mountains.jpg" />
<img class="-skew-12 ..." src="/img/mountains.jpg" />
```

### Skewing on the x-axis

Use `skew-x-<number>` utilities like `skew-x-4` and `-skew-x-10` to skew an element on the x-axis:

```html
<!-- [!code classes:-skew-x-12,skew-x-12,skew-x-6] -->
<img class="-skew-x-12 ..." src="/img/mountains.jpg" />
<img class="skew-x-6 ..." src="/img/mountains.jpg" />
<img class="skew-x-12 ..." src="/img/mountains.jpg" />
```

### Skewing on the y-axis

Use `skew-y-<number>` utilities like `skew-y-4` and `-skew-y-10` to skew an element on the y-axis:

```html
<!-- [!code classes:-skew-y-12,skew-y-12,skew-y-6] -->
<img class="-skew-y-12 ..." src="/img/mountains.jpg" />
<img class="skew-y-6 ..." src="/img/mountains.jpg" />
<img class="skew-y-12 ..." src="/img/mountains.jpg" />
```

### Using a custom value

### Responsive design