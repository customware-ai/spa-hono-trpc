# Template for React Router App with Tailwind CSS and SQLite

**This is a code style and architecture template repository.** Use this as a reference for coding patterns, project structure, and development standards when building production applications. The template demonstrates best practices through an ERP-style application structure built with React Router v7, TypeScript, Tailwind CSS, and SQLite.

> **⚠️ Important**: This is a **template repository** showcasing code patterns and styles, not a functional application. Use it to understand the coding standards, architectural patterns, and file organization for your own projects.

> **Required reading**: Review [AGENTS.md](./AGENTS.md) before development for coding patterns, commands, and project conventions.

## 📋 What This Template Provides

### ✅ Use This Template For:

- **Code Style Reference** - See how to structure TypeScript, React, and Tailwind code
- **Architecture Patterns** - Learn proper separation of concerns (db → services → routes → components)
- **Type Safety Examples** - Understand neverthrow Result pattern and Zod validation
- **UI Component Library** - Reusable, tested components with consistent styling
- **Database Patterns** - Migration system, CRUD operations, proper abstraction
- **Project Organization** - File structure for scalable applications

### ❌ This Template Does NOT Provide:

- A working, feature-complete application
- Production-ready business logic (focus is on code patterns, not business features)
- A starter project to deploy as-is (adapt patterns to your own requirements)

### 💡 How to Use This Template:

1. **Study the code patterns** in components, services, and routes
2. **Copy the architectural structure** for your own project
3. **Adapt the UI components** to your design system
4. **Follow the coding standards** demonstrated throughout
5. **Reference AGENTS.md** for development commands and conventions

## 🔍 What's Working vs What's a Pattern

### ✅ Fully Functional (Study These):

- **Customer CRUD** - Complete create, read, update, delete operations
- **Database Layer** - Full migration system and persistence
- **Component Library** - All UI components are functional and tested
- **Type Safety** - Complete Zod schemas and Result patterns
- **Layout System** - Sidebar navigation, responsive design

### 📐 Pattern Examples Only (Non-Functional):

- **Most Action Buttons** - Demonstrate UI patterns, not actual features
- **Leads, Quotes, Orders** - Show data display patterns with demo data
- **Invoices, Payments** - Illustrate accounting UI patterns
- **Reports, Charts** - Template for report generation interfaces

> **Key Insight**: The working Customer module shows the **complete pattern** from database to UI. Other modules show **UI patterns** you can implement following the same architectural approach.

## Template Features & Patterns

This template demonstrates:

- **Modern Stack**: React Router v7.13 SPA mode with Hono + tRPC backend, Vite 8, TypeScript strict mode
- **Type Safety**: Zod v4 schemas + neverthrow Result pattern for error handling
- **Database Layer**: SQLite via better-sqlite3 + Drizzle ORM with proper abstraction and migration system
- **UI Patterns**: Tailwind CSS v4 with professional custom theme and reusable components
- **Code Quality**: Type-aware linting (oxlint), comprehensive testing setup
- **Architecture**: Clean client/server separation (`app/` + `server/`) with typed API boundary

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

- **UI Components**: shadcn/ui with Radix primitives
- **Color Palette**: Blue primary with neutral grays (shadcn default)
- **Typography**: System fonts with clean, minimal styling
- **Style**: Clean, professional, shadcn-inspired design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate + run database migrations
npm run db:generate
npm run db:migrate

# Or build for production
npm run build
```

> **For development workflow and coding guidelines**, see [AGENTS.md](./AGENTS.md)

## 📁 Project Structure

```
app/
├── components/
│   ├── layout/          # Page layout primitives
│   └── ui/              # Reusable UI components
├── hooks/
│   └── use-mobile.tsx   # Client hook
├── lib/
│   ├── trpc.ts          # Typed tRPC client
│   ├── trpc-provider.tsx # Provider composition
│   └── utils.ts         # Client utilities
├── routes/
│   ├── index.tsx        # Customers list route
│   ├── customers.new.tsx # Create customer route
│   └── customers.$id.tsx # Customer detail route
├── utils/
│   └── logger.ts        # Client logging utility
├── routes.ts            # React Router route config
└── root.tsx             # Root app shell

