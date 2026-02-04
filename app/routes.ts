/**
 * Route Configuration - Sample Structure
 *
 * Demonstrates organizing routes for a multi-module application:
 * - Module-based prefixes (sales, accounting)
 * - RESTful patterns for CRUD operations
 * - Nested routes for detail views
 *
 * Customize this structure for your application's navigation.
 *
 * @see https://reactrouter.com/start/framework/routing
 */

import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  // Main dashboard
  index("routes/dashboard.tsx"),

  // Sales & CRM routes
  ...prefix("sales", [
    route("customers", "routes/sales/customers.tsx"),
    route("customers/new", "routes/sales/customers.new.tsx"),
    route("customers/:id", "routes/sales/customers.$id.tsx"),
    route("leads", "routes/sales/leads.tsx"),
    route("quotes", "routes/sales/quotes.tsx"),
  ]),

  // Accounting routes
  ...prefix("accounting", [
    route("invoices", "routes/accounting/invoices.tsx"),
    route("payments", "routes/accounting/payments.tsx"),
    route("accounts", "routes/accounting/accounts.tsx"),
    route("reports", "routes/accounting/reports.tsx"),
  ]),

  // Legacy demo and API routes
  route("demo", "routes/home.tsx"),
  route("api/users", "routes/api.users.tsx"),
  route("api/tasks", "routes/api.tasks.tsx"),
] satisfies RouteConfig;
