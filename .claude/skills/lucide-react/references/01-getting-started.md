# Getting Started with Lucide React

## Installation

```bash
# npm
npm install lucide-react

# yarn
yarn add lucide-react

# pnpm
pnpm add lucide-react

# bun
bun add lucide-react
```

## Basic Usage

Lucide is built with ES Modules, so it's completely tree-shakable. Each icon can be imported as a React component, which renders an inline SVG element. Only the icons that are imported into your project are included in the final bundle.

### Example

```jsx
import { Camera } from 'lucide-react';

const App = () => {
  return <Camera color="red" size={48} />;
};

export default App;
```

## Icon Props

| name                  | type      | default      |
| --------------------- | --------- | ------------ |
| `size`                | *number*  | 24           |
| `color`               | *string*  | currentColor |
| `strokeWidth`         | *number*  | 2            |
| `absoluteStrokeWidth` | *boolean* | false        |

### Applying Props

To customize the appearance of an icon, you can pass custom properties as props directly to the component. The component accepts all SVG attributes as props, which allows flexible styling of the SVG elements.

```jsx
// Size and color
<Camera size={48} color="red" />

// Fill and stroke
<Camera size={48} fill="red" stroke="blue" />

// Any SVG attribute
<Camera stroke-linecap="round" stroke-linejoin="round" />
```

## Dynamic Icon Component

`DynamicIcon` is useful for applications that want to show icons dynamically by icon name (e.g., when using a CMS where icon names are stored in a database).

**Note:** This is not recommended for static use cases, as it imports all icons during build time, increasing build time and bundle size.

```jsx
import { DynamicIcon } from 'lucide-react/dynamic';

const App = () => (
  <DynamicIcon name="camera" color="red" size={48} />
);
```

## Using Lucide Lab Icons

[Lucide lab](https://github.com/lucide-icons/lucide-lab) contains experimental icons not part of the main library. Use the `Icon` component with icon nodes from `@lucide/lab`:

```jsx
import { Icon } from 'lucide-react';
import { coconut } from '@lucide/lab';

const App = () => (
  <Icon iconNode={coconut} />
);
```
