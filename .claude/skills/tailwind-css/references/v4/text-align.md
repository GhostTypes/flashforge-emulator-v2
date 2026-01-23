---
title: text-align
description: Utilities for controlling the alignment of text.
---

## Examples

### Left aligning text

Use the `text-left` utility to left align the text of an element:

```html
<!-- [!code classes:text-left] -->
<p class="text-left">So I started to walk into the water...</p>
```

### Right aligning text

Use the `text-right` utility to right align the text of an element:

```html
<!-- [!code classes:text-right] -->
<p class="text-right">So I started to walk into the water...</p>
```

### Centering text

Use the `text-center` utility to center the text of an element:

```html
<!-- [!code classes:text-center] -->
<p class="text-center">So I started to walk into the water...</p>
```

### Justifying text

Use the `text-justify` utility to justify the text of an element:

```html
<!-- [!code classes:text-justify] -->
<p class="text-justify">So I started to walk into the water...</p>
```

### Using logical properties

Use the `text-start` and `text-end` utilities, which use [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties/Basic_concepts) to map to either the left or right side based on the text direction:

```html
<!-- [!code word:dir="rtl"] -->
<!-- [!code classes:text-end] -->
<div dir="rtl" lang="ar">
  <p class="text-end">فبدأت بالسير نحو الماء...</p>
</div>
```

### Responsive design