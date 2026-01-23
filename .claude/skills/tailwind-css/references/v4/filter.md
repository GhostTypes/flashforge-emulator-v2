---
title: filter
description: Utilities for applying filters to an element.
---

)", "filter: var();"],
  ["filter-[]", "filter: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `blur-xs` and `grayscale` to apply filters to an element:

```html
<!-- [!code classes:blur-xs,grayscale] -->
<img class="blur-xs" src="/img/mountains.jpg" />
<img class="grayscale" src="/img/mountains.jpg" />
<img class="blur-xs grayscale" src="/img/mountains.jpg" />
```

You can combine the following filter utilities: [blur](/docs/filter-blur), [brightness](/docs/filter-brightness), [contrast](/docs/filter-contrast), [drop-shadow](/docs/filter-drop-shadow), [grayscale](/docs/filter-grayscale), [hue-rotate](/docs/filter-hue-rotate), [invert](/docs/filter-invert), [saturate](/docs/filter-saturate), and [sepia](/docs/filter-sepia).

### Removing filters

Use the `filter-none` utility to remove all of the filters applied to an element:

```html
<!-- [!code classes:md:filter-none] -->
<img class="blur-md brightness-150 invert md:filter-none" src="/img/mountains.jpg" />
```

### Using a custom value

### Applying on hover

### Responsive design