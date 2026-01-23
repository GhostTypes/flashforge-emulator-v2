---
title: min-height
description: Utilities for setting the minimum height of an element.
---

", "min-height: calc(var(--spacing) * );"],
  ["min-h-", "min-height: calc( * 100%);"],
  ["min-h-px", "min-height: 1px;"],
  ["min-h-full", "min-height: 100%;"],
  ["min-h-screen", "min-height: 100vh;"],
  ["min-h-dvh", "min-height: 100dvh;"],
  ["min-h-dvw", "min-height: 100dvw;"],
  ["min-h-lvh", "min-height: 100lvh;"],
  ["min-h-lvw", "min-height: 100lvw;"],
  ["min-h-svw", "min-height: 100svw;"],
  ["min-h-svh", "min-height: 100svh;"],
  ["min-h-auto", "min-height: auto;"],
  ["min-h-min", "min-height: min-content;"],
  ["min-h-max", "min-height: max-content;"],
  ["min-h-fit", "min-height: fit-content;"],
  ["min-h-lh", "min-height: 1lh;"],
  ["min-h-()", "min-height: var();"],
  ["min-h-[]", "min-height: ;"],
  ]}
/>

## Examples

### Basic example

Use `min-h-<number>` utilities like `min-h-24` and `min-h-64` to set an element to a fixed minimum height based on the spacing scale:

```html
<!-- [!code classes:min-h-80,min-h-64,min-h-48,min-h-40,min-h-32,min-h-24,min-h-full] -->
<div class="h-20 ...">
  <div class="min-h-80 ...">min-h-80</div>
  <div class="min-h-64 ...">min-h-64</div>
  <div class="min-h-48 ...">min-h-48</div>
  <div class="min-h-40 ...">min-h-40</div>
  <div class="min-h-32 ...">min-h-32</div>
  <div class="min-h-24 ...">min-h-24</div>
</div>
```

### Using a percentage

Use `min-h-full` or `min-h-<fraction>` utilities like `min-h-1/2`, and `min-h-2/5` to give an element a percentage-based minimum height:

```html
<!-- [!code classes:min-h-9/10,min-h-3/4,min-h-1/2,min-h-1/3,min-h-full] -->
<div class="min-h-full ...">min-h-full</div>
<div class="min-h-9/10 ...">min-h-9/10</div>
<div class="min-h-3/4 ...">min-h-3/4</div>
<div class="min-h-1/2 ...">min-h-1/2</div>
<div class="min-h-1/3 ...">min-h-1/3</div>
```

### Using a custom value

### Responsive design

## Customizing your theme