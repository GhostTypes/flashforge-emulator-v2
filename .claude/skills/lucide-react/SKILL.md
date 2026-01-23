---
name: lucide-react
description: "Comprehensive guide for Lucide React - the beautiful & consistent icon toolkit for React. Use when: installing lucide-react, importing and using icon components, customizing icon appearance (size, color, stroke width), finding and selecting icons, implementing advanced patterns like DynamicIcon and animations, handling accessibility for icons."
---

# Lucide React

## Quick Start

```bash
npm install lucide-react
```

```jsx
import { Camera, Heart, Star } from 'lucide-react';

<Camera size={24} color="red" />
<Heart />
<Star className="text-yellow-500" />
```

## Common Tasks

### Finding Icons

Browse all 1000+ icons at https://lucide.dev/icons/

Icons use **kebab-case** naming:
- `arrow-up`, `arrow-down`, `chevron-left`
- `check-circle`, `x-circle`, `alert-triangle`
- `camera`, `heart`, `star`, `user`, `home`

See `references/04-icon-reference.md` for categorized icon lists.

### Installing

**For new projects:**
```bash
npm install lucide-react
```

**For existing projects with Next.js, Vite, Create React App:** same command - just import and use.

### Basic Usage Patterns

**Direct import (recommended for tree-shaking):**
```jsx
import { Camera } from 'lucide-react';

function App() {
  return <Camera />;
}
```

**Multiple icons:**
```jsx
import { Camera, Heart, Star, User, Home } from 'lucide-react';
```

**With props:**
```jsx
<Camera size={48} color="red" strokeWidth={2} />
```

## Icon Props

| prop                  | type      | default      | description                    |
| --------------------- | --------- | ------------ | ------------------------------ |
| `size`                | number    | 24           | Icon size in pixels            |
| `color`               | string    | currentColor | Icon color                     |
| `strokeWidth`         | number    | 2            | Stroke width                   |
| `absoluteStrokeWidth` | boolean   | false        | Keep stroke constant when sizing|

**All SVG attributes are accepted** - see MDN [SVG Presentation Attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation).

## Styling

### Color

```jsx
// Direct color prop
<Camera color="red" />
<Camera color="#ff0000" />
<Camera color="rgb(255, 0, 0)" />

// Inherits from parent (currentColor default)
<div className="text-blue-500">
  <Camera /> {/* Will be blue-500 */}
</div>
```

### Size

```jsx
// Size prop
<Camera size={16} />
<Camera size={24} />  // default
<Camera size={48} />

// CSS / Tailwind
<Camera className="w-6 h-6" />
<Camera style={{ width: '48px', height: '48px' }} />
```

### Stroke Width

```jsx
// Relative to size (default)
<Camera strokeWidth={1} />
<Camera strokeWidth={2} />  // default
<Camera strokeWidth={3} />

// Absolute (constant regardless of size)
<Camera size={48} strokeWidth={2} absoluteStrokeWidth />
```

### Global Styling

All icons have `lucide` class - use for global styles:

```css
.lucide {
  color: #333;
  stroke-width: 1.5;
}
```

## Advanced Patterns

### Dynamic Icons (CMS/Database)

**NOT recommended for static use** - imports all icons.

```jsx
import { DynamicIcon } from 'lucide-react/dynamic';

<DynamicIcon name="camera" size={24} />
```

### Lucide Lab Icons

```jsx
import { Icon } from 'lucide-react';
import { coconut } from '@lucide/lab';

<Icon iconNode={coconut} />
```

### Accessibility

```jsx
// With label
<Camera aria-label="Take photo" />

// Decorative (hidden from screen readers)
<Camera aria-hidden="true" />

// Interactive
<Camera
  role="button"
  tabIndex={0}
  onClick={handleClick}
  aria-label="Open camera"
/>
```

## References

- **Getting Started**: `references/01-getting-started.md` - Installation, basic usage, DynamicIcon, Lucide Lab
- **Styling**: `references/02-styling.md` - Color, size, stroke width, global styling, framework examples
- **Advanced**: `references/03-advanced-usage.md` - Custom icons, animations, SSR, tree-shaking best practices
- **Icon Reference**: `references/04-icon-reference.md` - Categorized icon listings, naming conventions, common patterns
