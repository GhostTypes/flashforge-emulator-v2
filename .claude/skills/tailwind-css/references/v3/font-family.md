---
title: "Font Family"
description: "Utilities for controlling the font family of an element."
---

@tailwind components;
@tailwind utilities;

@layer base
}
```

Learn more about customizing the default theme in the [theme customization](/docs/theme#customizing-the-default-theme) documentation.

#### Providing default font settings

You can optionally provide default [font-feature-settings](https://developer.mozilla.org/en-US/docs/Web/CSS/font-feature-settings) and [font-variation-settings](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings) for each font in your project using a tuple of the form `[fontFamilies, { fontFeatureSettings, fontVariationSettings }]` when configuring custom fonts.

```diff-js }
  module.exports = ,
  ],
  },
  },
  }
```

### Arbitrary values

<ArbitraryValues property="font-family" featuredClass="font-['Open_Sans']" element="p" />

### Customizing the default font

For convenience, [Preflight](/docs/preflight) sets the font family on the `html` element to match your configured `sans` font, so one way to change the default font for your project is to customize the `sans` key in your `fontFamily` configuration:

```diff-js }
  const defaultTheme = require('tailwindcss/defaultTheme')

  module.exports = ,
  }
  }
  }
```

You can also customize the default font used in your project by [adding a custom base style](/docs/adding-custom-styles#adding-base-styles) that sets the `font-family` property explicitly:

```css }
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base
}
```

This is the best approach if you have customized your font family utilities to have different names and don't want there to be `font-sans` utility available in your project.