---
title: font-stretch
description: Utilities for selecting the width of a font face.
---

", "font-stretch: ;"],
  ["font-stretch-()", "font-stretch: var();"],
  ["font-stretch-[]", "font-stretch: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `font-stretch-condensed` and `font-stretch-expanded` to set the width of a font face:

```html
<!-- [!code classes:font-stretch-extra-condensed,font-stretch-condensed,font-stretch-normal,font-stretch-expanded,font-stretch-extra-expanded] -->
<p class="font-stretch-extra-condensed">The quick brown fox...</p>
<p class="font-stretch-condensed">The quick brown fox...</p>
<p class="font-stretch-normal">The quick brown fox...</p>
<p class="font-stretch-expanded">The quick brown fox...</p>
<p class="font-stretch-extra-expanded">The quick brown fox...</p>
```

This only applies to fonts that have multiple width variations available, otherwise the browser selects the closest match.

### Using percentages

Use `font-stretch-<percentage>` utilities like `font-stretch-50%` and `font-stretch-125%` to set the width of a font face using a percentage:

```html
<!-- [!code classes:font-stretch-50%,font-stretch-100%,font-stretch-150%] -->
<p class="font-stretch-50%">The quick brown fox...</p>
<p class="font-stretch-100%">The quick brown fox...</p>
<p class="font-stretch-150%">The quick brown fox...</p>
```

### Using a custom value

### Responsive design