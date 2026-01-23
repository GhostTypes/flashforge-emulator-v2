---
title: hyphens
description: Utilities for controlling how words should be hyphenated.
---

## Examples

### Preventing hyphenation

Use the `hyphens-none` utility to prevent words from being hyphenated even if the line break suggestion `&shy;` is used:

  Kraftfahrzeug&shy;haftpflichtversicherung

  is a 36 letter word for motor vehicle liability insurance.

  }

```html
<!-- [!code classes:hyphens-none] -->
<!-- [!code word:&shy;] -->
<!-- prettier-ignore -->
<p class="hyphens-none">
  ... Kraftfahrzeug&shy;haftpflichtversicherung is a ...
</p>
```

### Manual hyphenation

Use the `hyphens-manual` utility to only set hyphenation points where the line break suggestion `&shy;` is used:

  Kraftfahrzeug&shy;haftpflichtversicherung

  is a 36 letter word for motor vehicle liability insurance.

  }

```html
<!-- [!code classes:hyphens-manual] -->
<!-- [!code word:&shy;] -->
<!-- prettier-ignore -->
<p class="hyphens-manual">
  ... Kraftfahrzeug&shy;haftpflichtversicherung is a ...
</p>
```

This is the default browser behavior.

### Automatic hyphenation

Use the `hyphens-auto` utility to allow the browser to automatically choose hyphenation points based on the language:

  Kraftfahrzeughaftpflichtversicherung

  is a 36 letter word for motor vehicle liability insurance.

  }

```html
<!-- [!code classes:hyphens-auto] -->
<!-- [!code word:lang="de"] -->
<!-- prettier-ignore -->
<p class="hyphens-auto" lang="de">
  ... Kraftfahrzeughaftpflichtversicherung is a ...
</p>
```

The line break suggestion `&shy;` will be preferred over automatic hyphenation points.

### Responsive design