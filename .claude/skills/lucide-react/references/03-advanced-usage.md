# Advanced Lucide React Usage

## Custom Icons

### Using the `Icon` Component

The `Icon` component allows rendering custom icon nodes. This is useful for:
- Icons from Lucide Lab
- Custom icon definitions
- Dynamically generated icons

```jsx
import { Icon } from 'lucide-react';
import { coconut } from '@lucide/lab';

// Lucide Lab icon
<Icon iconNode={coconut} size={32} />

// Custom icon node
const customIcon = [
  ['svg', { viewBox: '0 0 24 24' }, [
    ['circle', { cx: '12', cy: '12', r: '10' }]
  ]]
];
<Icon iconNode={customIcon} />
```

## Dynamic Icon Loading

### DynamicIcon Component

For CMS-driven or database-stored icon names:

```jsx
import { DynamicIcon } from 'lucide-react/dynamic';

function IconDisplay({ iconName }) {
  return (
    <DynamicIcon
      name={iconName}
      size={24}
      color="currentColor"
    />
  );
}

// Usage
<IconDisplay iconName="camera" />
<IconDisplay iconName="heart" />
```

**Warning:** DynamicIcon imports all icons, affecting bundle size and build time. Prefer direct imports for static use.

### Manual Dynamic Loading

For better performance, dynamically import only needed icons:

```jsx
import { createLucideIcon } from 'lucide-react';

const iconMap = {
  camera: () => import('lucide-react/dist/esm/icons/camera').then(m => m.Camera),
  heart: () => import('lucide-react/dist/esm/icons/heart').then(m => m.Heart),
};

async function loadIcon(name) {
  const loader = iconMap[name];
  if (loader) {
    const IconComponent = await loader();
    return IconComponent;
  }
  return null;
}
```

## SVG Customization

### All SVG Attributes Are Supported

```jsx
<Camera
  // Presentation attributes
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"

  // Transformations
  transform="rotate(45)"

  // Events
  onClick={handleClick}
  onMouseEnter={handleHover}

  // Accessibility
  aria-label="Camera icon"
  role="img"
/>
```

### Creating Icon Variants

```jsx
// Create reusable icon variants
const SolidIcon = ({ icon: Icon, ...props }) => (
  <Icon {...props} fill="currentColor" stroke="none" />
);

const OutlinedIcon = ({ icon: Icon, ...props }) => (
  <Icon {...props} fill="none" strokeWidth={2.5} />
);

// Usage
import { Camera } from 'lucide-react';
<SolidIcon icon={Camera} />
<OutlinedIcon icon={Camera} />
```

## Accessibility

### ARIA Labels

```jsx
<Camera aria-label="Take a photo" />
<Camera aria-labelledby="camera-icon-label" />

// With decorative icons (hidden from screen readers)
<Camera aria-hidden="true" />
```

### Focusable Icons

```jsx
<Camera
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
  role="button"
  aria-label="Open camera"
/>
```

## Animation Examples

### Rotate Animation

```jsx
import { keyframes } from 'styled-components';
import { RefreshCw } from 'lucide-react';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinningIcon = styled(RefreshCw)`
  animation: ${rotate} 1s linear infinite;
`;

<SpinningIcon />
```

### Pulse Animation

```jsx
// Using Tailwind
<Heart className="animate-pulse text-red-500" />

// Using CSS
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.pulse-icon {
  animation: pulse 1s ease-in-out infinite;
}

<Heart className="pulse-icon" />
```

## Server-Side Rendering (SSR)

Lucide React works seamlessly with SSR frameworks like Next.js:

```jsx
// Next.js page
import { Camera, Heart, Star } from 'lucide-react';

export default function Page() {
  return (
    <div>
      <Camera />
      <Heart />
      <Star />
    </div>
  );
}
```

For Next.js App Router with client components:

```jsx
'use client';

import { Camera } from 'lucide-react';

export default function ClientComponent() {
  return <Camera />;
}
```

## Tree Shaking Best Practices

```jsx
// ✅ Good - Only imports used icons
import { Camera, Heart, Star } from 'lucide-react';

// ❌ Bad - Imports everything
import * as Icons from 'lucide-react';

// ✅ Good - Direct import
import Camera from 'lucide-react/dist/esm/icons/camera';

// ❌ Bad - Dynamic imports without explicit mapping
const iconName = 'camera';
const Icon = Icons[iconName];
```
