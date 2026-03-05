import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import BetterSqlite3, { type Database } from "better-sqlite3";

export interface SeedCustomerInput {
  company_name: string;
  email: string | null;
  status: "active" | "inactive";
}

/**
 * Fixed sqlite database path shared by Playwright setup, helpers, and the
 * backend process under test.
 */
export const E2E_DATABASE_FILE_PATH = path.join(
  process.cwd(),
  ".dbs",
  "e2e.db",
);

/**
 * Resolves the dedicated sqlite database used by Playwright.
 */
export function getE2EDatabaseFilePath(): string {
  return E2E_DATABASE_FILE_PATH;
}

/**
 * Opens the shared Playwright database file.
 */
function openE2EDatabase(): Database {
  return new BetterSqlite3(getE2EDatabaseFilePath());
}

/**
 * Removes any prior test database and reapplies the schema migrations so the
 * web server starts against a clean, deterministic database.
 */
export async function prepareE2EDatabase(): Promise<void> {
  const databaseFilePath = getE2EDatabaseFilePath();
  const databaseDirectory = path.dirname(databaseFilePath);

  if (!existsSync(databaseDirectory)) {
    mkdirSync(databaseDirectory, { recursive: true });
  }

  rmSync(databaseFilePath, { force: true });
  const { runMigrations } = await import("../../server/db/migrate.js");
  await runMigrations();
}

/**
 * Clears customer rows and resets the autoincrement sequence so each test can
 * assert stable row ids when needed.
 */
export function resetCustomerTable(): void {
  const database = openE2EDatabase();

  try {
    database.prepare("DELETE FROM customers").run();
    database
      .prepare("DELETE FROM sqlite_sequence WHERE name = 'customers'")
      .run();
  } finally {
    database.close();
  }
}

/**
 * Seeds customer rows directly into sqlite for scenarios that need existing
 * backend state before the browser loads the page.
 */
export function seedCustomers(customers: SeedCustomerInput[]): void {
  const database = openE2EDatabase();

  try {
    const insertCustomer = database.prepare(
      "INSERT INTO customers (company_name, email, status) VALUES (@company_name, @email, @status)",
    );

    const seedTransaction = database.transaction((rows: SeedCustomerInput[]) => {
      for (const customer of rows) {
        insertCustomer.run(customer);
      }
    });

    seedTransaction(customers);
  } finally {
    database.close();
  }
}
