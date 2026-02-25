/**
 * Route Configuration
 *
 * Simplified SPA routes for customer list and customer creation.
 * Shared layout wraps all customer pages.
 */

import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/MainLayout.tsx", [
    index("routes/index.tsx"),
    route("customers/new", "routes/customers.new.tsx"),
  ]),
] satisfies RouteConfig;
