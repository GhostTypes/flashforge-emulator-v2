---
title: letter-spacing
description: Utilities for controlling the tracking, or letter spacing, of an element.
---

)", "letter-spacing: var();"],
  ["tracking-[]", "letter-spacing: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `tracking-tight` and `tracking-wide` to set the letter spacing of an element:

```html
<!-- [!code classes:tracking-tight,tracking-normal,tracking-wide] -->
<p class="tracking-tight ...">The quick brown fox ...</p>
<p class="tracking-normal ...">The quick brown fox ...</p>
<p class="tracking-wide ...">The quick brown fox ...</p>
```

### Using negative values

Using negative values doesn't make a ton of sense with the named letter spacing scale Tailwind includes out of the box, but if you've customized your scale to use numbers it can be useful:

```css
@theme {
  --tracking-1: 0em;
  --tracking-2: 0.025em;
  --tracking-3: 0.05em;
  --tracking-4: 0.1em;
}
```

To use a negative letter spacing value, prefix the class name with a dash to convert it to a negative value:

```html
<!-- [!code classes:-tracking-2] -->
<p class="-tracking-2">The quick brown fox ...</p>
```

### Using a custom value

### Responsive design

## Customizing your theme