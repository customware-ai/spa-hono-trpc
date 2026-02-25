# Template for React Router App with Tailwind CSS and SQLite

**This is a code style and architecture template repository.** Use it as a reference for coding patterns, project structure, and development standards when building production applications.

The template demonstrates a simplified, modern stack with React Router v7, TypeScript, Tailwind CSS, Hono, tRPC, and SQLite via Drizzle + better-sqlite3.

> **⚠️ Important**: This is a **template repository** showcasing patterns and structure, not a feature-complete product.

> **Required reading**: Review [AGENTS.md](./AGENTS.md) before development for commands, coding standards, and architecture rules.

## 📋 What This Template Provides

### ✅ Use This Template For:

- **Code Style Reference** - TypeScript + React + Tailwind conventions
- **Architecture Patterns** - Clean layering (contracts → queries → services → routes)
- **Type Safety Examples** - Zod contracts + neverthrow error handling
- **UI Component Library** - Reusable, tested UI primitives
- **Database Patterns** - Drizzle schema + migration workflow
- **Project Organization** - Scalable app/server/test directory structure

### ❌ This Template Does NOT Provide:

- A complete business product
- Domain-complete ERP/accounting features
- Ready-to-ship production logic without adaptation

### 💡 How to Use This Template:

1. Study the patterns in `app/`, `server/`, and `tests/`
2. Copy the structure into your own project
3. Replace the example customer slice with your domain modules
4. Keep strict contracts and Result-based error handling
5. Follow [AGENTS.md](./AGENTS.md) for development workflow

## 🔍 What's Working vs What's a Pattern

### ✅ Fully Functional (Study These):

- **UI shell and pages** - Shared `MainLayout` + customer list/create routes
- **Server example slice** - `customer` contract/query/service/tRPC route chain
- **Database layer** - Drizzle schema + generated SQL migrations + runner
- **Quality gates** - Typecheck, lint, build, and test workflows
- **Component library** - Tested reusable UI building blocks

### 📐 Pattern Scaffolding:

- **tRPC client/provider files in `app/lib/`** - Available as typed integration scaffolding
- **Single-module backend design** - Intentionally minimal for extension

## Template Features & Patterns

This template demonstrates:

- **Modern Stack**: React Router SPA mode with Hono + tRPC backend, Vite 8, strict TypeScript
- **Type Safety**: Zod runtime contracts + neverthrow Result/ResultAsync patterns
- **Database Layer**: better-sqlite3 + Drizzle ORM with migration-driven schema changes
- **UI Patterns**: Tailwind CSS v4 with reusable components and a shared app layout
- **Code Quality**: Type-aware linting (oxlint) + Vitest coverage
- **Architecture**: Explicit client/server boundary with typed API contracts

## Tech Stack

| Package               | Version       | Purpose                         |
| --------------------- | ------------- | ------------------------------- |
| react-router          | 7.13.0        | Client routing framework        |
| vite                  | 8.0.0-beta.13 | Build tool                      |
| hono                  | ^4.12.1       | HTTP server                     |
| @trpc/server          | ^11.10.0      | Type-safe API layer             |
| @trpc/react-query     | ^11.10.0      | Typed client hooks              |
| @tanstack/react-query | ^5.90.21      | Query/mutation state management |
| tailwindcss           | 4.1.18        | Styling                         |
| zod                   | 4.3.6         | Schema validation               |
| neverthrow            | 8.2.0         | Type-safe error handling        |
| vitest                | 4.0.18        | Testing framework               |
| oxlint                | 1.47.0        | Type-aware linting              |
| better-sqlite3        | ^12.6.2       | SQLite runtime                  |
| drizzle-orm           | ^0.45.1       | ORM and query builder           |
| drizzle-kit           | ^0.31.9       | Migration generation and tooling |

## 🎨 Design

- **UI Components**: shadcn/ui-style primitives
- **Color System**: professional neutral base with clear status states
- **Typography**: clean, readable hierarchy for dashboard-style layouts
- **Layout**: shared shell via `app/layouts/MainLayout.tsx`

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate and apply SQL migrations
npm run db:generate
npm run db:migrate

# Build and run
npm run build
npm run start
```

## 📁 Project Structure

```text
app/
├── components/
│   └── ui/                    # Reusable UI components
├── hooks/
│   └── use-mobile.tsx
├── layouts/
│   └── MainLayout.tsx         # Shared page shell + header
├── lib/
│   ├── trpc.ts                # Typed tRPC client type binding
│   ├── trpc-provider.tsx      # Typed provider scaffolding
│   └── utils.ts
├── routes/
│   ├── index.tsx              # Customer list page
│   └── customers.new.tsx      # Customer create page
├── routes.ts                  # Route definitions
└── root.tsx

server/
├── contracts/
│   ├── customer.ts            # Zod runtime contracts
│   └── index.ts
├── db/
│   ├── index.ts               # Drizzle + better-sqlite3 init
│   ├── schemas.ts             # Drizzle table schema
│   ├── queries/
│   │   └── customers.ts       # Query layer (ResultAsync)
│   ├── migrations/            # Generated SQL + drizzle metadata
│   └── migrate.ts             # Migration runner
├── services/
│   └── customer.ts            # Business logic
├── trpc/
│   └── router.ts              # API procedures
├── types/
│   └── errors.ts              # Shared app error contracts
├── index.ts                   # Hono app setup
├── start.ts                   # Server entrypoint
└── tsconfig.json

tests/
├── components/                # UI component tests
├── db/                        # DB behavior tests
├── layouts/                   # Layout tests
├── routes/                    # Route tests
├── services/                  # Service tests
└── lib/                       # Utility tests
```

## 🗄️ Database Architecture

**Technology**: SQLite (`better-sqlite3`) + Drizzle ORM

**Database file path**: `.dbs/database.db`

**Migration workflow**:

1. Update `server/db/schemas.ts`
2. Run `npm run db:generate`
3. Run `npm run db:migrate`

### Tables Implemented

- `customers`

This intentionally keeps one example table so teams can extend from a clean baseline.

## 📝 Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run build`        | Build client + server                |
| `npm run build:client` | Build client bundle                  |
| `npm run build:server` | Compile server TypeScript            |
| `npm run start`        | Start production Hono server         |
| `npm run db:generate`  | Generate Drizzle SQL migrations      |
| `npm run db:migrate`   | Run Drizzle migrations               |
| `npm run typecheck`    | TypeScript type checking             |
| `npm run lint`         | Type-aware linting with oxlint       |
| `npm test`             | Run all tests                        |
| `npm run check`        | Run typecheck, lint, build, and test |

## 🧪 Testing

### Running Tests

```bash
npm test
npm run check
```

### Coverage Areas

- UI components
- App routes and layout behavior
- Database behavior
- Server service layer

All tests use Vitest (and React Testing Library for UI).

## 🏗️ Example Module

The repository includes one cohesive example module:

- **Customer**
  - Contract: `server/contracts/customer.ts`
  - Query: `server/db/queries/customers.ts`
  - Service: `server/services/customer.ts`
  - API route: `server/trpc/router.ts`

Use this as the canonical pattern when adding your own modules.

## 📖 Documentation

- [README.md](./README.md) - Project overview and quick start
- [AGENTS.md](./AGENTS.md) - Development standards and architectural rules

---

This repository is designed as a reference baseline: keep the structure, extend by module, and preserve strict contracts and typed boundaries.
