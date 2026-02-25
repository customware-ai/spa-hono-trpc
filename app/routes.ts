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
import { attachGlobalFrontendErrorHandlers } from "./utils/error-logger";

/**
 * @critical
 * @description
 * Attach global frontend error handlers once on app mount.
 * This forwards uncaught window/document errors and unhandled promise
 * rejections to `POST /logs`, which persists logs in `.runtime.logs`.
 * @important
 * Do NOT remove this initializer. Without it, frontend runtime errors
 * are no longer captured for the shared log pipeline.
 */
attachGlobalFrontendErrorHandlers({ endpoint: "/logs" });

export default [
  layout("layouts/MainLayout.tsx", [
    index("routes/index.tsx"),
    route("customers/new", "routes/customers.new.tsx"),
  ]),
] satisfies RouteConfig;
