---
title: border-collapse
description: Utilities for controlling whether table borders should collapse or be separated.
---

## Examples

### Collapsing table borders

Use the `border-collapse` utility to combine adjacent cell borders into a single border when possible:

```html
<!-- [!code classes:border-collapse] -->
<table class="border-collapse border border-gray-400 ...">
  <thead>
  <tr>
  <th class="border border-gray-300 ...">State</th>
  <th class="border border-gray-300 ...">City</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td class="border border-gray-300 ...">Indiana</td>
  <td class="border border-gray-300 ...">Indianapolis</td>
  </tr>
  <tr>
  <td class="border border-gray-300 ...">Ohio</td>
  <td class="border border-gray-300 ...">Columbus</td>
  </tr>
  <tr>
  <td class="border border-gray-300 ...">Michigan</td>
  <td class="border border-gray-300 ...">Detroit</td>
  </tr>
  </tbody>
</table>
```

Note that this includes collapsing borders on the top-level `<table>` tag.

### Separating table borders

Use the `border-separate` utility to force each cell to display its own separate borders:

```html
<!-- [!code classes:border-separate] -->
<table class="border-separate border border-gray-400 ...">
  <thead>
  <tr>
  <th class="border border-gray-300 ...">State</th>
  <th class="border border-gray-300 ...">City</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td class="border border-gray-300 ...">Indiana</td>
  <td class="border border-gray-300 ...">Indianapolis</td>
  </tr>
  <tr>
  <td class="border border-gray-300 ...">Ohio</td>
  <td class="border border-gray-300 ...">Columbus</td>
  </tr>
  <tr>
  <td class="border border-gray-300 ...">Michigan</td>
  <td class="border border-gray-300 ...">Detroit</td>
  </tr>
  </tbody>
</table>
```

### Responsive design