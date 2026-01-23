---
title: grid-template-rows
description: Utilities for specifying the rows in a grid layout.
---

", "grid-template-rows: repeat(, minmax(0, 1fr));"],
  ["grid-rows-none", "grid-template-rows: none;"],
  ["grid-rows-subgrid", "grid-template-rows: subgrid;"],
  ["grid-rows-[]", "grid-template-rows: ;"],
  ["grid-rows-()", "grid-template-rows: var();"],
  ]}
/>

## Examples

### Specifying the grid rows

Use `grid-rows-<number>` utilities like `grid-rows-2` and `grid-rows-4` to create grids with _n_ equally sized rows:

```html
<!-- [!code classes:grid-rows-4] -->
<div class="grid grid-flow-col grid-rows-4 gap-4">
  <div>01</div>
  <!-- ... -->
  <div>09</div>
</div>
```

### Implementing a subgrid

Use the `grid-rows-subgrid` utility to adopt the row tracks defined by the item's parent:

```html
<!-- [!code classes:grid-rows-subgrid] -->
<div class="grid grid-flow-col grid-rows-4 gap-4">
  <div>01</div>
  <!-- ... -->
  <div>05</div>
  <div class="row-span-3 grid grid-rows-subgrid gap-4">
  <div class="row-start-2">06</div>
  </div>
  <div>07</div>
  <!-- ... -->
  <div>10</div>
</div>
```

### Using a custom value

### Responsive design