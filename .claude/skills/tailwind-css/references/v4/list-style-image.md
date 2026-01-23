---
title: list-style-image
description: Utilities for controlling the marker images for list items.
---

]", "list-style-image: ;"],
  ["list-image-()", "list-style-image: var();"],
  ["list-image-none", "list-style-image: none;"],
  ]}
/>

## Examples

### Basic example

Use the `list-image-[<value>]` syntax to control the marker image for list items:

```html
<!-- [!code classes:list-image-[url(/img/checkmark.png)]] -->
<ul class="list-image-[url(/img/checkmark.png)]">
  <li>5 cups chopped Porcini mushrooms</li>
  <!-- ... -->
</ul>
```

### Using a CSS variable

Use the list-image-() syntax to control the marker image for list items using a CSS variable:

```html
<!-- [!code classes:list-image-(--my-list-image)] -->
<ul class="list-image-(--my-list-image)">
  <!-- ... -->
</ul>
```

This is just a shorthand for list-image-[var()] that adds the `var()` function for you automatically.

### Removing a marker image

Use the `list-image-none` utility to remove an existing marker image from list items:

```html
<!-- [!code classes:list-image-none] -->
<ul class="list-image-none">
  <!-- ... -->
</ul>
```

### Responsive design