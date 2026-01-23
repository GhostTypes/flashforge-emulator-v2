---
title: border-style
description: Utilities for controlling the style of an element's borders.
---

:not(:last-child) "],
  ["divide-dashed", "& > :not(:last-child) "],
  ["divide-dotted", "& > :not(:last-child) "],
  ["divide-double", "& > :not(:last-child) "],
  ["divide-hidden", "& > :not(:last-child) "],
  ["divide-none", "& > :not(:last-child) "],
  ]}
/>

## Examples

### Basic example

Use utilities like `border-solid` and `border-dotted` to control an element's border style:

```html
<!-- [!code classes:border-solid,border-dashed,border-dotted,border-double] -->
<div class="border-2 border-solid ..."></div>
<div class="border-2 border-dashed ..."></div>
<div class="border-2 border-dotted ..."></div>
<div class="border-4 border-double ..."></div>
```

### Removing a border

Use the `border-none` utility to remove an existing border from an element:

```html
<!-- [!code classes:border-none] -->
<button class="border-none ...">Save Changes</button>
```

This is most commonly used to remove a border style that was applied at a smaller breakpoint.

### Setting the divider style

Use utilities like `divide-dashed` and `divide-dotted` to control the border style between child elements:

```html
<!-- [!code classes:divide-dashed] -->
<div class="grid grid-cols-3 divide-x-3 divide-dashed divide-indigo-500">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

### Responsive design