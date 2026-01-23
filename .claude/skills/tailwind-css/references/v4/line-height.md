---
title: line-height
description: Utilities for controlling the leading, or line height, of an element.
---

/", "font-size: ;\nline-height: calc(var(--spacing) * );"],
  ["text-/()", "font-size: ;\nline-height: var();"],
  ["text-/[]", "font-size: ;\nline-height: ;"],
  ["leading-none", "line-height: 1;"],
  ["leading-", "line-height: calc(var(--spacing) * );"],
  ["leading-()", "line-height: var();"],
  ["leading-[]", "line-height: ;"],
  ]}
/>

## Examples

### Basic example

Use font size utilities like `text-sm/6` and `text-lg/7` to set the font size and line-height of an element at the same time:

```html
<!-- [!code classes:text-base/6,text-base/7,text-base/8] -->
<p class="text-base/6 ...">So I started to walk into the water...</p>
<p class="text-base/7 ...">So I started to walk into the water...</p>
<p class="text-base/8 ...">So I started to walk into the water...</p>
```

Each font size utility also sets a default line height when one isn't provided. You can learn more about these values and how to customize them in the [font-size documentation](/docs/font-size).

### Setting independently

Use `leading-<number>` utilities like `leading-6` and `leading-7` to set the line height of an element independent of the font-size:

```html
<!-- [!code classes:leading-6,leading-7,leading-8] -->
<p class="text-sm leading-6">So I started to walk into the water...</p>
<p class="text-sm leading-7">So I started to walk into the water...</p>
<p class="text-sm leading-8">So I started to walk into the water...</p>
```

### Removing the leading

Use the `leading-none` utility to set the line height of an element equal to its font size:

```html
<!-- [!code classes:leading-none] -->
<p class="text-2xl leading-none ...">The quick brown fox...</p>
```

### Using a custom value

### Responsive design

## Customizing your theme