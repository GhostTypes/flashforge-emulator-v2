---
title: border-radius
description: Utilities for controlling the border radius of an element.
---

[
  [`${className}-xs`, properties.map((property) => `${property}: var(--radius-xs); /* 0.125rem (2px) */`).join("\n")],
  [`${className}-sm`, properties.map((property) => `${property}: var(--radius-sm); /* 0.25rem (4px) */`).join("\n")],
  [`${className}-md`, properties.map((property) => `${property}: var(--radius-md); /* 0.375rem (6px) */`).join("\n")],
  [`${className}-lg`, properties.map((property) => `${property}: var(--radius-lg); /* 0.5rem (8px) */`).join("\n")],
  [`${className}-xl`, properties.map((property) => `${property}: var(--radius-xl); /* 0.75rem (12px) */`).join("\n")],
  [`${className}-2xl`, properties.map((property) => `${property}: var(--radius-2xl); /* 1rem (16px) */`).join("\n")],
  [
  `${className}-3xl`,
  properties.map((property) => `${property}: var(--radius-3xl); /* 1.5rem (24px) */`).join("\n"),
  ],
  [`${className}-4xl`, properties.map((property) => `${property}: var(--radius-4xl); /* 2rem (32px) */`).join("\n")],
  [`${className}-none`, properties.map((property) => `${property}: 0;`).join("\n")],
  [`${className}-full`, properties.map((property) => `${property}: calc(infinity * 1px);`).join("\n")],
  [
  `${className}-(<custom-property>)`,
  properties.map((property) => `${property}: var(<custom-property>);`).join("\n"),
  ],
  [`${className}-[<value>]`, properties.map((property) => `${property}: <value>;`).join("\n")],
  ])}
/>

## Examples

### Basic example

Use utilities like `rounded-sm` and `rounded-md` to apply different border radius sizes to an element:

```html
<!-- [!code classes:rounded-sm,rounded-md,rounded-lg,rounded-xl] -->
<div class="rounded-sm ..."></div>
<div class="rounded-md ..."></div>
<div class="rounded-lg ..."></div>
<div class="rounded-xl ..."></div>
```

### Rounding sides separately

Use utilities like `rounded-t-md` and `rounded-r-lg` to only round one side of an element:

```html
<!-- [!code classes:rounded-t-lg,rounded-r-lg,rounded-b-lg,rounded-l-lg] -->
<div class="rounded-t-lg ..."></div>
<div class="rounded-r-lg ..."></div>
<div class="rounded-b-lg ..."></div>
<div class="rounded-l-lg ..."></div>
```

### Rounding corners separately

Use utilities like `rounded-tr-md` and `rounded-tl-lg` utilities to only round one corner of an element:

```html
<!-- [!code classes:rounded-tl-lg,rounded-tr-lg,rounded-br-lg,rounded-bl-lg] -->
<div class="rounded-tl-lg ..."></div>
<div class="rounded-tr-lg ..."></div>
<div class="rounded-br-lg ..."></div>
<div class="rounded-bl-lg ..."></div>
```

### Using logical properties

Use utilities like `rounded-s-md` and `rounded-se-xl` to set the border radius using [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties/Basic_concepts), which map to the appropriate corners based on the text direction:

```html
<!-- [!code classes:rounded-s-lg] -->
<!-- [!code word:dir="ltr"] -->
<!-- [!code word:dir="rtl"] -->
<div dir="ltr">
  <div class="rounded-s-lg ..."></div>
</div>

<div dir="rtl">
  <div class="rounded-s-lg ..."></div>
</div>
```

Here are all the available border radius logical property utilities and their physical property equivalents in both LTR and RTL modes.

For more control, you can also use the [LTR and RTL modifiers](/docs/hover-focus-and-other-states#rtl-support) to conditionally apply specific styles depending on the current text direction.

### Creating pill buttons

Use the `rounded-full` utility to create pill buttons:

```html
<!-- [!code classes:rounded-full] -->
<button class="rounded-full ...">Save Changes</button>
```

### Removing the border radius

Use the `rounded-none` utility to remove an existing border radius from an element:

```html
<!-- [!code classes:rounded-none] -->
<button class="rounded-none ...">Save Changes</button>
```

### Using a custom value

### Responsive design

## Customizing your theme