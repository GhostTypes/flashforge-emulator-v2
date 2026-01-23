---
title: grid-column
description: Utilities for controlling how elements are sized and placed across grid columns.
---

", "grid-column: span  / span ;"],
  ["col-span-full", "grid-column: 1 / -1;"],
  ["col-span-()", "grid-column: span var() / span var();"],
  ["col-span-[]", "grid-column: span  / span ;"],
  ["col-start-", "grid-column-start: ;"],
  ["-col-start-", "grid-column-start: calc( * -1);"],
  ["col-start-auto", "grid-column-start: auto;"],
  ["col-start-()", "grid-column-start: var();"],
  ["col-start-[]", "grid-column-start: ;"],
  ["col-end-", "grid-column-end: ;"],
  ["-col-end-", "grid-column-end: calc( * -1);"],
  ["col-end-auto", "grid-column-end: auto;"],
  ["col-end-()", "grid-column-end: var();"],
  ["col-end-[]", "grid-column-end: ;"],
  ["col-auto", "grid-column: auto;"],
  ["col-", "grid-column: ;"],
  ["-col-", "grid-column: calc( * -1);"],
  ["col-()", "grid-column: var();"],
  ["col-[]", "grid-column: ;"],
  ]}
/>

## Examples

### Spanning columns

Use `col-span-<number>` utilities like `col-span-2` and `col-span-4` to make an element span _n_ columns:

```html
<!-- [!code classes:col-span-2] -->
<div class="grid grid-cols-3 gap-4">
  <div class="...">01</div>
  <div class="...">02</div>
  <div class="...">03</div>
  <div class="col-span-2 ...">04</div>
  <div class="...">05</div>
  <div class="...">06</div>
  <div class="col-span-2 ...">07</div>
</div>
```

### Starting and ending lines

Use `col-start-<number>` or `col-end-<number>` utilities like `col-start-2` and `col-end-3` to make an element start or end at the _nth_ grid line:

```html
<!-- [!code classes:col-start-1,col-start-2,col-end-3,col-end-7] -->
<div class="grid grid-cols-6 gap-4">
  <div class="col-span-4 col-start-2 ...">01</div>
  <div class="col-start-1 col-end-3 ...">02</div>
  <div class="col-span-2 col-end-7 ...">03</div>
  <div class="col-start-1 col-end-7 ...">04</div>
</div>
```

These can also be combined with the `col-span-<number>` utilities to span a specific number of columns.

### Using a custom value

### Responsive design