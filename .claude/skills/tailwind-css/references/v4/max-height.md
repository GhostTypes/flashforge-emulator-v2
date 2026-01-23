---
title: max-height
description: Utilities for setting the maximum height of an element.
---

", "max-height: calc(var(--spacing) * );"],
  ["max-h-", "max-height: calc( * 100%);"],
  ["max-h-none", "max-height: none;"],
  ["max-h-px", "max-height: 1px;"],
  ["max-h-full", "max-height: 100%;"],
  ["max-h-screen", "max-height: 100vh;"],
  ["max-h-dvh", "max-height: 100dvh;"],
  ["max-h-dvw", "max-height: 100dvw;"],
  ["max-h-lvh", "max-height: 100lvh;"],
  ["max-h-lvw", "max-height: 100lvw;"],
  ["max-h-svh", "max-height: 100svh;"],
  ["max-h-svw", "max-height: 100svw;"],
  ["max-h-min", "max-height: min-content;"],
  ["max-h-max", "max-height: max-content;"],
  ["max-h-fit", "max-height: fit-content;"],
  ["max-h-lh", "max-height: 1lh;"],
  ["max-h-()", "max-height: var();"],
  ["max-h-[]", "max-height: ;"],
  ]}
/>

## Examples

### Basic example

Use `max-h-<number>` utilities like `max-h-24` and `max-h-64` to set an element to a fixed maximum height based on the spacing scale:

```html
<!-- [!code classes:max-h-80,max-h-64,max-h-48,max-h-40,max-h-32,max-h-24,max-h-full] -->
<div class="h-96 ...">
  <div class="h-full max-h-80 ...">max-h-80</div>
  <div class="h-full max-h-64 ...">max-h-64</div>
  <div class="h-full max-h-48 ...">max-h-48</div>
  <div class="h-full max-h-40 ...">max-h-40</div>
  <div class="h-full max-h-32 ...">max-h-32</div>
  <div class="h-full max-h-24 ...">max-h-24</div>
</div>
```

### Using a percentage

Use `max-h-full` or `max-h-<fraction>` utilities like `max-h-1/2` and `max-h-2/5` to give an element a percentage-based maximum height:

```html
<!-- [!code classes:max-h-9/10,max-h-3/4,max-h-1/2,max-h-1/4,max-h-full] -->
<div class="h-96 ...">
  <div class="h-full max-h-9/10 ...">max-h-9/10</div>
  <div class="h-full max-h-3/4 ...">max-h-3/4</div>
  <div class="h-full max-h-1/2 ...">max-h-1/2</div>
  <div class="h-full max-h-1/4 ...">max-h-1/4</div>
  <div class="h-full max-h-full ...">max-h-full</div>
</div>
```

### Using a custom value

### Responsive design

## Customizing your theme