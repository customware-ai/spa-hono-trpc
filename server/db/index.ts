import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import BetterSqlite3, { type Database as BetterSqliteDatabase } from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import * as schema from "./schemas.js";

export type DatabaseClient = BetterSQLite3Database<typeof schema>;

/**
 * Absolute database path for the local sqlite file.
 */
export const DATABASE_FILE_PATH = path.join(process.cwd(), ".dbs", "database.db");

let sqlite: BetterSqliteDatabase | null = null;
let db: DatabaseClient | null = null;

/**
 * Ensures the local database directory exists before opening sqlite.
 */
function ensureDatabaseDirectory(): void {
  const directory = path.dirname(DATABASE_FILE_PATH);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

/**
 * Initializes sqlite and Drizzle once per process.
 */
export function initializeDatabase(): DatabaseClient {
  if (sqlite && db) {
    return db;
  }

  ensureDatabaseDirectory();

  sqlite = new BetterSqlite3(DATABASE_FILE_PATH);
  sqlite.pragma("foreign_keys = ON");
  db = drizzle(sqlite, { schema });

  return db;
}

/**
 * Returns the shared database connection.
 */
export function getDatabase(): DatabaseClient {
  if (!sqlite || !db) {
    return initializeDatabase();
  }

  return db;
}
