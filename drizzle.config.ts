import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration for sqlite migrations under server/db.
 */
export default defineConfig({
  schema: "./server/db/schemas.ts",
  out: "./server/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./.dbs/database.db",
  },
  verbose: true,
  strict: true,
});
