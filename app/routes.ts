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
  //Customers list
  index("routes/index.tsx"),

  // Customer Routes
  route("customers/new", "routes/customers.new.tsx"),
  route("customers/:id", "routes/customers.$id.tsx"),

  // API routes
  ...prefix("api", [
    route("users", "routes/api/users.ts"),
    route("sales/customers", "routes/api/sales.customers.ts"),
  ]),
] satisfies RouteConfig;
