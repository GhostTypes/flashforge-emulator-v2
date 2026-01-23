---
title: font-size
description: Utilities for controlling the font size of an element.
---

)", "font-size: var();"],
  ["text-[]", "font-size: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `text-sm` and `text-lg` to set the font size of an element:

```html
<!-- [!code classes:text-sm,text-base,text-lg,text-xl,text-2xl] -->
<p class="text-sm ...">The quick brown fox ...</p>
<p class="text-base ...">The quick brown fox ...</p>
<p class="text-lg ...">The quick brown fox ...</p>
<p class="text-xl ...">The quick brown fox ...</p>
<p class="text-2xl ...">The quick brown fox ...</p>
```

### Setting the line-height

Use utilities like `text-sm/6` and `text-lg/7` to set the font size and line-height of an element at the same time:

```html
<!-- [!code classes:text-sm/6,text-sm/7,text-sm/8] -->
<p class="text-sm/6 ...">So I started to walk into the water...</p>
<p class="text-sm/7 ...">So I started to walk into the water...</p>
<p class="text-sm/8 ...">So I started to walk into the water...</p>
```

### Using a custom value

### Responsive design

## Customizing your theme

You can also provide default `line-height`, `letter-spacing`, and `font-weight` values for a font size:

```css
@theme {
  --text-tiny: 0.625rem;
  --text-tiny--line-height: 1.5rem; /* [!code highlight] */
  --text-tiny--letter-spacing: 0.125rem; /* [!code highlight] */
  --text-tiny--font-weight: 500; /* [!code highlight] */
}
```