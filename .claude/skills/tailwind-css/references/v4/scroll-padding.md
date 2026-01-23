---
title: scroll-padding
description: Utilities for controlling an element's scroll offset within a snap container.
---

[
  [`${prefix}-<number>`, `${property}: calc(var(--spacing) * <number>);`],
  [`-${prefix}-<number>`, `${property}: calc(var(--spacing) * -<number>);`],
  [`${prefix}-(<custom-property>)`, `${property}: var(<custom-property>);`],
  [`${prefix}-[<value>]`, `${property}: <value>;`],
  ])}
/>

## Examples

### Basic example

Use the `scroll-pt-<number>`, `scroll-pr-<number>`, `scroll-pb-<number>`, and `scroll-pl-<number>` utilities like `scroll-pl-4` and `scroll-pt-6` to set the scroll offset of an element within a snap container:

```html
<!-- [!code classes:scroll-pl-6] -->
<div class="snap-x scroll-pl-6 ...">
  <div class="snap-start ...">
  <img src="/img/vacation-01.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-02.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-03.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-04.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-05.jpg" />
  </div>
</div>
```

### Using logical properties

Use the `scroll-ps-<number>` and `scroll-pe-<number>` utilities to set the `scroll-padding-inline-start` and `scroll-padding-inline-end` logical properties, which map to either the left or right side based on the text direction:

```html
<!-- [!code word:dir="ltr"] -->
<!-- [!code word:dir="rtl"] -->
<!-- [!code classes:scroll-ps-6] -->
<div dir="ltr">
  <div class="snap-x scroll-ps-6 ...">
  <!-- ... -->
  </div>
</div>

<div dir="rtl">
  <div class="snap-x scroll-ps-6 ...">
  <!-- ... -->
  </div>
</div>
```

### Using negative values

To use a negative scroll padding value, prefix the class name with a dash to convert it to a negative value:

```html
<!-- [!code classes:-scroll-ps-6] -->
<div class="-scroll-ps-6 snap-x ...">
  <!-- ... -->
</div>
```

### Using a custom value

### Responsive design

## Customizing your theme