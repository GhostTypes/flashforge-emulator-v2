---
title: grid-template-columns
description: Utilities for specifying the columns in a grid layout.
---

", "grid-template-columns: repeat(, minmax(0, 1fr));"],
  ["grid-cols-none", "grid-template-columns: none;"],
  ["grid-cols-subgrid", "grid-template-columns: subgrid;"],
  ["grid-cols-[]", "grid-template-columns: ;"],
  ["grid-cols-()", "grid-template-columns: var();"],
  ]}
/>

## Examples

### Specifying the grid columns

Use `grid-cols-<number>` utilities like `grid-cols-2` and `grid-cols-4` to create grids with _n_ equally sized columns:

```html
<!-- [!code classes:grid-cols-4] -->
<div class="grid grid-cols-4 gap-4">
  <div>01</div>
  <!-- ... -->
  <div>09</div>
</div>
```

### Implementing a subgrid

Use the `grid-cols-subgrid` utility to adopt the column tracks defined by the item's parent:

```html
<!-- [!code classes:grid-cols-subgrid] -->
<div class="grid grid-cols-4 gap-4">
  <div>01</div>
  <!-- ... -->
  <div>05</div>
  <div class="col-span-3 grid grid-cols-subgrid gap-4">
  <div class="col-start-2">06</div>
  </div>
</div>
```

### Using a custom value

### Responsive design