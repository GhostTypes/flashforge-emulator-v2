---
title: flex-wrap
description: Utilities for controlling how flex items wrap.
---

## Examples

### Don't wrap

Use `flex-nowrap` to prevent flex items from wrapping, causing inflexible items to overflow the container if necessary:

```html
<!-- [!code classes:flex-nowrap] -->
<div class="flex flex-nowrap">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

### Wrap normally

Use `flex-wrap` to allow flex items to wrap:

```html
<!-- [!code classes:flex-wrap] -->
<div class="flex flex-wrap">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

### Wrap reversed

Use `flex-wrap-reverse` to wrap flex items in the reverse direction:

```html
<!-- [!code classes:flex-wrap-reverse] -->
<div class="flex flex-wrap-reverse">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

### Responsive design