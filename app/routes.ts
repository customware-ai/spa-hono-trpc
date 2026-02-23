/**
 * Route Configuration
 *
 * Client-Side Routes for SPA
 * API endpoints are handled by tRPC at /trpc/* (served by Hono)
 */

import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  // Customers list
  index("routes/index.tsx"),

  // Customer Routes
  route("customers/new", "routes/customers.new.tsx"),
  route("customers/:id", "routes/customers.$id.tsx"),
] satisfies RouteConfig;
