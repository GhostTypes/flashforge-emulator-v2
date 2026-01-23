---
title: "Appearance"
description: "Utilities for suppressing native form control styling."
---

```html {{ example: { hint: 'Try emulating &#96;forced-colors: active&#96; in your developer tools to see the difference' } }}
<div class="grid max-w-sm mx-auto my-6 gap-8 items-center justify-center">
  <div class="flex items-center">
  <label for="checkbox_2" class="select-none mx-6 grid grid-flow-col gap-3 items-center text-slate-900 text-sm font-semibold dark:text-slate-200">
  <div class="grid items-center justify-center">
  <input type="checkbox" id="checkbox_2" checked class="peer row-start-1 col-start-1 appearance-none w-4 h-4 border ring-transparent border-slate-300 rounded dark:border-slate-600 checked:bg-violet-600 checked:border-violet-600 dark:checked:border-violet-600 forced-colors:appearance-auto" />
  <svg viewBox="0 0 14 14" fill="none" class="invisible peer-checked:visible row-start-1 col-start-1 stroke-white dark:text-violet-300 forced-colors:hidden">
  <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
  </div>
  Falls back to default appearance
  </label>
  </div>
  <div class="flex items-center">
  <label for="checkbox_1" class="select-none mx-6 grid grid-flow-col gap-3 items-center text-slate-900 text-sm font-semibold dark:text-slate-200">
  <div class="grid items-center justify-center">
  <input type="checkbox" id="checkbox_1" checked class="peer row-start-1 col-start-1 appearance-none w-4 h-4 border ring-transparent border-slate-300 rounded dark:border-slate-600 checked:bg-violet-600 checked:border-violet-600 dark:checked:border-violet-600" />
  <svg viewBox="0 0 14 14" fill="none" class="invisible peer-checked:visible row-start-1 col-start-1 stroke-white dark:text-violet-300">
  <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
  </div>
  Keeps custom appearance
  </label>
  </div>
</div>
```

```html
<label>
  <div>
  <input type="checkbox" class="appearance-none **forced-colors:appearance-auto** ..." />
  <svg class="invisible peer-checked:visible **forced-colors:hidden** ..." >
  <!-- ... -->
  </svg>
  </div>
  Falls back to default appearance
</label>

<label>
  <div>
  <input type="checkbox" class="appearance-none ..." />
  <svg class="invisible peer-checked:visible ...">
  <!-- ... -->
  </svg>
  </div>
  Keeps custom appearance
</label>
```

## Applying conditionally

### Hover, focus, and other states

### Breakpoints and media queries