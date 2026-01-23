---
title: grid-auto-flow
description: Utilities for controlling how elements in a grid are auto-placed.
---

## Examples

### Basic example

Use utilities like `grid-flow-col` and `grid-flow-row-dense` to control how the auto-placement algorithm works for a grid layout:

```html
<!-- [!code classes:grid-flow-row-dense] -->
<div class="grid grid-flow-row-dense grid-cols-3 grid-rows-3 ...">
  <div class="col-span-2">01</div>
  <div class="col-span-2">02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
</div>
```

### Responsive design