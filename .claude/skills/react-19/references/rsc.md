# React Server Components Reference

Server Components and Server Functions for server-side React rendering.

## Overview

Server Components run on the server (at build time or request time) and send rendered output to the client. They can:
- Access server resources directly (databases, file system)
- Keep sensitive code/data on server
- Reduce client JavaScript bundle size

## Directives

| Directive | Summary | Full Doc |
|-----------|---------|----------|
| **"use client"** | Mark file as Client Component boundary. Components below can use hooks, browser APIs. | [docs/rsc/use-client.md](./rsc/use-client.md) |
| **"use server"** | Mark function as Server Function (Server Action). Callable from client, executes on server. | [docs/rsc/use-server.md](./rsc/use-server.md) |

## Core Concepts

| Concept | Summary | Full Doc |
|---------|---------|----------|
| **Server Components** | Components that render on server. Default in RSC frameworks. Cannot use useState, useEffect. | [docs/rsc/server-components.md](./rsc/server-components.md) |
| **Server Functions** | Async functions that run on server, called from client. Use for mutations, form handling. | [docs/rsc/server-functions.md](./rsc/server-functions.md) |
| **Directives Overview** | How "use client" and "use server" work together. | [docs/rsc/directives.md](./rsc/directives.md) |

## Key Rules

### Server Components
- Cannot use React hooks (useState, useEffect, etc.)
- Cannot use browser APIs (window, document)
- Can be async functions
- Can import and render Client Components
- Can pass serializable props to Client Components
- Can pass Server Functions as props

### Client Components
- Must be marked with "use client" at file top
- Can use all React hooks
- Can use browser APIs
- Cannot import Server Components (but can receive them as children)
- Can call Server Functions

### Server Functions
- Must be marked with "use server"
- Can be defined in Server Components or separate files
- Receive serializable arguments
- Must return serializable values
- Great for form actions, mutations, data fetching

## Quick Patterns

### Server Component with Data Fetching
```jsx
// No directive needed - Server Component by default
async function ProductList() {
  const products = await db.products.findMany();
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

### Client Component
```jsx
"use client";

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Server Function (Action)
```jsx
// In Server Component or separate file
async function addToCart(productId) {
  "use server";
  await db.cart.add({ productId, userId: getCurrentUser() });
  revalidatePath('/cart');
}

// Use in Client Component
function AddButton({ productId }) {
  return (
    <form action={addToCart.bind(null, productId)}>
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```

### Passing Server Function to Client
```jsx
// Server Component
async function ProductPage({ id }) {
  async function handlePurchase() {
    "use server";
    await processPurchase(id);
  }

  return <BuyButton onPurchase={handlePurchase} />;
}

// Client Component
"use client";
function BuyButton({ onPurchase }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => onPurchase())}
      disabled={isPending}
    >
      {isPending ? 'Processing...' : 'Buy Now'}
    </button>
  );
}
```

### Form with useActionState
```jsx
"use client";
import { useActionState } from 'react';
import { submitForm } from './actions';

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitForm, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button disabled={isPending}>
        {isPending ? 'Sending...' : 'Send'}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
      {state?.success && <p className="success">Message sent!</p>}
    </form>
  );
}
```

## Composition Patterns

### Server Component Rendering Client Component
```jsx
// Server Component
import ClientCounter from './ClientCounter';

async function Dashboard() {
  const data = await fetchDashboardData();
  return (
    <div>
      <h1>Dashboard</h1>
      <ClientCounter initialCount={data.visitCount} />
    </div>
  );
}
```

### Passing Server Components as Children
```jsx
// Server Component
async function ServerContent() {
  const data = await fetchData();
  return <p>{data.content}</p>;
}

// Client Component wrapper
"use client";
function InteractiveWrapper({ children }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>Toggle</button>
      {expanded && children}
    </div>
  );
}

// Usage
<InteractiveWrapper>
  <ServerContent />
</InteractiveWrapper>
```
