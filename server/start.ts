/**
 * Node.js Server Startup Script
 * 
 * This file starts the Hono server using @hono/node-server.
 * It binds to the specified port and handles graceful shutdown.
 */

import { serve } from "@hono/node-server";
import app from "./index.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

console.log(`🚀 Starting server on http://localhost:${PORT}`);
console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
console.log(`🏥 Health check: http://localhost:${PORT}/health`);

/**
 * Start the Hono server
 */
serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`✅ Server running at http://localhost:${info.port}`);
  }
);

/**
 * Graceful shutdown on SIGINT/SIGTERM
 */
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});
