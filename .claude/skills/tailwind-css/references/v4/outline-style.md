---
title: outline-style
description: Utilities for controlling the style of an element's outline.
---

## Examples

### Basic example

Use utilities like `outline-solid` and `outline-dashed` to set the style of an element's outline:

```html
<!-- [!code classes:outline-solid,outline-dashed,outline-dotted,outline-double] -->
<button class="outline-2 outline-offset-2 outline-solid ...">Button A</button>
<button class="outline-2 outline-offset-2 outline-dashed ...">Button B</button>
<button class="outline-2 outline-offset-2 outline-dotted ...">Button C</button>
<button class="outline-3 outline-offset-2 outline-double ...">Button D</button>
```

### Hiding an outline

Use the `outline-hidden` utility to hide the default browser outline on focused elements, while still preserving the outline in forced colors mode:

```html
<!-- [!code classes:focus:outline-hidden] -->
<input class="focus:border-indigo-600 focus:outline-hidden ..." type="text" />
```

It is highly recommended to apply your own focus styling for accessibility when using this utility.

### Removing outlines

Use the `outline-none` utility to completely remove the default browser outline on focused elements:

```html
<!-- [!code classes:outline-none] -->
<div class="focus-within:outline-2 focus-within:outline-indigo-600 ...">
  <textarea class="outline-none ..." placeholder="Leave a comment..." />
  <button class="..." type="button">Post</button>
</div>
```

It is highly recommended to apply your own focus styling for accessibility when using this utility.

### Responsive design