---
name: react-19
description: Comprehensive React 19 development skill with 150+ official react.dev documents. Use when writing React components, hooks, Server Components, forms, or any React code. Covers state management (useState, useReducer, Context), effects (useEffect, useLayoutEffect), refs, performance optimization, React Compiler, Server Components ("use server", "use client"), Server Functions, form actions (useActionState, useFormStatus, useOptimistic), and all React DOM APIs. Includes full official documentation from react.dev organized by topic.
---

# React 19 Development Skill

Production-ready React 19 development with 150+ official docs from react.dev.

## Quick Reference

### New in React 19

| Feature | Usage |
|---------|-------|
| **useActionState** | `const [state, action, pending] = useActionState(fn, init)` |
| **useOptimistic** | `const [optimistic, add] = useOptimistic(state)` |
| **useFormStatus** | `const { pending } = useFormStatus()` |
| **use()** | `const data = use(promise)` - Read promises/context in render |
| **Form actions** | `<form action={serverFn}>` |
| **ref as prop** | `function Input({ ref }) {}` - No forwardRef needed |
| **Context as Provider** | `<ThemeContext value="dark">` |

### Hook Selection

| Need | Hook |
|------|------|
| Component state | `useState` |
| Complex state logic | `useReducer` |
| Shared state (tree) | `useContext` |
| Side effects | `useEffect` |
| DOM measurement | `useLayoutEffect` |
| DOM/value reference | `useRef` |
| Expensive calculation | `useMemo` |
| Stable callback | `useCallback` |
| Non-blocking update | `useTransition` |
| Form submission | `useActionState` |
| Optimistic UI | `useOptimistic` |

### Server vs Client

```jsx
// Server Component (default in RSC frameworks)
async function ProductPage({ id }) {
  const product = await db.products.get(id);
  return <ProductDetails product={product} />;
}

// Client Component
"use client";
function AddToCart({ productId }) {
  const [pending, setPending] = useState(false);
}

// Server Function
async function addToCart(productId) {
  "use server";
  await db.cart.add(productId);
}
```

## Documentation Structure

### Reference Guides (Summaries + Links to Full Docs)

| Reference | Contents |
|-----------|----------|
| [references/hooks.md](references/hooks.md) | All React hooks - state, effects, refs, performance, React 19 |
| [references/react-apis.md](references/react-apis.md) | Components, Context, lazy, memo, startTransition |
| [references/react-dom.md](references/react-dom.md) | Client/Server/Static rendering, DOM components, preloading |
| [references/rsc.md](references/rsc.md) | Server Components, Server Functions, directives |
| [references/compiler.md](references/compiler.md) | React Compiler setup, configuration, directives |
| [references/learn.md](references/learn.md) | Learning guides index - concepts, patterns, best practices |

### Official Docs (Full Documentation)

| Folder | Files | Contents |
|--------|-------|----------|
| `references/react/` | 49 | All hooks, APIs, built-in components |
| `references/react-dom/` | 39 | Client, server, static APIs, DOM components |
| `references/rsc/` | 5 | Server Components, Server Functions |
| `references/learn/` | 51 | Tutorials, concepts, patterns |
| `references/react-compiler/` | 10 | Compiler configuration |

## Common Patterns

### Form with Server Action
```jsx
"use client";
import { useActionState } from 'react';
import { submitForm } from './actions';

function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitForm,
    { error: null, success: false }
  );

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <button disabled={isPending}>
        {isPending ? 'Sending...' : 'Send'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

### Optimistic Update
```jsx
function TodoList({ todos, onAdd }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(todos);

  async function handleAdd(formData) {
    const title = formData.get('title');
    addOptimistic([...todos, { title, pending: true }]);
    await onAdd(title);
  }

  return (
    <form action={handleAdd}>
      <input name="title" />
      <button>Add</button>
      <ul>
        {optimisticTodos.map((todo, i) => (
          <li key={i} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

### Data Fetching with Suspense
```jsx
import { use, Suspense } from 'react';

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(c => <Comment key={c.id} {...c} />);
}

function Post({ post, commentsPromise }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <Comments commentsPromise={commentsPromise} />
      </Suspense>
    </article>
  );
}
```

## Decision Trees

### Form Handling
```
Need form state management?
├─ Server mutation → Server Action with form action
├─ Client with loading/error → useActionState
├─ Form field status → useFormStatus
└─ Simple local → useState
```

### State Management
```
What type of state?
├─ Form input → useState or useFormInput hook
├─ Complex logic → useReducer
├─ Few components → Lift state up
├─ App-wide (theme, auth) → Context
├─ Frequent updates → Zustand/Jotai
└─ Server data → Server Components or React Query
```

### Component Type
```
Needs interactivity?
├─ No (data, lists) → Server Component
├─ Yes (buttons, forms) → Client Component ("use client")
└─ Mixed → Server parent + Client children
```

## When to Read Full Docs

- **Specific hook**: `references/react/[hookName].md`
- **DOM component**: `references/react-dom/components/[name].md`
- **Server rendering**: `references/react-dom/server/*.md`
- **Concepts/patterns**: `references/learn/[topic].md`
- **Compiler config**: `references/react-compiler/*.md`

## Performance Quick Wins

1. **React Compiler** - Automatic memoization
2. **Code Split Routes** - `lazy(() => import('./Page'))`
3. **Virtualize Lists** - `react-window` for 50+ items
4. **Split Contexts** - By update frequency
5. **Image Optimization** - WebP, lazy load, explicit dimensions

## Migration from React 18

| Before | After |
|--------|-------|
| `forwardRef(Comp)` | `function Comp({ ref })` |
| `<Context.Provider>` | `<Context value={}>` |
| Manual memo | React Compiler |
| `useFormState` | `useActionState` |
| `ReactDOM.render()` | `createRoot().render()` |

## Common Gotchas

- **`use()` promises** - Must come from outside render
- **Server Components** - No hooks, event handlers, browser APIs
- **`"use server"`** - For Server Functions only, not Server Components
- **ref cleanup** - Return cleanup function from ref callback
- **Context cascade** - Split by update frequency
