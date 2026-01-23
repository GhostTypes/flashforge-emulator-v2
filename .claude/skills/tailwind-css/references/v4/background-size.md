---
title: background-size
description: Utilities for controlling the background size of an element's background image.
---

)", "background-size: var();"],
  ["bg-size-[]", "background-size: ;"],
  ]}
/>

## Examples

### Filling the container

Use the `bg-cover` utility to scale the background image until it fills the background layer, cropping the image if needed:

```html
<!-- [!code classes:bg-cover] -->
<div class="bg-[url(/img/mountains.jpg)] bg-cover bg-center"></div>
```

### Filling without cropping

Use the `bg-contain` utility to scale the background image to the outer edges without cropping or stretching:

```html
<!-- [!code classes:bg-contain] -->
<div class="bg-[url(/img/mountains.jpg)] bg-contain bg-center"></div>
```

### Using the default size

Use the `bg-auto` utility to display the background image at its default size:

```html
<!-- [!code classes:bg-auto] -->
<div class="bg-[url(/img/mountains.jpg)] bg-auto bg-center bg-no-repeat"></div>
```

### Using a custom value

### Responsive design