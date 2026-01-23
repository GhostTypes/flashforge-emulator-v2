---
title: padding
description: Utilities for controlling an element's padding.
---

[
  [`${prefix}-<number>`, `${property}: calc(var(--spacing) * <number>);`],
  [`${prefix}-px`, `${property}: 1px;`],
  [`${prefix}-(<custom-property>)`, `${property}: var(<custom-property>);`],
  [`${prefix}-[<value>]`, `${property}: <value>;`],
  ])}
/>

## Examples

### Basic example

Use `p-<number>` utilities like `p-4` and `p-8` to control the padding on all sides of an element:

```html
<!-- [!code classes:p-8] -->
<div class="p-8 ...">p-8</div>
```

### Adding padding to one side

Use `pt-<number>`, `pr-<number>`, `pb-<number>`, and `pl-<number>` utilities like `pt-6` and `pr-4` to control the padding on one side of an element:

```html
<!-- [!code classes:pt-6,pr-4,pb-8,pl-2] -->
<div class="pt-6 ...">pt-6</div>
<div class="pr-4 ...">pr-4</div>
<div class="pb-8 ...">pb-8</div>
<div class="pl-2 ...">pl-2</div>
```

### Adding horizontal padding

Use `px-<number>` utilities like `px-4` and `px-8` to control the horizontal padding of an element:

```html
<!-- [!code classes:px-8] -->
<div class="px-8 ...">px-8</div>
```

### Adding vertical padding

Use `py-<number>` utilities like `py-4` and `py-8` to control the vertical padding of an element:

```html
<!-- [!code classes:py-8] -->
<div class="py-8 ...">py-8</div>
```

### Using logical properties

Use `ps-<number>` or `pe-<number>` utilities like `ps-4` and `pe-8` to set the `padding-inline-start` and `padding-inline-end` logical properties, which map to either the left or right side based on the text direction:

```html
<!-- [!code classes:ps-8,pe-8] -->
<!-- [!code word:dir="ltr"] -->
<!-- [!code word:dir="rtl"] -->
<div>
  <div dir="ltr">
  <div class="ps-8 ...">ps-8</div>
  <div class="pe-8 ...">pe-8</div>
  </div>
  <div dir="rtl">
  <div class="ps-8 ...">ps-8</div>
  <div class="pe-8 ...">pe-8</div>
  </div>
</div>
```

For more control, you can also use the [LTR and RTL modifiers](/docs/hover-focus-and-other-states#rtl-support) to conditionally apply specific styles depending on the current text direction.

### Using a custom value

### Responsive design

## Customizing your theme