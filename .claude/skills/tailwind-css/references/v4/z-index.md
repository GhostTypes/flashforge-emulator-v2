---
title: z-index
description: Utilities for controlling the stack order of an element.
---

", "z-index: ;"],
  ["z-auto", "z-index: auto;"],
  ["z-[]", "z-index: ;"],
  ["z-()", "z-index: var();"],
  ]}
/>

## Examples

### Basic example

Use the `z-<number>` utilities like `z-10` and `z-50` to control the stack order (or three-dimensional positioning) of an element, regardless of the order it has been displayed:

```html
<!-- [!code classes:z-40,z-30,z-20,z-10,z-0] -->
<div class="z-40 ...">05</div>
<div class="z-30 ...">04</div>
<div class="z-20 ...">03</div>
<div class="z-10 ...">02</div>
<div class="z-0 ...">01</div>
```

### Using negative values

To use a negative z-index value, prefix the class name with a dash to convert it to a negative value:

```html
<!-- [!code classes:-z-10] -->
<div class="...">05</div>
<div class="...">04</div>
<div class="-z-10 ...">03</div>
<div class="...">02</div>
<div class="...">01</div>
```

### Using a custom value

### Responsive design