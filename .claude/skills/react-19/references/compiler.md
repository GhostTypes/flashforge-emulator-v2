# React Compiler Reference

React Compiler automatically optimizes React applications by memoizing components and values.

## Overview

React Compiler is a build-time tool that:
- Automatically memoizes components (like memo())
- Automatically memoizes values (like useMemo())
- Automatically memoizes callbacks (like useCallback())
- Requires no code changes for most applications

## Configuration

| Topic | Summary | Full Doc |
|-------|---------|----------|
| **Configuration** | Compiler options, Babel/Vite/Webpack setup. | [docs/react-compiler/configuration.md](./react-compiler/configuration.md) |
| **Compilation Mode** | Control which files/functions to compile. | [docs/react-compiler/compilationMode.md](./react-compiler/compilationMode.md) |
| **Target** | Specify React version target (17, 18, 19). | [docs/react-compiler/target.md](./react-compiler/target.md) |
| **Gating** | Enable/disable compilation per component. | [docs/react-compiler/gating.md](./react-compiler/gating.md) |
| **Logger** | Custom logging for compilation events. | [docs/react-compiler/logger.md](./react-compiler/logger.md) |
| **Panic Threshold** | Control error handling behavior. | [docs/react-compiler/panicThreshold.md](./react-compiler/panicThreshold.md) |

## Directives

| Directive | Summary | Full Doc |
|-----------|---------|----------|
| **"use memo"** | Hint to compiler to memoize this component/function. | [docs/react-compiler/directives/use-memo.md](./react-compiler/directives/use-memo.md) |
| **"use no memo"** | Opt-out of compilation for specific component/function. | [docs/react-compiler/directives/use-no-memo.md](./react-compiler/directives/use-no-memo.md) |
| **Directives Overview** | All compiler directives. | [docs/react-compiler/directives.md](./react-compiler/directives.md) |

## Library Compilation

| Topic | Summary | Full Doc |
|-------|---------|----------|
| **Compiling Libraries** | How to ship pre-compiled library code. | [docs/react-compiler/compiling-libraries.md](./react-compiler/compiling-libraries.md) |

## Learning Guides

| Guide | Summary | Full Doc |
|-------|---------|----------|
| **Introduction** | What React Compiler is and why. | [docs/learn/react-compiler/introduction.md](./learn/react-compiler/introduction.md) |
| **Installation** | Setup for Next.js, Vite, Babel, etc. | [docs/learn/react-compiler/installation.md](./learn/react-compiler/installation.md) |
| **Incremental Adoption** | Gradually adopt compiler in existing apps. | [docs/learn/react-compiler/incremental-adoption.md](./learn/react-compiler/incremental-adoption.md) |
| **Debugging** | Debug compiler issues, inspect output. | [docs/learn/react-compiler/debugging.md](./learn/react-compiler/debugging.md) |

## What Compiler Does

### Before (Manual Memoization)
```jsx
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => heavyCalculation(item));
  }, [data]);

  const handleClick = useCallback(() => {
    onUpdate(processedData);
  }, [onUpdate, processedData]);

  return <div onClick={handleClick}>{processedData.length}</div>;
});
```

### After (Automatic with Compiler)
```jsx
// Just write natural React - compiler handles optimization
function ExpensiveComponent({ data, onUpdate }) {
  const processedData = data.map(item => heavyCalculation(item));

  const handleClick = () => {
    onUpdate(processedData);
  };

  return <div onClick={handleClick}>{processedData.length}</div>;
}
```

## Opting Out

If compiler causes issues with specific code:

```jsx
function ProblematicComponent() {
  "use no memo";
  // This component won't be compiled
  // ... complex code that doesn't work with compiler
}
```

## Requirements

- React 19 (or React 17/18 with react-compiler-runtime)
- Components must follow Rules of React (purity, hooks rules)
- No mutation of props, state, or values returned from hooks

## Installation Quick Start

### Next.js
```js
// next.config.js
module.exports = {
  experimental: {
    reactCompiler: true,
  },
};
```

### Vite
```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
```

### Babel
```js
// babel.config.js
module.exports = {
  plugins: ['babel-plugin-react-compiler'],
};
```

## Compiler Benefits

| Optimization | Manual Approach | With Compiler |
|--------------|-----------------|---------------|
| Component memoization | `memo()` | Automatic |
| Value memoization | `useMemo()` | Automatic |
| Callback memoization | `useCallback()` | Automatic |
| Dependency tracking | Manual arrays | Automatic |

Typical improvements:
- 30-60% fewer re-renders
- 20-40% faster expensive calculations
- Cleaner, more readable code
