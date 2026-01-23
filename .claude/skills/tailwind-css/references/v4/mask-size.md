---
title: mask-size
description: Utilities for controlling the size of an element's mask image.
---

)", "mask-size: var();"],
  ["mask-size-[]", "mask-size: ;"],
  ]}
/>

## Examples

### Filling the container

Use the `mask-cover` utility to scale the mask image until it fills the mask layer, cropping the image if needed:

  }
  >

  }

```html
<!-- [!code classes:mask-cover] -->
<div class="mask-cover mask-[url(/img/scribble.png)] bg-[url(/img/mountains.jpg)] ..."></div>
```

### Filling without cropping

Use the `mask-contain` utility to scale the mask image to the outer edges without cropping or stretching:

  }
  >

  }

```html
<!-- [!code classes:mask-contain] -->
<div class="mask-contain mask-[url(/img/scribble.png)] bg-[url(/img/mountains.jpg)] ..."></div>
```

### Using the default size

Use the `mask-auto` utility to display the mask image at its default size:

  }
  >

  }

```html
<!-- [!code classes:mask-auto] -->
<div class="mask-auto mask-[url(/img/scribble.png)] bg-[url(/img/mountains.jpg)] ..."></div>
```

### Using a custom value

### Responsive design