---
title: line-clamp
description: Utilities for clamping text to a specific number of lines.
---

",
  "overflow: hidden;\ndisplay: -webkit-box;\n-webkit-box-orient: vertical;\n-webkit-line-clamp: ;",
  ],
  [
  "line-clamp-none",
  "overflow: visible;\ndisplay: block;\n-webkit-box-orient: horizontal;\n-webkit-line-clamp: unset;",
  ],
  [
  "line-clamp-()",
  "overflow: hidden;\ndisplay: -webkit-box;\n-webkit-box-orient: vertical;\n-webkit-line-clamp: var();",
  ],
  [
  "line-clamp-[]",
  "overflow: hidden;\ndisplay: -webkit-box;\n-webkit-box-orient: vertical;\n-webkit-line-clamp: ;",
  ],
  ]}
/>

## Examples

### Basic example

Use `line-clamp-<number>` utilities like `line-clamp-2` and `line-clamp-3` to truncate multi-line text after a specific number of lines:

```html
<!-- [!code classes:line-clamp-3] -->
<article>
  <time>Mar 10, 2020</time>
  <h2>Boost your conversion rate</h2>
  <p class="line-clamp-3">
  Nulla dolor velit adipisicing duis excepteur esse in duis nostrud occaecat mollit incididunt deserunt sunt. Ut ut
  sunt laborum ex occaecat eu tempor labore enim adipisicing minim ad. Est in quis eu dolore occaecat excepteur fugiat
  dolore nisi aliqua fugiat enim ut cillum. Labore enim duis nostrud eu. Est ut eiusmod consequat irure quis deserunt
  ex. Enim laboris dolor magna pariatur. Dolor et ad sint voluptate sunt elit mollit officia ad enim sit consectetur
  enim.
  </p>
  <div>
  <img src="/img/lindsay.jpg" />
  Lindsay Walton
  </div>
</article>
```

### Undoing line clamping

Use `line-clamp-none` to undo a previously applied line clamp utility:

```html
<!-- [!code classes:lg:line-clamp-none] -->
<p class="line-clamp-3 lg:line-clamp-none">
  <!-- ... -->
</p>
```

### Using a custom value

### Responsive design