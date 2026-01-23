---
title: scroll-margin
description: Utilities for controlling the scroll offset around items in a snap container.
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

Use the `scroll-mt-<number>`, `scroll-mr-<number>`, `scroll-mb-<number>`, and `scroll-ml-<number>` utilities like `scroll-ml-4` and `scroll-mt-6` to set the scroll offset around items within a snap container:

```html
<!-- [!code classes:scroll-ml-6] -->
<div class="snap-x ...">
  <div class="snap-start scroll-ml-6 ...">
  <img src="/img/vacation-01.jpg"/>
  </div>
  <div class="snap-start scroll-ml-6 ...">
  <img src="/img/vacation-02.jpg"/>
  </div>
  <div class="snap-start scroll-ml-6 ...">
  <img src="/img/vacation-03.jpg"/>
  </div>
  <div class="snap-start scroll-ml-6 ...">
  <img src="/img/vacation-04.jpg"/>
  </div>
  <div class="snap-start scroll-ml-6 ...">
  <img src="/img/vacation-05.jpg"/>
  </div>
</div>
```

### Using negative values

To use a negative scroll margin value, prefix the class name with a dash to convert it to a negative value:

```html
<!-- [!code classes:-scroll-ml-6] -->
<div class="snap-start -scroll-ml-6 ...">
  <!-- ... -->
</div>
```

### Using logical properties

Use the `scroll-ms-<number>` and `scroll-me-<number>` utilities to set the `scroll-margin-inline-start` and `scroll-margin-inline-end` [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties/Basic_concepts), which map to either the left or right side based on the text direction:

```html
<!-- [!code classes:scroll-ms-6] -->
<!-- [!code word:dir="ltr"] -->
<!-- [!code word:dir="rtl"] -->
<div dir="ltr">
  <div class="snap-x ...">
  <div class="snap-start scroll-ms-6 ...">
  <img src="/img/vacation-01.jpg"/>
  </div>
  <!-- ... -->
  </div>
</div>

<div dir="rtl">
  <div class="snap-x ...">
  <div class="snap-start scroll-ms-6 ...">
  <img src="/img/vacation-01.jpg"/>
  </div>
  <!-- ... -->
  </div>
</div>
```

For more control, you can also use the [LTR and RTL modifiers](/docs/hover-focus-and-other-states#rtl-support) to conditionally apply specific styles depending on the current text direction.

### Using a custom value

### Responsive design

## Customizing your theme