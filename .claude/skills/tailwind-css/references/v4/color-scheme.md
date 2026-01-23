---
title: color-scheme
description: Utilities for controlling the color scheme of an element.
---

## Examples

### Basic example

Use utilities like `scheme-light` and `scheme-light-dark` to control how element should be rendered:

```html
<!-- [!code classes:scheme-light-dark,scheme-light,scheme-dark] -->
<div class="scheme-light ...">
  <input type="date" />
</div>

<div class="scheme-dark ...">
  <input type="date" />
</div>

<div class="scheme-light-dark ...">
  <input type="date" />
</div>
```

### Applying in dark mode