---
title: overscroll-behavior
description: Utilities for controlling how the browser behaves when reaching the boundary of a scrolling area.
---

## Examples

### Preventing parent overscrolling

Use the `overscroll-contain` utility to prevent scrolling in the target area from triggering scrolling in the parent element, but preserve "bounce" effects when scrolling past the end of the container in operating systems that support it:

  />

  }

```html
<!-- [!code classes:overscroll-contain] -->
<div class="overscroll-contain ...">Well, let me tell you something, ...</div>
```

### Preventing overscroll bouncing

Use the `overscroll-none` utility to prevent scrolling in the target area from triggering scrolling in the parent element, and also prevent "bounce" effects when scrolling past the end of the container:

  />

  }

```html
<!-- [!code classes:overscroll-none] -->
<div class="overscroll-none ...">Well, let me tell you something, ...</div>
```

### Using the default overscroll behavior

Use the `overscroll-auto` utility to make it possible for the user to continue scrolling a parent scroll area when they reach the boundary of the primary scroll area:

  />

  }

```html
<!-- [!code classes:overscroll-auto] -->
<div class="overscroll-auto ...">Well, let me tell you something, ...</div>
```

### Responsive design