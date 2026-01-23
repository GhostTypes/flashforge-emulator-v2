---
title: "Container"
description: "A component for fixing an element's width to the current breakpoint."
---

  >

  ()

  max-width: ;

  ))}

  ),
}

## Basic usage

### Using the container

The `container` class sets the `max-width` of an element to match the `min-width` of the current breakpoint. This is useful if you'd prefer to design for a fixed set of screen sizes instead of trying to accommodate a fully fluid viewport.

Note that unlike containers you might have used in other frameworks, **Tailwind's container does not center itself automatically and does not have any built-in horizontal padding.**

To center a container, use the `mx-auto` utility:

```html
<div class="container **mx-auto**">
  <!-- ... -->
</div>
```

To add horizontal padding, use the `px-*` utilities:

```html
<div class="container mx-auto **px-4**">
  <!-- ... -->
</div>
```

If you'd like to center your containers by default or include default horizontal padding, see the [customization options](#customizing) below.

---

## Applying conditionally

### Responsive variants

The `container` class also includes responsive variants like `md:container` by default that allow you to make something behave like a container at only a certain breakpoint and up:

```html
<!-- Full-width fluid until the `md` breakpoint, then lock to container -->
<div class="**md:container md:mx-auto**">
  <!-- ... -->
</div>
```

---

## Customizing

### Centering by default

To center containers by default, set the `center` option to `true` in the `theme.container` section of your config file:

```js {{ filename: 'tailwind.config.js' }}
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
  container: {
  center: true,
  },
  },
}
```

### Adding horizontal padding

To add horizontal padding by default, specify the amount of padding you'd like using the `padding` option in the `theme.container` section of your config file:

```js {{ filename: 'tailwind.config.js' }}
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
  container: {
  padding: '2rem',
  },
  },
}
```

If you want to specify a different padding amount for each breakpoint, use an object to provide a `default` value and any breakpoint-specific overrides:

```js {{ filename: 'tailwind.config.js' }}
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
  container: {
  padding: {
  DEFAULT: '1rem',
  sm: '2rem',
  lg: '4rem',
  xl: '5rem',
  '2xl': '6rem',
  },
  },
  },
};
```