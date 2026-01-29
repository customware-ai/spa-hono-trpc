# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **For project overview**: See [README.md](./README.md) for features, architecture details, and documentation.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run typecheck    # TypeScript checking + React Router typegen
npm run lint         # Type-aware linting with oxlint
npm test             # Run all tests with Vitest
npm run check        # Run typecheck + lint + build + test (full validation)
```

To run a single test file:

```bash
npx vitest run tests/db/db.test.ts
```

## Architecture

This is a full-stack React Router v7 application with SQLite (sql.js) persistence.

## Development Requirements

- **Strict types with schemas**: Always define and use Zod schemas for data validation. Derive TypeScript types from schemas using `z.infer<>`.
- **Write tests for changes**: Any code changes must include corresponding tests in the `tests/` directory.
- **Run checks after every task**: After completing any `task`, run `npm run check` to validate typecheck, lint, build, and tests all pass.

### Key Patterns

#### Error Handling with neverthrow

All database operations in `app/db.ts` return `Result<T, E>` types from neverthrow. Check results with `.isErr()` / `.isOk()` before accessing values. Error types are defined in `app/types/errors.ts`.

```typescript
import { Result, ok, err } from "neverthrow";
import type { DatabaseError } from "./types/errors";

export async function getRecords(): Promise<
  Result<SqlValue[][], DatabaseError>
> {
  try {
    const { db } = await getDatabase();
    const result = db.exec("SELECT * FROM my_table");
    return ok(result[0]?.values || []);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to fetch records",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

// Usage in loaders
const result = await getRecords();
if (result.isErr()) {
  return { data: [], error: result.error.message };
}
return { data: result.value };
```

#### Schema Validation with Zod

Zod schemas in `app/schemas/index.ts` define data types. Use `z.infer<typeof Schema>` for type inference.

```typescript
import { z } from "zod";

export const RecordSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required").max(100),
  created_at: z.string().optional(),
});

export type Record = z.infer<typeof RecordSchema>;
```

#### Database

sql.js runs SQLite in JavaScript with file persistence to `database.db`. Every mutation calls `saveDatabase()` to persist changes. Define your tables in `app/db.ts`. If `database.db` is not present, treat this as a new project—tables are created on first run without migrations.

### Directory Structure

- `app/components/ui/` - Reusable UI components (Button, Card, Input, Badge, Alert)
- `app/routes/` - Page components and API endpoints
- `app/db.ts` - Database operations with Result types
- `app/schemas/` - Zod validation schemas
- `app/types/` - TypeScript type definitions
- `app/utils/` - Helper functions (api, json, logger, validate)
- `tests/` - Vitest tests organized by category

### Linting Rules

oxlint enforces:

- `typescript/explicit-function-return-type`: Required on all functions
- `typescript/no-explicit-any`: No `any` types allowed
- `react/jsx-key`: Keys required in JSX lists

### Path Alias

Use `~/` to import from `app/` directory (e.g., `import { Button } from '~/components/ui/Button'`).

## Autonomous Task Workflow

You work autonomously on all tasks until done.

### Task Discovery

Tasks are in `/workspace/development/.agent/tasks/` as markdown files:

- Named with numeric prefixes: `00_task-name.md`, `01_another.md`
- Process in order (lowest number first)
- Each has frontmatter (taskId, orgId, projectId) and description

### Workflow Loop

1. **Check for tasks**: `ls /workspace/development/.agent/tasks/`
2. **If empty**: You're done - stop working
3. **If tasks exist**: Read first file (alphabetically)
4. **Execute**: Follow instructions in file
5. **Verify**: Run `npm run check`
6. **Complete**: Call `task_complete` (this deletes the file)
7. **Loop**: Return to step 1

### Context Management

Re-read files anytime especially when the conversation is compacted:

- README.md for project conventions
- CLAUDE.md for rules
- Current task file for task details

### Rules

- Always call task_complete - never delete task files manually
- One task at a time - complete before starting next
- Verify with npm run check before completing
- **NEVER stop working until `/workspace/development/.agent/tasks/` is empty**
- If you feel the conversation is getting long, do NOT summarize and stop - keep executing tasks
- After completing a task, immediately check for more tasks and continue
- The ONLY valid stopping condition is: `ls /workspace/development/.agent/tasks/` returns no `.md` files

**Example task_complete usage:**

```bash
task_complete --orgId "abc" --projectId "xyz" --taskId "123" --taskName "Task Name" --taskFilePath "/workspace/development/.agent/tasks/00_task-name.md" --status completed --summary "Implemented feature X with Y approach"
```

Use `--status failed` if the task cannot be completed, with a summary explaining why.

## Project Context (Do This First)

- Read `README.md` before making decisions so you understand what the app is, how it runs, and the repo conventions
- Read `CLAUDE.md` for instructions on how to develop with the system
- If the README points to other sources of truth (e.g. `.env.example`, `package.json`, `docs/`), read those too

## React Router v7 Reference Guide

### Overview

React Router v7 is essentially "Remix v3" - it brings Remix's framework features into React Router. The distinction between the two has become minimal.

---

### Common Features: React Router v7 & Remix

#### Core Architecture

- **Data Routers**: Function-based route definitions with `loader`/`action` functions
- **Vite Plugin**: Both use Vite-based compilation for bundling and optimization
- **Nested Routing**: Support nested routes with independent data loading
- **SSR Support**: Built-in server-side rendering capabilities
- **Code Splitting**: Automatic bundle splitting and optimization

#### Data Loading & Mutations

- **Loaders**: `async loader({ params, request, context })` - fetch data before rendering
- **Actions**: `async action({ params, request, context })` - handle form submissions and mutations
- **Form Component**: `<Form>` from react-router automatically handles navigation and calls actions
- **Hooks**:
  - `useLoaderData()` - access loader data
  - `useActionData()` - access action results
  - `useFetcher()` - non-navigational data fetching
  - `useNavigation()` - navigation state

#### Error Handling

- **Route-level Error Boundaries**: `errorElement` property on routes
- **Error Propagation**: Errors bubble up to nearest error boundary
- **Granular Control**: Each route can have its own error handling

#### React 18+ Integration

- **Suspense**: Built-in integration with React Suspense
- **Await Component**: `<Await>` for streaming/deferred data
- **useTransition**: Uses React.useTransition for state updates

---

### Differences: React Router v7 vs Remix

#### Package & Branding

- **React Router v7**: Core package is `react-router` (unified)
- **Remix**: Used separate packages (`@remix-run/node`, `@remix-run/cloudflare`, etc.)
- **Migration Path**: Remix v2 → React Router v7 (just change imports)

Remix was framework-only.

#### Configuration

- **React Router v7**: `react-router.config.ts` for framework config
- **Remix**: Used `remix.config.js`

#### File-Based Routing

- **React Router v7**: Optional - use `routes.ts` for programmatic routes
- **Remix**: File-based routing was the primary/default approach

#### SSR Setup

- **React Router v7**: Built-in SSR out of box
- **Remix/v7**: Built-in SSR and deployment pipelines

---

### Changes from React Router v6 to v7

#### Key Changes from v6

##### 1. `json()` and `defer()` Deprecated

```javascript
// v6
export async function loader() {
  return json({ data });
}

