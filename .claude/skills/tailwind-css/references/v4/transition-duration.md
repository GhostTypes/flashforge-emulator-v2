---
title: transition-duration
description: Utilities for controlling the duration of CSS transitions.
---

", "transition-duration: ms;"],
  ["duration-initial", "transition-duration: initial;"],
  ["duration-()", "transition-duration: var();"],
  ["duration-[]", "transition-duration: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `duration-150` and `duration-700` to set the transition duration of an element in milliseconds:

```html
<!-- [!code classes:duration-150,duration-300,duration-700] -->
<button class="transition duration-150 ease-in-out ...">Button A</button>
<button class="transition duration-300 ease-in-out ...">Button B</button>
<button class="transition duration-700 ease-in-out ...">Button C</button>
```

### Supporting reduced motion

For situations where the user has specified that they prefer reduced motion, you can conditionally apply animations and transitions using the `motion-safe` and `motion-reduce` variants:

```html
<!-- [!code classes:motion-reduce:duration-0] -->
<button type="button" class="duration-300 motion-reduce:duration-0 ...">
  <!-- ... -->
</button>
```

### Using a custom value

### Responsive design