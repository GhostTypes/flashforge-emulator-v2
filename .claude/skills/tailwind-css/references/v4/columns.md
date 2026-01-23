---
title: columns
description: Utilities for controlling the number of columns within an element.
---

", "columns: ;"],
  ["columns-3xs", "columns: var(--container-3xs); /* 16rem (256px) */"],
  ["columns-2xs", "columns: var(--container-2xs); /* 18rem (288px) */"],
  ["columns-xs", "columns: var(--container-xs); /* 20rem (320px) */"],
  ["columns-sm", "columns: var(--container-sm); /* 24rem (384px) */"],
  ["columns-md", "columns: var(--container-md); /* 28rem (448px) */"],
  ["columns-lg", "columns: var(--container-lg); /* 32rem (512px) */"],
  ["columns-xl", "columns: var(--container-xl); /* 36rem (576px) */"],
  ["columns-2xl", "columns: var(--container-2xl); /* 42rem (672px) */"],
  ["columns-3xl", "columns: var(--container-3xl); /* 48rem (768px) */"],
  ["columns-4xl", "columns: var(--container-4xl); /* 56rem (896px) */"],
  ["columns-5xl", "columns: var(--container-5xl); /* 64rem (1024px) */"],
  ["columns-6xl", "columns: var(--container-6xl); /* 72rem (1152px) */"],
  ["columns-7xl", "columns: var(--container-7xl); /* 80rem (1280px) */"],
  ["columns-auto", "columns: auto;"],
  ["columns-()", "columns: var();"],
  ["columns-[]", "columns: ;"],
  ]}
/>

## Examples

### Setting by number

Use `columns-<number>` utilities like `columns-3` to set the number of columns that should be created for the content within an element:

```html
<!-- [!code classes:columns-3] -->
<div class="columns-3 ...">
  <img class="aspect-3/2 ..." src="/img/mountains-1.jpg" />
  <img class="aspect-square ..." src="/img/mountains-2.jpg" />
  <img class="aspect-square ..." src="/img/mountains-3.jpg" />
  <!-- ... -->
</div>
```

The column width will automatically adjust to accommodate the specified number of columns.

### Setting by width

Use utilities like `columns-xs` and `columns-sm` to set the ideal column width for the content within an element:

```html
<!-- [!code classes:columns-3xs] -->
<div class="columns-3xs ...">
  <img class="aspect-3/2 ..." src="/img/mountains-1.jpg" />
  <img class="aspect-square ..." src="/img/mountains-2.jpg" />
  <img class="aspect-square ..." src="/img/mountains-3.jpg" />
  <!-- ... -->
</div>
```

When setting the column width, the number of columns automatically adjusts to ensure they don't get too narrow.

### Setting the column gap

Use the `gap-<width>` utilities to specify the width between columns:

```html
<!-- [!code classes:gap-8] -->
<div class="columns-3 gap-8 ...">
  <img class="aspect-3/2 ..." src="/img/mountains-1.jpg" />
  <img class="aspect-square ..." src="/img/mountains-2.jpg" />
  <img class="aspect-square ..." src="/img/mountains-3.jpg" />
  <!-- ... -->
</div>
```

Learn more about the gap utilities in the [gap documentation](/docs/gap).

### Using a custom value

### Responsive design

```html
<!-- [!code classes:sm:gap-8,sm:columns-3] -->
<div class="columns-2 gap-4 sm:columns-3 sm:gap-8 ...">
  <img class="aspect-3/2 ..." src="/img/mountains-1.jpg" />
  <img class="aspect-square ..." src="/img/mountains-2.jpg" />
  <img class="aspect-square ..." src="/img/mountains-3.jpg" />
  <!-- ... -->
</div>
```

## Customizing your theme