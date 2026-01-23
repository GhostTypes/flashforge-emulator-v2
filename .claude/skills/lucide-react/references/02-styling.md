# Styling Lucide Icons

## Default Values

By default, all Lucide icons have:
- **color**: `currentColor` (inherits from text color)
- **size**: `24px`
- **stroke width**: `2`

## Color

### Using the `color` Prop

```jsx
import { Camera } from 'lucide-react';

<Camera color="red" />
<Camera color="#ff0000" />
<Camera color="rgb(255, 0, 0)" />
```

### Using `currentColor` (Default)

The default `currentColor` keyword makes icons inherit the text color of their parent element:

```jsx
// Icon inherits color from parent
<div style={{ color: 'blue' }}>
  <Camera /> {/* Will be blue */}
</div>

// Inherits from global CSS
<p className="text-red-500">
  <Camera /> {/* Will be red-500 in Tailwind */}
</p>
```

## Size

### Using the `size` Prop

```jsx
<Camera size={16} />
<Camera size={24} />  {/* default */}
<Camera size={32} />
<Camera size={48} />
<Camera size={64} />
```

### Using CSS

```jsx
// Direct styling
<Camera style={{ width: '48px', height: '48px' }} />

// With class names
<Camera className="w-12 h-12" />  {/* Tailwind */}
```

### Responsive Sizing with `em`

Icons can scale with font size using the `em` unit:

```jsx
// In CSS
.icon-responsive {
  width: 1em;
  height: 1em;
}

// Icon scales with parent font size
<div style={{ fontSize: '24px' }}>
  <Camera className="icon-responsive" />  {/* 24px icon */}
</div>
```

## Stroke Width

### Using the `strokeWidth` Prop

```jsx
<Camera strokeWidth={1} />
<Camera strokeWidth={2} />  {/* default */}
<Camera strokeWidth={3} />
```

### Absolute Stroke Width

By default, stroke width scales with icon size. Use `absoluteStrokeWidth` to keep stroke width constant regardless of icon size:

```jsx
// Stroke width stays 2px even when icon is 48px
<Camera size={48} strokeWidth={2} absoluteStrokeWidth={true} />
```

### CSS for Global Stroke Width

Apply `stroke-width` via CSS using the `lucide` class:

```css
.lucide {
  stroke-width: 1.5;
}

/* For absolute stroke width effect */
.lucide *[stroke-width] {
  vector-effect: non-scaling-stroke;
}
```

## Global Styling

Every icon has a `lucide` class applied, which can be used for global styling:

```css
/* Target all icons */
.lucide {
  color: #333;
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

/* Hover effects */
.lucide:hover {
  color: #007bff;
}
```

## Framework-Specific Examples

### Tailwind CSS

```jsx
<Camera className="w-6 h-6 text-blue-500 hover:text-blue-700" />
<Camera className="w-8 h-8 stroke-1" />
```

### CSS Modules

```jsx
// In component
import { Camera } from 'lucide-react';
import styles from './Icon.module.css';

<Camera className={styles.icon} />

// In CSS file
.icon {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
}
```

### Styled Components

```jsx
import styled from 'styled-components';
import { Camera } from 'lucide-react';

const StyledCamera = styled(Camera)`
  width: 48px;
  height: 48px;
  color: ${props => props.theme.primary};
`;
```
