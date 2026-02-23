# AGENTS.md

This file provides guidance to LLMs when working with code in this repository.

> **For project overview**: See [README.md](./README.md) for features and documentation.

---

## 📋 Quick Reference

Jump to section:

| Section                                               | Description                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| [Core Principles](#-core-principles)                  | Type safety, architecture, error handling, testing, UX       |
| [Commands](#commands)                                 | npm scripts for dev, build, test, lint                       |
| [Architecture](#architecture)                         | Layered architecture, data flow, type safety                 |
| [Development Requirements](#development-requirements) | Non-negotiable rules, code style, patterns                   |
| [Directory Structure](#directory-structure)           | File organization and structure principles                   |
| [Design System](#design-system)                       | Colors, typography, component patterns                       |
| [UX Requirements](#-user-experience-ux-requirements)  | Loading states, error handling, responsive design, animation |
| [React Component Patterns](#react-component-patterns) | Component structure, route patterns                          |
| [Testing Patterns](#testing-patterns)                 | Component and service testing                                |
| [React Router v7 Reference](#react-router-v7-guide)   | SPA routing, pending UI, optimistic UI, tRPC patterns        |
| [Autonomous Task Workflow](#autonomous-task-workflow) | Context management, task completion                          |

### Key Import Paths

```typescript
// App-side imports
import { Button } from "~/components/ui/Button";
import { trpc } from "~/lib/trpc";
import { PageLayout } from "~/components/layout/PageLayout";

// Server-side imports
import { getDatabase } from "../db.js";
import { CustomerSchema } from "../schemas/sales.js";
```

---

## 🎯 Core Principles

This codebase follows strict architectural patterns and coding standards:

### 1. **Type Safety First**

- Every function must have explicit return types
- No `any` types allowed - use `unknown` or proper types
- Use Zod schemas for runtime validation, derive TypeScript types from schemas
- Full type checking must pass before committing

### 2. **Clean Architecture**

- **server/db.ts** - Database & filesystem operations ONLY (single source of truth)
- **server/services/** - Business logic & CRUD operations (uses Result pattern)
- **server/schemas/** - Zod validation schemas (source of truth for shared data types)
- **server/trpc/router.ts** - API contract and procedure handlers
- **app/routes/** - Page components and route-level UI composition
- **app/lib/trpc.ts** - Type-safe API client binding to server router types
- **app/components/** - UI components only (rendering + local interaction patterns)
- **server/utils/** / **app/lib/utils.ts** - Pure utility functions by runtime boundary

### 3. **Error Handling**

- Use neverthrow's `Result<T, E>` pattern for all operations that can fail
- Never throw exceptions in business logic
- Check `.isErr()` / `.isOk()` before accessing values
- Provide meaningful error messages
- **See [Error Handling UX](#error-handling-ux-mandatory) for user-facing error patterns**

### 4. **Testing Requirements** 🚨 ENFORCED

> **CRITICAL**: All code changes MUST include corresponding tests. A task is NOT complete if tests are missing.

**Mandatory Test Coverage:**

- **Frontend changes** (routes, components, hooks, UI behavior) → MUST have component tests
- **Backend changes** (server services, schemas, db operations, tRPC procedures) → MUST have unit/integration tests
- **Bug fixes** → MUST have a test that reproduces the bug and verifies the fix
- **New features** → MUST have tests covering happy paths AND error cases

**Enforcement Rules:**

1. **NO CODE WITHOUT TESTS**: If you modify or add code, you MUST add/update tests. No exceptions.
2. **Tests before completion**: Never mark a task as complete without corresponding test coverage
3. **Test the behavior, not the implementation**: Tests should verify what the code does, not how it does it
4. **Run tests before finishing**: Always run `npm test` to verify all tests pass

**What to test:**

| Change Type          | Required Tests                                                               |
| -------------------- | ---------------------------------------------------------------------------- |
| New component        | Rendering, variants, props, interactions, accessibility                      |
| New service function | Happy path, error cases, edge cases, validation                              |
| Route + API flow     | Query/mutation loading, pending states, error handling, submission behavior  |
| Bug fix              | Test that reproduces the bug + verifies the fix                              |
| Refactor             | Ensure existing tests still pass (no new tests needed if behavior unchanged) |

**Validation Commands:**

```bash
npm test                           # Run all tests
npx vitest run tests/path/file.test.ts  # Run specific test file
npm run check                      # Full validation (includes tests)
```

- Run the narrowest relevant check based on what changed
- Run `npm run check` at the very end only when multiple areas are updated
- No need to run checks for docs-only/non-code changes

### 5. **Code Quality Standards**

- Write self-documenting code with clear names
- Comment the "why", not the "what"
- Follow the single responsibility principle
- Keep functions small and focused

### 6. **User Experience (UX) Standards** ⭐ NEW

**All user-facing code MUST implement proper UX patterns.** Poor UX is a bug.

- **Loading States**: Every data fetch MUST show loading UI (skeletons, spinners)
- **Pending UI**: Every form submission MUST show pending state
- **Optimistic Updates**: Mutations should update UI immediately where feasible
- **Error Feedback**: Errors must be user-friendly, actionable, and recoverable
- **Responsive Design**: All UI must work on mobile, tablet, and desktop
- **Motion**: Use purposeful animation for feedback and guidance

> **CRITICAL**: See [UX Requirements](#-user-experience-ux-requirements) for detailed patterns and [React Router v7 Reference Guide](#react-router-v7-guide) for implementation details.

## Commands

```bash
npm run build         # Build client + compile server TypeScript
npm run build:client  # Build React Router client output
npm run build:server  # Compile server TypeScript only
npm run start         # Run production Hono server
npm run migrate       # Run server database migrations
npm run typecheck     # TypeScript checking + React Router typegen
npm run lint          # Type-aware linting with oxlint
npm test              # Run all tests with Vitest
npm run check         # Run typecheck + lint + build + test (full validation)
```

To run a single test file:

```bash
npx vitest run tests/db/db.test.ts
```

### Dependency Baseline

**Framework/runtime dependencies (current):**

- `react-router@7.13.0` + `@react-router/dev@7.13.0` + `@react-router/node@^7.13.0`
- `vite@8.0.0-beta.13` (with override pinned), `@vitejs/plugin-react@5.1.4`
- `hono@^4.12.1`, `@hono/node-server@^1.19.9`, `@hono/trpc-server@^0.4.2`
- `@trpc/server@^11.10.0`, `@trpc/client@^11.10.0`, `@trpc/react-query@^11.10.0`
- `@tanstack/react-query@^5.90.21`
- `sql.js@1.14.0`
- `zod@^4.3.6`, `neverthrow@8.2.0`

**Testing/lint/tooling dependencies (current):**

- `vitest@4.0.18`, `@testing-library/react@16.3.0`, `@testing-library/user-event@14.6.1`
- `oxlint@1.47.0`, `oxlint-tsgolint@latest`
- `typescript@5.9.3`, `tsx@4.21.0`, `concurrently@^9.2.1`

## Architecture

This is a React Router v7 SPA with a dedicated Hono+tRPC backend and SQLite (sql.js) persistence.

### Architectural Flow

The application follows a strict client/server layered architecture:

```
User Interaction
    ↓
React Router Route Component (app/routes/*.tsx)
    ↓
tRPC React Query Client (app/lib/trpc.ts)
    ↓
Hono tRPC Endpoint (/trpc/* in server/index.ts)
    ↓
tRPC Router Procedures (server/trpc/router.ts)
    ↓
Service Layer (server/services/erp.ts)
    ↓
Schema Validation (server/schemas/*.ts)
    ↓
Database Layer (server/db.ts)
    ↓
SQLite (sql.js, persisted to ../sqlite/database.db)
```

**Key Rules:**

1. **App routes/components** call **tRPC hooks**, never import server db/services directly
2. **tRPC router procedures** call **server services**, not the database directly
3. **Server services** validate with **server schemas**, then call **server db**
4. **`server/db.ts`** is the ONLY file that touches filesystem/sql.js internals
5. All server-side mutable operations use `Result<T, E>` and structured error objects

### Type Safety Flow

Every layer maintains strict end-to-end type safety:

```typescript
// 1. Define schema on the server (server/schemas/sales.ts)
export const CreateCustomerSchema = z.object({
  company_name: z.string().min(1).max(200),
  email: z.string().email().optional(),
});

// 2. Derive server types
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

// 3. Validate and execute in service layer
export async function createCustomer(
  data: unknown,
): Promise<Result<Customer, DatabaseError>> {
  const validation = CreateCustomerSchema.safeParse(data);
  if (!validation.success) {
    return err({
      type: "VALIDATION_ERROR",
      message: "Invalid customer data",
      details: validation.error.errors,
    });
  }

  return insertCustomer(validation.data);
}

// 4. Expose through tRPC router (server/trpc/router.ts)
export const appRouter = router({
  createCustomer: procedure
    .input(CreateCustomerSchema)
    .mutation(async ({ input }) => createCustomer(input)),
});

// 5. Consume with typed hooks in app routes (app/routes/*.tsx)
const createCustomerMutation = trpc.createCustomer.useMutation();
```

### Database Layer Rules

**CRITICAL**: `server/db.ts` is the ONLY file that:

- Imports sql.js
- Reads/writes `../sqlite/database.db` file (outside project directory)
- Manages database connection lifecycle
- Calls `saveDatabase()` after all mutations

**NEVER:**

- Import better-sqlite3 (this project uses sql.js)
- Access filesystem/database files outside `server/db.ts`
- Bypass service + schema layers from API handlers
- Skip calling `saveDatabase()` after create/update/delete operations

## Development Requirements

### Non-Negotiable Rules

1. **Strict Type Safety**
   - Every function must have explicit return types
   - No `any` types - use `unknown` or specific types
   - Always define Zod schemas for data validation
   - Derive TypeScript types from schemas using `z.infer<>`

2. **Test Coverage** 🚨 MANDATORY
   - See [Testing Requirements](#4-testing-requirements--enforced) in Core Principles - ALL rules apply
   - **A task is NOT COMPLETE without corresponding tests**

3. **Validation Before Completion**
   - Run checks only at the very end of the task (right before marking it complete). Use focused validation based on the scope of changes (e.g. `npm run typecheck` when only TypeScript/types are modified, `npm test` when tests are updated, `npm run lint` for lint-focused refactors). Skip checks for non-code-only changes (e.g. Markdown/docs, copy, comments, or other non-executable content).
   - Run `npm run check` at the very end only when multiple areas are updated
   - This runs: typecheck + lint + build + test
   - ALL checks must pass before considering task complete
   - Fix any errors before moving to next task

4. **Single Source of Truth**
   - Database operations ONLY in `server/db.ts`
   - Business logic ONLY in `server/services/`
   - Validation schemas ONLY in `server/schemas/`
   - API procedure contracts ONLY in `server/trpc/router.ts`
   - UI route/component logic ONLY in `app/routes/` and `app/components/`
   - Never bypass these layers

5. **Error Handling Pattern**
   - See [Error Handling](#3-error-handling) in Core Principles for Result pattern
   - See [Error Handling UX](#error-handling-ux-mandatory) for user-facing error patterns

### Code Style Requirements

- **Comments**: Always write detailed comments for all code. Use doc tag comments (JSDoc `/** */`) before functions, classes, and logic blocks. Use regular `//` comments inside logic to explain steps. Focus on the "why", not the "what"
- **Naming**: Clear, descriptive names for functions and variables
- **Functions**: Keep small and focused (single responsibility)
- **Imports**: Use `~/` path alias for app imports
- **Formatting**: Let Prettier handle formatting (configured in project)

### Key Patterns

#### Error Handling with neverthrow

Database and service operations in `server/` return `Result<T, E>` types from neverthrow. Check results with `.isErr()` / `.isOk()` before accessing values. Error types are defined in `server/types/errors.ts`.

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

// Usage in tRPC procedure handlers
const result = await getRecords();
if (result.isErr()) {
  throw new Error(result.error.message);
}
return result.value;
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

**Database Technology:** sql.js (SQLite in JavaScript) with file persistence to `../sqlite/database.db` (outside project directory)

**Critical Rules:**

1. **server/db.ts** is the ONLY file that imports sql.js and touches the filesystem
2. Every mutation MUST call `saveDatabase()` to persist changes
3. Use the migration system for all schema changes
4. Never modify the database schema directly in production

**Migration System:**

```typescript
// server/db-migrations/001-initial-schema.ts
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

1. **Create** the migration file in `server/db-migrations/` with sequential numbering
2. **Run** the migration: `npm run migrate`
3. **Verify** it ran successfully (check for errors in output)
4. **Test** that it works:
   - Check `../sqlite/database.db` file was updated
   - Verify tables/columns were created correctly
   - Write/update tests for any new database operations

```bash
# After creating a migration file:
npm run migrate              # Apply the migration
npm test                     # Ensure tests pass
```

**CRITICAL**: Always run and verify migrations immediately after creating them. Never commit a migration file without confirming it runs successfully.

**Database Operations Pattern:**

> ⚠️ **sql.js Caveat**: `last_insert_rowid()` does NOT work reliably with sql.js prepared statements. After executing an INSERT via prepared statement, `last_insert_rowid()` returns `0`. Instead, query by a unique field (like `company_name`) to retrieve the inserted record.

```typescript
// ✅ CORRECT - Query by unique field after INSERT
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

    // Query by unique field - last_insert_rowid() doesn't work with sql.js prepared statements
    const result = db.exec(
      `SELECT * FROM users WHERE email = ? ORDER BY id DESC LIMIT 1`,
      [data.email],
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

// ❌ WRONG - last_insert_rowid() returns 0 with sql.js prepared statements
const result = db.exec(`SELECT * FROM users WHERE id = last_insert_rowid()`);

// ❌ WRONG - Never import sql.js outside server/db.ts
import initSqlJs from "sql.js"; // NEVER DO THIS
```

### Directory Structure

```
app/
├── components/
│   ├── layout/          # Page layout primitives (PageLayout, PageHeader)
│   └── ui/              # Reusable UI components used by active routes
├── hooks/
│   └── use-mobile.tsx   # Shared client hook
├── lib/
│   ├── trpc.ts          # Typed tRPC React client
│   ├── trpc-provider.tsx # QueryClient + tRPC provider composition
│   └── utils.ts         # Client utility helpers
├── routes/
│   ├── index.tsx        # Customers list route
│   ├── customers.new.tsx # Create customer route
│   ├── customers.$id.tsx # Customer detail route
├── utils/
│   └── logger.ts        # Client logging utility
├── routes.ts            # React Router route map
└── root.tsx             # Root layout component

server/
├── db.ts                # Database layer (ONLY file for filesystem/sql.js)
├── index.ts             # Hono app: CORS, /trpc/*, assets, SPA fallback
├── start.ts             # Node server startup entrypoint
├── db-migrations/
│   ├── migrate.ts       # Migration engine
│   ├── run-migrations.ts # Migration runner script
│   └── 001-erp-schema.ts # Schema migration
├── trpc/
│   ├── index.ts         # tRPC init/context
│   └── router.ts        # tRPC procedures and API contract
├── services/
│   └── erp.ts           # Business logic
├── schemas/
│   ├── index.ts         # Shared schema exports
│   └── sales.ts         # Sales/customer schemas
├── types/
│   └── errors.ts        # Typed error contracts
└── utils/
    ├── calculations.ts  # Domain calculations
    └── validate.ts      # Shared validation helper

tests/                   # Test files mirror active app/server boundaries
├── components/          # UI component tests
├── db/                  # Database operation tests
└── services/            # Business logic tests
```

**Structure Principles:**

- Separate client and server responsibilities (`app/` vs `server/`)
- Keep API boundary explicit through `server/trpc/router.ts` and `app/lib/trpc.ts`
- Keep persistence and migrations exclusively in `server/`
- Keep route files focused on UI composition + tRPC hook orchestration
- Tests mirror behavior-critical boundaries (UI, service, db)

### Design System

**UI Components:** shadcn/ui with Radix primitives

**Color Palette:**

- Primary: Blue (`primary` / `primary-foreground` CSS variables)
- Neutral grays following shadcn default theme
- Status colors: Red (destructive), Amber (warning), Green (success), Blue (info)

**Typography:**

- System fonts with clean, minimal styling (shadcn defaults)
- Professional, clean aesthetic

**Component Patterns:**

- All components in `app/components/ui/` follow shadcn conventions
- Built on Radix UI primitives for accessibility
- Use composition over configuration
- Props interfaces defined with TypeScript
- Consistent styling with Tailwind CSS v4

**Layout Structure:**

- `PageLayout` - Main page wrapper with breadcrumbs
- `PageHeader` - Consistent page titles and actions
- `TopBar` - Top navigation, logo, and theme toggle

---

## 🎨 User Experience (UX) Requirements

**CRITICAL**: This section defines mandatory UX patterns for all user-facing code. Every route, form, and interactive element MUST implement these patterns. Poor UX is a bug - treat it with the same severity as broken functionality.

> **Important**: All UX patterns in this section integrate with React Router v7 + tRPC React Query. See the [React Router v7 Reference Guide](#react-router-v7-guide) section for implementation details on `useNavigation`, query/mutation pending states, and optimistic UI.

---

### Loading States (MANDATORY)

**Every query and mutation MUST have a loading state.** Users should never see blank screens.

#### Skeleton Components

Use the existing `Skeleton` component from `~/components/ui/Skeleton`:

| Component  | Use Case                      | Key Props             |
| ---------- | ----------------------------- | --------------------- |
| `Skeleton` | Page/section/row placeholders | `className` sizing    |
| `Button`   | Built-in loading state        | `loading`, `disabled` |

**HydrateFallback Pattern (required for SPA hydration):**

```typescript
export function HydrateFallback(): ReactElement {
  return (
    <PageLayout>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </PageLayout>
  );
}
```

#### Button Loading States

```typescript
// Preferred: Button with built-in loading
<Button loading={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>

// With tRPC mutation
const createCustomer = trpc.createCustomer.useMutation();
const isSubmitting = createCustomer.isPending;
<Button type="submit" loading={isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</Button>
```

#### 3. Optimistic Updates (REQUIRED for mutations)

**All mutations MUST implement optimistic UI.** Predict the outcome and update UI immediately while the request processes.

> **Full Implementation**: See [React Router v7 Reference Guide > Optimistic UI Patterns](#optimistic-ui-patterns) for complete examples.

**Core Pattern:** Use pending mutation variables or React Query cache updates to render predicted state:

```typescript
const updateTask = trpc.updateTask.useMutation();

// Optimistically determine state from pending mutation variables
let isComplete = task.status === "complete";
if (updateTask.isPending && updateTask.variables?.id === task.id) {
  isComplete = updateTask.variables.status === "complete";
}

// Optimistic delete - filter out items being deleted
const visibleItems = items.filter((item) => {
  if (deleteTask.isPending && deleteTask.variables?.id === item.id) {
    return false;
  }
  return true;
});
```

#### 4. Progressive Disclosure

Use collapsible sections to reduce cognitive load. Show primary fields first, reveal advanced options on demand.

---

### Error Handling UX (MANDATORY)

**Every error state MUST be user-friendly, actionable, and recoverable.** Technical errors should never be shown directly to users.

> **Implementation**: See [React Router v7 Reference Guide > Error Handling](#error-handling) for error boundary patterns.

#### Core Principles

- **NEVER show raw error messages** - translate to human-readable messages
- **Always offer retry** for recoverable errors
- **Graceful degradation** - show cached/stale data when fresh data fails
- **Route error boundaries** - every route must handle errors gracefully

#### Error Message Pattern

```typescript
// Map error types to user-friendly messages
const ERROR_MESSAGES: Record<
  string,
  { title: string; description: string; action?: string }
> = {
  NETWORK_ERROR: {
    title: "Connection Problem",
    description: "Check your internet connection.",
    action: "Retry",
  },
  NOT_FOUND: {
    title: "Not Found",
    description: "This item doesn't exist or was removed.",
    action: "Go Back",
  },
  SERVER_ERROR: {
    title: "Something Went Wrong",
    description: "We're working on it.",
    action: "Try Again",
  },
};

export function getUserFriendlyError(errorType: string): {
  title: string;
  description: string;
  action?: string;
} {
  return (
    ERROR_MESSAGES[errorType] || {
      title: "Oops!",
      description: "Please try again.",
      action: "Retry",
    }
  );
}
```

#### ErrorDisplay Component

Use `<ErrorDisplay error={{ type, message }} variant="page|inline" onRetry={fn} />` for consistent error UI.

**Variants:** `page` (full-page centered), `inline` (banner with dismiss), `toast` (notification)

#### Route Error Boundary Pattern

```typescript
export function ErrorBoundary(): ReactElement {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const type = error.status === 404 ? "NOT_FOUND" : error.status === 403 ? "PERMISSION_DENIED" : "SERVER_ERROR";
    return <ErrorDisplay error={{ type, message: error.statusText }} variant="page" />;
  }

  return <ErrorDisplay error={{ type: "SERVER_ERROR", message: "Unexpected error" }} variant="page" />;
}
```

#### Graceful Degradation Pattern

```typescript
// Return cached data when fresh data fails
if (result.isErr()) {
  const cached = getCachedData();
  if (cached)
    return { data: cached, error: "Using cached data", isStale: true };
  return { data: [], error: result.error.message, isStale: false };
}
```

---

### Responsive Design (MANDATORY)

**All UI MUST be fully responsive.** Mobile-first design required.

#### Core Principles

- **Mobile-first**: Write mobile styles first, add breakpoint modifiers for larger screens
- **Touch targets**: Minimum 44x44px (WCAG 2.1 AAA), use `min-w-[44px] min-h-[44px]`
- **Responsive tables**: Show as card lists on mobile (`block md:hidden` / `hidden md:block`)

**Breakpoints:** `sm:640px` `md:768px` `lg:1024px` `xl:1280px` `2xl:1536px`

**Mobile-First Pattern:**

```typescript
// ✅ CORRECT - Mobile-first
<div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">

// ❌ WRONG - Desktop-first
<div className="flex flex-row gap-8 max-md:flex-col max-md:gap-4">
```

**Responsive Navigation:** Desktop sidebar (`hidden lg:flex`), mobile hamburger menu (`lg:hidden`).

---

### Animation & Motion (MANDATORY)

**Animation must be purposeful** - provide feedback, guide attention, create continuity. Never decorative.

> Use `viewTransition` for page transitions. See [React Router v7 Reference Guide](#react-router-v7-guide).

#### Key Patterns

| Type               | Tailwind Classes                              | Use Case            |
| ------------------ | --------------------------------------------- | ------------------- |
| Micro-interactions | `transition-colors duration-150`              | Hover/active states |
| Scale feedback     | `active:scale-[0.98]`                         | Button press        |
| Page entrance      | `animate-in fade-in slide-in-from-bottom-4`   | Route transitions   |
| Toast/notification | `animate-in slide-in-from-right-full fade-in` | Alerts              |
| Shimmer skeleton   | `animate-shimmer` (custom)                    | Loading states      |

**Motion Accessibility (CRITICAL):**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

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

**Route Module Structure:**

> **Full Implementation**: See [React Router v7 Reference Guide](#react-router-v7-guide) for comprehensive patterns.

Every route module should export:

1. `default` component - Render route UI (REQUIRED)
2. Optional `ErrorBoundary` - Handle route-level render/runtime errors
3. Optional route metadata exports as needed (`meta`, `links`)
4. Use `trpc.*.useQuery()` for reads and `trpc.*.useMutation()` for writes
5. Use local pending/error UI based on query/mutation state

**Key React Patterns:**

- Functional components with explicit return types (`ReactElement`)
- Props interfaces for all components
- Composition over prop drilling
- Implement pending UI, optimistic UI, and loading skeletons (see React Router v7 Reference)

### Linting Rules

oxlint enforces strict standards:

- `typescript/explicit-function-return-type`: Required on all functions
- `typescript/no-explicit-any`: No `any` types allowed
- `react/jsx-key`: Keys required in JSX lists
- All violations must be fixed before committing

### Testing Patterns

> **CRITICAL**: See [Testing Requirements](#4-testing-requirements--enforced) for mandatory rules. ALL code changes require tests.

**Tools:** Vitest + React Testing Library

**Component Test Pattern:**

```typescript
describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Service Test Pattern:**

```typescript
describe("User Service", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates user successfully", async () => {
    const result = await createUser({
      name: "Test",
      email: "test@example.com",
    });
    expect(result.isOk()).toBe(true);
  });

  it("returns error for invalid data", async () => {
    const result = await createUser({ name: "", email: "invalid" });
    expect(result.isErr()).toBe(true);
  });
});
```

**Organization:** Tests in `tests/` mirroring active boundaries (`app/components`, `server/db`, `server/services`). Test happy paths AND error cases.

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

## React Router v7 Guide

> **CRITICAL**: This section is the authoritative reference for routing/data UI patterns in this codebase. This project runs React Router in SPA mode and uses tRPC for all backend data access.

### Overview

This app uses:

- **React Router v7** for client routing and route module boundaries
- **SPA mode** (`ssr: false`) with build-time generated `index.html`
- **Hono server** for static asset serving + `/trpc/*` API endpoint + SPA fallback
- **tRPC + React Query** for typed queries/mutations

**What this means:**

- Do not build new route features around `loader`/`action`
- Route components should orchestrate UI + `trpc.*.useQuery()`/`useMutation()`
- Server logic belongs in `server/trpc/router.ts` → `server/services/` → `server/db.ts`

---

### Route Module Strategy

Use simple route modules focused on rendering and hook orchestration.

**Required in every route module:**

1. Default route component with explicit `ReactElement` return type
2. Loading UI from query/mutation state
3. Error UI from query/mutation state
4. Pending state on submit buttons

**Optional exports:**

- `ErrorBoundary` for unexpected render/runtime route errors
- `meta`/`links` when route-specific metadata is needed

---

### Data Fetching (Queries)

All read operations should use `trpc.*.useQuery()`.

```typescript
import type { ReactElement } from "react";
import { trpc } from "~/lib/trpc";
import { PageLayout } from "~/components/layout/PageLayout";
import { Skeleton } from "~/components/ui/Skeleton";
import { Alert } from "~/components/ui/Alert";

export default function CustomersPage(): ReactElement {
  const {
    data: customers = [],
    isLoading,
    error,
  } = trpc.getCustomers.useQuery();

  if (isLoading) {
    return (
      <PageLayout breadcrumbs={[{ label: "Customers" }]}>
        <Skeleton className="h-10 w-full" />
      </PageLayout>
    );
  }

  return (
    <PageLayout breadcrumbs={[{ label: "Customers" }]}>
      {error ? (
        <Alert variant="destructive">{error.message}</Alert>
      ) : (
        <div>{customers.length} customer(s)</div>
      )}
    </PageLayout>
  );
}
```

**Query rules:**

- Always provide a meaningful loading state (skeleton/spinner)
- Always surface user-friendly error feedback in UI
- Never fetch directly from route components with raw `fetch` when tRPC endpoint exists

---

### Mutations (Form Submission)

All write operations should use `trpc.*.useMutation()`.

```typescript
import type { FormEvent, ReactElement } from "react";
import { useNavigate } from "react-router";
import { trpc } from "~/lib/trpc";
import { Button } from "~/components/ui/Button";
import { Alert } from "~/components/ui/Alert";

export default function NewCustomerPage(): ReactElement {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const createCustomer = trpc.createCustomer.useMutation({
    onSuccess: async () => {
      await utils.getCustomers.invalidate();
      void navigate("/");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    createCustomer.mutate({
      company_name: String(formData.get("company_name") || ""),
      email: String(formData.get("email") || "") || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {createCustomer.error && (
        <Alert variant="destructive">{createCustomer.error.message}</Alert>
      )}

      <Button type="submit" loading={createCustomer.isPending}>
        {createCustomer.isPending ? "Creating..." : "Create Customer"}
      </Button>
    </form>
  );
}
```

**Mutation rules:**

- Disable/mark pending controls while mutation is pending
- Invalidate relevant queries on success
- Keep error state visible and recoverable

---

### Pending UI Patterns

Use pending state at three levels:

1. **Query-level**: `isLoading` for page/section skeletons
2. **Mutation-level**: `isPending` for submit buttons and inline states
3. **Navigation-level**: `useNavigation()` for route transition indicators

```typescript
import { useNavigation } from "react-router";

function LayoutShell(): ReactElement {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  return (
    <div>
      {isNavigating && <div className="h-1 w-full animate-pulse bg-primary" />}
      {/* layout content */}
    </div>
  );
}
```

---

### Optimistic UI Patterns

Prefer optimistic updates for UX-critical mutations.

#### Option A: Local optimistic rendering

Use pending form values/mutation variables to reflect expected UI immediately.

```typescript
const mutation = trpc.updateCustomerStatus.useMutation();

const optimisticStatus =
  mutation.isPending && mutation.variables?.id === customer.id
    ? mutation.variables.status
    : customer.status;
```

#### Option B: React Query cache updates

Use `onMutate`/`onError`/`onSettled` for robust list-level optimistic updates.

```typescript
const utils = trpc.useUtils();

const deleteCustomer = trpc.deleteCustomer.useMutation({
  onMutate: async ({ id }) => {
    await utils.getCustomers.cancel();
    const previous = utils.getCustomers.getData();

    utils.getCustomers.setData(undefined, (current) =>
      (current ?? []).filter((c) => c.id !== id),
    );

    return { previous };
  },
  onError: (_error, _input, context) => {
    if (context?.previous) {
      utils.getCustomers.setData(undefined, context.previous);
    }
  },
  onSettled: async () => {
    await utils.getCustomers.invalidate();
  },
});
```

---

### Error Handling

Handle errors at both data and route boundaries.

#### Data-level errors (preferred for recoverable failures)

- Query/mutation errors should render inline/page `Alert` or `ErrorDisplay`
- Keep the user in context with retry options

#### Route-level errors (unexpected failures)

```typescript
import type { ReactElement } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary(): ReactElement {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <div>{error.status} {error.statusText}</div>;
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return <div>{message}</div>;
}
```

---

### Server Boundary Rules

All backend behavior must stay in `server/`:

- `server/index.ts`: Hono HTTP wiring (CORS, static assets, `/trpc/*`, fallback)
- `server/trpc/router.ts`: API procedure definitions
- `server/services/erp.ts`: business logic
- `server/schemas/*.ts`: validation and inferred types
- `server/db.ts`: sql.js + filesystem persistence only

Never import `server/db.ts` or `server/services/*` directly from `app/` route modules.

---

### Essential Hooks Reference

```typescript
// tRPC + React Query (primary data APIs)
trpc.getCustomers.useQuery();
trpc.getCustomerById.useQuery({ id });
trpc.createCustomer.useMutation();
trpc.updateCustomer.useMutation();
trpc.deleteCustomer.useMutation();
trpc.useUtils(); // invalidate/setData/cancel helpers

// React Router hooks (routing/navigation concerns)
useNavigate();
useNavigation();
useParams();
useSearchParams();
useLocation();

// Root/route error handling hooks
useRouteError();
isRouteErrorResponse(error);
```

---

### Common Route Pattern (Current Project Style)

```typescript
import type { ReactElement } from "react";
import { useNavigate, useParams } from "react-router";
import { trpc } from "~/lib/trpc";
import { Button } from "~/components/ui/Button";
import { Alert } from "~/components/ui/Alert";
import { Skeleton } from "~/components/ui/Skeleton";

export default function CustomerDetailPage(): ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const customerId = Number(id);

  const customerQuery = trpc.getCustomerById.useQuery({ id: customerId }, {
    enabled: Number.isFinite(customerId),
  });

  const deleteMutation = trpc.deleteCustomer.useMutation({
    onSuccess: async () => {
      await utils.getCustomers.invalidate();
      void navigate("/");
    },
  });

  if (customerQuery.isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (customerQuery.error) {
    return <Alert variant="destructive">{customerQuery.error.message}</Alert>;
  }

  const customer = customerQuery.data;
  if (!customer) {
    return <Alert variant="destructive">Customer not found</Alert>;
  }

  return (
    <div className="space-y-4">
      <h1>{customer.company_name}</h1>

      <Button
        variant="destructive"
        loading={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate({ id: customer.id })}
      >
        {deleteMutation.isPending ? "Deleting..." : "Delete"}
      </Button>

      {deleteMutation.error && (
        <Alert variant="destructive">{deleteMutation.error.message}</Alert>
      )}
    </div>
  );
}
```

---

### Migration Notes (Old vs Current Pattern)

**Old pattern (no longer default in this project):**

- Route `loader`/`action` driven data/mutations
- SSR-first route data flow

**Current pattern (required):**

- SPA route components + tRPC query/mutation hooks
- Hono server provides API boundary and static hosting
- Build output includes `build/client` (SPA assets) and `build/server` (compiled Hono server)

**Config requirements to keep:**

- `react-router.config.ts` uses `ssr: false`
- `react-router.config.ts` enables `future.v8_viteEnvironmentApi: true`
- `vite.config.ts` uses Vite 8-compatible settings
