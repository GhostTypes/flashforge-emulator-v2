---
title: object-fit
description: Utilities for controlling how a replaced element's content should be resized.
---

## Examples

### Resizing to cover

Use the `object-cover` utility to resize an element's content to cover its container:

```html
<!-- [!code classes:object-cover] -->
<img class="h-48 w-96 object-cover ..." src="/img/mountains.jpg" />
```

### Containing within

Use the `object-contain` utility to resize an element's content to stay contained within its container:

```html
<!-- [!code classes:object-contain] -->
<img class="h-48 w-96 object-contain ..." src="/img/mountains.jpg" />
```

### Stretching to fit

Use the `object-fill` utility to stretch an element's content to fit its container:

```html
<!-- [!code classes:object-fill] -->
<img class="h-48 w-96 object-fill ..." src="/img/mountains.jpg" />
```

### Scaling down

Use the `object-scale-down` utility to display an element's content at its original size but scale it down to fit its container if necessary:

```html
<!-- [!code classes:object-scale-down] -->
<img class="h-48 w-96 object-scale-down ..." src="/img/mountains.jpg" />
```

### Using the original size

Use the `object-none` utility to display an element's content at its original size ignoring the container size:

```html
<!-- [!code classes:object-none] -->
<img class="h-48 w-96 object-none ..." src="/img/mountains.jpg" />
```

### Responsive design

```html
<!-- [!code classes:md:object-cover] -->
<img class="object-contain md:object-cover" src="/img/mountains.jpg" />
```