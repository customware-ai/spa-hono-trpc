# Simple ERP System

A professional Enterprise Resource Planning (ERP) system built with React Router v7, TypeScript, Tailwind CSS, and sql.js. Features Sales & CRM and Accounting modules with industrial, modern design.

> **Required reading**: Review [AGENTS.md](./AGENTS.md) before development for coding patterns, commands, and project conventions.

## Features

- React Router v7.13 with server-side rendering
- Vite 8 beta for fast development and builds
- SQLite database with file persistence (`database.db`)
- Type-safe error handling with neverthrow
- Schema validation with Zod v4
- Tailwind CSS v4 with custom professional theme
- Type-aware linting with oxlint
- Full TypeScript support with strict mode

## Tech Stack

| Package      | Version        | Purpose                    |
| ------------ | -------------- | -------------------------- |
| react-router | 7.13.0         | Full-stack React framework |
| vite         | 8.0.0-beta.12  | Build tool                 |
| tailwindcss  | 4.1.18         | Styling                    |
| zod          | 4.3.6          | Schema validation          |
| neverthrow   | 8.2.0          | Type-safe error handling   |
| vitest       | 4.0.x          | Testing framework          |
| oxlint       | 1.x            | Type-aware linting         |
| sql.js       | 1.13.0         | SQLite in JavaScript       |

## 🎨 Design

- **Color Palette**: Emerald green (primary) + Slate gray (surface)
- **Typography**: Work Sans (400, 500, 600, 700)
- **Style**: Industrial precision, professional enterprise-grade UI
- **NO generic AI aesthetics** - Distinctive, purposeful design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run database migrations (creates ERP schema)
npm run migrate

# Start development server
npm run dev
```

Visit **http://localhost:5173** to see the application.

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

### ✅ Using sql.js

- **In-memory SQLite with file persistence**
- All database operations go through `db.ts`
- **db.ts is the ONLY file that writes to filesystem**
- Never use better-sqlite3 or direct filesystem access

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

The database persists to `database.db` in the project root.

**On startup:**

- If `database.db` exists, it's loaded into memory
- If not, migrations create a new database with tables

**On mutations:**

- Every create/update/delete calls `saveDatabase()`
- Data survives server restarts

**To reset:**

```bash
rm database.db
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

## 🔧 Development Guidelines

### Database Operations

```typescript
// ✅ CORRECT - Use db.ts
import { getDatabase } from "./db";
const { db } = await getDatabase();
```

**NEVER:**
- Import better-sqlite3
- Write to filesystem directly
- Bypass db.ts

### Service Layer

```typescript
// All business logic goes in services/
import { getCustomers, createCustomer } from "./services/erp";

// Uses Result<T, Error> pattern (neverthrow)
const result = await getCustomers();
if (result.isOk()) {
  const customers = result.value;
} else {
  const error = result.error;
}
```

### Result Pattern

Always use neverthrow's Result pattern for error handling:

```typescript
const result = await createCustomer(data);
if (result.isOk()) {
  const customer = result.value;
  // Success path
} else {
  console.error(result.error.message);
  // Error path
}
```

### Schema Validation

Validate all input with Zod before database operations:

```typescript
import { CreateCustomerSchema } from "./schemas/sales";

const validation = CreateCustomerSchema.safeParse(data);
if (!validation.success) {
  return err(new Error("Validation failed"));
}

// Now safe to use validated data
const result = await createCustomer(validation.data);
```

### Single Responsibility

- **db.ts**: Database & filesystem only
- **services/erp.ts**: Business logic & CRUD
- **schemas/**: Validation rules (Zod)
- **utils/**: Pure utilities
- **components/**: UI only
- **routes/**: Page components with loaders/actions

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

## 🏗️ ERP Modules

### Sales & CRM

- **Customers** - Manage customer records, contacts, and relationships
- **Leads** - Track prospects through sales pipeline (Kanban view)
- **Quotes** - Create quotations with line items and convert to orders
- **Orders** - Confirmed sales orders with fulfillment tracking

### Accounting & Finance

- **Chart of Accounts** - Hierarchical account structure (pre-seeded)
- **Invoices** - Customer invoicing with payment tracking
- **Payments** - Record and track customer payments
- **Journal Entries** - Manual accounting entries (debits/credits)
- **Ledger** - General ledger with transaction history
- **Reports** - Balance sheet, income statement, aged receivables

### Dashboard

- Revenue metrics and charts
- Sales pipeline funnel
- Outstanding invoices summary
- Recent activity feed

## 🔒 Important Rules

1. **db.ts is the ONLY file that writes to filesystem**
2. **Use Result pattern** - No throwing exceptions in business logic
3. **Validate with Zod** - Before database operations
4. **Type everything** - Full TypeScript with strict mode
5. **Comment your code** - Explain the "why", not the "what"
6. **Test your code** - Write tests for business logic and components

## 📖 Documentation

- **README.md** - This file (project overview)
- **AGENTS.md** - Agent coordination and development patterns
- **CLAUDE.md** - Legacy reference (see AGENTS.md instead)
- Code comments throughout codebase

## 🚦 Type Safety

This project enforces strict TypeScript and linting:

- **Explicit return types** on all functions
- **No `any` types** - use `unknown` or specific types
- **Type-aware linting** with oxlint
- **Schema validation** with Zod at runtime

Run `npm run check` to verify all checks pass before committing.

---

**Built with industrial precision** 🏭
