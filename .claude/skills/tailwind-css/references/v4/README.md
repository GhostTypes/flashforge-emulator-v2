# Tailwind CSS v4.x Documentation

Official documentation for Tailwind CSS v4.x (current version: 4.1.18).

## What's New in v4

Tailwind CSS v4.0 represents a major evolution of the framework with a CSS-first approach:

### Key Changes

1. **CSS-First Configuration**
   - No more `tailwind.config.js`
   - Configure using CSS variables in your stylesheets
   - `@theme` directive for customization

2. **New Import Syntax**
   ```css
   /* v4 */
   @import "tailwindcss";

   /* v3 (deprecated) */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. **Modern Tooling**
   - `@tailwindcss/postcss` - New PostCSS plugin
   - `@tailwindcss/vite` - Dedicated Vite plugin
   - `@tailwindcss/cli` - New CLI package
   - Lightning CSS for improved performance

4. **Browser Support**
   - Safari 16.4+
   - Chrome 111+
   - Firefox 128+

## Documentation Structure

### Getting Started
- `upgrade-guide.md` - Migrating from v3 to v4
- `editor-setup.md` - IDE configuration
- `compatibility.md` - Browser compatibility

### Core Concepts
- `responsive-design.md` - Breakpoints and responsive utilities
- `dark-mode.md` - Dark mode implementation
- `hover-focus-and-other-states.md` - State variants
- `styling-with-utility-classes.md` - Utility-first approach
- `adding-custom-styles.md` - Customization
- `functions-and-directives.md` - CSS functions and at-rules
- `theme.md` - Theme configuration

### Layout Utilities
- `container.md` - Container component
- `display.md` - Display properties
- `flex*.md` - Flexbox utilities
- `grid*.md` - CSS Grid utilities
- `position.md` - Positioning
- `top-right-bottom-left.md` - Inset properties
- `overflow.md` - Overflow handling

### Spacing
- `padding.md` - Padding utilities
- `margin.md` - Margin utilities
- `gap.md` - Gap for flexbox/grid

### Sizing
- `width.md`, `height.md` - Dimensions
- `min-width.md`, `max-width.md` - Min/max constraints
- `aspect-ratio.md` - Aspect ratios

### Typography
- `font-family.md`, `font-size.md`, `font-weight.md`
- `text-align.md`, `text-color.md`, `text-decoration-*.md`
- `line-height.md`, `letter-spacing.md`
- `text-overflow.md`, `text-wrap.md`

### Backgrounds
- `background-color.md` - Background colors
- `background-image.md` - Gradients and images
- `background-position.md`, `background-size.md`

### Borders
- `border-color.md`, `border-width.md`, `border-style.md`
- `border-radius.md` - Rounded corners
- `outline-*.md` - Outline properties

### Effects
- `box-shadow.md` - Shadows
- `opacity.md` - Transparency
- `mix-blend-mode.md` - Blend modes

### Filters
- `backdrop-filter*.md` - Backdrop filters
- `filter*.md` - Image filters

### Transitions & Animation
- `transition-*.md` - Transition utilities
- `animation.md` - Animation utilities
- `transform.md`, `rotate.md`, `scale.md`, `translate.md`

### Interactivity
- `cursor.md` - Cursor styles
- `pointer-events.md` - Pointer event handling
- `user-select.md` - Text selection
- `scroll-*.md` - Scroll behavior

### Colors
- `colors.md` - Color palette and usage
- `accent-color.md` - Accent colors
- `caret-color.md` - Text cursor color

### Miscellaneous
- `preflight.md` - Base styles reset
- `detecting-classes-in-source-files.md` - Content detection
- Various utility-specific files

## Total Files

185 markdown files covering every aspect of Tailwind CSS v4.

## Usage Tips

1. Start with `upgrade-guide.md` if coming from v3
2. Review `theme.md` for CSS-first configuration
3. Reference specific utility files as needed
4. Check `compatibility.md` for browser support requirements
