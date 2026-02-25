import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getDatabase } from "./index.js";

/**
 * Applies all generated Drizzle migrations from server/db/migrations.
 */
export async function runMigrations(): Promise<void> {
  const db = getDatabase();
  const migrationsFolder = path.join(
    process.cwd(),
    "server",
    "db",
    "migrations",
  );

  migrate(db, { migrationsFolder });

  console.log("Drizzle migrations applied successfully.");
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  runMigrations().catch((error: unknown) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
}
