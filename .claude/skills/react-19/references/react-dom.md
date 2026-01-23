# React DOM Reference

React DOM APIs for web applications - client rendering, server rendering, components, and resource loading.

## Client APIs (react-dom/client)

| API | Summary | Full Doc |
|-----|---------|----------|
| **createRoot** | Create root for rendering React app. `root.render(<App />)`. New error handlers in React 19. | [docs/react-dom/client/createRoot.md](./react-dom/client/createRoot.md) |
| **hydrateRoot** | Hydrate server-rendered HTML. `hydrateRoot(container, <App />)`. For SSR apps. | [docs/react-dom/client/hydrateRoot.md](./react-dom/client/hydrateRoot.md) |

## Server APIs (react-dom/server)

| API | Summary | Full Doc |
|-----|---------|----------|
| **renderToPipeableStream** | Render to Node.js stream. Supports Suspense streaming. Recommended for Node.js. | [docs/react-dom/server/renderToPipeableStream.md](./react-dom/server/renderToPipeableStream.md) |
| **renderToReadableStream** | Render to Web Stream. For edge runtimes (Deno, Cloudflare Workers). | [docs/react-dom/server/renderToReadableStream.md](./react-dom/server/renderToReadableStream.md) |
| **renderToString** | Render to string. No Suspense streaming. Consider streaming APIs instead. | [docs/react-dom/server/renderToString.md](./react-dom/server/renderToString.md) |
| **renderToStaticMarkup** | Render non-interactive HTML. No React attributes. For static pages/emails. | [docs/react-dom/server/renderToStaticMarkup.md](./react-dom/server/renderToStaticMarkup.md) |
| **resume** | Resume rendering from prerender. For partial hydration. | [docs/react-dom/server/resume.md](./react-dom/server/resume.md) |
| **resumeToPipeableStream** | Resume prerender to Node.js stream. | [docs/react-dom/server/resumeToPipeableStream.md](./react-dom/server/resumeToPipeableStream.md) |

## Static APIs (react-dom/static)

| API | Summary | Full Doc |
|-----|---------|----------|
| **prerender** | Generate static HTML. Waits for all data. For SSG. | [docs/react-dom/static/prerender.md](./react-dom/static/prerender.md) |
| **prerenderToNodeStream** | Prerender to Node.js stream. | [docs/react-dom/static/prerenderToNodeStream.md](./react-dom/static/prerenderToNodeStream.md) |
| **resumeAndPrerender** | Resume and complete prerender. | [docs/react-dom/static/resumeAndPrerender.md](./react-dom/static/resumeAndPrerender.md) |
| **resumeAndPrerenderToNodeStream** | Resume prerender to Node stream. | [docs/react-dom/static/resumeAndPrerenderToNodeStream.md](./react-dom/static/resumeAndPrerenderToNodeStream.md) |

## DOM APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **createPortal** | Render children into different DOM node. For modals, tooltips. | [docs/react-dom/createPortal.md](./react-dom/createPortal.md) |
| **flushSync** | Force React to flush updates synchronously. Avoid if possible. | [docs/react-dom/flushSync.md](./react-dom/flushSync.md) |

## Resource Preloading APIs

| API | Summary | Full Doc |
|-----|---------|----------|
| **prefetchDNS** | Prefetch DNS for domain. `prefetchDNS('https://api.example.com')` | [docs/react-dom/prefetchDNS.md](./react-dom/prefetchDNS.md) |
| **preconnect** | Preconnect to server. DNS + TCP + TLS. | [docs/react-dom/preconnect.md](./react-dom/preconnect.md) |
| **preload** | Preload resource (font, script, stylesheet). | [docs/react-dom/preload.md](./react-dom/preload.md) |
| **preloadModule** | Preload ESM module. | [docs/react-dom/preloadModule.md](./react-dom/preloadModule.md) |
| **preinit** | Fetch and execute script, or fetch stylesheet. | [docs/react-dom/preinit.md](./react-dom/preinit.md) |
| **preinitModule** | Fetch and evaluate ESM module. | [docs/react-dom/preinitModule.md](./react-dom/preinitModule.md) |

## React DOM Hooks

| Hook | Summary | Full Doc |
|------|---------|----------|
| **useFormStatus** | Get parent form's submission status. Returns `{ pending, data, method, action }`. | [docs/react-dom/hooks/useFormStatus.md](./react-dom/hooks/useFormStatus.md) |

## DOM Components

### Form Components
| Component | Summary | Full Doc |
|-----------|---------|----------|
| **\<form\>** | Form with action support. React 19: pass function to action prop. | [docs/react-dom/components/form.md](./react-dom/components/form.md) |
| **\<input\>** | Controlled/uncontrolled input. value + onChange for controlled. | [docs/react-dom/components/input.md](./react-dom/components/input.md) |
| **\<textarea\>** | Multi-line text input. Use value prop, not children. | [docs/react-dom/components/textarea.md](./react-dom/components/textarea.md) |
| **\<select\>** | Dropdown select. Use value prop on select, not selected on option. | [docs/react-dom/components/select.md](./react-dom/components/select.md) |
| **\<option\>** | Option within select. | [docs/react-dom/components/option.md](./react-dom/components/option.md) |
| **\<progress\>** | Progress indicator. | [docs/react-dom/components/progress.md](./react-dom/components/progress.md) |

### Document Metadata (React 19)
| Component | Summary | Full Doc |
|-----------|---------|----------|
| **\<title\>** | Document title. Render anywhere, hoisted to head. | [docs/react-dom/components/title.md](./react-dom/components/title.md) |
| **\<meta\>** | Meta tags. Render anywhere, hoisted to head. | [docs/react-dom/components/meta.md](./react-dom/components/meta.md) |
| **\<link\>** | External resources. stylesheet, icon, preload. | [docs/react-dom/components/link.md](./react-dom/components/link.md) |
| **\<style\>** | Inline stylesheet. Use precedence for ordering. | [docs/react-dom/components/style.md](./react-dom/components/style.md) |
| **\<script\>** | Script tag. async scripts auto-deduplicated. | [docs/react-dom/components/script.md](./react-dom/components/script.md) |

### Common Props
See [docs/react-dom/components/common.md](./react-dom/components/common.md) for props shared by all DOM components (className, style, ref, event handlers, etc.).

## Quick Patterns

### Creating Root with Error Handlers (React 19)
```jsx
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'), {
  onUncaughtError: (error, errorInfo) => {
    // Not caught by Error Boundary
    reportToService(error, errorInfo);
  },
  onCaughtError: (error, errorInfo) => {
    // Caught by Error Boundary
    logError(error);
  },
  onRecoverableError: (error, errorInfo) => {
    // Auto-recovered (hydration mismatch, etc.)
    console.warn('Recovered:', error);
  }
});
root.render(<App />);
```

### Form with Action
```jsx
<form action={async (formData) => {
  await saveData(formData);
}}>
  <input name="title" />
  <SubmitButton />
</form>

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Save</button>;
}
```

### Document Metadata
```jsx
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```
