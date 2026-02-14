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

import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  /**
   * ⚠️ TEMPLATE DEMO ONLY - Landing Page
   *
   * This landing page route is ONLY for the demo/template version.
   * Remove this route when building your actual application.
   *
   * For production apps:
   * 1. Delete this index route
   * 2. Delete the routes/landing.tsx file
   * 3. Make your dashboard or login page the index route
   * 4. Remove landing page animations from tailwind.config.ts
   */
  index("routes/landing.tsx"),

  // Main dashboard (make this your index route for production apps)
  route("home", "routes/home.tsx"),

  // Sales & CRM routes
  ...prefix("sales", [
    route("customers", "routes/sales/customers.tsx"),
    route("customers/new", "routes/sales/customers.new.tsx"),
    route("customers/:id", "routes/sales/customers.$id.tsx"),
    route("leads", "routes/sales/leads.tsx"),
    route("quotes", "routes/sales/quotes.tsx"),
  ]),

  route("settings", "routes/settings.tsx"),

  // API routes
  ...prefix("api", [
    route("users", "routes/api/users.ts"),
    route("sales/customers", "routes/api/sales.customers.ts"),
  ]),
] satisfies RouteConfig;
