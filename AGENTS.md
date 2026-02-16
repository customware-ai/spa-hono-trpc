# AGENTS.md

This file provides guidance to LLMs when working with code in this repository.

> **For project overview**: See [README.md](./README.md) for features and documentation.

---

## 📋 Quick Reference

Jump to section:

| Section                                                       | Description                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| [Core Principles](#-core-principles)                          | Type safety, architecture, error handling, testing, UX       |
| [Commands](#commands)                                         | npm scripts for dev, build, test, lint                       |
| [Architecture](#architecture)                                 | Layered architecture, data flow, type safety                 |
| [Development Requirements](#development-requirements)         | Non-negotiable rules, code style, patterns                   |
| [Directory Structure](#directory-structure)                   | File organization and structure principles                   |
| [Design System](#design-system)                               | Colors, typography, component patterns                       |
| [UX Requirements](#-user-experience-ux-requirements)          | Loading states, error handling, responsive design, animation |
| [React Component Patterns](#react-component-patterns)         | Component structure, route patterns                          |
| [Testing Patterns](#testing-patterns)                         | Component and service testing                                |
| [React Router v7 Reference](#react-router-v7-reference-guide) | Data loading, pending UI, optimistic UI, actions             |
| [Autonomous Task Workflow](#autonomous-task-workflow)         | Context management, task completion                          |

### Key Import Paths

```typescript
import { Button } from "~/components/ui/Button";
import { getCustomers } from "~/services/erp";
import { CustomerSchema } from "~/schemas/sales";
import { getDatabase } from "~/db";
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
- **See [Error Handling UX](#error-handling-ux-mandatory) for user-facing error patterns**

### 4. **Testing Requirements** 🚨 ENFORCED

> **CRITICAL**: All code changes MUST include corresponding tests. A task is NOT complete if tests are missing.

**Mandatory Test Coverage:**

- **Frontend changes** (routes, components, hooks, UI behavior) → MUST have component tests
- **Backend changes** (services, schemas, db operations, loaders/actions) → MUST have unit/integration tests
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
| Route loader/action  | Data loading, error handling, form submission                                |
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

> **CRITICAL**: See [UX Requirements](#-user-experience-ux-requirements) for detailed patterns and [React Router v7 Reference Guide](#react-router-v7-reference-guide) for implementation details.

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
   - Database operations ONLY in `db.ts`
   - Business logic ONLY in `services/`
   - Validation schemas ONLY in `schemas/`
   - UI components ONLY in `components/`
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

---

## 🎨 User Experience (UX) Requirements

**CRITICAL**: This section defines mandatory UX patterns for all user-facing code. Every route, form, and interactive element MUST implement these patterns. Poor UX is a bug - treat it with the same severity as broken functionality.

> **Important**: All UX patterns in this section integrate with React Router v7. See the [React Router v7 Reference Guide](#react-router-v7-reference-guide) section for implementation details on `useNavigation`, `useFetcher`, optimistic UI, and pending states.

---

### Loading States (MANDATORY)

**Every data fetch and action MUST have a loading state.** Users should never see blank screens.

#### Skeleton Components

Import from `~/components/ui/LoadingSkeleton`:

| Component       | Use Case              | Key Props                          |
| --------------- | --------------------- | ---------------------------------- |
| `PageSkeleton`  | Full page loading     | `contentType="table\|cards\|form"` |
| `TableSkeleton` | Table loading         | `rows`, `columns`                  |
| `CardSkeleton`  | Card grid loading     | `count`                            |
| `FormSkeleton`  | Form loading          | `fields`, `showSubmitButton`       |
| `Spinner`       | Inline/button loading | `size` (xs/sm/md/lg)               |

**HydrateFallback Pattern (REQUIRED with clientLoader):**

```typescript
export function HydrateFallback(): ReactElement {
  return <PageLayout><PageSkeleton contentType="table" itemCount={10} /></PageLayout>;
}
```

#### Button Loading States

```typescript
// Preferred: Button with built-in loading
<Button loading={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>

// With fetcher
const fetcher = useFetcher();
const isSubmitting = fetcher.state !== "idle";
<Button type="submit" loading={isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</Button>
```

#### 3. Optimistic Updates (REQUIRED for mutations)

**All mutations MUST implement optimistic UI.** Predict the outcome and update UI immediately while the request processes.

> **Full Implementation**: See [React Router v7 Reference Guide > Optimistic UI Patterns](#optimistic-ui-patterns-required) for complete examples.

**Core Pattern:** Use `fetcher.formData` to read pending values and render the predicted state:

```typescript
const fetcher = useFetcher();

// Optimistically determine state from pending form data
let isComplete = task.status === "complete";
if (fetcher.formData) {
  isComplete = fetcher.formData.get("status") === "complete";
}

// Optimistic delete - filter out items being deleted
const visibleItems = items.filter((item) => {
  if (fetcher.formData?.get("intent") === "delete") {
    return item.id !== Number(fetcher.formData.get("itemId"));
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

> Use `viewTransition` for page transitions. See [React Router v7 Reference Guide](#react-router-v7-reference-guide).

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

> **Full Implementation**: See [React Router v7 Reference Guide](#react-router-v7-reference-guide) for comprehensive patterns.

Every route module should export:

1. `loader` - Fetch data (REQUIRED for data routes)
2. `action` - Handle mutations (REQUIRED for forms)
3. `ErrorBoundary` - Handle errors (REQUIRED)
4. `HydrateFallback` - Loading state (REQUIRED if using clientLoader)
5. `default` component - Render with typed data

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

**Organization:** Tests in `tests/` mirroring `app/` structure. Test happy paths AND error cases.

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

> **CRITICAL**: This section is the authoritative reference for all data loading and UI patterns in this codebase. All routes MUST implement the patterns described here. The [UX Requirements](#-user-experience-ux-requirements) section references these patterns - when implementing UX features, always refer back to this guide.

### Overview

React Router v7 is essentially "Remix v3" - it brings Remix's framework features into React Router. The distinction between the two has become minimal. This framework provides powerful primitives for:

- **Data Loading**: Fetch data before rendering with `loader` and `clientLoader`
- **Mutations**: Handle form submissions with `action` functions
- **Pending UI**: Show loading states during navigation and submissions
- **Optimistic UI**: Update the UI immediately based on pending form data
- **Error Handling**: Route-level error boundaries for graceful error handling

---

### Recommended Loading Strategy ⭐

**Use `loader` for initial page load (SSR), use `clientLoader` for fast subsequent navigations.**

| Scenario | Use | Why |
|----------|-----|-----|
| Initial page load | `loader` | SSR for SEO, fast first paint |
| Subsequent navigations | `clientLoader` | Runs on client = instant navigation |
| Hybrid (best of both) | `loader` + `clientLoader` | SSR initial load, fast client navigations |

**Pattern for fast navigations:**

```typescript
// Server loader for initial SSR
export async function loader(): Promise<{ data: Data[] }> {
  const result = await getData();
  return { data: result.isOk() ? result.value : [] };
}

// Client loader for fast subsequent navigations
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs): Promise<{ data: Data[] }> {
  // On initial hydration, use server data
  // On client navigation, fetch directly (faster than round-trip to server)
  return serverLoader();
}

// Enable client loader on hydration for consistent behavior
clientLoader.hydrate = true as const;

export function HydrateFallback(): ReactElement {
  return <PageSkeleton contentType="table" />;
}
```

This gives you:
- ✅ SEO-friendly initial page load (SSR)
- ✅ Fast subsequent navigations (client-side fetch)
- ✅ Consistent loading states via `HydrateFallback`

---

### Data Loading (MANDATORY)

**Every route that displays data MUST use loaders.** Never fetch data inside components with `useEffect` - this is an anti-pattern in React Router v7.

#### Server Data Loading with `loader`

The `loader` function runs on the server for initial page loads and on the client for navigations (via automatic fetch). Server-only code is automatically stripped from client bundles.

```typescript
// routes/products.$productId.tsx
import type { Route } from "./+types/products.$productId";
import { getProduct } from "~/services/products";

/**
 * Server loader - runs on server for SSR and via fetch for client navigation.
 * This code is stripped from client bundles - safe to use server-only APIs.
 */
export async function loader({ params }: Route.LoaderArgs): Promise<{
  product: Product;
  error: string | null;
}> {
  const result = await getProduct(params.productId);

  if (result.isErr()) {
    // Return error in data, not thrown - allows graceful handling
    return { product: null, error: result.error.message };
  }

  return { product: result.value, error: null };
}

export default function ProductPage({
  loaderData,
}: Route.ComponentProps): ReactElement {
  const { product, error } = loaderData;

  if (error) {
    return <ErrorDisplay error={{ message: error }} variant="page" />;
  }

  return (
    <PageLayout>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </PageLayout>
  );
}
```

#### Client Data Loading with `clientLoader`

Use `clientLoader` for browser-only data fetching patterns. **MUST include `HydrateFallback` to show loading state.**

```typescript
// routes/dashboard.tsx
import type { Route } from "./+types/dashboard";

/**
 * Client loader - runs only in the browser.
 * Use for: browser APIs, localStorage, client-side caches.
 */
export async function clientLoader({
  params,
}: Route.ClientLoaderArgs): Promise<{ analytics: AnalyticsData }> {
  const res = await fetch(`/api/analytics`);
  const analytics = await res.json();
  return { analytics };
}

/**
 * HydrateFallback - REQUIRED when using clientLoader.
 * Rendered while clientLoader is running. MUST show meaningful loading state.
 * See: UX Requirements > Loading States for skeleton patterns.
 */
export function HydrateFallback(): ReactElement {
  return (
    <PageLayout>
      <div className="space-y-4">
        <LoadingSkeleton variant="rectangular" className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LoadingSkeleton variant="rectangular" className="h-32" />
          <LoadingSkeleton variant="rectangular" className="h-32" />
          <LoadingSkeleton variant="rectangular" className="h-32" />
        </div>
        <LoadingSkeleton variant="rectangular" className="h-64" />
      </div>
    </PageLayout>
  );
}

export default function Dashboard({
  loaderData,
}: Route.ComponentProps): ReactElement {
  const { analytics } = loaderData;
  return <AnalyticsDashboard data={analytics} />;
}
```

#### Hybrid Loading (Server + Client)

Combine both loaders for optimal SSR with client-side enhancements.

```typescript
// routes/products.tsx
import type { Route } from "./+types/products";

// Server loader for SSR
export async function loader(): Promise<{ products: Product[] }> {
  const result = await getProducts();
  return { products: result.isOk() ? result.value : [] };
}

// Client loader augments server data
export async function clientLoader({
  serverLoader,
}: Route.ClientLoaderArgs): Promise<{
  products: Product[];
  userFavorites: number[];
}> {
  const serverData = await serverLoader();
  // Add client-only data (e.g., from localStorage)
  const userFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  return { ...serverData, userFavorites };
}

// Force client loader during hydration (optional)
clientLoader.hydrate = true as const;

export function HydrateFallback(): ReactElement {
  return <CardSkeleton count={6} />;
}
```

#### Loader Return Type Safety

**All loaders MUST have explicit return types.** The `loaderData` prop type is automatically inferred.

```typescript
// ✅ CORRECT - Explicit return type
export async function loader({ params }: Route.LoaderArgs): Promise<{
  customer: Customer | null;
  orders: Order[];
  error: string | null;
}> {
  // Implementation
}

// ❌ WRONG - Implicit return type
export async function loader({ params }: Route.LoaderArgs) {
  // No return type - violates type safety requirements
}
```

---

### Pending UI Patterns (MANDATORY)

**Every navigation and form submission MUST show appropriate pending UI.** Users should never wonder if their action was registered or if the page is loading.

#### Global Navigation Pending State

Show a global loading indicator when navigating between routes.

```typescript
// root.tsx or layout component
import { useNavigation, Outlet } from "react-router";

export default function RootLayout(): ReactElement {
  const navigation = useNavigation();

  // Check if any navigation is in progress
  const isNavigating = Boolean(navigation.location);

  return (
    <html>
      <body>
        {/* Global loading bar at top of page */}
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-primary-500 animate-pulse" />
          </div>
        )}

        {/* Or a spinner overlay */}
        {isNavigating && (
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40">
            <Spinner size="lg" />
          </div>
        )}

        <Outlet />
      </body>
    </html>
  );
}
```

#### `useNavigation` Hook States

The `useNavigation` hook provides detailed information about navigation state:

```typescript
import { useNavigation } from "react-router";

function NavigationAwareComponent(): ReactElement {
  const navigation = useNavigation();

  // Navigation states:
  // - navigation.state === "idle"       → No navigation in progress
  // - navigation.state === "loading"    → Route loaders are running
  // - navigation.state === "submitting" → Form action is running

  // navigation.location exists when navigation is pending
  const isNavigating = Boolean(navigation.location);

  // Check for specific form submission
  const isSubmittingToNewProject = navigation.formAction === "/projects/new";

  // Get form data being submitted
  const submittedData = navigation.formData;

  return (
    <div>
      {navigation.state === "loading" && <p>Loading page...</p>}
      {navigation.state === "submitting" && <p>Submitting form...</p>}
    </div>
  );
}
```

#### Local Pending States with `NavLink`

Show pending state on individual navigation links:

```typescript
import { NavLink } from "react-router";

function Sidebar(): ReactElement {
  return (
    <nav className="space-y-1">
      <NavLink
        to="/dashboard"
        viewTransition // Enable view transitions
        className={({ isActive, isPending }) =>
          clsx(
            "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
            isActive && "bg-primary-100 text-primary-700",
            isPending && "opacity-50 pointer-events-none"
          )
        }
      >
        {({ isPending }) => (
          <>
            <DashboardIcon className="w-5 h-5" />
            <span>Dashboard</span>
            {isPending && <Spinner size="sm" className="ml-auto" />}
          </>
        )}
      </NavLink>

      <NavLink
        to="/customers"
        viewTransition
        style={({ isPending }) => ({
          opacity: isPending ? 0.5 : 1,
        })}
      >
        {({ isPending }) => (
          <>
            Customers
            {isPending && <Spinner size="sm" />}
          </>
        )}
      </NavLink>
    </nav>
  );
}
```

---

### Form Submission with Pending UI (MANDATORY)

**Every form submission MUST show loading state.** Use `useFetcher` for in-page forms (no navigation) or `Form` with `useNavigation` for navigating forms.

#### Using `useFetcher` (Recommended for In-Page Forms)

`useFetcher` handles form submissions without causing page navigation. Each fetcher has its own independent state.

```typescript
import { useFetcher } from "react-router";

/**
 * Form that submits without navigating away.
 * Uses fetcher for independent loading state.
 */
function CreateCustomerForm(): ReactElement {
  const fetcher = useFetcher();

  // Fetcher states:
  // - fetcher.state === "idle"       → Not submitting
  // - fetcher.state === "submitting" → POST/PUT/PATCH/DELETE in progress
  // - fetcher.state === "loading"    → Revalidating after submission

  const isSubmitting = fetcher.state !== "idle";
  const isSuccess = fetcher.data?.success;
  const error = fetcher.data?.error;

  return (
    <fetcher.Form method="post" action="/api/customers" className="space-y-4">
      <Input
        name="company_name"
        label="Company Name"
        required
        disabled={isSubmitting}
      />

      <Input
        name="email"
        label="Email"
        type="email"
        disabled={isSubmitting}
      />

      {/* Show error from action response */}
      {error && (
        <ErrorDisplay error={{ message: error }} variant="inline" />
      )}

      {/* Show success message */}
      {isSuccess && (
        <div className="text-green-600">Customer created successfully!</div>
      )}

      {/* Button with loading state - REQUIRED */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Creating...
          </>
        ) : (
          "Create Customer"
        )}
      </Button>
    </fetcher.Form>
  );
}
```

#### Using `Form` with `useNavigation` (For Navigating Forms)

Use when the form submission should navigate to a new page:

```typescript
import { Form, useNavigation } from "react-router";

function NewProjectForm(): ReactElement {
  const navigation = useNavigation();

  // Check if THIS specific form is being submitted
  const isSubmitting = navigation.formAction === "/projects/new";

  return (
    <Form method="post" action="/projects/new" className="space-y-4">
      <Input name="title" label="Project Title" required disabled={isSubmitting} />
      <Textarea name="description" label="Description" disabled={isSubmitting} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Creating Project...
          </>
        ) : (
          "Create Project"
        )}
      </Button>
    </Form>
  );
}
```

#### Multiple Forms on Same Page

Use `useFetcher` for independent form states:

```typescript
function TaskList({ tasks }: { tasks: Task[] }): ReactElement {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}

function TaskItem({ task }: { task: Task }): ReactElement {
  // Each task has its own fetcher - independent states
  const deleteFetcher = useFetcher();
  const toggleFetcher = useFetcher();

  const isDeleting = deleteFetcher.state !== "idle";
  const isToggling = toggleFetcher.state !== "idle";

  return (
    <li className={clsx("flex items-center gap-3 p-3", isDeleting && "opacity-50")}>
      {/* Toggle completion */}
      <toggleFetcher.Form method="post" action={`/tasks/${task.id}/toggle`}>
        <button
          type="submit"
          disabled={isToggling}
          className="w-6 h-6 rounded border flex items-center justify-center"
        >
          {isToggling ? <Spinner size="sm" /> : task.completed && <CheckIcon />}
        </button>
      </toggleFetcher.Form>

      <span className={clsx(task.completed && "line-through")}>{task.title}</span>

      {/* Delete button */}
      <deleteFetcher.Form method="post" action={`/tasks/${task.id}/delete`}>
        <button
          type="submit"
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700"
        >
          {isDeleting ? <Spinner size="sm" /> : <TrashIcon />}
        </button>
      </deleteFetcher.Form>
    </li>
  );
}
```

---

### Optimistic UI Patterns (REQUIRED)

**All mutations MUST implement optimistic UI where feasible.** Optimistic UI makes the app feel instant by predicting the outcome based on form data.

#### Core Concept

When a form is submitted, `fetcher.formData` contains the pending form values. Use these to immediately update the UI while the request processes.

```typescript
import { useFetcher } from "react-router";

function TaskItem({ task }: { task: Task }): ReactElement {
  const fetcher = useFetcher();

  // Optimistically determine completion state
  let isComplete = task.status === "complete";

  // If form is being submitted, use the pending value instead
  if (fetcher.formData) {
    isComplete = fetcher.formData.get("status") === "complete";
  }

  return (
    <div className={clsx(
      "flex items-center gap-3 p-3 rounded-lg transition-all",
      isComplete && "bg-green-50"
    )}>
      <fetcher.Form method="post" action={`/tasks/${task.id}/toggle`}>
        <input
          type="hidden"
          name="status"
          value={isComplete ? "incomplete" : "complete"}
        />
        <button
          type="submit"
          className={clsx(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
            "transition-colors",
            isComplete
              ? "bg-green-500 border-green-500 text-white"
              : "border-surface-300 hover:border-green-400"
          )}
        >
          {isComplete && <CheckIcon className="w-4 h-4" />}
        </button>
      </fetcher.Form>

      <span className={clsx(
        "transition-all",
        isComplete && "line-through text-surface-500"
      )}>
        {task.title}
      </span>
    </div>
  );
}
```

#### Optimistic List Updates

```typescript
function ContactList({ contacts }: { contacts: Contact[] }): ReactElement {
  const fetcher = useFetcher();

  // Optimistically filter out deleted contacts
  const visibleContacts = contacts.filter((contact) => {
    // If this contact is being deleted, hide it immediately
    if (
      fetcher.formData &&
      fetcher.formData.get("intent") === "delete" &&
      fetcher.formData.get("contactId") === String(contact.id)
    ) {
      return false;
    }
    return true;
  });

  // Optimistically add new contacts
  let pendingContact: Partial<Contact> | null = null;
  if (
    fetcher.formData &&
    fetcher.formData.get("intent") === "create"
  ) {
    pendingContact = {
      id: -1, // Temporary ID
      name: fetcher.formData.get("name") as string,
      email: fetcher.formData.get("email") as string,
    };
  }

  return (
    <div className="space-y-4">
      {/* Add contact form */}
      <fetcher.Form method="post" className="flex gap-2">
        <input type="hidden" name="intent" value="create" />
        <Input name="name" placeholder="Name" required />
        <Input name="email" placeholder="Email" type="email" required />
        <Button type="submit" disabled={fetcher.state !== "idle"}>
          {fetcher.state !== "idle" ? <Spinner size="sm" /> : "Add"}
        </Button>
      </fetcher.Form>

      {/* Contact list with optimistic updates */}
      <ul className="space-y-2">
        {/* Show pending contact at top with loading indicator */}
        {pendingContact && (
          <li className="flex items-center gap-3 p-3 bg-surface-50 animate-pulse">
            <span>{pendingContact.name}</span>
            <span className="text-surface-500">{pendingContact.email}</span>
            <Spinner size="sm" className="ml-auto" />
          </li>
        )}

        {visibleContacts.map((contact) => (
          <li key={contact.id} className="flex items-center gap-3 p-3">
            <span>{contact.name}</span>
            <span className="text-surface-500">{contact.email}</span>

            <fetcher.Form method="post" className="ml-auto">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="contactId" value={contact.id} />
              <button
                type="submit"
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </fetcher.Form>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Optimistic Form Field Updates

```typescript
function EditableTitle({ item }: { item: Item }): ReactElement {
  const fetcher = useFetcher();
  const [isEditing, setIsEditing] = useState(false);

  // Optimistically show the new title
  const displayTitle = fetcher.formData
    ? (fetcher.formData.get("title") as string)
    : item.title;

  const isSaving = fetcher.state !== "idle";

  if (isEditing) {
    return (
      <fetcher.Form
        method="post"
        action={`/items/${item.id}/update`}
        onSubmit={() => setIsEditing(false)}
        className="flex gap-2"
      >
        <Input
          name="title"
          defaultValue={item.title}
          autoFocus
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? <Spinner size="sm" /> : "Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      </fetcher.Form>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h2 className={clsx("text-xl font-semibold", isSaving && "opacity-50")}>
        {displayTitle}
      </h2>
      {isSaving && <Spinner size="sm" />}
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <PencilIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

### Actions (Form Handlers)

**Every form MUST have a corresponding action handler.** Actions process form submissions and return data to the component.

```typescript
// routes/customers.new.tsx
import type { Route } from "./+types/customers.new";
import { redirect } from "react-router";
import { createCustomer } from "~/services/customers";
import { CustomerSchema } from "~/schemas/customer";

/**
 * Action handler for customer creation form.
 * Validates input, calls service, and returns result.
 */
export async function action({
  request,
}: Route.ActionArgs): Promise<
  { success: true; customerId: number } | { success: false; error: string }
> {
  const formData = await request.formData();

  // Convert FormData to object for validation
  const data = Object.fromEntries(formData);

  // Validate with Zod schema
  const validation = CustomerSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Validation failed",
    };
  }

  // Call service layer
  const result = await createCustomer(validation.data);

  if (result.isErr()) {
    return { success: false, error: result.error.message };
  }

  // Option 1: Return success data (for fetcher forms)
  return { success: true, customerId: result.value.id };

  // Option 2: Redirect (for navigating forms)
  // return redirect(`/customers/${result.value.id}`);
}

export default function NewCustomerPage(): ReactElement {
  const fetcher = useFetcher<typeof action>();

  const isSubmitting = fetcher.state !== "idle";
  const error = fetcher.data?.success === false ? fetcher.data.error : null;

  // Redirect on success
  useEffect(() => {
    if (fetcher.data?.success) {
      // Show success toast, redirect, etc.
    }
  }, [fetcher.data]);

  return (
    <PageLayout>
      <fetcher.Form method="post" className="space-y-4 max-w-md">
        <Input name="company_name" label="Company Name" required />
        <Input name="email" label="Email" type="email" />
        <Input name="phone" label="Phone" type="tel" />

        {error && <ErrorDisplay error={{ message: error }} variant="inline" />}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            "Create Customer"
          )}
        </Button>
      </fetcher.Form>
    </PageLayout>
  );
}
```

---

### Error Handling

Use React Router's error boundary system for route-level error handling.

```typescript
// routes/customers.$customerId.tsx
import { useRouteError, isRouteErrorResponse } from "react-router";

/**
 * Error boundary for this route.
 * Catches errors from loader, action, and component rendering.
 */
export function ErrorBoundary(): ReactElement {
  const error = useRouteError();

  // Handle HTTP error responses (4xx, 5xx)
  if (isRouteErrorResponse(error)) {
    return (
      <PageLayout>
        <ErrorDisplay
          error={{
            type: error.status === 404 ? "NOT_FOUND" : "SERVER_ERROR",
            message: error.statusText || "An error occurred",
          }}
          variant="page"
        />
      </PageLayout>
    );
  }

  // Handle thrown errors
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  return (
    <PageLayout>
      <ErrorDisplay
        error={{ type: "SERVER_ERROR", message: errorMessage }}
        variant="page"
      />
    </PageLayout>
  );
}

export default function CustomerDetailPage(): ReactElement {
  // Component implementation
}
```

---

### Essential Hooks Reference

```typescript
// Data access
useLoaderData<typeof loader>(); // Access route loader data (typed)
useActionData<typeof action>(); // Access route action results (typed)
useFetcher<typeof action>(); // Independent fetch/submit (typed)

// Navigation state
useNavigation(); // Global navigation state
useNavigation().state; // "idle" | "loading" | "submitting"
useNavigation().location; // Pending location (if navigating)
useNavigation().formData; // Pending form data (if submitting)
useNavigation().formAction; // Action URL being submitted to

// Fetcher state (per fetcher)
fetcher.state; // "idle" | "loading" | "submitting"
fetcher.data; // Response from last fetch/submit
fetcher.formData; // Pending form data for optimistic UI
fetcher.Form; // Form component bound to this fetcher

// URL and routing
useParams(); // URL parameters
useSearchParams(); // Query string params
useLocation(); // Current location object
useNavigate(); // Programmatic navigation
useMatches(); // All matched routes

// Forms
useSubmit(); // Programmatic form submission
Form; // Declarative form (navigates)
fetcher.Form; // Declarative form (no navigation)

// Errors
useRouteError(); // Error in error boundary
isRouteErrorResponse(error); // Check if HTTP error response

// View transitions
useViewTransitionState(to); // Check if transitioning to a route
```

### Components Reference

```typescript
<Link to="/path">              // Navigation link
<Link to="/path" viewTransition>  // With view transition

<NavLink to="/path">           // Link with active/pending state
<NavLink to="/path">
  {({ isActive, isPending }) => <span>...</span>}
</NavLink>

<Form method="post">           // Declarative form (calls action, navigates)
<Form method="post" action="/custom">  // Custom action URL

<fetcher.Form method="post">   // Fetcher form (no navigation)

<Outlet />                     // Render child routes
<Outlet context={value} />     // With context for children

<ScrollRestoration />          // Restore scroll on navigation

<Await resolve={promise}>      // Render when promise resolves
  {(data) => <Component data={data} />}
</Await>
```

---

### Common Patterns Reference

#### Complete Route Module Pattern

```typescript
// routes/customers.tsx
import type { Route } from "./+types/customers";
import type { ReactElement } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { getCustomers, deleteCustomer } from "~/services/customers";

// 1. Loader - fetch data
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

// 2. Action - handle mutations
export async function action({
  request,
}: Route.ActionArgs): Promise<{ success: boolean; error?: string }> {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = Number(formData.get("customerId"));
    const result = await deleteCustomer(id);

    if (result.isErr()) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  }

  return { success: false, error: "Unknown action" };
}

// 3. Error boundary
export function ErrorBoundary(): ReactElement {
  const error = useRouteError();
  return <ErrorDisplay error={{ message: String(error) }} variant="page" />;
}

// 4. Hydrate fallback (if using clientLoader)
export function HydrateFallback(): ReactElement {
  return <TableSkeleton rows={10} columns={4} />;
}

// 5. Component
export default function CustomersPage(): ReactElement {
  const { customers, error } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  // Optimistic delete
  const visibleCustomers = customers.filter((c) => {
    if (
      fetcher.formData?.get("intent") === "delete" &&
      fetcher.formData.get("customerId") === String(c.id)
    ) {
      return false;
    }
    return true;
  });

  if (error && customers.length === 0) {
    return <ErrorDisplay error={{ message: error }} variant="page" />;
  }

  return (
    <PageLayout>
      <PageHeader title="Customers" />

      {error && (
        <Banner variant="warning" className="mb-4">
          {error}
        </Banner>
      )}

      <CustomerTable
        customers={visibleCustomers}
        onDelete={(id) => {
          fetcher.submit(
            { intent: "delete", customerId: id },
            { method: "post" }
          );
        }}
      />
    </PageLayout>
  );
}
```

---

### Changes from React Router v6 to v7

#### Key Changes

##### 1. `json()` and `defer()` Deprecated

```typescript
// v6
export async function loader() {
  return json({ data });
}

// v7 - return raw objects
export async function loader() {
  return { data };
}

// If need Response, use native API
export async function loader() {
  return Response.json({ data });
}
```

##### 2. Type Generation System

```bash
# Generate types for routes
npx react-router typegen
```

Provides type-safe `params`, `loaderData`, `actionData` via generated `Route` types.

##### 3. Route Module API

```typescript
// Access typed route args
import type { Route } from "./+types/product";

export async function loader({ params }: Route.LoaderArgs) {
  // params.productId is typed
}

export default function Product({ loaderData }: Route.ComponentProps) {
  // loaderData is typed based on loader return
}
```

##### 4. Future Flags (Now Default)

- `v7_startTransition` - Uses React.useTransition
- `v7_fetcherPersist` - Fetcher persists until idle
- `v7_skipActionErrorRevalidation` - Skip revalidation on errors

---
