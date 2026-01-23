---
title: height
description: Utilities for setting the height of an element.
---

", "height: calc(var(--spacing) * );"],
  ["h-", "height: calc( * 100%);"],
  ["h-auto", "height: auto;"],
  ["h-px", "height: 1px;"],
  ["h-full", "height: 100%;"],
  ["h-screen", "height: 100vh;"],
  ["h-dvh", "height: 100dvh;"],
  ["h-dvw", "height: 100dvw;"],
  ["h-lvh", "height: 100lvh;"],
  ["h-lvw", "height: 100lvw;"],
  ["h-svh", "height: 100svh;"],
  ["h-svw", "height: 100svw;"],
  ["h-min", "height: min-content;"],
  ["h-max", "height: max-content;"],
  ["h-fit", "height: fit-content;"],
  ["h-lh", "height: 1lh;"],
  ["h-()", "height: var();"],
  ["h-[]", "height: ;"],
  ["size-", "width: calc(var(--spacing) * );\nheight: calc(var(--spacing) * );"],
  ["size-", "width: calc( * 100%);\nheight: calc( * 100%);"],
  ["size-auto", "width: auto;\nheight: auto;"],
  ["size-px", "width: 1px;\nheight: 1px;"],
  ["size-full", "width: 100%;\nheight: 100%;"],
  ["size-dvw", "width: 100dvw;\nheight: 100dvw;"],
  ["size-dvh", "width: 100dvh;\nheight: 100dvh;"],
  ["size-lvw", "width: 100lvw;\nheight: 100lvw;"],
  ["size-lvh", "width: 100lvh;\nheight: 100lvh;"],
  ["size-svw", "width: 100svw;\nheight: 100svw;"],
  ["size-svh", "width: 100svh;\nheight: 100svh;"],
  ["size-min", "width: min-content;\nheight: min-content;"],
  ["size-max", "width: max-content;\nheight: max-content;"],
  ["size-fit", "width: fit-content;\nheight: fit-content;"],
  ["size-()", "width: var();\nheight: var();"],
  ["size-[]", "width: ;\nheight: ;"],
  ]}
/>

## Examples

### Basic example

Use `h-<number>` utilities like `h-24` and `h-64` to set an element to a fixed height based on the spacing scale:

```html
<!-- [!code classes:h-96,h-80,h-64,h-48,h-40,h-32,h-24] -->
<div class="h-96 ...">h-96</div>
<div class="h-80 ...">h-80</div>
<div class="h-64 ...">h-64</div>
<div class="h-48 ...">h-48</div>
<div class="h-40 ...">h-40</div>
<div class="h-32 ...">h-32</div>
<div class="h-24 ...">h-24</div>
```

### Using a percentage

Use `h-full` or `h-<fraction>` utilities like `h-1/2` and `h-2/5` to give an element a percentage-based height:

```html
<!-- [!code classes:h-9/10,h-3/4,h-1/2,h-1/3,h-full] -->
<div class="h-full ...">h-full</div>
<div class="h-9/10 ...">h-9/10</div>
<div class="h-3/4 ...">h-3/4</div>
<div class="h-1/2 ...">h-1/2</div>
<div class="h-1/3 ...">h-1/3</div>
```

### Matching viewport

Use the `h-screen` utility to make an element span the entire height of the viewport:

```html
<!-- [!code classes:h-screen] -->
<div class="h-screen">
  <!-- ... -->
</div>
```

### Matching dynamic viewport

Use the `h-dvh` utility to make an element span the entire height of the viewport, which changes as the browser UI expands or contracts:

  {}

```html
<!-- [!code classes:h-dvh] -->
<div class="h-dvh">
  <!-- ... -->
</div>
```

### Matching large viewport

Use the `h-lvh` utility to set an element's height to the largest possible height of the viewport:

  {}

```html
<!-- [!code classes:h-lvh] -->
<div class="h-lvh">
  <!-- ... -->
</div>
```

### Matching small viewport

Use the `h-svh` utility to set an element's height to the smallest possible height of the viewport:

  {}

```html
<!-- [!code classes:h-svh] -->
<div class="h-svh">
  <!-- ... -->
</div>
```

### Setting both width and height

Use utilities like `size-px`, `size-4`, and `size-full` to set both the width and height of an element at the same time:

```html
<!-- [!code classes:size-16,size-20,size-24,size-32,size-40] -->
<div class="size-16 ...">size-16</div>
<div class="size-20 ...">size-20</div>
<div class="size-24 ...">size-24</div>
<div class="size-32 ...">size-32</div>
<div class="size-40 ...">size-40</div>
```

### Using a custom value

### Responsive design

## Customizing your theme