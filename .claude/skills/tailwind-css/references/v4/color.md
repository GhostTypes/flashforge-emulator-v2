---
title: color
description: Utilities for controlling the text color of an element.
---

import  from "@/components/content.tsx";

 [`text-${name}`, `color: var(--color-${name}); /* ${value} */`]),
  ["text-()", "color: var();"],
  ["text-[]", "color: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `text-blue-600` and `text-sky-400` to control the text color of an element:

```html
<!-- [!code classes:text-blue-600,dark:text-sky-400] -->
<p class="text-blue-600 dark:text-sky-400">The quick brown fox...</p>
```

### Changing the opacity

Use the color opacity modifier to control the text color opacity of an element:

```html
<!-- [!code word:\/100] -->
<!-- [!code word:\/75] -->
<!-- [!code word:\/50] -->
<!-- [!code word:\/25] -->
<p class="text-blue-600/100 dark:text-sky-400/100">The quick brown fox...</p>
<p class="text-blue-600/75 dark:text-sky-400/75">The quick brown fox...</p>
<p class="text-blue-600/50 dark:text-sky-400/50">The quick brown fox...</p>
<p class="text-blue-600/25 dark:text-sky-400/25">The quick brown fox...</p>
```

### Using a custom value

### Applying on hover

  internet

  , I'm late on everything!

  }

```html
<!-- [!code classes:hover:text-blue-600,dark:hover:text-blue-400] -->
<!-- prettier-ignore -->
<p class="...">
  Oh I gotta get on that
  <a class="underline hover:text-blue-600 dark:hover:text-blue-400" href="https://en.wikipedia.org/wiki/Internet">internet</a>,
  I'm late on everything!
</p>
```

### Responsive design

## Customizing your theme