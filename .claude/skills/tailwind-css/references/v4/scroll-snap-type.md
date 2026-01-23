---
title: scroll-snap-type
description: Utilities for controlling how strictly snap points are enforced in a snap container.
---

## Examples

### Horizontal scroll snapping

Use the `snap-x` utility to enable horizontal scroll snapping within an element:

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

For scroll snapping to work, you need to also set the [scroll snap alignment](/docs/scroll-snap-align) on the children.

### Mandatory scroll snapping

Use the `snap-mandatory` utility to force a snap container to always come to rest on a snap point:

```html
<!-- [!code classes:snap-mandatory] -->
<div class="snap-x snap-mandatory ...">
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

### Proximity scroll snapping

Use the `snap-proximity` utility to make a snap container come to rest on snap points that are close in proximity:

```html
<!-- [!code classes:snap-proximity] -->
<div class="snap-x snap-proximity ...">
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
</div>
```

### Responsive design