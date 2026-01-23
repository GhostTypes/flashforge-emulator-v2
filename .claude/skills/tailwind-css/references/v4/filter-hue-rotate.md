---
title: filter: hue-rotate()
description: Utilities for applying hue-rotate filters to an element.
---

", "filter: hue-rotate(deg);"],
  ["-hue-rotate-", "filter: hue-rotate(calc(deg * -1));"],
  ["hue-rotate-()", "filter: hue-rotate(var());"],
  ["hue-rotate-[]", "filter: hue-rotate();"],
  ]}
/>

## Examples

### Basic example

Use utilities like `hue-rotate-90` and `hue-rotate-180` to rotate the hue of an element by degrees:

```html
<!-- [!code classes:hue-rotate-15,hue-rotate-90,hue-rotate-180,hue-rotate-270] -->
<img class="hue-rotate-15" src="/img/mountains.jpg" />
<img class="hue-rotate-90" src="/img/mountains.jpg" />
<img class="hue-rotate-180" src="/img/mountains.jpg" />
<img class="hue-rotate-270" src="/img/mountains.jpg" />
```

### Using negative values

Use utilities like `-hue-rotate-15` and `-hue-rotate-45` to set a negative hue rotate value:

```html
<!-- [!code classes:-hue-rotate-15,-hue-rotate-45,-hue-rotate-90] -->
<img class="-hue-rotate-15" src="/img/mountains.jpg" />
<img class="-hue-rotate-45" src="/img/mountains.jpg" />
<img class="-hue-rotate-90" src="/img/mountains.jpg" />
```

### Using a custom value

### Responsive design