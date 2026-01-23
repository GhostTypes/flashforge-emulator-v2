# React Hooks Reference

All React hooks for state, effects, context, refs, performance, and React 19 features.

## State Hooks

| Hook | Summary | Full Doc |
|------|---------|----------|
| **useState** | Add state variable to component. Returns `[state, setState]`. Use updater function for state based on previous value. | [docs/react/useState.md](./react/useState.md) |
| **useReducer** | Manage complex state with reducer function. Returns `[state, dispatch]`. Better than useState for related state updates. | [docs/react/useReducer.md](./react/useReducer.md) |

## Context Hooks

| Hook | Summary | Full Doc |
|------|---------|----------|
| **useContext** | Read and subscribe to context. Returns current context value. Re-renders when context changes. | [docs/react/useContext.md](./react/useContext.md) |

## Ref Hooks

| Hook | Summary | Full Doc |
|------|---------|----------|
| **useRef** | Reference value that persists across renders without triggering re-render. Access DOM nodes or store mutable values. | [docs/react/useRef.md](./react/useRef.md) |
| **useImperativeHandle** | Customize ref handle exposed to parent. Use with forwardRef (deprecated) or ref prop. | [docs/react/useImperativeHandle.md](./react/useImperativeHandle.md) |

## Effect Hooks

| Hook | Summary | Full Doc |
|------|---------|----------|
| **useEffect** | Synchronize with external systems. Runs after render. Return cleanup function. Specify dependencies array. | [docs/react/useEffect.md](./react/useEffect.md) |
| **useLayoutEffect** | Like useEffect but fires synchronously after DOM mutations, before browser paint. Use for DOM measurements. | [docs/react/useLayoutEffect.md](./react/useLayoutEffect.md) |
| **useInsertionEffect** | Insert styles before DOM mutations. For CSS-in-JS libraries only. | [docs/react/useInsertionEffect.md](./react/useInsertionEffect.md) |

## Performance Hooks

| Hook | Summary | Full Doc |
|------|---------|----------|
| **useMemo** | Cache expensive calculation between re-renders. Only recalculates when dependencies change. | [docs/react/useMemo.md](./react/useMemo.md) |
| **useCallback** | Cache function definition between re-renders. Returns same function unless dependencies change. | [docs/react/useCallback.md](./react/useCallback.md) |
| **useTransition** | Update state without blocking UI. Returns `[isPending, startTransition]`. Mark updates as non-urgent. | [docs/react/useTransition.md](./react/useTransition.md) |
| **useDeferredValue** | Defer updating part of UI. Shows stale value during re-render. New React 19: supports initialValue. | [docs/react/useDeferredValue.md](./react/useDeferredValue.md) |

## React 19 Hooks

| Hook | Summary | Full Doc |
|------|---------|----------|
| **useActionState** | Manage form action state. Returns `[state, formAction, isPending]`. Works with Server Functions. Renamed from useFormState. | [docs/react/useActionState.md](./react/useActionState.md) |
| **useOptimistic** | Show optimistic UI during async operations. Returns `[optimisticState, addOptimistic]`. Auto-reverts on error. | [docs/react/useOptimistic.md](./react/useOptimistic.md) |
| **use** | Read resources (Promises, Context) in render. Can be called conditionally unlike other hooks. Suspends on promises. | [docs/react/use.md](./react/use.md) |

## Other Hooks

| Hook | Summary | Full Doc |
|------|---------|----------|
| **useId** | Generate unique IDs for accessibility attributes. Stable across server/client. | [docs/react/useId.md](./react/useId.md) |
| **useDebugValue** | Display custom label in React DevTools for custom hooks. | [docs/react/useDebugValue.md](./react/useDebugValue.md) |
| **useSyncExternalStore** | Subscribe to external store. For library authors. Handles SSR hydration. | [docs/react/useSyncExternalStore.md](./react/useSyncExternalStore.md) |
| **useEffectEvent** | (Experimental) Extract non-reactive logic from Effects. Not in stable React yet. | [docs/react/useEffectEvent.md](./react/useEffectEvent.md) |

## Quick Patterns

### Form with useActionState
```jsx
const [state, formAction, isPending] = useActionState(async (prev, formData) => {
  const result = await submitForm(formData);
  return result.error || null;
}, null);

return (
  <form action={formAction}>
    <input name="email" />
    <button disabled={isPending}>Submit</button>
    {state && <p className="error">{state}</p>}
  </form>
);
```

### Optimistic Update
```jsx
const [optimisticItems, addOptimistic] = useOptimistic(items);

async function handleAdd(newItem) {
  addOptimistic([...items, { ...newItem, pending: true }]);
  await saveItem(newItem);
}
```

### Reading Promise with use()
```jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // Suspends until resolved
  return comments.map(c => <Comment key={c.id} {...c} />);
}
```
