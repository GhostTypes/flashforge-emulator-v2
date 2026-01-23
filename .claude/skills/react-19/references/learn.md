# React Learning Guides Reference

Official React learning guides organized by topic. Use these to understand concepts, patterns, and best practices.

## Getting Started

| Guide | Summary | Full Doc |
|-------|---------|----------|
| **Quick Start** | Introduction to React fundamentals. | [docs/learn/index.md](./learn/index.md) |
| **Installation** | Installing React and setting up environment. | [docs/learn/installation.md](./learn/installation.md) |
| **Creating a React App** | Recommended frameworks (Next.js, Remix, etc.). | [docs/learn/creating-a-react-app.md](./learn/creating-a-react-app.md) |
| **Build from Scratch** | Building React app without framework. | [docs/learn/build-a-react-app-from-scratch.md](./learn/build-a-react-app-from-scratch.md) |
| **Add to Existing Project** | Adding React to non-React project. | [docs/learn/add-react-to-an-existing-project.md](./learn/add-react-to-an-existing-project.md) |
| **Editor Setup** | VS Code extensions, formatting, linting. | [docs/learn/editor-setup.md](./learn/editor-setup.md) |
| **React Developer Tools** | Browser extension for debugging. | [docs/learn/react-developer-tools.md](./learn/react-developer-tools.md) |
| **Setup** | Development environment configuration. | [docs/learn/setup.md](./learn/setup.md) |

## Core Concepts

| Guide | Summary | Full Doc |
|-------|---------|----------|
| **Thinking in React** | Mental model for building React apps. Break UI into components. | [docs/learn/thinking-in-react.md](./learn/thinking-in-react.md) |
| **Tutorial: Tic-Tac-Toe** | Hands-on tutorial building a game. | [docs/learn/tutorial-tic-tac-toe.md](./learn/tutorial-tic-tac-toe.md) |
| **TypeScript** | Using TypeScript with React. | [docs/learn/typescript.md](./learn/typescript.md) |

## Describing the UI

| Guide | Summary | Full Doc |
|-------|---------|----------|
| **Describing the UI** | Overview of UI building blocks. | [docs/learn/describing-the-ui.md](./learn/describing-the-ui.md) |
| **Your First Component** | Creating and exporting components. | [docs/learn/your-first-component.md](./learn/your-first-component.md) |
| **Importing/Exporting** | Module system, default vs named exports. | [docs/learn/importing-and-exporting-components.md](./learn/importing-and-exporting-components.md) |
| **Writing JSX** | JSX syntax, rules, expressions. | [docs/learn/writing-markup-with-jsx.md](./learn/writing-markup-with-jsx.md) |
| **JavaScript in JSX** | Curly braces, expressions, objects. | [docs/learn/javascript-in-jsx-with-curly-braces.md](./learn/javascript-in-jsx-with-curly-braces.md) |
| **Passing Props** | Component configuration via props. | [docs/learn/passing-props-to-a-component.md](./learn/passing-props-to-a-component.md) |
| **Conditional Rendering** | if, &&, ternary operators in JSX. | [docs/learn/conditional-rendering.md](./learn/conditional-rendering.md) |
| **Rendering Lists** | map(), key prop, filtering. | [docs/learn/rendering-lists.md](./learn/rendering-lists.md) |
| **Keeping Components Pure** | Purity rules, side effects, StrictMode. | [docs/learn/keeping-components-pure.md](./learn/keeping-components-pure.md) |
| **UI as a Tree** | Understanding component tree structure. | [docs/learn/understanding-your-ui-as-a-tree.md](./learn/understanding-your-ui-as-a-tree.md) |

## Adding Interactivity

| Guide | Summary | Full Doc |
|-------|---------|----------|
| **Adding Interactivity** | Overview of event handling and state. | [docs/learn/adding-interactivity.md](./learn/adding-interactivity.md) |
| **Responding to Events** | Event handlers, onClick, propagation. | [docs/learn/responding-to-events.md](./learn/responding-to-events.md) |
| **State: Component Memory** | useState basics, re-rendering. | [docs/learn/state-a-components-memory.md](./learn/state-a-components-memory.md) |
| **Render and Commit** | How React renders: trigger, render, commit phases. | [docs/learn/render-and-commit.md](./learn/render-and-commit.md) |
| **State as a Snapshot** | State captures value at render time. | [docs/learn/state-as-a-snapshot.md](./learn/state-as-a-snapshot.md) |
| **Queueing State Updates** | Batching, updater functions. | [docs/learn/queueing-a-series-of-state-updates.md](./learn/queueing-a-series-of-state-updates.md) |
| **Updating Objects in State** | Immutability, spread operator, nested objects. | [docs/learn/updating-objects-in-state.md](./learn/updating-objects-in-state.md) |
| **Updating Arrays in State** | Add, remove, update array items immutably. | [docs/learn/updating-arrays-in-state.md](./learn/updating-arrays-in-state.md) |

