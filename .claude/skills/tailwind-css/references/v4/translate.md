---
title: translate
description: Utilities for translating elements.
---

),
  [`translate-z-<number>`, `translate: var(--tw-translate-x) var(--tw-translate-y) calc(var(--spacing) * <number>);`],
  [
  `-translate-z-<number>`,
  `translate: var(--tw-translate-x) var(--tw-translate-y) calc(var(--spacing) * -<number>);`,
  ],
  [`translate-z-px`, `translate: var(--tw-translate-x) var(--tw-translate-y) 1px;`],
  [`-translate-z-px`, `translate: var(--tw-translate-x) var(--tw-translate-y) -1px;`],
  [
  `translate-z-(<custom-property>)`,
  `translate: var(--tw-translate-x) var(--tw-translate-y) var(<custom-property>);`,
  ],
  [`translate-z-[<value>]`, `translate: var(--tw-translate-x) var(--tw-translate-y) <value>;`],
  ["translate-none", "translate: none;"],
  ]}
/>

## Examples

### Using the spacing scale

Use `translate-<number>` utilities like `translate-2` and `-translate-4` to translate an element on both axes based on the spacing scale:

```html
<!-- [!code classes:-translate-6,translate-2,translate-8] -->
<img class="-translate-6 ..." src="/img/mountains.jpg" />
<img class="translate-2 ..." src="/img/mountains.jpg" />
<img class="translate-8 ..." src="/img/mountains.jpg" />
```

### Using a percentage

Use `translate-<fraction>` utilities like `translate-1/4` and `-translate-full` to translate an element on both axes by a percentage of the element's size:

```html
<!-- [!code classes:-translate-1/4,translate-1/6,translate-1/2] -->
<img class="-translate-1/4 ..." src="/img/mountains.jpg" />
<img class="translate-1/6 ..." src="/img/mountains.jpg" />
<img class="translate-1/2 ..." src="/img/mountains.jpg" />
```

### Translating on the x-axis

Use `translate-x-<number>` or `translate-x-<fraction>` utilities like `translate-x-4` and `translate-x-1/4` to translate an element on the x-axis:

```html
<!-- [!code classes:-translate-x-4,translate-x-2,translate-x-1/2] -->
<img class="-translate-x-4 ..." src="/img/mountains.jpg" />
<img class="translate-x-2 ..." src="/img/mountains.jpg" />
<img class="translate-x-1/2 ..." src="/img/mountains.jpg" />
```

### Translating on the y-axis

Use `translate-y-<number>` or `translate-y-<fraction>` utilities like `translate-y-6` and `translate-y-1/3` to translate an element on the y-axis:

```html
<!-- [!code classes:-translate-y-4,translate-y-2,translate-y-1/2] -->
<img class="-translate-y-4 ..." src="/img/mountains.jpg" />
<img class="translate-y-2 ..." src="/img/mountains.jpg" />
<img class="translate-y-1/2 ..." src="/img/mountains.jpg" />
```

### Translating on the z-axis

Use `translate-z-<number>` utilities like `translate-z-6` and `-translate-z-12` to translate an element on the z-axis:

```html
<!-- [!code classes:transform-3d,-translate-z-8,translate-z-2,translate-z-1/2] -->
<div class="transform-3d">
  <img class="-translate-z-8 rotate-x-50 rotate-z-45 ..." src="/img/mountains.jpg" />
  <img class="translate-z-2 rotate-x-50 rotate-z-45 ..." src="/img/mountains.jpg" />
  <img class="translate-z-1/2 rotate-x-50 rotate-z-45 ..." src="/img/mountains.jpg" />
</div>
```

Note that the `translate-z-<number>` utilities require the `transform-3d` utility to be applied to the parent element.

### Using a custom value

### Responsive design