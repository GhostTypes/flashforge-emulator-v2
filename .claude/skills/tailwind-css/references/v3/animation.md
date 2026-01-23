---
title: "Animation"
description: "Utilities for animating elements with CSS animations."
---

  animate-spin

  animate-ping

  animate-pulse

  animate-bounce

  ),
}

## Basic usage

### Spin

Add the `animate-spin` utility to add a linear spin animation to elements like loading indicators.

```html {{ example: true }}
<div class="flex items-center justify-center">
  <button type="button" class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed" disabled>
  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  Processing...
  </button>
</div>
```

```html
<button type="button" class="bg-indigo-500 ..." disabled>
  <svg class="**animate-spin** h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
  <!-- ... -->
  </svg>
  Processing...
</button>
```

### Ping

Add the `animate-ping` utility to make an element scale and fade like a radar ping or ripple of water — useful for things like notification badges.

```html {{ example: true }}
<div class="flex items-center justify-center">
  <span class="relative inline-flex">
  <button type="button" class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-sky-500 bg-white dark:bg-slate-800 transition ease-in-out duration-150 cursor-not-allowed ring-1 ring-slate-900/10 dark:ring-slate-200/20" disabled>
  Transactions
  </button>
  <span class="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
  <span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
  </span>
  </span>
</div>
```

```html
<span class="relative flex h-3 w-3">
  <span class="**animate-ping** absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
  <span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
</span>
```

### Pulse

Add the `animate-pulse` utility to make an element gently fade in and out — useful for things like skeleton loaders.

```html {{ example: true }}
<div class="flex items-center justify-center">
  <div class="bg-white dark:bg-slate-800 p-4 ring-1 ring-slate-900/5 rounded-lg shadow-lg max-w-xs w-full h-28">
  <div class="flex space-x-4 animate-pulse">
  <div class="rounded-full bg-slate-200 dark:bg-slate-700 h-10 w-10"></div>
  <div class="flex-1 space-y-6 py-1">
  <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
  <div class="space-y-3">
  <div class="grid grid-cols-3 gap-4">
  <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded col-span-2"></div>
  <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
  </div>
  <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
  </div>
  </div>
  </div>
  </div>
</div>
```

```html
<div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto">
  <div class="**animate-pulse** flex space-x-4">
  <div class="rounded-full bg-slate-200 h-10 w-10" dark-class="rounded-full bg-slate-700 h-10 w-10"></div>
  <div class="flex-1 space-y-6 py-1">
  <div class="h-2 bg-slate-200 rounded" dark-class="h-2 bg-slate-700 rounded"></div>
  <div class="space-y-3">
  <div class="grid grid-cols-3 gap-4">
  <div class="h-2 bg-slate-200 rounded col-span-2" dark-class="h-2 bg-slate-700 rounded col-span-2"></div>
  <div class="h-2 bg-slate-200 rounded col-span-1" dark-class="h-2 bg-slate-700 rounded col-span-1"></div>
  </div>
  <div class="h-2 bg-slate-200 rounded" dark-class="h-2 bg-slate-700 rounded"></div>
  </div>
  </div>
  </div>
</div>
```

### Bounce

Add the `animate-bounce` utility to make an element bounce up and down — useful for things like "scroll down" indicators.

```html {{ example: true }}
<div class="flex justify-center">
  <div class="animate-bounce bg-white dark:bg-slate-800 p-2 w-10 h-10 ring-1 ring-slate-900/5 dark:ring-slate-200/20 shadow-lg rounded-full flex items-center justify-center">
  <svg class="w-6 h-6 text-violet-500" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
  <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
  </svg>
  </div>
</div>
```

```html
<svg class="**animate-bounce** w-6 h-6 ...">
  <!-- ... -->
</svg>
```

### Prefers-reduced-motion

For situations where the user has specified that they prefer reduced motion, you can conditionally apply animations and transitions using the `motion-safe` and `motion-reduce` variants:

```html
<button type="button" class="bg-indigo-600 ..." disabled>
  <svg class="**motion-safe:animate-spin** h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
  <!-- ... -->
  </svg>
  Processing
</button>
```

---

## Applying conditionally

### Hover, focus, and other states

### Breakpoints and media queries

---

## Using custom values

### Customizing your theme

Animations by their very nature tend to be highly project-specific. **The animations we include by default are best thought of as helpful examples**, and you're encouraged to customize your animations to better suit your needs.

By default, Tailwind provides utilities for four different example animations, as well as the `animate-none` utility. You can customize these values by editing `theme.animation` or `theme.extend.animation` in your `tailwind.config.js` file.

```diff-js {{ filename: 'tailwind.config.js' }}
  module.exports = {
  theme: {
  extend: {
+  animation: {
+  'spin-slow': 'spin 3s linear infinite',
+  }
  }
  }
  }
```

To add new animation `@keyframes`, use the `keyframes` section of your theme configuration:

```diff-js {{ filename: 'tailwind.config.js' }}
  module.exports = {
  theme: {
  extend: {
+  keyframes: {
+  wiggle: {
+  '0%, 100%': { transform: 'rotate(-3deg)' },
+  '50%': { transform: 'rotate(3deg)' },
+  }
+  }
  }
  }
  }
```

You can then reference these keyframes by name in the `animation` section of your theme configuration:

```diff-js {{ filename: 'tailwind.config.js' }}
  module.exports = {
  theme: {
  extend: {
+  animation: {
+  wiggle: 'wiggle 1s ease-in-out infinite',
+  }
  }
  }
  }
```

Learn more about customizing the default theme in the [theme customization](/docs/theme#customizing-the-default-theme) documentation.

### Arbitrary values