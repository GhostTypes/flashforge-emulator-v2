---
title: "Hyphens"
description: "Utilities for controlling how words should be hyphenated."
---

Use `hyphens-none` to prevent words from being hyphenated even if the line break suggestion `&shy;` is used:

```html {{ example: { p: 'none' } }}
<div class="overflow-x-scroll sm:overflow-x-visible px-4">
  <div class="mx-auto max-w-xs bg-white shadow-xl p-12 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
  <p class="hyphens-none">Officially recognized by the Duden dictionary as the longest word in German, <span class="text-slate-900 font-medium dark:text-slate-200" lang="de"> Kraftfahrzeug&shy;haftpflichtversicherung</span> is a 36 letter word for motor vehicle liability insurance.</p>
  </div>
</div>
```

```html
<p class="**hyphens-none** ...">
  ... Kraftfahrzeug**&shy;**haftpflichtversicherung is a ...
</p>
```

### Manual

Use `hyphens-manual` to only set hyphenation points where the line break suggestion `&shy;` is used:

```html {{ example: { p: 'none' } }}
<div class="overflow-x-scroll sm:overflow-x-visible px-4">
  <div class="mx-auto max-w-xs bg-white shadow-xl p-12 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
  <p class="hyphens-manual">Officially recognized by the Duden dictionary as the longest word in German, <span class="text-slate-900 font-medium dark:text-slate-200" lang="de"> Kraftfahrzeug&shy;haftpflichtversicherung</span> is a 36 letter word for motor vehicle liability insurance.</p>
  </div>
</div>
```

```html
<p class="**hyphens-manual** ...">
  ... Kraftfahrzeug**&shy;**haftpflichtversicherung is a ...
</p>
```

### Auto

Use `hyphens-auto` to allow the browser to automatically choose hyphenation points based on the language. The line break suggestion `&shy;` will be preferred over automatic hyphenation points.

```html {{ example: { p: 'none' } }}
<div class="overflow-x-scroll sm:overflow-x-visible px-4">
  <div class="mx-auto max-w-xs bg-white shadow-xl p-12 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
  <p class="hyphens-auto">Officially recognized by the Duden dictionary as the longest word in German, <span class="text-slate-900 font-medium dark:text-slate-200" lang="de"> Kraftfahrzeughaftpflichtversicherung</span> is a 36 letter word for motor vehicle liability insurance.</p>
  </div>
</div>
```

```html
<p class="**hyphens-auto** ..." **lang**="de">
  ... Kraftfahrzeughaftpflichtversicherung is a ...
</p>
```

---

## Applying conditionally

### Hover, focus, and other states

### Breakpoints and media queries