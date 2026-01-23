# React APIs Reference

Core React APIs for components, context, refs, and utilities.

## Built-in Components

| Component | Summary | Full Doc |
|-----------|---------|----------|
| **Fragment** | Group elements without wrapper node. Shorthand: `<>...</>`. Use `<Fragment key={}>` for keyed fragments. | [docs/react/Fragment.md](./react/Fragment.md) |
| **Suspense** | Display fallback while children load. Wrap lazy components or data-fetching components. | [docs/react/Suspense.md](./react/Suspense.md) |
| **StrictMode** | Enable extra development checks. Double-invokes render, effects. Warns about deprecated APIs. | [docs/react/StrictMode.md](./react/StrictMode.md) |
| **Profiler** | Measure rendering performance programmatically. Use in development. | [docs/react/Profiler.md](./react/Profiler.md) |
| **Activity** | (Experimental) Manage component activity state for view transitions. | [docs/react/Activity.md](./react/Activity.md) |
| **ViewTransition** | (Experimental) Enable view transitions for navigation/state changes. | [docs/react/ViewTransition.md](./react/ViewTransition.md) |

## Context APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **createContext** | Create context for passing data through tree. Returns Provider component. React 19: use Context directly as Provider. | [docs/react/createContext.md](./react/createContext.md) |

## Ref APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **createRef** | Create ref object for class components. For function components, use useRef instead. | [docs/react/createRef.md](./react/createRef.md) |
| **forwardRef** | (Deprecated in React 19) Let component expose DOM node to parent. Now use `ref` as regular prop. | [docs/react/forwardRef.md](./react/forwardRef.md) |

## Component APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **lazy** | Lazy-load component code. Use with Suspense. `const LazyComp = lazy(() => import('./Comp'))` | [docs/react/lazy.md](./react/lazy.md) |
| **memo** | Skip re-rendering when props unchanged. Wrap component: `memo(MyComponent)`. React Compiler makes this less needed. | [docs/react/memo.md](./react/memo.md) |
| **startTransition** | Mark state update as non-urgent. Keeps UI responsive. `startTransition(() => setState(newValue))` | [docs/react/startTransition.md](./react/startTransition.md) |

## Element APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **createElement** | Create React element. JSX compiles to this. Rarely used directly. | [docs/react/createElement.md](./react/createElement.md) |
| **cloneElement** | Clone element with different props. Consider alternatives like render props or composition. | [docs/react/cloneElement.md](./react/cloneElement.md) |
| **isValidElement** | Check if value is React element. Returns boolean. | [docs/react/isValidElement.md](./react/isValidElement.md) |
| **Children** | Utilities for working with `props.children`. Consider restructuring data instead. | [docs/react/Children.md](./react/Children.md) |

## Server/Cache APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **cache** | Cache function results. For Server Components. Memoize data fetching across renders. | [docs/react/cache.md](./react/cache.md) |
| **cacheSignal** | (Experimental) Get AbortSignal for cache invalidation. | [docs/react/cacheSignal.md](./react/cacheSignal.md) |

## Testing APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **act** | Wrap code that causes React updates in tests. Ensures updates are processed before assertions. | [docs/react/act.md](./react/act.md) |

## Transition APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **addTransitionType** | (Experimental) Add transition type for view transitions. | [docs/react/addTransitionType.md](./react/addTransitionType.md) |

## Debug APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **captureOwnerStack** | (Experimental) Capture component stack for error reporting. | [docs/react/captureOwnerStack.md](./react/captureOwnerStack.md) |

## Security APIs (Experimental)

| API | Summary | Full Doc |
|-----|---------|----------|
| **experimental_taintObjectReference** | Mark object as unsafe to pass to Client Components. | [docs/react/experimental_taintObjectReference.md](./react/experimental_taintObjectReference.md) |
| **experimental_taintUniqueValue** | Mark unique value (token, key) as unsafe to pass to client. | [docs/react/experimental_taintUniqueValue.md](./react/experimental_taintUniqueValue.md) |

## Legacy APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **Component** | Base class for class components. Use function components instead. | [docs/react/Component.md](./react/Component.md) |
| **PureComponent** | Component that skips re-render if props/state unchanged. Use memo() for function components. | [docs/react/PureComponent.md](./react/PureComponent.md) |

See [docs/react/legacy.md](./react/legacy.md) for deprecated APIs.

## React 19 Changes

### ref as Regular Prop
```jsx
// React 19: No forwardRef needed
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

### Context as Provider
```jsx
// React 19: Use Context directly
const ThemeContext = createContext('light');

function App({ children }) {
  return (
    <ThemeContext value="dark">
      {children}
    </ThemeContext>
  );
}
```

### Ref Cleanup Functions
```jsx
<input ref={(node) => {
  // Setup
  return () => {
    // Cleanup when unmounted
  };
}} />
```
