---
title: transition-property
description: Utilities for controlling which CSS properties transition.
---

)",
  dedent`
  transition-property: var(<custom-property>);
  transition-timing-function: var(--default-transition-timing-function); /* cubic-bezier(0.4, 0, 0.2, 1) */
  transition-duration: var(--default-transition-duration); /* 150ms */
  `,
  ],
  [
  "transition-[]",
  dedent`
  transition-property: <value>;
  transition-timing-function: var(--default-transition-timing-function); /* cubic-bezier(0.4, 0, 0.2, 1) */
  transition-duration: var(--default-transition-duration); /* 150ms */
  `,
  ],
  ]}
/>

## Examples

### Basic example

Use utilities like `transition` and `transition-colors` to specify which properties should transition when they change:

```html
<!-- [!code classes:transition] -->
<button class="bg-blue-500 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 ...">
  Save Changes
</button>
```

### Supporting reduced motion

For situations where the user has specified that they prefer reduced motion, you can conditionally apply animations and transitions using the `motion-safe` and `motion-reduce` variants:

```html
<!-- [!code classes:motion-reduce:transition-none,motion-reduce:hover:transform-none] -->
<!-- prettier-ignore -->
<button class="transform transition hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:transform-none ...">
  <!-- ... -->
</button>
```

### Using a custom value

### Responsive design