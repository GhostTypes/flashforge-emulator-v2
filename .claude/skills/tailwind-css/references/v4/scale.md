---
title: scale
description: Utilities for scaling elements.
---

[
  [`${prefix}-<number>`, `scale: <number>% <number>%;`],
  [`-${prefix}-<number>`, `scale: calc(<number>% * -1) calc(<number>% * -1);`],
  [`${prefix}-(<custom-property>)`, `scale: var(<custom-property>) var(<custom-property>);`],
  [`${prefix}-[<value>]`, `scale: <value>;`],
  ]),
  ...[
  ["scale-x", (value) => `${value} var(--tw-scale-y)`],
  ["scale-y", (value) => `var(--tw-scale-x) ${value}`],
  ["scale-z", (value) => `var(--tw-scale-x) var(--tw-scale-y) ${value}`],
  ].flatMap(([prefix, getScale]) => [
  [`${prefix}-<number>`, `scale: ${getScale("<number>%")};`],
  [`-${prefix}-<number>`, `scale: ${getScale("calc(<number>% * -1)")};`],
  [`${prefix}-(<custom-property>)`, `scale: ${getScale("var(<custom-property>)")};`],
  [`${prefix}-[<value>]`, `scale: ${getScale("<value>")};`],
  ]),
  ["scale-3d", "scale: var(--tw-scale-x) var(--tw-scale-y) var(--tw-scale-z);"],
  ]}
/>

## Examples

### Basic example

Use `scale-<number>` utilities like `scale-75` and `scale-150` to scale an element by a percentage of its original size:

```html
<!-- [!code classes:scale-75,scale-100,scale-125] -->
<img class="scale-75 ..." src="/img/mountains.jpg" />
<img class="scale-100 ..." src="/img/mountains.jpg" />
<img class="scale-125 ..." src="/img/mountains.jpg" />
```

### Scaling on the x-axis

Use the `scale-x-<number>` utilities like `scale-x-75` and `-scale-x-150` to scale an element on the x-axis by a percentage of its original width:

```html
<!-- [!code classes:scale-x-75,scale-x-100,scale-x-125] -->
<img class="scale-x-75 ..." src="/img/mountains.jpg" />
<img class="scale-x-100 ..." src="/img/mountains.jpg" />
<img class="scale-x-125 ..." src="/img/mountains.jpg" />
```

### Scaling on the y-axis

Use the `scale-y-<number>` utilities like `scale-y-75` and `scale-y-150` to scale an element on the y-axis by a percentage of its original height:

```html
<!-- [!code classes:scale-y-75,scale-y-100,scale-y-125] -->
<img class="scale-y-75 ..." src="/img/mountains.jpg" />
<img class="scale-y-100 ..." src="/img/mountains.jpg" />
<img class="scale-y-125 ..." src="/img/mountains.jpg" />
```

### Using negative values

Use `-scale-<number>`, `-scale-x-<number>` or `-scale-y-<number>` utilities like `-scale-x-75` and `-scale-125` to mirror and scale down an element by a percentage of its original size:

```html
<!-- [!code classes:-scale-x-75,-scale-100,-scale-y-125] -->
<img class="-scale-x-75 ..." src="/img/mountains.jpg" />
<img class="-scale-100 ..." src="/img/mountains.jpg" />
<img class="-scale-y-125 ..." src="/img/mountains.jpg" />
```

### Using a custom value

### Applying on hover