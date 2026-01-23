---
title: text-overflow
description: Utilities for controlling how the text of an element overflows.
---

## Examples

### Truncating text

Use the `truncate` utility to prevent text from wrapping and truncate overflowing text with an ellipsis (…) if needed:

  pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung
  disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it
  is the same as silicosis.

  }

```html
<!-- [!code classes:truncate] -->
<p class="truncate">The longest word in any of the major...</p>
```

### Adding an ellipsis

Use the `text-ellipsis` utility to truncate overflowing text with an ellipsis (…) if needed:

  pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung
  disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it
  is the same as silicosis.

  }

```html
<!-- [!code classes:text-ellipsis] -->
<p class="overflow-hidden text-ellipsis">The longest word in any of the major...</p>
```

### Clipping text

Use the `text-clip` utility to truncate the text at the limit of the content area:

  pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung
  disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it
  is the same as silicosis.

  }

```html
<!-- [!code classes:text-clip] -->
<p class="overflow-hidden text-clip">The longest word in any of the major...</p>
```

This is the default browser behavior.

### Responsive design