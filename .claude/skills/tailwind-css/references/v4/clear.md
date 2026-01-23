---
title: clear
description: Utilities for controlling the wrapping of content around an element.
---

## Examples

### Clearing left

Use the `clear-left` utility to position an element below any preceding left-floated elements:

```html
<!-- [!code classes:clear-left] -->
<article>
  <img class="float-left ..." src="/img/snow-mountains.jpg" />
  <img class="float-right ..." src="/img/green-mountains.jpg" />
  <p class="clear-left ...">Maybe we can live without libraries...</p>
</article>
```

### Clearing right

Use the `clear-right` utility to position an element below any preceding right-floated elements:

```html
<!-- [!code classes:clear-right] -->
<article>
  <img class="float-left ..." src="/img/green-mountains.jpg" />
  <img class="float-right ..." src="/img/snow-mountains.jpg" />
  <p class="clear-right ...">Maybe we can live without libraries...</p>
</article>
```

### Clearing all

Use the `clear-both` utility to position an element below all preceding floated elements:

```html
<!-- [!code classes:clear-both] -->
<article>
  <img class="float-left ..." src="/img/snow-mountains.jpg" />
  <img class="float-right ..." src="/img/green-mountains.jpg" />
  <p class="clear-both ...">Maybe we can live without libraries...</p>
</article>
```

### Using logical properties

Use the `clear-start` and `clear-end` utilities, which use [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties/Basic_concepts) to map to either the left or right side based on the text direction:

```html
<!-- [!code word:dir="rtl"] -->
<!-- [!code classes:clear-end] -->
<article dir="rtl">
  <img class="float-left ..." src="/img/green-mountains.jpg" />
  <img class="float-right ..." src="/img/green-mountains.jpg" />
  <p class="clear-end ...">...ربما يمكننا العيش بدون مكتبات،</p>
</article>
```

### Disabling clears

Use the `clear-none` utility to reset any clears that are applied to an element:

```html
<!-- [!code classes:clear-none] -->
<article>
  <img class="float-left ..." src="/img/green-mountains.jpg" />
  <img class="float-right ..." src="/img/snow-mountains.jpg" />
  <p class="clear-none ...">Maybe we can live without libraries...</p>
</article>
```

### Responsive design