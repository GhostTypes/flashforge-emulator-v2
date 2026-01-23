---
title: grid-row
description: Utilities for controlling how elements are sized and placed across grid rows.
---

", "grid-row: span  / span ;"],
  ["row-span-full", "grid-row: 1 / -1;"],
  ["row-span-()", "grid-row: span var() / span var();"],
  ["row-span-[]", "grid-row: span  / span ;"],
  ["row-start-", "grid-row-start: ;"],
  ["-row-start-", "grid-row-start: calc( * -1);"],
  ["row-start-auto", "grid-row-start: auto;"],
  ["row-start-()", "grid-row-start: var();"],
  ["row-start-[]", "grid-row-start: ;"],
  ["row-end-", "grid-row-end: ;"],
  ["-row-end-", "grid-row-end: calc( * -1);"],
  ["row-end-auto", "grid-row-end: auto;"],
  ["row-end-()", "grid-row-end: var();"],
  ["row-end-[]", "grid-row-end: ;"],
  ["row-auto", "grid-row: auto;"],
  ["row-", "grid-row: ;"],
  ["-row-", "grid-row: calc( * -1);"],
  ["row-()", "grid-row: var();"],
  ["row-[]", "grid-row: ;"],
  ]}
/>

## Examples

### Spanning rows

Use `row-span-<number>` utilities like `row-span-2` and `row-span-4` to make an element span _n_ rows:

```html
<!-- [!code classes:row-span-2,row-span-3] -->
<div class="grid grid-flow-col grid-rows-3 gap-4">
  <div class="row-span-3 ...">01</div>
  <div class="col-span-2 ...">02</div>
  <div class="col-span-2 row-span-2 ...">03</div>
</div>
```

### Starting and ending lines

Use `row-start-<number>` or `row-end-<number>` utilities like `row-start-2` and `row-end-3` to make an element start or end at the _nth_ grid line:

```html
<!-- [!code classes:row-start-1,row-start-2,row-end-3,row-end-4] -->
<div class="grid grid-flow-col grid-rows-3 gap-4">
  <div class="row-span-2 row-start-2 ...">01</div>
  <div class="row-span-2 row-end-3 ...">02</div>
  <div class="row-start-1 row-end-4 ...">03</div>
</div>
```

These can also be combined with the `row-span-<number>` utilities to span a specific number of rows.

### Using a custom value

### Responsive design