/**
 * Route Configuration
 *
 * Simplified for Customers Demo
 */

import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  /**
   * Landing Page
   */
  index("routes/landing.tsx"),

  // Main dashboard (Customers list is now the home)
  route("home", "routes/home.tsx"),

  // Customer Routes
  route("customers/new", "routes/customers.new.tsx"),
  route("customers/:id", "routes/customers.$id.tsx"),

  // API routes
  ...prefix("api", [
    route("users", "routes/api/users.ts"),
    route("sales/customers", "routes/api/sales.customers.ts"),
  ]),
] satisfies RouteConfig;
