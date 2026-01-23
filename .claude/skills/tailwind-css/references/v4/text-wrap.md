---
title: text-wrap
description: Utilities for controlling how text wraps within an element.
---

## Examples

### Allowing text to wrap

Use the `text-wrap` utility to wrap overflowing text onto multiple lines at logical points in the text:

```html
<!-- [!code classes:text-wrap] -->
<article class="text-wrap">
  <h3>Beloved Manhattan soup stand closes</h3>
  <p>New Yorkers are facing the winter chill...</p>
</article>
```

### Preventing text from wrapping

Use the `text-nowrap` utility to prevent text from wrapping, allowing it to overflow if necessary:

```html
<!-- [!code classes:text-nowrap] -->
<article class="text-nowrap">
  <h3>Beloved Manhattan soup stand closes</h3>
  <p>New Yorkers are facing the winter chill...</p>
</article>
```

### Balanced text wrapping

Use the `text-balance` utility to distribute the text evenly across each line:

```html
<!-- [!code classes:text-balance] -->
<article>
  <h3 class="text-balance">Beloved Manhattan soup stand closes</h3>
  <p>New Yorkers are facing the winter chill...</p>
</article>
```

For performance reasons browsers limit text balancing to blocks that are ~6 lines or less, making it best suited for headings.

### Pretty text wrapping

Use the `text-pretty` utility to prefer better text wrapping and layout at the expense of speed. Behavior varies across browsers but often involves approaches like preventing orphans (a single word on its own line) at the end of a text block:

```html
<!-- [!code classes:text-pretty] -->
<article>
  <h3 class="text-pretty">Beloved Manhattan soup stand closes</h3>
  <p>New Yorkers are facing the winter chill...</p>
</article>
```

### Responsive design