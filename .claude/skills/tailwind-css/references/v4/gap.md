---
title: gap
description: Utilities for controlling gutters between grid and flexbox items.
---

", "gap: calc(var(--spacing) * );"],
  ["gap-()", "gap: var();"],
  ["gap-[]", "gap: ;"],
  ["gap-x-", "column-gap: calc(var(--spacing) * );"],
  ["gap-x-()", "column-gap: var();"],
  ["gap-x-[]", "column-gap: ;"],
  ["gap-y-", "row-gap: calc(var(--spacing) * );"],
  ["gap-y-()", "row-gap: var();"],
  ["gap-y-[]", "row-gap: ;"],
  ]}
/>

## Examples

### Basic example

Use `gap-<number>` utilities like `gap-2` and `gap-4` to change the gap between both rows and columns in grid and flexbox layouts:

```html
<!-- [!code classes:gap-4] -->
<div class="grid grid-cols-2 gap-4">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
</div>
```

### Changing row and column gaps independently

Use `gap-x-<number>` or `gap-y-<number>` utilities like `gap-x-8` and `gap-y-4` to change the gap between columns and rows independently:

```html
<!-- [!code classes:gap-x-8,gap-y-4] -->
<div class="grid grid-cols-3 gap-x-8 gap-y-4">
  <div>01</div>
  <div>02</div>
  <div>03</div>
  <div>04</div>
  <div>05</div>
  <div>06</div>
</div>
```

### Using a custom value

### Responsive design