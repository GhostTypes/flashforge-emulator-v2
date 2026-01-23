---
title: "Word Break"
description: "Utilities for controlling word breaks in an element."
---

  a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.

```

```html
...
```

### Break Words

Use `break-words` to add line breaks mid-word if needed.

```html  }}

  The longest word in any of the major English language dictionaries is
  pneumonoultramicroscopicsilicovolcanoconiosis,
  a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.

```

```html
...
```

### Break All

Use `break-all` to add line breaks whenever necessary, without trying to preserve whole words.

```html  }}

  The longest word in any of the major English language dictionaries is
  pneumonoultramicroscopicsilicovolcanoconiosis,
  a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.

```

```html
...
```

### Break Keep

Use `break-keep` to prevent line breaks from being applied to Chinese/Japanese/Korean (CJK) text. For non-CJK text `break-keep` has the same behavior as `break-normal`.

```html  }}

  抗衡不屈不挠 (kànghéng bùqū bùnáo) 这是一个长词，意思是不畏强暴，奋勇抗争，坚定不移，永不放弃。这个词通常用来描述那些在面对困难和挑战时坚持自己信念的人， 他们克服一切困难，不屈不挠地追求自己的目标。无论遇到多大的挑战，他们都能够坚持到底，不放弃，最终获得胜利。

```

```html
...
```

---

## Applying conditionally

### Hover, focus, and other states

### Breakpoints and media queries