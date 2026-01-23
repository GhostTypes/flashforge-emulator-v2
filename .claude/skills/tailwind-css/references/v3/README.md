# Tailwind CSS v3.x Documentation

Official documentation for Tailwind CSS v3.x (final version: 3.4.17).

## About v3

Tailwind CSS v3.x is the mature, stable version with broad browser support. Use this for:

- Projects requiring older browser support
- Existing codebases not yet ready to migrate
- Teams preferring JavaScript configuration

## Key Features

1. **JavaScript Configuration**
   ```js
   // tailwind.config.js
   module.exports = {
     content: ['./src/**/*.{html,js}'],
     theme: {
       extend: {
         colors: {
           brand: '#ff6b6b',
         },
       },
     },
     plugins: [],
   }
   ```

2. **Traditional Directives**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. **JIT Compiler**
   - Just-In-Time compilation
   - Instant build times
   - On-demand arbitrary values

4. **Broad Browser Support**
   - Modern and legacy browsers
   - IE11 support (with polyfills)

## Documentation Structure

### Getting Started
- `installation.md` - Installation instructions
- `editor-setup.md` - IDE configuration
- `upgrade-guide.md` - Upgrading from v2

### Core Concepts
- `utility-first.md` - Utility-first fundamentals
- `responsive-design.md` - Breakpoints and mobile-first
- `hover-focus-and-other-states.md` - State variants
- `dark-mode.md` - Dark mode support
- `adding-custom-styles.md` - Customization
- `reusing-styles.md` - Component extraction
- `adding-new-utilities.md` - Custom utilities
- `functions-and-directives.md` - Configuration helpers

### Layout Utilities
- `container.md` - Container component
- `display.md` - Display properties
- `flex*.md` - Flexbox utilities
- `grid*.md` - CSS Grid utilities
- `position.md` - Positioning
- `top-right-bottom-left.md` - Inset properties
- `overflow.md`, `overscroll-behavior.md`
- `z-index.md` - Z-index control

### Spacing
- `padding.md` - Padding utilities
- `margin.md` - Margin utilities
- `space-between.md` - Gap between elements (v3 only)

### Sizing
- `width.md`, `height.md` - Dimensions
- `min-width.md`, `max-width.md` - Min/max constraints
- `aspect-ratio.md` - Aspect ratios

### Typography
- `font-family.md`, `font-size.md`, `font-weight.md`
- `text-align.md`, `text-color.md`, `text-decoration.md`
- `line-height.md`, `letter-spacing.md`
- `text-transform.md` - Uppercase, lowercase, capitalize
- `text-overflow.md`, `word-break.md`

### Backgrounds
- `background-color.md` - Background colors
- `background-image.md` - Gradients and images
- `background-position.md`, `background-size.md`
- `background-repeat.md`, `background-attachment.md`

### Borders
- `border-color.md`, `border-width.md`, `border-style.md`
- `border-radius.md` - Rounded corners
- `divide-width.md`, `divide-color.md` - Dividers between elements
- `outline-width.md`, `outline-color.md`
- `ring-width.md`, `ring-color.md` - Ring utilities

### Effects
- `box-shadow.md` - Shadows
- `opacity.md` - Transparency
- `mix-blend-mode.md` - Blend modes

### Filters
- `blur.md`, `brightness.md`, `contrast.md`
- `drop-shadow.md`, `grayscale.md`
- `hue-rotate.md`, `invert.md`, `saturate.md`, `sepia.md`
- `backdrop-blur.md`, `backdrop-brightness.md`, etc. - Backdrop filters

### Transitions & Animation
- `transition-property.md`, `transition-duration.md`
- `transition-timing-function.md`, `transition-delay.md`
- `animation.md` - Animation utilities
- `transform.md`, `transform-origin.md`
- `rotate.md`, `scale.md`, `translate.md`, `skew.md`

### Interactivity
- `cursor.md` - Cursor styles
- `pointer-events.md` - Pointer event handling
- `resize.md` - Element resizing
- `scroll-behavior.md`, `scroll-margin.md`, `scroll-padding.md`
- `scroll-snap-type.md`, `scroll-snap-align.md`
- `touch-action.md` - Touch gestures
- `user-select.md` - Text selection
- `will-change.md` - Performance hints

### SVG
- `fill.md`, `stroke.md`, `stroke-width.md`

### Colors
- `customizing-colors.md` - Color palette customization
- `color-opacity.md` - Opacity modifiers (v3 syntax)

### Tables
- `border-collapse.md`, `table-layout.md`

### Accessibility
- `screen-readers.md` - Screen reader utilities

## v3-Specific Features

### Space Between (replaced by Gap in v4)
```html
<!-- v3: Use space-between -->
<div class="flex space-x-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- v4: Use gap -->
<div class="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Ring Utilities
Outline-style utilities using box-shadows (still available in v4 but styled differently).

### Divide Utilities
Borders between child elements (v3 approach, v4 prefers gap/borders).

## Total Files

187 markdown files covering the complete Tailwind CSS v3 feature set.

## Migration to v4

See `upgrade-guide.md` in the v4 directory for migration instructions.

## Usage Tips

1. Check `installation.md` for setup instructions
2. Review `utility-first.md` for core concepts
3. Use `responsive-design.md` for breakpoint strategies
4. Reference specific utility files as needed
5. For custom configuration, see `adding-custom-styles.md` and `functions-and-directives.md`
