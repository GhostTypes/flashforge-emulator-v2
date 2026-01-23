---
title: aspect-ratio
description: Utilities for controlling the aspect ratio of an element.
---

", "aspect-ratio: ;"],
  ["aspect-square", "aspect-ratio: 1 / 1;"],
  ["aspect-video", "aspect-ratio: var(--aspect-video); /* 16 / 9 */"],
  ["aspect-auto", "aspect-ratio: auto;"],
  ["aspect-()", "aspect-ratio: var();"],
  ["aspect-[]", "aspect-ratio: ;"],
  ]}
/>

## Examples

### Basic example

Use aspect-&lt;ratio&gt; utilities like `aspect-3/2` to give an element a specific aspect ratio:

```html
<!-- [!code classes:aspect-3/2] -->
<img class="aspect-3/2 object-cover ..." src="/img/villas.jpg" />
```

### Using a video aspect ratio

Use the `aspect-video` utility to give a video element a 16 / 9 aspect ratio:

```html
<!-- [!code classes:aspect-video] -->
<iframe class="aspect-video ..." src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
```

### Using a custom value

### Responsive design

## Customizing your theme