---
title: font-variant-numeric
description: Utilities for controlling the variant of numbers.
---

## Examples

### Using ordinal glyphs

Use the `ordinal` utility to enable special glyphs for the ordinal markers in fonts that support them:

```html
<!-- [!code classes:ordinal] -->
<p class="ordinal ...">1st</p>
```

### Using slashed zeroes

Use the `slashed-zero` utility to force a zero with a slash in fonts that support them:

```html
<!-- [!code classes:slashed-zero] -->
<p class="slashed-zero ...">0</p>
```

### Using lining figures

Use the `lining-nums` utility to use numeric glyphs that are aligned by their baseline in fonts that support them:

```html
<!-- [!code classes:lining-nums] -->
<p class="lining-nums ...">1234567890</p>
```

### Using oldstyle figures

Use the `oldstyle-nums` utility to use numeric glyphs where some numbers have descenders in fonts that support them:

```html
<!-- [!code classes:oldstyle-nums] -->
<p class="oldstyle-nums ...">1234567890</p>
```

### Using proportional figures

Use the `proportional-nums` utility to use numeric glyphs that have proportional widths in fonts that support them:

```html
<!-- [!code classes:proportional-nums] -->
<p class="proportional-nums ...">12121</p>
<p class="proportional-nums ...">90909</p>
```

### Using tabular figures

Use the `tabular-nums` utility to use numeric glyphs that have uniform/tabular widths in fonts that support them:

```html
<!-- [!code classes:tabular-nums] -->
<p class="tabular-nums ...">12121</p>
<p class="tabular-nums ...">90909</p>
```

### Using diagonal fractions

Use the `diagonal-fractions` utility to replace numbers separated by a slash with common diagonal fractions in fonts that support them:

```html
<!-- [!code classes:diagonal-fractions] -->
<p class="diagonal-fractions ...">1/2 3/4 5/6</p>
```

### Using stacked fractions

Use the `stacked-fractions` utility to replace numbers separated by a slash with common stacked fractions in fonts that support them:

```html
<!-- [!code classes:stacked-fractions] -->
<p class="stacked-fractions ...">1/2 3/4 5/6</p>
```

### Stacking multiple utilities

The `font-variant-numeric` utilities are composable so you can enable multiple variants by combining them:

```html
<!-- [!code classes:slashed-zero,tabular-nums] -->
<dl class="...">
  <dt class="...">Subtotal</dt>
  <dd class="text-right slashed-zero tabular-nums ...">$100.00</dd>
  <dt class="...">Tax</dt>
  <dd class="text-right slashed-zero tabular-nums ...">$14.50</dd>
  <dt class="...">Total</dt>
  <dd class="text-right slashed-zero tabular-nums ...">$114.50</dd>
</dl>
```

### Resetting numeric font variants

Use the `normal-nums` property to reset numeric font variants:

```html
<!-- [!code classes:slashed-zero,tabular-nums,normal-nums] -->
<p class="slashed-zero tabular-nums md:normal-nums ...">
  <!-- ... -->
</p>
```

### Responsive design