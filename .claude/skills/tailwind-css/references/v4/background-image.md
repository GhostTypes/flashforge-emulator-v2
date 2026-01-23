---
title: background-image
description: Utilities for controlling an element's background image.
---

]", "background-image: ;"],
  ["bg-(image:)", "background-image: var();"],
  ["bg-none", "background-image: none;"],
  ["bg-linear-to-t", "background-image: linear-gradient(to top, var(--tw-gradient-stops));"],
  ["bg-linear-to-tr", "background-image: linear-gradient(to top right, var(--tw-gradient-stops));"],
  ["bg-linear-to-r", "background-image: linear-gradient(to right, var(--tw-gradient-stops));"],
  ["bg-linear-to-br", "background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));"],
  ["bg-linear-to-b", "background-image: linear-gradient(to bottom, var(--tw-gradient-stops));"],
  ["bg-linear-to-bl", "background-image: linear-gradient(to bottom left, var(--tw-gradient-stops));"],
  ["bg-linear-to-l", "background-image: linear-gradient(to left, var(--tw-gradient-stops));"],
  ["bg-linear-to-tl", "background-image: linear-gradient(to top left, var(--tw-gradient-stops));"],
  ["bg-linear-", "background-image: linear-gradient( in oklab, var(--tw-gradient-stops));"],
  ["-bg-linear-", "background-image: linear-gradient(- in oklab, var(--tw-gradient-stops));"],
  [
  "bg-linear-()",
  "background-image: linear-gradient(var(--tw-gradient-stops, var()));",
  ],
  ["bg-linear-[]", "background-image: linear-gradient(var(--tw-gradient-stops, ));"],
  ["bg-radial", "background-image: radial-gradient(in oklab, var(--tw-gradient-stops));"],
  [
  "bg-radial-()",
  "background-image: radial-gradient(var(--tw-gradient-stops,  var()));",
  ],
  ["bg-radial-[]", "background-image: radial-gradient(var(--tw-gradient-stops, ));"],
  ["bg-conic-", "background-image: conic-gradient(from  in oklab, var(--tw-gradient-stops));"],
  ["-bg-conic-", "background-image: conic-gradient(from - in oklab, var(--tw-gradient-stops));"],
  ["bg-conic-()", "background-image: var();"],
  ["bg-conic-[]", "background-image: ;"],
  ["from-", "--tw-gradient-from: ;"],
  ["from-", "--tw-gradient-from-position: ;"],
  ["from-()", "--tw-gradient-from: var();"],
  ["from-[]", "--tw-gradient-from: ;"],
  ["via-", "--tw-gradient-via: ;"],
  ["via-", "--tw-gradient-via-position: ;"],
  ["via-()", "--tw-gradient-via: var();"],
  ["via-[]", "--tw-gradient-via: ;"],
  ["to-", "--tw-gradient-to: ;"],
  ["to-", "--tw-gradient-to-position: ;"],
  ["to-()", "--tw-gradient-to: var();"],
  ["to-[]", "--tw-gradient-to: ;"],
  ]}
/>

## Examples

### Basic example

Use the `bg-[<value>]` syntax to set the background image of an element:

```html
<!-- [!code classes:bg-[url(/img/mountains.jpg)]] -->
<div class="bg-[url(/img/mountains.jpg)] ..."></div>
```

### Adding a linear gradient

Use utilities like `bg-linear-to-r` and `bg-linear-<angle>` with the [color stop utilities](#setting-gradient-color-stops) to add a linear gradient to an element:

```html
<!-- [!code classes:bg-linear-to-r,bg-linear-to-t,bg-linear-to-bl,bg-linear-65] -->
<div class="h-14 bg-linear-to-r from-cyan-500 to-blue-500"></div>
<div class="h-14 bg-linear-to-t from-sky-500 to-indigo-500"></div>
<div class="h-14 bg-linear-to-bl from-violet-500 to-fuchsia-500"></div>
<div class="h-14 bg-linear-65 from-purple-500 to-pink-500"></div>
```

### Adding a radial gradient

Use the `bg-radial` and `bg-radial-[<position>]` utilities with the [color stop utilities](#setting-gradient-color-stops) to add a radial gradient to an element:

```html
<!-- [!code classes:bg-radial-[at_50%_75%],bg-radial-[at_25%_25%],bg-radial] -->
<div class="size-18 rounded-full bg-radial from-pink-400 from-40% to-fuchsia-700"></div>
<div class="size-18 rounded-full bg-radial-[at_50%_75%] from-sky-200 via-blue-400 to-indigo-900 to-90%"></div>
<div class="size-18 rounded-full bg-radial-[at_25%_25%] from-white to-zinc-900 to-75%"></div>
```

### Adding a conic gradient

Use the `bg-conic` and `bg-conic-<angle>` utilities with the [color stop utilities](#setting-gradient-color-stops) to add a conic gradient to an element:

```html
<!-- [!code classes:bg-conic-180,bg-conic/decreasing,bg-conic] -->
<div class="size-24 rounded-full bg-conic from-blue-600 to-sky-400 to-50%"></div>
<div class="size-24 rounded-full bg-conic-180 from-indigo-600 via-indigo-50 to-indigo-600"></div>
<div class="size-24 rounded-full bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700"></div>
```

### Setting gradient color stops

Use utilities like `from-indigo-500`, `via-purple-500`, and `to-pink-500` to set the colors of the gradient stops:

```html
<!-- [!code classes:from-indigo-500,via-purple-500,to-pink-500] -->
<div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ..."></div>
```

### Setting gradient stop positions

Use utilities like `from-10%`, `via-30%`, and `to-90%` to set more precise positions for the gradient color stops:

```html
<!-- [!code classes:from-10%,via-30%,to-90%] -->
<div class="bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% ..."></div>
```

### Changing interpolation mode

Use the interpolation modifier to control the interpolation mode of a gradient:

```html
<!-- [!code word:/srgb] -->
<!-- [!code word:/hsl] -->
<!-- [!code word:/oklab] -->
<!-- [!code word:/oklch] -->
<!-- [!code word:/longer] -->
<!-- [!code word:/shorter] -->
<!-- [!code word:/increasing] -->
<!-- [!code word:/decreasing] -->
<div class="bg-linear-to-r/srgb from-indigo-500 to-teal-400"></div>
<div class="bg-linear-to-r/hsl from-indigo-500 to-teal-400"></div>
<div class="bg-linear-to-r/oklab from-indigo-500 to-teal-400"></div>
<div class="bg-linear-to-r/oklch from-indigo-500 to-teal-400"></div>
<div class="bg-linear-to-r/longer from-indigo-500 to-teal-400"></div>
<div class="bg-linear-to-r/shorter from-indigo-500 to-teal-400"></div>
<div class="bg-linear-to-r/increasing from-indigo-500 to-teal-400"></div>
<div class="bg-linear-to-r/decreasing from-indigo-500 to-teal-400"></div>
```

By default gradients are interpolated in the `oklab` color space.

### Removing background images

Use the `bg-none` utility to remove an existing background image from an element:

```html
<!-- [!code classes:bg-none] -->
<div class="bg-none"></div>
```

### Using a custom value

### Responsive design

## Customizing your theme