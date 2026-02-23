/**
 * Hono Server Entry Point
 *
 * This file creates the Hono HTTP server that:
 * 1. Serves static frontend assets from ../client/ (relative to server)
 * 2. Handles tRPC API requests at /trpc/*
 * 3. Falls back to index.html for client-side routing
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
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

// Resolve paths relative to the script location (works in both dev and production)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = path.resolve(__dirname, "../client");

const app = new Hono();

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
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

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
