---
title: transition-delay
description: Utilities for controlling the delay of CSS transitions.
---

", "transition-delay: ms;"],
  ["delay-()", "transition-delay: var();"],
  ["delay-[]", "transition-delay: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `delay-150` and `delay-700` to set the transition delay of an element in milliseconds:

```html
<!-- [!code classes:delay-150,delay-300,delay-700] -->
<button class="transition delay-150 duration-300 ease-in-out ...">Button A</button>
<button class="transition delay-300 duration-300 ease-in-out ...">Button B</button>
<button class="transition delay-700 duration-300 ease-in-out ...">Button C</button>
```

### Supporting reduced motion

For situations where the user has specified that they prefer reduced motion, you can conditionally apply animations and transitions using the `motion-safe` and `motion-reduce` variants:

```html
<!-- [!code classes:motion-reduce:delay-0] -->
<button type="button" class="delay-300 motion-reduce:delay-0 ...">
  <!-- ... -->
</button>
```

### Using a custom value

### Responsive design