---
title: "Aspect Ratio"
description: "Utilities for controlling the aspect ratio of an element."
---

```

```html

```

Tailwind doesn't include a large set of aspect ratio values out of the box since it's easier to just use arbitrary values. See the [arbitrary values](#arbitrary-values) section for more information.

### Browser support

The `aspect-*` utilities use the native `aspect-ratio` CSS property, which was not supported in Safari until version 15. Until Safari 15 is popularized, Tailwind's [aspect-ratio](https://github.com/tailwindlabs/tailwindcss-aspect-ratio) plugin is a good alternative.

---

## <Heading ignore>Applying conditionally</Heading>

### <Heading ignore>Hover, focus, and other states</Heading>

<HoverFocusAndOtherStates featuredClass="aspect-square">

```html

```

</HoverFocusAndOtherStates>

### <Heading ignore>Breakpoints and media queries</Heading>

<BreakpointsAndMediaQueries featuredClass="aspect-square">

```html

```

</BreakpointsAndMediaQueries>

---

## Using custom values

### Customizing your theme

By default, Tailwind provides a minimal set of `aspect-ratio` utilities. You can customize these values by editing `theme.aspectRatio` or `theme.extend.aspectRatio` in your `tailwind.config.js` file.

```diff-js }
  module.exports = ,
  }
  }
  }
```

Learn more about customizing the default theme in the [theme customization](/docs/theme#customizing-the-default-theme) documentation.

### Arbitrary values

<ArbitraryValues property="aspect-ratio">

```html

```