// v7 - return raw objects
export async function loader() {
  return { data };
}

// If need JSON serialization, use native API
export async function loader() {
  return Response.json({ data });
}
```

##### 2. Future Flags (now default in v7)

These were opt-in flags in v6, now default behavior:

- **v7_relativeSplatPath**: Changes relative path matching for multi-segment splat routes (`dashboard/*`)
- **v7_startTransition**: Uses `React.useTransition` instead of `React.useState`
- **v7_fetcherPersist**: Fetcher lifecycle based on idle state, not component unmount
- **v7_normalizeFormMethod**: Normalizes form methods
- **v7_partialHydration**: Partial hydration support
- **v7_skipActionErrorRevalidation**: Skip revalidation on action errors

##### 3. Data Strategy APIs Stabilized

```javascript
// Unstable → Stable
unstable_dataStrategy → dataStrategy
unstable_patchRoutesOnNavigation → patchRoutesOnNavigation
unstable_flushSync → flushSync
unstable_viewTransition → viewTransition
```

##### 4. React.lazy Usage

- Must move `React.lazy()` to module scope (not inside components)
- Incompatible with `React.useTransition` inside components

##### TypeGen System

- Run `npx react-router typegen` to generate types
- Provides type-safe `params`, `loaderData`, `actionData`

##### Route Module API

```typescript
// routes/product.tsx
import { Route } from "./+types/product";

export async function loader({ params }: Route.LoaderArgs) {
  return { product: await getProduct(params.id) };
}

export default function Product({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.product.name}</div>;
}
```

#### Key Architectural Shift

**v6**: Component-based routing, manual data fetching in components

```javascript
function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  return <div>{data && data.name}</div>;
}
```

**v7**: Declarative data loading at route level

```javascript
export async function loader() {
  return { data: await fetchData() };
}

function Dashboard() {
  const { data } = useLoaderData();
  return <div>{data.name}</div>;
}
```

#### Error Handling Improvements

- Route-level `errorElement` for granular error boundaries
- Better error propagation and debugging
- Integration with React Error Boundaries

---

#### Essential Hooks

```javascript
useLoaderData(); // Access loader data
useActionData(); // Access action results
useNavigation(); // Navigation state (idle, loading, submitting)
useSubmit(); // Programmatic form submission
useFetcher(); // Non-navigational data operations
useParams(); // URL parameters
useNavigate(); // Programmatic navigation
useLocation(); // Current location
useMatches(); // Matched routes
useRouteError(); // Error in error boundary
```

#### Components

```javascript
<Link to="/path">          // Navigation link
<NavLink to="/path">       // Link with active state
<Form method="post">       // Declarative form (calls action)
<Outlet />                 // Render child routes
<ScrollRestoration />      // Restore scroll position
<Await resolve={promise}>  // Streaming/deferred data
```

---
