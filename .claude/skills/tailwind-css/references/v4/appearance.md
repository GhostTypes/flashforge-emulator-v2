---
title: appearance
description: Utilities for suppressing native form control styling.
---

## Examples

### Removing default appearance

Use `appearance-none` to reset any browser specific styling on an element:

```html
<!-- [!code classes:appearance-none] -->
<select>
  <option>Yes</option>
  <option>No</option>
  <option>Maybe</option>
</select>

<div class="grid">
  <select class="col-start-1 row-start-1 appearance-none bg-gray-50 dark:bg-gray-800 ...">
  <option>Yes</option>
  <option>No</option>
  <option>Maybe</option>
  </select>
  <svg class="pointer-events-none col-start-1 row-start-1 ...">
  <!-- ... -->
  </svg>
</div>
```

This utility is often used when creating custom form components.

### Restoring default appearance

Use `appearance-auto` to restore the default browser specific styling on an element:

```html
<!-- [!code classes:forced-colors:appearance-auto,forced-colors:hidden] -->
<label>
  <div>
  <input type="checkbox" class="appearance-none forced-colors:appearance-auto ..." />
  <svg class="invisible peer-checked:visible forced-colors:hidden ...">
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

This is useful for reverting to the standard browser controls in certain accessibility modes.

### Responsive design