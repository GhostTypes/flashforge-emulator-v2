---
title: font-family
description: Utilities for controlling the font family of an element.
---

)", "font-family: var();"],
  ["font-[]", "font-family: ;"],
  ]}
/>

## Examples

### Basic example

Use utilities like `font-sans` and `font-mono` to set the font family of an element:

```html
<!-- [!code classes:font-sans,font-serif,font-mono] -->
<p class="font-sans ...">The quick brown fox ...</p>
<p class="font-serif ...">The quick brown fox ...</p>
<p class="font-mono ...">The quick brown fox ...</p>
```

### Using a custom value

### Responsive design

## Customizing your theme

You can also provide default `font-feature-settings` and `font-variation-settings` values for a font family:

```css
@theme {
  --font-display: "Oswald", sans-serif;
  --font-display--font-feature-settings: "cv02", "cv03", "cv04", "cv11"; /* [!code highlight] */
  --font-display--font-variation-settings: "opsz" 32; /* [!code highlight] */
}
```

If needed, use the [@font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) at-rule to load custom fonts:

```css
@font-face {
  font-family: Oswald;
  font-style: normal;
  font-weight: 200 700;
  font-display: swap;
  src: url("/fonts/Oswald.woff2") format("woff2");
}
```

If you're loading a font from a service like [Google Fonts](https://fonts.google.com/), make sure to put the `@import` at the very top of your CSS file:

```css
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap"); /* [!code highlight] */
@import "tailwindcss";

@theme {
  --font-roboto: "Roboto", sans-serif; /* [!code highlight] */
}
```

Browsers require that `@import` statements come before any other rules, so URL imports need to be above imports like `@import "tailwindcss"` which are inlined in the compiled CSS.