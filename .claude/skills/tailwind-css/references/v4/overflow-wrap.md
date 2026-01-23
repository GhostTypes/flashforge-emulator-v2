---
title: overflow-wrap
description: Utilities for controlling line breaks within words in an overflowing element.
---

## Examples

### Wrapping mid-word

Use the `wrap-break-word` utility to allow line breaks between letters in a word if needed:

  pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung
  disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it
  is the same as silicosis.

  }

```html
<!-- [!code classes:wrap-break-word] -->
<p class="wrap-break-word">The longest word in any of the major...</p>
```

### Wrapping anywhere

The `wrap-anywhere` utility behaves similarly to `wrap-break-word`, except that the browser factors in mid-word line breaks when calculating the intrinsic size of the element:

```html
<!-- [!code classes:wrap-anywhere,wrap-break-word] -->
<div class="flex max-w-sm">
  <img class="size-16 rounded-full" src="/img/profile.jpg" />
  <div class="wrap-break-word">
  <p class="font-medium">Jay Riemenschneider</p>
  <p>jason.riemenschneider@vandelayindustries.com</p>
  </div>
</div>
<div class="flex max-w-sm">
  <img class="size-16 rounded-full" src="/img/profile.jpg" />
  <div class="wrap-anywhere">
  <p class="font-medium">Jay Riemenschneider</p>
  <p>jason.riemenschneider@vandelayindustries.com</p>
  </div>
</div>
```

This is useful for wrapping text inside of `flex` containers, where you would usually need to set `min-width: 0` on the child element to allow it to shrink below its content size.

### Wrapping normally

Use the `wrap-normal` utility to only allow line breaks at natural wrapping points, like spaces, hyphens, and punctuation:

  pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung
  disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it
  is the same as silicosis.

  }

```html
<!-- [!code classes:wrap-normal] -->
<p class="wrap-normal">The longest word in any of the major...</p>
```

### Responsive design