# AGENTS.md

This file provides guidance to LLMs when working with code in this repository.

> **For project overview**: See [README.md](./README.md) for features, architecture details, and documentation.

## 🎯 Core Principles

This codebase follows strict architectural patterns and coding standards:

### 1. **Type Safety First**

- Every function must have explicit return types
- No `any` types allowed - use `unknown` or proper types
- Use Zod schemas for runtime validation, derive TypeScript types from schemas
- Full type checking must pass before committing

### 2. **Clean Architecture**

- **db.ts** - Database & filesystem operations ONLY (single source of truth)
- **services/** - Business logic & CRUD operations (uses Result pattern)
- **schemas/** - Zod validation schemas (source of truth for types)
- **routes/** - Page components with loaders/actions (no business logic)
- **components/** - UI components only (no data fetching or business logic)
- **utils/** - Pure utility functions

### 3. **Error Handling**

- Use neverthrow's `Result<T, E>` pattern for all operations that can fail
- Never throw exceptions in business logic
- Check `.isErr()` / `.isOk()` before accessing values
- Provide meaningful error messages

### 4. **Testing Requirements**

- All business logic must have tests
- All UI components must have tests
- Run checks only at the very end of the task (right before marking it complete). Run the narrowest relevant check based on what changed (e.g. `npm run typecheck` when only TypeScript/types are modified, `npm test` when tests are updated). No need to run checks for non-code-only changes (e.g. updating Markdown/docs, copy, comments, or other non-executable content).
- Run `npm run check` at the very end only when multiple areas are updated and full validation is needed
- Test coverage is mandatory, not optional

### 5. **Code Quality Standards**

- Write self-documenting code with clear names
- Comment the "why", not the "what"
- Follow the single responsibility principle
- Keep functions small and focused

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

### Architectural Flow

The application follows a strict layered architecture with clear data flow:

```
User Request
    ↓
Route (loader/action)
    ↓
Service Layer (erp.ts)
    ↓
Schema Validation (Zod)
    ↓
Database Layer (db.ts)
    ↓
SQLite (sql.js)
```

**Key Rules:**

1. **Routes** call **services**, never database directly
2. **Services** validate with **schemas**, then call **database**
3. **Database (db.ts)** is the ONLY file that touches filesystem
4. **Components** receive data via props, never fetch directly
5. All data flows through the Result pattern for type-safe error handling

### Type Safety Flow

Every layer maintains strict type safety:

```typescript
// 1. Define Schema (schemas/sales.ts)
export const CustomerSchema = z.object({
  id: z.number().optional(),
  company_name: z.string().min(1).max(200),
  email: z.string().email().optional(),
});

// 2. Derive TypeScript Type
export type Customer = z.infer<typeof CustomerSchema>;

// 3. Service validates and uses typed Result (services/erp.ts)
export async function createCustomer(
  data: unknown,
): Promise<Result<Customer, Error>> {
  // Validate input
  const validation = CustomerSchema.safeParse(data);
  if (!validation.success) {
    return err(new Error("Validation failed"));
  }

  // Database operation
  const result = await insertCustomer(validation.data);
  if (result.isErr()) {
    return err(result.error);
  }

  return ok(result.value);
}

// 4. Route loader uses typed result (routes/customers.tsx)
export async function loader(): Promise<{
  customers: Customer[];
  error: string | null;
}> {
  const result = await getCustomers();

  if (result.isErr()) {
    return { customers: [], error: result.error.message };
  }

  return { customers: result.value, error: null };
}

// 5. Component receives typed data
export default function CustomersPage(): ReactElement {
  const { customers, error } = useLoaderData<typeof loader>();
  // customers is Customer[], fully typed
}
```

### Database Layer Rules

**CRITICAL**: `db.ts` is the ONLY file that:

- Imports sql.js
- Reads/writes `database.db` file
- Manages database connection
- Calls `saveDatabase()` after mutations

**NEVER:**

- Import better-sqlite3 (we use sql.js)
- Access filesystem outside of db.ts
- Bypass the database layer
- Skip calling saveDatabase() after mutations

## Development Requirements

### Non-Negotiable Rules

1. **Strict Type Safety**
   - Every function must have explicit return types
   - No `any` types - use `unknown` or specific types
   - Always define Zod schemas for data validation
   - Derive TypeScript types from schemas using `z.infer<>`

2. **Test Coverage**
   - All code changes must include corresponding tests
   - Tests must cover happy paths and error cases
   - Place tests in `tests/` mirroring the source structure
   - Run `npm test` to verify all tests pass

3. **Validation Before Completion**
   - Run checks only at the very end of the task (right before marking it complete). Use focused validation based on the scope of changes (e.g. `npm run typecheck` when only TypeScript/types are modified, `npm test` when tests are updated, `npm run lint` for lint-focused refactors). Skip checks for non-code-only changes (e.g. Markdown/docs, copy, comments, or other non-executable content).
   - Run `npm run check` at the very end only when multiple areas are updated
   - This runs: typecheck + lint + build + test
   - ALL checks must pass before considering task complete
   - Fix any errors before moving to next task

4. **Single Source of Truth**
   - Database operations ONLY in `db.ts`
   - Business logic ONLY in `services/`
   - Validation schemas ONLY in `schemas/`
   - UI components ONLY in `components/`
   - Never bypass these layers

5. **Error Handling Pattern**
   - Use neverthrow's `Result<T, E>` for all operations that can fail
   - Never throw exceptions in business logic
   - Always check `.isErr()` / `.isOk()` before accessing values
   - Provide meaningful error messages

### Code Style Requirements

- **Comments**: Explain the "why", not the "what"
- **Naming**: Clear, descriptive names for functions and variables
- **Functions**: Keep small and focused (single responsibility)
- **Imports**: Use `~/` path alias for app imports
- **Formatting**: Let Prettier handle formatting (configured in project)

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

**Always define schemas first, derive types from them:**

```typescript
// ❌ WRONG - Don't define TypeScript types first
interface User {
  id?: number;
  name: string;
  email: string;
}

// ✅ CORRECT - Define Zod schema, derive type
import { z } from "zod";

export const UserSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  created_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Create/Update schemas for forms
export const CreateUserSchema = UserSchema.omit({ id: true, created_at: true });
export const UpdateUserSchema = UserSchema.partial().required({ id: true });
```

**Schema Validation in Services:**

```typescript
export async function createUser(data: unknown): Promise<Result<User, Error>> {
  // Always validate unknown input
  const validation = CreateUserSchema.safeParse(data);

  if (!validation.success) {
    return err(new Error(`Validation failed: ${validation.error.message}`));
  }

  // validation.data is now typed and safe to use
  const result = await insertUser(validation.data);
  return result;
}
```

#### Database & Migrations

**Database Technology:** sql.js (SQLite in JavaScript) with file persistence to `database.db`

**Critical Rules:**

1. **db.ts** is the ONLY file that imports sql.js and touches the filesystem
2. Every mutation MUST call `saveDatabase()` to persist changes
3. Use the migration system for all schema changes
4. Never modify the database schema directly in production

**Migration System:**

```typescript
// app/db-migrations/001-initial-schema.ts
export const migration_001 = {
  id: 1,
  name: "initial-schema",
  up: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,
  down: `DROP TABLE IF EXISTS users;`,
};
```

**Migration Workflow:**

When creating a new migration:

1. **Create** the migration file in `app/db-migrations/` with sequential numbering
2. **Run** the migration: `npm run migrate`
3. **Verify** it ran successfully (check for errors in output)
4. **Test** that it works:
   - Check `database.db` file was updated
   - Verify tables/columns were created correctly
   - Write/update tests for any new database operations

```bash
# After creating a migration file:
npm run migrate              # Apply the migration
npm test                     # Ensure tests pass
```

**CRITICAL**: Always run and verify migrations immediately after creating them. Never commit a migration file without confirming it runs successfully.

**Database Operations Pattern:**

```typescript
// ✅ CORRECT - All database operations in db.ts
export async function insertUser(
  data: Omit<User, "id">,
): Promise<Result<User, DatabaseError>> {
  try {
    const { db } = await getDatabase();

    db.run(`INSERT INTO users (name, email) VALUES (?, ?)`, [
      data.name,
      data.email,
    ]);

    // CRITICAL: Save after mutation
    await saveDatabase();

    const result = db.exec(
      `SELECT * FROM users WHERE id = last_insert_rowid()`,
    );

    return ok(mapRowToUser(result[0].values[0]));
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to insert user",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

// ❌ WRONG - Never import sql.js outside db.ts
import initSqlJs from "sql.js"; // NEVER DO THIS
```

### Directory Structure

```
app/
├── components/
│   ├── layout/          # Sidebar, TopBar, PageLayout, PageHeader
│   ├── ui/              # Reusable UI components (Button, Card, Input, etc.)
│   └── [feature]/       # Feature-specific components
├── routes/
│   ├── dashboard.tsx    # Main dashboard/home route
│   └── [feature]/       # Feature module routes (nested)
├── services/
│   └── [service].ts     # Business logic & CRUD operations
├── schemas/
│   └── [entity].ts      # Entity validation schemas (Zod)
├── db-migrations/
│   ├── migrate.ts       # Migration system
│   └── 00X-*.ts         # Numbered database migrations
├── utils/
│   └── [utility].ts     # Pure utility functions
├── db.ts                # Database layer (ONLY file for filesystem)
├── types/               # TypeScript type definitions
└── root.tsx             # Root layout component

tests/                   # Test files mirror app/ structure
├── components/          # UI component tests
├── db/                  # Database operation tests
└── services/            # Business logic tests
```

**Structure Principles:**

- Group by feature/domain (feature folders)
- Separate concerns by layer (db → services → schemas → routes → components)
- One file per entity/service/component
- Tests mirror the source structure
- Clear naming conventions

### Design System

**Color Palette:**

- Primary: Emerald green (`primary-*` Tailwind classes)
- Surface: Slate gray (`surface-*` Tailwind classes)
- Status colors: Red (danger), Amber (warning), Green (success), Blue (info)

**Typography:**

- Font: Work Sans (weights: 400, 500, 600, 700)
- Professional, industrial aesthetic
- NO generic AI aesthetics - distinctive, purposeful design

**Component Patterns:**

- All components in `app/components/ui/` are tested and reusable
- Use composition over configuration
- Props interfaces defined with TypeScript
- Consistent styling with Tailwind CSS v4

**Layout Structure:**

- `PageLayout` - Main page wrapper with breadcrumbs
- `PageHeader` - Consistent page titles and actions
- `Sidebar` - Left navigation
- `TopBar` - Top navigation and user menu

### React Component Patterns

**Component Structure:**

```typescript
// ✅ CORRECT - Full type safety
interface ButtonProps {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
}: ButtonProps): ReactElement {
  return (
    <button
      className={clsx(
        "font-semibold rounded transition-colors",
        variantStyles[variant],
        sizeStyles[size]
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

**Route Component Pattern:**

```typescript
// routes/users.tsx
import type { ReactElement } from "react";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUsers } from "~/services/users";

// Loader - fetch data before rendering
export async function loader({
  request,
}: LoaderFunctionArgs): Promise<{
  users: User[];
  error: string | null;
}> {
  const result = await getUsers();

  if (result.isErr()) {
    return { users: [], error: result.error.message };
  }

  return { users: result.value, error: null };
}

// Component - render with typed data
export default function UsersPage(): ReactElement {
  const { users, error } = useLoaderData<typeof loader>();

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return <UserTable users={users} />;
}
```

**Key React Patterns:**

- Use functional components exclusively
- Explicit return types (`ReactElement`, `ReactNode`, etc.)
- Props interfaces for all components
- Use composition over prop drilling
- Keep components focused and small

### Linting Rules

oxlint enforces strict standards:

- `typescript/explicit-function-return-type`: Required on all functions
- `typescript/no-explicit-any`: No `any` types allowed
- `react/jsx-key`: Keys required in JSX lists
- All violations must be fixed before committing

### Testing Patterns

**All code changes require tests.** Use Vitest and React Testing Library.

**Component Testing:**

```typescript
// tests/components/Button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "~/components/ui/Button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDisabled();
  });
});
```

**Service Testing:**

```typescript
// tests/services/users.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getUsers, createUser } from "~/services/users";
import { resetDatabase } from "~/db";

describe("User Service", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates a user successfully", async () => {
    const result = await createUser({
      name: "Test User",
      email: "test@example.com",
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.name).toBe("Test User");
      expect(result.value.email).toBe("test@example.com");
    }
  });

  it("returns error for invalid data", async () => {
    const result = await createUser({
      name: "",
      email: "invalid-email",
    });

    expect(result.isErr()).toBe(true);
  });
});
```

**Test Organization:**

- Place tests in `tests/` directory mirroring `app/` structure
- One test file per source file
- Use descriptive test names
- Test happy paths AND error cases
- Run `npm test` before committing

### Path Alias

Use `~/` to import from `app/` directory (e.g., `import { Button } from '~/components/ui/Button'`).

## Autonomous Task Workflow

You work autonomously on the current task until done.

### Context Management

Re-read files anytime especially when the conversation is compacted:

- README.md for project conventions
- AGENTS.md for rules
- Current task file for task details

### Rules

- Always call task_complete - never delete task files manually
- Run checks only at the very end of each task: use the narrowest relevant check for scoped changes, and use `npm run check` only when multiple areas were updated
- No need to run checks for docs-only/non-code-only updates (e.g. Markdown/docs, copy, comments, or other non-executable content)
- If you feel the conversation is getting long, do NOT summarize and stop - keep executing task

**Example task_complete usage:**

```bash
task_complete --orgId "abc" --projectId "xyz" --taskId "123" --taskName "Task Name" --taskFilePath "/workspace/development/.agent/tasks/00_task-name.md" --status completed --summary "Implemented feature X with Y approach"
```

Use `--status failed` if the task cannot be completed, with a summary explaining why.

## Project Context (Do This First)

- Read `README.md` before making decisions so you understand what the app is, how it runs, and the repo conventions
- Read `AGENTS.md` for instructions on how to develop with the system
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
