---
title: border-color
description: Utilities for controlling the color of an element's borders.
---

import  from "@/components/content.tsx";

 `border-color: ${value}`],
  ["border-x", (value) => `border-inline-color: ${value}`],
  ["border-y", (value) => `border-block-color: ${value}`],
  ["border-s", (value) => `border-inline-start-color: ${value}`],
  ["border-e", (value) => `border-inline-end-color: ${value}`],
  ["border-t", (value) => `border-top-color: ${value}`],
  ["border-r", (value) => `border-right-color: ${value}`],
  ["border-b", (value) => `border-bottom-color: ${value}`],
  ["border-l", (value) => `border-left-color: ${value}`],
  ["divide", (value) => `& > :not(:last-child) {\n  border-color: ${value}\n}`],
  ].flatMap(([utility, css]) => [
  [`${utility}-inherit`, css("inherit;")],
  [`${utility}-current`, css("currentColor;")],
  [`${utility}-transparent`, css("transparent;")],
  ...Object.entries(colors).map(([name, value]) => [
  `${utility}-${name}`,
  css(`var(--color-${name}); /* ${value} */`),
  ]),
  [`${utility}-(<custom-property>)`, css("var();")],
  [`${utility}-[<value>]`, css(";")],
  ]),
  ]}
/>

## Examples

### Basic example

Use utilities like `border-rose-500` and `border-lime-100` to control the border color of an element:

```html
<!-- [!code classes:border-indigo-500,border-purple-500,border-sky-500] -->
<div class="border-4 border-indigo-500 ..."></div>
<div class="border-4 border-purple-500 ..."></div>
<div class="border-4 border-sky-500 ..."></div>
```

### Changing the opacity

Use the color opacity modifier to control the opacity of an element's border color:

```html
<!-- [!code word:/100] -->
<!-- [!code word:/75] -->
<!-- [!code word:/50] -->
<div class="border-4 border-indigo-500/100 ..."></div>
<div class="border-4 border-indigo-500/75 ..."></div>
<div class="border-4 border-indigo-500/50 ..."></div>
```

### Individual sides

Use utilities like `border-t-indigo-500` and `border-r-lime-100` to set the border color for one side of an element:

```html
<!-- [!code classes:border-t-indigo-500,border-r-indigo-500,border-b-indigo-500,border-l-indigo-500] -->
<div class="border-4 border-indigo-200 border-t-indigo-500 ..."></div>
<div class="border-4 border-indigo-200 border-r-indigo-500 ..."></div>
<div class="border-4 border-indigo-200 border-b-indigo-500 ..."></div>
<div class="border-4 border-indigo-200 border-l-indigo-500 ..."></div>
```

### Horizontal and vertical sides

Use utilities like `border-x-indigo-500` and `border-y-lime-100` to set the border color on two sides of an element at the same time:

```html
<!-- [!code classes:border-x-indigo-500,border-y-indigo-500] -->
<div class="border-4 border-indigo-200 border-x-indigo-500 ..."></div>
<div class="border-4 border-indigo-200 border-y-indigo-500 ..."></div>
```

### Using logical properties

Use utilities like `border-s-indigo-500` and `border-e-lime-100` to set the `border-inline-start-color` and `border-inline-end-color` [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties/Basic_concepts), which map to either the left or right border based on the text direction:

```html
<!-- [!code classes:border-s-indigo-500,border-s-indigo-500] -->
<!-- [!code word:dir="ltr"] -->
<!-- [!code word:dir="rtl"] -->
<div dir="ltr">
  <div class="border-s-indigo-500 ..."></div>
</div>
<div dir="rtl">
  <div class="border-s-indigo-500 ..."></div>
</div>
```

### Divider between children

Use utilities like `divide-indigo-500` and `divide-lime-100` to control the border color between child elements:

```html
<!-- [!code classes:divide-indigo-500] -->
<div class="grid grid-cols-3 divide-x-4 divide-indigo-500">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

### Using a custom value

### Applying on focus

```html
<!-- [!code classes:focus:border-pink-600] -->
<input class="border-2 border-gray-700 focus:border-pink-600 ..." />
```

### Responsive design

## Customizing your theme