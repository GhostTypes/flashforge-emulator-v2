---
title: border-spacing
description: Utilities for controlling the spacing between table borders.
---

", "border-spacing: calc(var(--spacing) * );"],
  ["border-spacing-()", "border-spacing: var();"],
  ["border-spacing-[]", "border-spacing: ;"],
  ["border-spacing-x-", "border-spacing: calc(var(--spacing) * ) var(--tw-border-spacing-y);"],
  ["border-spacing-x-()", "border-spacing: var() var(--tw-border-spacing-y);"],
  ["border-spacing-x-[]", "border-spacing:  var(--tw-border-spacing-y);"],
  ["border-spacing-y-", "border-spacing: var(--tw-border-spacing-x) calc(var(--spacing) * );"],
  ["border-spacing-y-()", "border-spacing: var(--tw-border-spacing-x) var();"],
  ["border-spacing-y-[]", "border-spacing: var(--tw-border-spacing-x) ;"],
  ]}
/>

## Examples

### Basic example

Use `border-spacing-<number>` utilities like `border-spacing-2` and `border-spacing-x-3` to control the space between the borders of table cells with [separate borders](/docs/border-collapse#separating-table-borders):

```html
<!-- [!code classes:border-spacing-2] -->
<table class="border-separate border-spacing-2 border border-gray-400 dark:border-gray-500">
  <thead>
  <tr>
  <th class="border border-gray-300 dark:border-gray-600">State</th>
  <th class="border border-gray-300 dark:border-gray-600">City</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td class="border border-gray-300 dark:border-gray-700">Indiana</td>
  <td class="border border-gray-300 dark:border-gray-700">Indianapolis</td>
  </tr>
  <tr>
  <td class="border border-gray-300 dark:border-gray-700">Ohio</td>
  <td class="border border-gray-300 dark:border-gray-700">Columbus</td>
  </tr>
  <tr>
  <td class="border border-gray-300 dark:border-gray-700">Michigan</td>
  <td class="border border-gray-300 dark:border-gray-700">Detroit</td>
  </tr>
  </tbody>
</table>
```

### Using a custom value

### Responsive design

## Customizing your theme