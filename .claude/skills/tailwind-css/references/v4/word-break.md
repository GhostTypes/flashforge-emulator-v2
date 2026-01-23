---
title: word-break
description: Utilities for controlling word breaks in an element.
---

## Examples

### Normal

Use the `break-normal` utility to only add line breaks at normal word break points:

  pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung
  disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it
  is the same as silicosis.

  }

```html
<!-- [!code classes:break-normal] -->
<p class="break-normal">The longest word in any of the major...</p>
```

### Break All

Use the `break-all` utility to add line breaks whenever necessary, without trying to preserve whole words:

  pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung
  disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it
  is the same as silicosis.

  }

```html
<!-- [!code classes:break-all] -->
<p class="break-all">The longest word in any of the major...</p>
```

### Break Keep

Use the `break-keep` utility to prevent line breaks from being applied to Chinese/Japanese/Korean (CJK) text:

  他们克服一切困难，不屈不挠地追求自己的目标。无论遇到多大的挑战，他们都能够坚持到底，不放弃，最终获得胜利。

  }

```html
<!-- [!code classes:break-keep] -->
<p class="break-keep">抗衡不屈不挠...</p>
```

For non-CJK text the `break-keep` utility has the same behavior as the `break-normal` utility.

### Responsive design