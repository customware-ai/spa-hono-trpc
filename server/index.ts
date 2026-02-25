/**
 * Hono Server Entry Point
 *
 * This file creates the Hono HTTP server that:
 * 1. Serves static frontend assets from ../client/ (relative to server)
 * 2. Handles tRPC API requests at /trpc/*
 * 3. Captures frontend and backend error events
 * 4. Falls back to index.html for client-side routing
 *
 * Architecture:
 * - Hono handles HTTP routing and middleware
 * - tRPC provides type-safe API endpoints
 * - React Router handles client-side routing
 */

import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { appRouter } from "./trpc/router.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  installProcessErrorHandlers,
  logFrontendPayload,
  logServerPayload,
} from "./services/logging.js";

// Resolve paths relative to the script location (works in both dev and production)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = path.resolve(__dirname, "../client");

const app = new Hono();
/**
 * @critical
 * @description
 * Bootstraps process-level exception/rejection logging so server crashes
 * and unhandled promise failures are persisted to `.runtime.logs`.
 * @important
 * Do NOT remove this call. Without it, fatal backend failures bypass logging.
 */
installProcessErrorHandlers();

// ============================================================
// MIDDLEWARE
// ============================================================

/**
 * Enable CORS for all routes
 */
app.use("/*", cors());

// ============================================================
// tRPC API ENDPOINT
// ============================================================

/**
 * Mount tRPC router at /trpc/*
 * All API calls will go through this endpoint
 */
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

// ============================================================
// FRONTEND ERROR INGESTION
// ============================================================

/**
 * @critical
 * @description
 * Browser logs hit this endpoint directly.
 * Keep this route and body schema in place so frontend errors are persisted.
 * This is part of the central `.runtime.logs` capture pipeline.
 * @important
 * Do NOT remove this endpoint (`POST /logs`).
 */
app.post("/logs", async (c) => {
  const payload = await c.req.json().catch(() => undefined);
  if (payload === undefined) {
    return c.json({ message: "Invalid JSON payload for /logs." }, 400);
  }

  const result = logFrontendPayload(payload);
  if (result.isErr()) {
    const status = result.error.type === "LOG_VALIDATION_ERROR" ? 400 : 500;
    return c.json({ message: result.error.message }, status);
  }

  return c.json({ ok: true });
});

// ============================================================
// STATIC FILE SERVING
// ============================================================

/**
 * Serve static assets from client directory
 * This includes JS, CSS, images, fonts, etc.
 */
app.use(
  "/assets/*",
  serveStatic({
    root: CLIENT_DIR,
  })
);

/**
 * Serve favicon
 */
app.use(
  "/favicon.ico",
  serveStatic({
    path: path.join(CLIENT_DIR, "favicon.ico"),
  })
);

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * Health check endpoint for monitoring
 */
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ============================================================
// GLOBAL ERROR HANDLING
// ============================================================

/**
 * Centralized server error handler for unhandled app exceptions.
 *
 * @critical
 * @description
 * Logs unhandled route/middleware-level server errors to `.runtime.logs`.
 * Removing this loses server-side exception visibility and breaks parity with
 * frontend logging.
 */
app.onError((error, c) => {
  void logServerPayload({
    source: "server",
    level: "error",
    message: error instanceof Error ? error.message : "Unhandled server error.",
    context: {
      stack: error instanceof Error ? error.stack : undefined,
      path: c.req.path,
      method: c.req.method,
    },
    page_url: c.req.url,
  });

  return c.text("Internal Server Error", 500);
});

/**
 * Capture missing routes to keep routing gaps visible for debugging.
 *
 * @critical
 * @description
 * Logs not-found requests to `.runtime.logs` to keep traceability of
 * unexpected client calls and routing issues.
 * @important
 * Do NOT remove this handler; it is part of expected observability coverage.
 */
app.notFound((c) => {
  void logServerPayload({
    source: "server",
    level: "warn",
    message: `No route handler found for ${c.req.method} ${c.req.path}`,
    context: {
      path: c.req.path,
      method: c.req.method,
      url: c.req.url,
    },
    page_url: c.req.url,
  });

  return c.text("Not Found", 404);
});

// ============================================================
// SPA FALLBACK
// ============================================================

/**
 * Catch-all route for client-side routing
 * Returns index.html for any route not matched above
 * This allows React Router to handle client-side navigation
 */
app.get("*", (c) => {
  const indexPath = path.join(CLIENT_DIR, "index.html");

  if (!fs.existsSync(indexPath)) {
    return c.text("Application not built. Run 'npm run build' first.", 500);
  }

  const html = fs.readFileSync(indexPath, "utf-8");
  return c.html(html);
});

export default app;
