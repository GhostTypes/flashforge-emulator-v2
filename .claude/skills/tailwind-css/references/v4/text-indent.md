---
title: text-indent
description: Utilities for controlling the amount of empty space shown before text in a block.
---

", "text-indent: calc(var(--spacing) * );"],
  ["-indent-", "text-indent: calc(var(--spacing) * -);"],
  ["indent-px", "text-indent: 1px;"],
  ["-indent-px", "text-indent: -1px;"],
  ["indent-()", "text-indent: var();"],
  ["indent-[]", "text-indent: ;"],
  ]}
/>

## Examples

### Basic example

Use `indent-<number>` utilities like `indent-2` and `indent-8` to set the amount of empty space (indentation) that's shown before text in a block:

```html
<!-- [!code classes:indent-8] -->
<p class="indent-8">So I started to walk into the water...</p>
```

### Using negative values

To use a negative text indent value, prefix the class name with a dash to convert it to a negative value:

```html
<!-- [!code classes:-indent-8] -->
<p class="-indent-8">So I started to walk into the water...</p>
```

### Using a custom value

### Responsive design