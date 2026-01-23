---
title: top / right / bottom / left
description: Utilities for controlling the placement of positioned elements.
---

[
  ["", "calc(var(--spacing) * )"],
  ["", "calc(var(--spacing) * -)", true],
  ["", "calc( * 100%)"],
  ["", "calc( * -100%)", true],
  ["px", "1px"],
  ["px", "-1px", true],
  ["full", "100%"],
  ["full", "-100%", true],
  ["auto", "auto"],
  ["()", "var()"],
  ["[]", ""],
  ].map(([suffix, value, negative]) => [`${negative ? "-" : ""}${prefix}-${suffix}`, `${property}: ${value};`]),
  )}
/>

## Examples

### Basic example

Use `top-<number>`, `right-<number>`, `bottom-<number>`, `left-<number>`, and `inset-<number>` utilities like `top-0` and `bottom-4` to set the horizontal or vertical position of a [positioned element](/docs/position):

```html
<!-- [!code classes:inset-x-0,inset-y-0,inset-0,right-0,left-0,top-0,bottom-0] -->
<!-- Pin to top left corner -->
<div class="relative size-32 ...">
  <div class="absolute top-0 left-0 size-16 ...">01</div>
</div>

<!-- Span top edge -->
<div class="relative size-32 ...">
  <div class="absolute inset-x-0 top-0 h-16 ...">02</div>
</div>

<!-- Pin to top right corner -->
<div class="relative size-32 ...">
  <div class="absolute top-0 right-0 size-16 ...">03</div>
</div>

<!-- Span left edge -->
<div class="relative size-32 ...">
  <div class="absolute inset-y-0 left-0 w-16 ...">04</div>
</div>

<!-- Fill entire parent -->
<div class="relative size-32 ...">
  <div class="absolute inset-0 ...">05</div>
</div>

<!-- Span right edge -->
<div class="relative size-32 ...">
  <div class="absolute inset-y-0 right-0 w-16 ...">06</div>
</div>

<!-- Pin to bottom left corner -->
<div class="relative size-32 ...">
  <div class="absolute bottom-0 left-0 size-16 ...">07</div>
</div>

<!-- Span bottom edge -->
<div class="relative size-32 ...">
  <div class="absolute inset-x-0 bottom-0 h-16 ...">08</div>
</div>

<!-- Pin to bottom right corner -->
<div class="relative size-32 ...">
  <div class="absolute right-0 bottom-0 size-16 ...">09</div>
</div>
```

### Using negative values

To use a negative top/right/bottom/left value, prefix the class name with a dash to convert it to a negative value:

```html
<!-- [!code classes:-left-4,-top-4] -->
<div class="relative size-32 ...">
  <div class="absolute -top-4 -left-4 size-14 ..."></div>
</div>
```

### Using logical properties

Use `start-<number>` or `end-<number>` utilities like `start-0` and `end-4` to set the `inset-inline-start` and `inset-inline-end` [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties/Basic_concepts), which map to either the left or right side based on the text direction:

```html
<!-- [!code classes:start-0] -->
<div dir="ltr">
  <div class="relative size-32 ...">
  <div class="absolute start-0 top-0 size-14 ..."></div>
  </div>
  <div>
  <div dir="rtl">
  <div class="relative size-32 ...">
  <div class="absolute start-0 top-0 size-14 ..."></div>
  </div>
  <div></div>
  </div>
  </div>
</div>
```

For more control, you can also use the [LTR and RTL modifiers](/docs/hover-focus-and-other-states#rtl-support) to conditionally apply specific styles depending on the current text direction.

### Using a custom value

### Responsive design

## Customizing your theme