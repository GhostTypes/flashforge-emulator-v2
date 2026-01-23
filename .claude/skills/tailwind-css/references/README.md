# Tailwind CSS Documentation Archive

Complete documentation for Tailwind CSS v3.x and v4.x, scraped and converted from the official Tailwind CSS documentation repository.

## Contents

- **[v4/](v4/)** - Tailwind CSS v4.x documentation (185 files) - Latest version (4.1.18)
- **[v3/](v3/)** - Tailwind CSS v3.x documentation (187 files) - Legacy version (3.4.17)

## Total Size

- 372 markdown files
- ~1.6 MB total

## Version Differences

### Tailwind CSS v4.x

**Major Changes:**
- New CSS-first configuration (no more tailwind.config.js)
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Native CSS variables for theming
- Improved performance with Lightning CSS
- New PostCSS plugin: `@tailwindcss/postcss`
- Dedicated Vite plugin: `@tailwindcss/vite`
- Modern browser support (Safari 16.4+, Chrome 111+, Firefox 128+)

### Tailwind CSS v3.x

**Features:**
- JavaScript configuration (tailwind.config.js)
- Traditional `@tailwind` directives
- JIT (Just-In-Time) compiler
- Broader browser support
- PostCSS integration

## Documentation Categories

### Core Concepts
- Installation & setup
- Configuration
- Utility-first fundamentals
- Responsive design
- Dark mode
- State variants (hover, focus, etc.)
- Functions and directives

### Layout
- Container
- Display
- Flexbox
- Grid
- Spacing (padding, margin, gap)
- Positioning
- Sizing

### Typography
- Font family, size, weight
- Text color, alignment, decoration
- Line height, letter spacing
- Text wrapping and overflow

### Backgrounds & Borders
- Background colors, images, gradients
- Border colors, radius, width
- Box shadows
- Opacity

### Effects & Filters
- Backdrop filters
- Blur, brightness, contrast
- Drop shadows
- Mix blend modes
- Opacity

### Transitions & Animations
- Transition properties
- Animation utilities
- Transform utilities

### Interactivity
- Cursor
- Pointer events
- User select
- Resize

### Customization
- Theme configuration
- Adding custom styles
- Using plugins
- Extracting components

## Usage

These files are organized for progressive loading - Claude Code will only load the specific documentation you need when you reference it.

## Conversion Notes

- Converted from MDX to Markdown using custom scraper
- JSX/React components removed, content preserved
- Code examples maintained intact
- Frontmatter metadata preserved
- Some minor formatting artifacts may exist but don't affect readability
