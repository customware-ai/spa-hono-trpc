# Template for React Router App with Tailwind CSS and SQLite

**This is a code style and architecture template repository.** Use this as a reference for coding patterns, project structure, and development standards when building production applications. The template demonstrates best practices through an ERP-style application structure built with React Router v7, TypeScript, Tailwind CSS, and sql.js.

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

- **Modern Stack**: React Router v7.13 with SSR, Vite 8, TypeScript strict mode
- **Type Safety**: Zod v4 schemas + neverthrow Result pattern for error handling
- **Database Layer**: SQLite via sql.js with proper abstraction and migration system
- **UI Patterns**: Tailwind CSS v4 with professional custom theme and reusable components
- **Code Quality**: Type-aware linting (oxlint), comprehensive testing setup
- **Architecture**: Clean separation of concerns (db, services, schemas, routes, components)

## Tech Stack

| Package      | Version       | Purpose                    |
| ------------ | ------------- | -------------------------- |
| react-router | 7.13.0        | Full-stack React framework |
| vite         | 8.0.0-beta.12 | Build tool                 |
| tailwindcss  | 4.1.18        | Styling                    |
| zod          | 4.3.6         | Schema validation          |
| neverthrow   | 8.2.0         | Type-safe error handling   |
| vitest       | 4.0.x         | Testing framework          |
| oxlint       | 1.x           | Type-aware linting         |
| sql.js       | 1.13.0        | SQLite in JavaScript       |

## 🎨 Design

- **Color Palette**: Emerald green (primary) + Slate gray (surface)
- **Typography**: Work Sans (400, 500, 600, 700)
- **Style**: Industrial precision, professional enterprise-grade UI
- **NO generic AI aesthetics** - Distinctive, purposeful design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Or build for production
npm run build
```

> **For development workflow and coding guidelines**, see [AGENTS.md](./AGENTS.md)

## 📁 Project Structure

```
app/
├── components/
│   ├── layout/          # Sidebar, TopBar, PageLayout, PageHeader
│   ├── ui/              # Table, Modal, Tabs, Select, StatusBadge, etc.
│   └── sales/           # Sales-specific components
├── routes/
│   ├── dashboard.tsx    # Main dashboard
│   ├── sales/           # Sales & CRM routes (customers, leads, quotes)
│   └── accounting/      # Accounting routes (invoices, payments, reports)
├── services/
│   └── erp.ts           # ERP business logic & CRUD operations
├── schemas/
│   ├── sales.ts         # Sales entity validation (Zod)
│   └── accounting.ts    # Accounting entity validation (Zod)
├── db-migrations/
│   ├── migrate.ts       # Migration system (uses db.ts)
│   ├── 001-erp-schema.ts # ERP database schema
│   └── run-migrations.ts # Migration runner
├── utils/
│   ├── calculations.ts  # Financial calculations
│   └── json.ts          # JSON response helper
└── db.ts                # Database layer (sql.js) - ONLY file for filesystem
```

## 🗄️ Database Architecture

**Technology**: SQLite via sql.js (in-memory with file persistence to `../sqlite/database.db`)

**Key Pattern**: All database operations go through `db.ts` (single source of truth for filesystem access)

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

The database persists to `../sqlite/database.db` (outside the project directory). The `sqlite` directory is created automatically if it doesn't exist.

**On startup:**

- If `../sqlite/database.db` exists, it's loaded into memory
- If not, migrations create a new database with tables

**On mutations:**

- Every create/update/delete calls `saveDatabase()`
- Data survives server restarts

**To reset:**

```bash
rm ../sqlite/database.db
npm run migrate
npm run dev
```

## 📝 Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start development server             |
| `npm run build`     | Production build                     |
| `npm run start`     | Start production server              |
| `npm run migrate`   | Run database migrations              |
| `npm run typecheck` | TypeScript type checking             |
| `npm run lint`      | Type-aware linting with oxlint       |
| `npm test`          | Run all tests                        |
| `npm run check`     | Run typecheck, lint, build, and test |

## 🧪 Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run check        # Full check (includes tests)
```

### Test Coverage

Tests cover:

- UI components (Button, Card, Input, Badge, Alert, Table, Modal, Select)
- Database CRUD operations (customers, invoices)
- API routes (loaders and actions)
- ERP service layer (business logic)
- Validation with Zod schemas

All tests use Vitest and React Testing Library.

## 🏗️ Application Modules

The codebase includes example modules to demonstrate full-stack patterns:

- **Sales & CRM** - Customer management, leads tracking, quotes, orders
- **Accounting & Finance** - Chart of accounts, invoices, payments, reports
- **Dashboard** - Overview with metrics, charts, and quick actions

> **For development guidelines, coding patterns, and architectural rules**, see [AGENTS.md](./AGENTS.md)

## 📖 Documentation

- **README.md** - This file (project overview and quick start)
- **[AGENTS.md](./AGENTS.md)** - Development patterns, coding rules, and architectural guidelines
- Code comments throughout codebase

---

_Remember:_ This is a **code pattern reference**, not a working application. Study the patterns, adapt the architecture, and build your own production-ready features following these standards.

> For all development rules, patterns, and guidelines, see **[AGENTS.md](./AGENTS.md)**
