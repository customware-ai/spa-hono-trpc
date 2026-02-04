/**
 * Migration runner script
 *
 * This script executes all pending database migrations to set up
 * the ERP schema (Sales, CRM, Accounting tables).
 *
 * Run this script with: npx tsx app/db-migrations/run-migrations.ts
 *
 * The migration system:
 * - Tracks which migrations have been applied
 * - Automatically backs up the database before running migrations
 * - Runs migrations in transactions (all-or-nothing)
 * - Can be rolled back if needed
 */

import { runMigrations } from "./migrate";
import { migration001 } from "./001-erp-schema";

/**
 * Main function to run all migrations
 */
async function main(): Promise<void> {
  console.log("Starting database migrations...\n");

  try {
    // Array of all migrations in order
    const migrations = [
      migration001, // ERP schema (Sales, CRM, Accounting)
    ];

    await runMigrations(migrations);

    console.log("\n✓ All migrations completed successfully!");
    console.log("Your database is now ready for the ERP system.");
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  void main();
}

export { main as runMigrations };