server/
├── contracts/
│   ├── core.ts          # Core runtime contracts (Zod)
│   ├── sales.ts         # Sales/customer contracts
│   └── index.ts         # Contract exports
├── db/
│   ├── index.ts         # Database client + connection lifecycle
│   ├── schemas.ts       # Drizzle table schemas
│   ├── queries/         # Reusable query modules
│   ├── migrations/      # SQL migrations + drizzle metadata
│   └── migrate.ts       # Migration runner
├── index.ts             # Hono app setup + static serving + /trpc/*
├── start.ts             # Production server entrypoint
├── trpc/
│   ├── index.ts         # tRPC initialization
│   └── router.ts        # API procedures
├── services/
│   └── erp.ts           # Business logic
├── types/
│   └── errors.ts        # Error contracts
├── utils/
│   ├── calculations.ts  # Domain calculations
│   └── validate.ts      # Validation helpers
└── tsconfig.json
```

## 🗄️ Database Architecture

**Technology**: SQLite via better-sqlite3 + Drizzle ORM with persistence to `.dbs/database.db`

**Key Pattern**: All database operations go through `server/db/` (single source of truth for schema, query, and migration access)

### Tables Implemented

**Sales & CRM:**

- `customers` - Customer records with contact info
- `contacts` - Multiple contacts per customer
- `leads` - Sales pipeline and prospect tracking
- `opportunities` - Deal tracking with probability
- `quotes` & `quote_items` - Quotations with line items
- `sales_orders` & `sales_order_items` - Confirmed orders
- `activities` - CRM activity log (calls, meetings, tasks)

**Accounting & Finance:**

- `chart_of_accounts` - Account hierarchy (assets, liabilities, equity, revenue, expenses)
- `invoices` & `invoice_items` - Customer invoices with line items
- `payments` - Payment records linked to invoices
- `journal_entries` & `journal_entry_lines` - Manual accounting entries
- `ledger` - General ledger (transaction history per account)
- `bank_accounts` - Bank account details

### Database Persistence

The database persists to `.dbs/database.db` inside the repository. The `.dbs` directory is created automatically when needed.

**On startup:**

- If `.dbs/database.db` exists, better-sqlite3 opens it directly
- If not, running `npm run db:migrate` creates the schema via Drizzle migrations

**On mutations:**

- better-sqlite3 writes through directly
- Data survives server restarts

**To reset:**

```bash
rm -rf .dbs/database.db
npm run db:migrate
npm run dev
```

## 📝 Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run build`        | Build client + server                |
| `npm run build:client` | Build client bundle                  |
| `npm run build:server` | Compile server TypeScript            |
| `npm run start`        | Start production Hono server         |
| `npm run db:generate`  | Generate Drizzle SQL migrations      |
| `npm run db:migrate`   | Run server database migrations       |
| `npm run migrate`      | Alias for `npm run db:migrate`       |
| `npm run typecheck`    | TypeScript type checking             |
| `npm run lint`         | Type-aware linting with oxlint       |
| `npm test`             | Run all tests                        |
| `npm run check`        | Run typecheck, lint, build, and test |

## 🧪 Testing

### Running Tests

```bash
npm test              # Run all tests
npm run check        # Full check (includes tests)
```

### Test Coverage

Tests cover:

- UI components (Button, Card, Input, Badge, Alert, Table)
- Database operations
- Server-side service/business logic

All tests use Vitest and React Testing Library.

## 🏗️ Application Modules

The codebase currently centers on the customer module to demonstrate end-to-end patterns:

- **Customers** - List, create, and detail views
- **Typed API** - tRPC procedures consumed via React Query hooks
- **Server Data Layer** - Services, contracts, db queries, Drizzle migrations, and better-sqlite3 persistence

> **For development guidelines, coding patterns, and architectural rules**, see [AGENTS.md](./AGENTS.md)

## 📖 Documentation

- **README.md** - This file (project overview and quick start)
- **[AGENTS.md](./AGENTS.md)** - Development patterns, coding rules, and architectural guidelines
- Code comments throughout codebase

---

_Remember:_ This is a **code pattern reference**, not a working application. Study the patterns, adapt the architecture, and build your own production-ready features following these standards.

> For all development rules, patterns, and guidelines, see **[AGENTS.md](./AGENTS.md)**
