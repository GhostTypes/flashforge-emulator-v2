---
title: text-decoration-color
description: Utilities for controlling the color of text decorations.
---

import  from "@/components/content.tsx";

 [
  `decoration-${name}`,
  `text-decoration-color: var(--color-${name}); /* ${value} */`,
  ]),
  ["decoration-()", "text-decoration-color: var();"],
  ["decoration-[]", "text-decoration-color: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `decoration-sky-500` and `decoration-pink-500` to change the [text decoration](/docs/text-decoration-line) color of an element:

  My Company, Inc

  . Outside of work, I like to

  watch pod-racing

  and have

  light-saber

  fights.

  }

```html
<!-- [!code classes:decoration-sky-500,decoration-pink-500,decoration-indigo-500] -->
<!-- prettier-ignore -->
<p>
  I’m Derek, an astro-engineer based in Tattooine. I like to build X-Wings
  at <a class="underline decoration-sky-500">My Company, Inc</a>. Outside
  of work, I like to <a class="underline decoration-pink-500">watch pod-racing</a>
  and have <a class="underline decoration-indigo-500">light-saber</a> fights.
</p>
```

### Changing the opacity

Use the color opacity modifier to control the text decoration color opacity of an element:

  My Company, Inc

  . Outside of work, I like to

  watch pod-racing

  and have

  light-saber

  fights.

  }

```html
<!-- [!code word:\/30] -->
<!-- prettier-ignore -->
<p>
  I’m Derek, an astro-engineer based in Tattooine. I like to build X-Wings
  at <a class="underline decoration-sky-500/30">My Company, Inc</a>. Outside
  of work, I like to <a class="underline decoration-pink-500/30">watch pod-racing</a>
  and have <a class="underline decoration-indigo-500/30">light-saber</a> fights.
</p>
```

### Using a custom value

### Applying on hover

  quick brown fox

  jumps over the lazy dog.

  }

```html
<!-- [!code classes:hover:decoration-pink-500] -->
<p>The <a href="..." class="underline hover:decoration-pink-500 ...">quick brown fox</a> jumps over the lazy dog.</p>
```

### Responsive design

## Customizing your theme