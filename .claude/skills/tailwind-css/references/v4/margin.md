---
title: margin
description: Utilities for controlling an element's margin.
---

[
  [`${prefix}-<number>`, `${property}: calc(var(--spacing) * <number>);`],
  [`-${prefix}-<number>`, `${property}: calc(var(--spacing) * -<number>);`],
  [`${prefix}-auto`, `${property}: auto;`],
  [`${prefix}-px`, `${property}: 1px;`],
  [`-${prefix}-px`, `${property}: -1px;`],
  [`${prefix}-(<custom-property>)`, `${property}: var(<custom-property>);`],
  [`${prefix}-[<value>]`, `${property}: <value>;`],
  ]),
  ...[
  ["space-x", "margin-inline"],
  ["space-y", "margin-block"],
  ].flatMap(([prefix, property]) => [
  [
  `${prefix}-<number>`,
  dedent`& > :not(:last-child) {
  --tw-${prefix}-reverse: 0;
  ${property}-start: calc(calc(var(--spacing) * <number>) * var(--tw-${prefix}-reverse));
  ${property}-end: calc(calc(var(--spacing) * <number>) * calc(1 - var(--tw-${prefix}-reverse)));
  };`,
  ],
  [
  `-${prefix}-<number>`,
  dedent`& > :not(:last-child) {
  --tw-${prefix}-reverse: 0;
  ${property}-start: calc(calc(var(--spacing) * -<number>) * var(--tw-${prefix}-reverse));
  ${property}-end: calc(calc(var(--spacing) * -<number>) * calc(1 - var(--tw-${prefix}-reverse)));
  };`,
  ],
  [
  `${prefix}-px`,
  dedent`& > :not(:last-child) {
  --tw-${prefix}-reverse: 0;
  ${property}-start: calc(1px * var(--tw-${prefix}-reverse));
  ${property}-end: calc(1px * calc(1 - var(--tw-${prefix}-reverse)));
  };`,
  ],
  [
  `-${prefix}-px`,
  dedent`& > :not(:last-child) {
  --tw-${prefix}-reverse: 0;
  ${property}-start: calc(-1px * var(--tw-${prefix}-reverse));
  ${property}-end: calc(-1px * calc(1 - var(--tw-${prefix}-reverse)));
  };`,
  ],
  [
  `${prefix}-(<custom-property>)`,
  dedent`& > :not(:last-child) {
  --tw-${prefix}-reverse: 0;
  ${property}-start: calc(var(<custom-property>) * var(--tw-${prefix}-reverse));
  ${property}-end: calc(var(<custom-property>) * calc(1 - var(--tw-${prefix}-reverse)));
  };`,
  ],
  [
  `${prefix}-[<value>]`,
  dedent`& > :not(:last-child) {
  --tw-${prefix}-reverse: 0;
  ${property}-start: calc(<value> * var(--tw-${prefix}-reverse));
  ${property}-end: calc(<value> * calc(1 - var(--tw-${prefix}-reverse)));
  };`,
  ],
  ]),
  [
  "space-x-reverse",
  dedent`& > :not(:last-child)) {
  --tw-space-x-reverse: 1;
  }`,
  ],
  [
  "space-y-reverse",
  dedent`& > :not(:last-child)) {
  --tw-space-y-reverse: 1;
  }`,
  ],

]}
/>

## Examples

### Basic example

Use `m-<number>` utilities like `m-4` and `m-8` to control the margin on all sides of an element:

```html
<!-- [!code classes:m-8] -->
<div class="m-8 ...">m-8</div>
```

### Adding margin to a single side

Use `mt-<number>`, `mr-<number>`, `mb-<number>`, and `ml-<number>` utilities like `ml-2` and `mt-6` to control the margin on one side of an element:

```html
<!-- [!code classes:mt-6,mr-4,mb-8,ml-2] -->
<div class="mt-6 ...">mt-6</div>
<div class="mr-4 ...">mr-4</div>
<div class="mb-8 ...">mb-8</div>
<div class="ml-2 ...">ml-2</div>
```

### Adding horizontal margin

Use `mx-<number>` utilities like `mx-4` and `mx-8` to control the horizontal margin of an element:

```html
<!-- [!code classes:mx-8] -->
<div class="mx-8 ...">mx-8</div>
```

### Adding vertical margin

Use `my-<number>` utilities like `my-4` and `my-8` to control the vertical margin of an element:

```html
<!-- [!code classes:my-8] -->
<div class="my-8 ...">my-8</div>
```

### Using negative values

To use a negative margin value, prefix the class name with a dash to convert it to a negative value:

```html
<!-- [!code classes:-mt-8] -->
<div class="h-16 w-36 bg-sky-400 opacity-20 ..."></div>
<div class="-mt-8 bg-sky-300 ...">-mt-8</div>
```

### Using logical properties

Use `ms-<number>` or `me-<number>` utilities like `ms-4` and `me-8` to set the `margin-inline-start` and `margin-inline-end` logical properties:

```html
<!-- [!code classes:ms-8,me-8] -->
<!-- [!code word:dir="ltr"] -->
<!-- [!code word:dir="rtl"] -->
<div>
  <div dir="ltr">
  <div class="ms-8 ...">ms-8</div>
  <div class="me-8 ...">me-8</div>
  </div>
  <div dir="rtl">
  <div class="ms-8 ...">ms-8</div>
  <div class="me-8 ...">me-8</div>
  </div>
</div>
```

### Adding space between children

Use `space-x-<number>` or `space-y-<number>` utilities like `space-x-4` and `space-y-8` to control the space between elements:

```html
<!-- [!code classes:space-x-4] -->
<div class="flex space-x-4 ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

#### Reversing children order

If your elements are in reverse order (using say `flex-row-reverse` or `flex-col-reverse`), use the `space-x-reverse` or `space-y-reverse` utilities to ensure the space is added to the correct side of each element:

```html
<!-- [!code classes:flex-row-reverse,space-x-4,space-x-reverse] -->
<div class="flex flex-row-reverse space-x-4 space-x-reverse ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
```

#### Limitations

The space utilities are really just a shortcut for adding margin to all-but-the-last-item in a group, and aren't designed to handle complex cases like grids, layouts that wrap, or situations where the children are rendered in a complex custom order rather than their natural DOM order.

For those situations, it's better to use the [gap utilities](/docs/gap) when possible, or add margin to every element with a matching negative margin on the parent.

Additionally, the space utilities are not designed to work together with the [divide utilities](/docs/border-width#between-children). For those situations, consider adding margin/padding utilities to the children instead.

### Using a custom value

### Responsive design

## Customizing your theme