---
title: "Font Variant Numeric"
description: "Utilities for controlling the variant of numbers."
---

Use the `slashed-zero` utility to force a 0 with a slash; this is useful when a clear distinction between O and 0 is needed.

```html {{ example: true }}
<p class="font-source slashed-zero text-center text-slate-900 text-lg dark:text-slate-200">0</p>
```

```html
<p class="**slashed-zero** ...">0</p>
```

### Lining figures

Use the `lining-nums` utility to use the numeric glyphs that are all aligned by their baseline. This corresponds to the `lnum` OpenType feature. This is the default for most fonts.

```html {{ example: true }}
<p class="font-source lining-nums text-center text-slate-900 text-lg dark:text-slate-200">1234567890</p>
```

```html
<p class="**lining-nums** ...">
  1234567890
</p>
```

### Oldstyle figures

Use the `oldstyle-nums` utility to use numeric glyphs where some numbers have descenders. This corresponds to the `onum` OpenType feature.

```html {{ example: true }}
<p class="font-source oldstyle-nums text-center text-slate-900 text-lg dark:text-slate-200">1234567890</p>
```

```html
<p class="**oldstyle-nums** ...">
  1234567890
</p>
```

### Proportional figures

Use the `proportional-nums` utility to use numeric glyphs that have proportional widths (rather than uniform/tabular). This corresponds to the `pnum` OpenType feature.

```html {{ example: true }}
<div class="max-w-sm text-right">
  <p class="font-source proportional-nums text-slate-900 text-lg dark:text-slate-200">12121</p>
  <p class="font-source proportional-nums text-slate-900 text-lg dark:text-slate-200">90909</p>
</div>
```

```html
<p class="**proportional-nums** ...">
  12121
</p>
<p class="**proportional-nums** ...">
  90909
</p>
```

### Tabular figures

Use the `tabular-nums` utility to use numeric glyphs that have uniform/tabular widths (rather than proportional). This corresponds to the `tnum` OpenType feature.

```html {{ example: true }}
<div class="max-w-sm text-right">
  <p class="font-source tabular-nums text-slate-900 text-lg dark:text-slate-200">12121</p>
  <p class="font-source tabular-nums text-slate-900 text-lg dark:text-slate-200">90909</p>
</div>
```

```html
<p class="**tabular-nums** ...">
  12121
</p>
<p class="**tabular-nums** ...">
  90909
</p>
```

### Diagonal fractions

Use the `diagonal-fractions` utility to replace numbers separated by a slash with common diagonal fractions. This corresponds to the `frac` OpenType feature.

```html {{ example: true }}
<p class="font-source diagonal-fractions text-center text-slate-900 text-lg dark:text-slate-200">1/2 3/4 5/6</p>
```

```html
<p class="**diagonal-fractions** ...">
  1/2 3/4 5/6
</p>
```

### Stacked fractions

Use the `stacked-fractions` utility to replace numbers separated by a slash with common stacked fractions. This corresponds to the `afrc` OpenType feature. Very few fonts seem to support this feature — we've used Ubuntu Mono here.

```html {{ example: true }}
<p class="font-ubuntu-mono stacked-fractions text-center text-slate-900 text-lg dark:text-slate-200">1/2 3/4 5/6</p>
```

```html
<p class="**stacked-fractions** ...">
  1/2 3/4 5/6
</p>
```

### Resetting numeric font variants

Use the `normal-nums` property to reset numeric font variants. This is usually useful for resetting a font feature at a particular breakpoint:

```html
<p class="slashed-zero tabular-nums **md:normal-nums** ...">
  12345
</p>
```

---

## Applying conditionally

### Hover, focus, and other states

### Breakpoints and media queries