## Managing State

| Guide | Summary | Full Doc |
|-------|---------|----------|
| **Managing State** | Overview of state management patterns. | [docs/learn/managing-state.md](./learn/managing-state.md) |
| **Reacting to Input** | Declarative UI, state machines, reducing states. | [docs/learn/reacting-to-input-with-state.md](./learn/reacting-to-input-with-state.md) |
| **Choosing State Structure** | Grouping, avoiding duplication, flat state. | [docs/learn/choosing-the-state-structure.md](./learn/choosing-the-state-structure.md) |
| **Sharing State** | Lifting state up, controlled components. | [docs/learn/sharing-state-between-components.md](./learn/sharing-state-between-components.md) |
| **Preserving/Resetting State** | Key prop, state and position in tree. | [docs/learn/preserving-and-resetting-state.md](./learn/preserving-and-resetting-state.md) |
| **Extracting State to Reducer** | useReducer, actions, reducer functions. | [docs/learn/extracting-state-logic-into-a-reducer.md](./learn/extracting-state-logic-into-a-reducer.md) |
| **Context + Reducer** | Combining context with reducer for global state. | [docs/learn/scaling-up-with-reducer-and-context.md](./learn/scaling-up-with-reducer-and-context.md) |
| **Passing Data with Context** | createContext, useContext, avoiding prop drilling. | [docs/learn/passing-data-deeply-with-context.md](./learn/passing-data-deeply-with-context.md) |

## Escape Hatches (Effects, Refs)

| Guide | Summary | Full Doc |
|-------|---------|----------|
| **Escape Hatches** | Overview of refs and effects. | [docs/learn/escape-hatches.md](./learn/escape-hatches.md) |
| **Referencing Values with Refs** | useRef for non-reactive values. | [docs/learn/referencing-values-with-refs.md](./learn/referencing-values-with-refs.md) |
| **Manipulating DOM with Refs** | Accessing DOM nodes, scrolling, focusing. | [docs/learn/manipulating-the-dom-with-refs.md](./learn/manipulating-the-dom-with-refs.md) |
| **Synchronizing with Effects** | useEffect basics, cleanup, dependencies. | [docs/learn/synchronizing-with-effects.md](./learn/synchronizing-with-effects.md) |
| **You Might Not Need an Effect** | When NOT to use effects. Common anti-patterns. | [docs/learn/you-might-not-need-an-effect.md](./learn/you-might-not-need-an-effect.md) |
| **Lifecycle of Effects** | Mount, update, cleanup cycle. | [docs/learn/lifecycle-of-reactive-effects.md](./learn/lifecycle-of-reactive-effects.md) |
| **Separating Events from Effects** | Event handlers vs effects, when to use each. | [docs/learn/separating-events-from-effects.md](./learn/separating-events-from-effects.md) |
| **Removing Effect Dependencies** | Fixing unnecessary dependencies. | [docs/learn/removing-effect-dependencies.md](./learn/removing-effect-dependencies.md) |
| **Custom Hooks** | Extracting reusable logic into hooks. | [docs/learn/reusing-logic-with-custom-hooks.md](./learn/reusing-logic-with-custom-hooks.md) |

## React Compiler

| Guide | Summary | Full Doc |
|-------|---------|----------|
| **Compiler Index** | React Compiler documentation index. | [docs/learn/react-compiler/index.md](./learn/react-compiler/index.md) |
| **Introduction** | What the compiler does, why use it. | [docs/learn/react-compiler/introduction.md](./learn/react-compiler/introduction.md) |
| **Installation** | Setup for various build tools. | [docs/learn/react-compiler/installation.md](./learn/react-compiler/installation.md) |
| **Incremental Adoption** | Gradually adopting in existing projects. | [docs/learn/react-compiler/incremental-adoption.md](./learn/react-compiler/incremental-adoption.md) |
| **Debugging** | Troubleshooting compiler issues. | [docs/learn/react-compiler/debugging.md](./learn/react-compiler/debugging.md) |

## Key Takeaways for AI Agents

### State Management Decision Tree
1. **Local state** (useState) - Default choice for component-specific state
2. **Lifted state** - When siblings need to share state
3. **Context** - When many components at different depths need same data
4. **Reducer** - When state logic is complex with many updates
5. **Context + Reducer** - Global state with complex logic

### When to Use Effects
- Synchronizing with external systems (APIs, subscriptions, DOM)
- NOT for: transforming data, handling events, derived state

### Component Design Principles
- Keep components pure (same inputs = same output)
- Lift state to lowest common ancestor
- Prefer composition over inheritance
- Use key prop to reset component state
