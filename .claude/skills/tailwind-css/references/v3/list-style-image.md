---
title: "List Style Image"
description: "Utilities for controlling the marker images for list items."
---

  5 cups chopped Porcini mushrooms
  1/2 cup of olive oil
  3lb of celery

```

```html

  5 cups chopped Porcini mushrooms
  <!-- ... -->

```

---

## <Heading ignore>Applying conditionally</Heading>

### <Heading ignore>Hover, focus, and other states</Heading>

<HoverFocusAndOtherStates defaultClass="list-image-none" featuredClass="list-image-[url(checkmark.png)]" element="ul" />

### <Heading ignore>Breakpoints and media queries</Heading>

<BreakpointsAndMediaQueries defaultClass="list-image-none" featuredClass="list-image-[url(checkmark.png)]" element="ul" />

---

## Using custom values

### Customizing your theme

By default, Tailwind only provides the `list-image-none` utility. You can customize these values by editing `theme.listStyleImage` or `theme.extend.listStyleImage` in your `tailwind.config.js` file.

```diff-js }
  module.exports = ,
  }
  }
  }
```

Learn more about customizing the default theme in the [theme customization](/docs/theme#customizing-the-default-theme) documentation.

### Arbitrary values