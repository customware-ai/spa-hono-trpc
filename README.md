# SQLite Database Management App

A full-stack React Router application with SQLite database integration, featuring modern tooling and type-safe error handling.

**This is a template** demonstrating best practices and project structure—not a live application. Use it as a starting point for new projects.

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

| Package      | Version       | Purpose                    |
| ------------ | ------------- | -------------------------- |
| react-router | 7.13.0        | Full-stack React framework |
| vite         | 8.0.0-beta.10 | Build tool                 |
| tailwindcss  | 4.1.18        | Styling                    |
| zod          | 4.3.6         | Schema validation          |
| neverthrow   | 8.2.0         | Type-safe error handling   |
| vitest       | 4.0.x         | Testing framework          |
| oxlint       | 1.x           | Type-aware linting         |
| sql.js       | 1.13.0        | SQLite in JavaScript       |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting (type-aware)
npm run lint

# Production build
npm run build

# Start production server
npm run start

# Run all checks (typecheck, lint, build, test)
npm run check
```

## Project Structure (initial template)

```
app/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── demo/
│       └── ThemeShowcase.tsx
├── config/
│   ├── constants.ts        # App configuration
│   └── env.ts              # Environment validation
├── hooks/
│   └── useForm.ts          # Type-safe form handling
├── schemas/
│   └── index.ts            # Zod validation schemas
├── types/
│   └── errors.ts           # Error types for neverthrow
├── utils/
│   ├── api.ts              # API response helpers
│   ├── json.ts             # JSON response helper
│   ├── logger.ts           # Structured logging
│   └── validate.ts         # Zod validation helper
├── routes/
│   ├── home.tsx            # Main page with loader/action
│   ├── showcase.tsx        # Theme demo page
│   └── api.*.tsx           # API endpoints
├── db.ts                   # Database operations with Result types
├── routes.ts               # Route configuration
├── root.tsx                # Root layout with ErrorBoundary
└── app.css                 # Tailwind CSS entry point

tests/                      # Test files
├── components/             # UI component tests
├── db/                     # Database operation tests
├── routes/                 # API route tests
└── utils/                  # Utility tests

tailwind.config.ts          # Tailwind theme configuration
vitest.config.ts            # Vitest configuration
.oxlintrc.json              # Oxlint configuration
database.db                 # Persistent SQLite database
```

## Tailwind CSS Theme

Custom theme defined in `tailwind.config.ts` with:

- **Primary**: Professional blue palette
- **Accent**: Teal palette
- **Surface**: Neutral grays
- **Semantic**: Success, warning, danger, info colors
- **Custom shadows**: soft, medium, strong
- **Animations**: fade-in, slide-up, scale-in

Visit `/showcase` to see all components and theme colors.

### UI Components

Reusable components in `app/components/ui/`:

- **Button**: Variants (primary, secondary, outline, ghost, danger), sizes (sm, md, lg), loading state
- **Card**: Variants (default, elevated, outlined), CardHeader subcomponent
- **Input/Textarea**: Label, error state, helper text support
- **Badge**: Variants (default, primary, success, warning, danger, info)
- **Alert**: Variants (info, success, warning, danger), dismissible

## Database Persistence

The database persists to `database.db` in the project root.

**On startup:**

- If `database.db` exists, it's loaded into memory
- If not, a new database is created with tables

**On mutations:**

- Every create/update/delete calls `saveDatabase()`
- Data survives server restarts

**To reset:**

```bash
rm database.db
npm run dev
```

## Testing

The project uses **Vitest 4.x** with React Testing Library for comprehensive testing.

### Test Structure

```
tests/
├── setup.ts                    # Test setup with jest-dom
├── helpers.ts                  # Test utilities (createLoaderArgs, etc.)
├── components/                 # UI component tests
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   ├── Input.test.tsx
│   ├── Badge.test.tsx
│   └── Alert.test.tsx
├── db/
│   └── db.test.ts              # Database operation tests
├── routes/                     # API route tests
│   └── *.test.ts
└── utils/                      # Utility tests
    ├── validate.test.ts
    └── api.test.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run full check (typecheck, lint, build, test)
npm run check
```

### Test Coverage

Tests cover:

- UI components (Button, Card, Input, Badge, Alert)
- Database CRUD operations
- API routes (loaders and actions)
- Utility functions
- Schema validation with Zod

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start development server             |
| `npm run build`     | Production build                     |
| `npm run start`     | Start production server              |
| `npm run typecheck` | TypeScript type checking             |
| `npm run lint`      | Type-aware linting with oxlint       |
| `npm test`          | Run all tests                        |
| `npm run check`     | Run typecheck, lint, build, and test |

---

Built with React Router, Vite, and SQLite.
