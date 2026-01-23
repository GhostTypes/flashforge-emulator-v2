---
title: flex-basis
description: Utilities for controlling the initial size of flex items.
---

", "flex-basis: calc(var(--spacing) * );"],
  ["basis-", "flex-basis: calc( * 100%);"],
  ["basis-full", "flex-basis: 100%;"],
  ["basis-auto", "flex-basis: auto;"],
  ["basis-3xs", "flex-basis: var(--container-3xs); /* 16rem (256px) */"],
  ["basis-2xs", "flex-basis: var(--container-2xs); /* 18rem (288px) */"],
  ["basis-xs", "flex-basis: var(--container-xs); /* 20rem (320px) */"],
  ["basis-sm", "flex-basis: var(--container-sm); /* 24rem (384px) */"],
  ["basis-md", "flex-basis: var(--container-md); /* 28rem (448px) */"],
  ["basis-lg", "flex-basis: var(--container-lg); /* 32rem (512px) */"],
  ["basis-xl", "flex-basis: var(--container-xl); /* 36rem (576px) */"],
  ["basis-2xl", "flex-basis: var(--container-2xl); /* 42rem (672px) */"],
  ["basis-3xl", "flex-basis: var(--container-3xl); /* 48rem (768px) */"],
  ["basis-4xl", "flex-basis: var(--container-4xl); /* 56rem (896px) */"],
  ["basis-5xl", "flex-basis: var(--container-5xl); /* 64rem (1024px) */"],
  ["basis-6xl", "flex-basis: var(--container-6xl); /* 72rem (1152px) */"],
  ["basis-7xl", "flex-basis: var(--container-7xl); /* 80rem (1280px) */"],
  ["basis-()", "flex-basis: var();"],
  ["basis-[]", "flex-basis: ;"],
  ]}
/>

## Examples

### Using the spacing scale

Use `basis-<number>` utilities like `basis-64` and `basis-128` to set the initial size of flex items based on the spacing scale:

```html
<!-- [!code classes:basis-64,basis-128] -->
<div class="flex flex-row">
  <div class="basis-64">01</div>
  <div class="basis-64">02</div>
  <div class="basis-128">03</div>
</div>
```

### Using the container scale

Use utilities like `basis-xs` and `basis-sm` to set the initial size of flex items based on the container scale:

```html
<!-- [!code classes:basis-3xs,basis-2xs,basis-xs,basis-sm] -->
<div class="flex flex-row">
  <div class="basis-3xs">01</div>
  <div class="basis-2xs">02</div>
  <div class="basis-xs">03</div>
  <div class="basis-sm">04</div>
</div>
```

### Using percentages

Use `basis-<fraction>` utilities like `basis-1/2` and `basis-2/3` to set the initial size of flex items:

```html
<!-- [!code classes:basis-1/3,basis-2/3] -->
<div class="flex flex-row">
  <div class="basis-1/3">01</div>
  <div class="basis-2/3">02</div>
</div>
```

### Using a custom value

### Responsive design

```html
<!-- [!code classes:md:basis-1/3] -->
<div class="flex flex-row">
  <div class="basis-1/4 md:basis-1/3">01</div>
  <div class="basis-1/4 md:basis-1/3">02</div>
  <div class="basis-1/2 md:basis-1/3">03</div>
</div>
```

## Customizing your theme