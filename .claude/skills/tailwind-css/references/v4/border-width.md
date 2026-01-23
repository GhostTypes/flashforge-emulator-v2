---
title: border-width
description: Utilities for controlling the width of an element's borders.
---

", "border-width: px;"],
  ["border-(length:)", "border-width: var();"],
  ["border-[]", "border-width: ;"],
  ["border-x", "border-inline-width: 1px;"],
  ["border-x-", "border-inline-width: px;"],
  ["border-x-(length:)", "border-inline-width: var();"],
  ["border-x-[]", "border-inline-width: ;"],
  ["border-y", "border-block-width: 1px;"],
  ["border-y-", "border-block-width: px;"],
  ["border-y-(length:)", "border-block-width: var();"],
  ["border-y-[]", "border-block-width: ;"],
  ["border-s", "border-inline-start-width: 1px;"],
  ["border-s-", "border-inline-start-width: px;"],
  ["border-s-(length:)", "border-inline-start-width: var();"],
  ["border-s-[]", "border-inline-start-width: ;"],
  ["border-e", "border-inline-end-width: 1px;"],
  ["border-e-", "border-inline-end-width: px;"],
  ["border-e-(length:)", "border-inline-end-width: var();"],
  ["border-e-[]", "border-inline-end-width: ;"],
  ["border-t", "border-top-width: 1px;"],
  ["border-t-", "border-top-width: px;"],
  ["border-t-(length:)", "border-top-width: var();"],
  ["border-t-[]", "border-top-width: ;"],
  ["border-r", "border-right-width: 1px;"],
  ["border-r-", "border-right-width: px;"],
  ["border-r-(length:)", "border-right-width: var();"],
  ["border-r-[]", "border-right-width: ;"],
  ["border-b", "border-bottom-width: 1px;"],
  ["border-b-", "border-bottom-width: px;"],
  ["border-b-(length:)", "border-bottom-width: var();"],
  ["border-b-[]", "border-bottom-width: ;"],
  ["border-l", "border-left-width: 1px;"],
  ["border-l-", "border-left-width: px;"],
  ["border-l-(length:)", "border-left-width: var();"],
  ["border-l-[]", "border-left-width: ;"],
  [
  "divide-x",
  dedent`
  & > :not(:last-child) {
  border-inline-start-width: 0px;
  border-inline-end-width: 1px;
  }
  `,
  ],
  [
  "divide-x-",
  dedent`
  & > :not(:last-child) {
  border-inline-start-width: 0px;
  border-inline-end-width: <number>px;
  }
  `,
  ],
  [
  "divide-x-(length:)",
  dedent`
  & > :not(:last-child) {
  border-inline-start-width: 0px;
  border-inline-end-width: var(<custom-property>);
  }
  `,
  ],
  [
  "divide-x-[]",
  dedent`
  & > :not(:last-child) {
  border-inline-start-width: 0px;
  border-inline-end-width: <value>;
  }
  `,
  ],
  [
  "divide-y",
  dedent`
  & > :not(:last-child) {
  border-top-width: 0px;
  border-bottom-width: 1px;
  }
  `,
  ],
  [
  "divide-y-",
  dedent`
  & > :not(:last-child) {
  border-top-width: 0px;
  border-bottom-width: <number>px;
  }
  `,
  ],
  [
  "divide-y-(length:)",
  dedent`
  & > :not(:last-child) {
  border-top-width: 0px;
  border-bottom-width: var(<custom-property>);
  }
  `,
  ],
  [
  "divide-y-[]",
  dedent`
  & > :not(:last-child) {
  border-top-width: 0px;
  border-bottom-width: <value>;
  }
  `,
  ],
  ["divide-x-reverse", "--tw-divide-x-reverse: 1;"],
  ["divide-y-reverse", "--tw-divide-y-reverse: 1;"],
  ]}
/>

## Examples

### Basic example

Use `border` or `border-<number>` utilities like `border-2` and `border-4` to set the border width for all sides of an element:

```html
<!-- [!code classes:border,border-2,border-4,border-8] -->
<div class="border border-indigo-600 ..."></div>
<div class="border-2 border-indigo-600 ..."></div>
<div class="border-4 border-indigo-600 ..."></div>
<div class="border-8 border-indigo-600 ..."></div>
```

### Individual sides

Use utilities like `border-r` and `border-t-4` to set the border width for one side of an element:

```html
<!-- [!code classes:border-t-4,border-r-4,border-b-4,border-l-4] -->
<div class="border-t-4 border-indigo-500 ..."></div>
<div class="border-r-4 border-indigo-500 ..."></div>
<div class="border-b-4 border-indigo-500 ..."></div>
<div class="border-l-4 border-indigo-500 ..."></div>
```

### Horizontal and vertical sides

Use utilities like `border-x` and `border-y-4` to set the border width on two sides of an element at the same time:

```html
<!-- [!code classes:border-x-4,border-y-4] -->
<div class="border-x-4 border-indigo-500 ..."></div>
<div class="border-y-4 border-indigo-500 ..."></div>
```

### Using logical properties

Use utilities like `border-s` and `border-e-4` to set the `border-inline-start-width` and `border-inline-end-width` [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties/Basic_concepts), which map to either the left or right border based on the text direction:

```html
<!-- [!code word:dir="ltr"] -->
<!-- [!code word:dir="rtl"] -->
<!-- [!code classes:border-s-4] -->
<div dir="ltr">
  <div class="border-s-4 ..."></div>
</div>
<div dir="rtl">
  <div class="border-s-4 ..."></div>
</div>
```

### Between children

Use utilities like `divide-x` and `divide-y-4` to add borders between child elements:

```html
<!-- [!code classes:divide-x-4] -->
<div class="grid grid-cols-3 divide-x-4">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

#### Reversing children order

If your elements are in reverse order (using say `flex-row-reverse` or `flex-col-reverse`), use the `divide-x-reverse` or `divide-y-reverse` utilities to ensure the border is added to the correct side of each element:

```html
<!-- [!code classes:flex-col-reverse,divide-y-4,divide-y-reverse] -->
<div class="flex flex-col-reverse divide-y-4 divide-y-reverse divide-gray-200">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

### Using a custom value

### Responsive design