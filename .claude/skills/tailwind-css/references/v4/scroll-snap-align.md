---
title: scroll-snap-align
description: Utilities for controlling the scroll snap alignment of an element.
---

## Examples

### Snapping to the center

Use the `snap-center` utility to snap an element to its center when being scrolled inside a snap container:

```html
<!-- [!code classes:snap-x,snap-center] -->
<div class="snap-x ...">
  <div class="snap-center ...">
  <img src="/img/vacation-01.jpg" />
  </div>
  <div class="snap-center ...">
  <img src="/img/vacation-02.jpg" />
  </div>
  <div class="snap-center ...">
  <img src="/img/vacation-03.jpg" />
  </div>
  <div class="snap-center ...">
  <img src="/img/vacation-04.jpg" />
  </div>
  <div class="snap-center ...">
  <img src="/img/vacation-05.jpg" />
  </div>
  <div class="snap-center ...">
  <img src="/img/vacation-06.jpg" />
  </div>
</div>
```

### Snapping to the start

Use the `snap-start` utility to snap an element to its start when being scrolled inside a snap container:

```html
<!-- [!code classes:snap-x,snap-start] -->

<div class="snap-x ...">
  <div class="snap-start ...">
  <img src="/img/vacation-01.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-02.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-03.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-04.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-05.jpg" />
  </div>
  <div class="snap-start ...">
  <img src="/img/vacation-06.jpg" />
  </div>
</div>
```

### Snapping to the end

Use the `snap-end` utility to snap an element to its end when being scrolled inside a snap container:

```html
<!-- [!code classes:snap-x,snap-end] -->
<div class="snap-x ...">
  <div class="snap-end ...">
  <img src="/img/vacation-01.jpg" />
  </div>
  <div class="snap-end ...">
  <img src="/img/vacation-02.jpg" />
  </div>
  <div class="snap-end ...">
  <img src="/img/vacation-03.jpg" />
  </div>
  <div class="snap-end ...">
  <img src="/img/vacation-04.jpg" />
  </div>
  <div class="snap-end ...">
  <img src="/img/vacation-05.jpg" />
  </div>
  <div class="snap-end ...">
  <img src="/img/vacation-06.jpg" />
  </div>
</div>
```

### Responsive design