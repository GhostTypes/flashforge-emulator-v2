---
title: rotate
description: Utilities for rotating elements.
---

[
  [`${prefix}-<number>`, `rotate: <number>deg;`],
  [`-${prefix}-<number>`, `rotate: calc(<number>deg * -1);`],
  [`${prefix}-(<custom-property>)`, `rotate: var(<custom-property>);`],
  [`${prefix}-[<value>]`, `rotate: <value>;`],
  ]),
  ...[
  ["rotate-x", (value) => `rotateX(${value}) var(--tw-rotate-y)`],
  ["rotate-y", (value) => `var(--tw-rotate-x) rotateY(${value})`],
  ["rotate-z", (value) => `var(--tw-rotate-x) var(--tw-rotate-y) rotateZ(${value})`],
  ].flatMap(([prefix, getTransform]) => [
  [`${prefix}-<number>`, `transform: ${getTransform("<number>deg")};`],
  [`-${prefix}-<number>`, `transform: ${getTransform("-<number>deg")};`],
  [`${prefix}-(<custom-property>)`, `transform: ${getTransform("var(<custom-property>)")};`],
  [`${prefix}-[<value>]`, `transform: ${getTransform("<value>")};`],
  ]),
  ]}
/>

## Examples

### Basic example

Use `rotate-<number>` utilities like `rotate-45` and `rotate-90` to rotate an element by degrees:

```html
<!-- [!code classes:rotate-45,rotate-90,rotate-210] -->
<img class="rotate-45 ..." src="/img/mountains.jpg" />
<img class="rotate-90 ..." src="/img/mountains.jpg" />
<img class="rotate-210 ..." src="/img/mountains.jpg" />
```

### Using negative values

Use `-rotate-<number>` utilities like `-rotate-45` and `-rotate-90` to rotate an element counterclockwise by degrees:

```html
<!-- [!code classes:-rotate-45,-rotate-90,-rotate-210] -->
<img class="-rotate-45 ..." src="/img/mountains.jpg" />
<img class="-rotate-90 ..." src="/img/mountains.jpg" />
<img class="-rotate-210 ..." src="/img/mountains.jpg" />
```

### Rotating in 3D space

Use `rotate-x-<number>`, `rotate-y-<number>`, and `rotate-z-<number>` utilities like `rotate-x-50`, `-rotate-y-30`, and `rotate-z-45` together to rotate an element in 3D space:

```html
<!-- [!code classes:rotate-y-25,rotate-z-30,rotate-x-15,-rotate-y-30,rotate-x-50 rotate-z-45] -->
<img class="rotate-x-50 rotate-z-45 ..." src="/img/mountains.jpg" />
<img class="rotate-x-15 -rotate-y-30 ..." src="/img/mountains.jpg" />
<img class="rotate-y-25 rotate-z-30 ..." src="/img/mountains.jpg" />
```

### Using a custom value

### Responsive design