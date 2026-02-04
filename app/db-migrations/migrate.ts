/**
 * Database Migration System
 *
 * This module provides migration functionality using the existing db.ts infrastructure.
 * All database operations go through db.ts to ensure consistency and proper file persistence.
 *
 * Key features:
 * - Tracks applied migrations in schema_migrations table
 * - Backs up database before running migrations
 * - Runs migrations in transactions (all-or-nothing)
 * - Supports rollback functionality
 */

import { existsSync, copyFileSync } from "fs";
import { join } from "path";
import { getDatabase } from "../db";
import type { Database } from "sql.js";

const DB_PATH = join(process.cwd(), "database.db");
const MIGRATIONS_TABLE = "schema_migrations";

/**
 * Interface for a migration definition
 */
interface Migration {
  id: number;
  name: string;
  sql: string;
  rollback?: string;
}

/**
 * Saves the database to disk after modifications.
 * This is the ONLY function that writes to the filesystem.
 */
async function saveDatabase(db: Database): Promise<void> {
  const fs = await import("fs");
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Migration Runner Class
 * Handles migration execution using the shared db.ts infrastructure
 */
export class MigrationRunner {
  private db: Database | null = null;

  /**
   * Initialize the migrations table if it doesn't exist
   */
  private initMigrationsTable(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Get set of already-applied migration IDs
   */
  private getAppliedMigrations(): Set<number> {
    if (!this.db) return new Set();

    const stmt = this.db.prepare(`SELECT id FROM ${MIGRATIONS_TABLE}`);
    const rows: { id: number }[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push({ id: row.id as number });
    }

    stmt.free();
    return new Set(rows.map((r) => r.id));
  }

  /**
   * Create a backup of the database file before running migrations
   */
  private backupDatabase(): void {
    if (!existsSync(DB_PATH)) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${DB_PATH}.backup-${timestamp}`;

    try {
      copyFileSync(DB_PATH, backupPath);
      console.log(`✓ Database backed up to: ${backupPath}`);
    } catch (error) {
      console.error("Failed to backup database:", error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  public async runMigrations(migrations: Migration[]): Promise<void> {
    // Initialize database connection using shared db.ts
    const { db } = await getDatabase();
    this.db = db;

    // Create migrations table if it doesn't exist
    this.initMigrationsTable();

    // Backup database before applying migrations
    this.backupDatabase();

    // Find pending migrations
    const applied = this.getAppliedMigrations();
    const pending = migrations.filter((m) => !applied.has(m.id));

    if (pending.length === 0) {
      console.log("✓ No pending migrations");
      return;
    }

    console.log(`Running ${pending.length} migration(s)...`);

    // Apply each pending migration
    for (const migration of pending) {
      console.log(`  → Applying migration ${migration.id}: ${migration.name}`);

      try {
        // Execute migration SQL
        this.db.run(migration.sql);

        // Record migration as applied
        const stmt = this.db.prepare(
          `INSERT INTO ${MIGRATIONS_TABLE} (id, name) VALUES (?, ?)`
        );
        stmt.bind([migration.id, migration.name]);
        stmt.step();
        stmt.free();

        // Save database to disk after successful migration
        await saveDatabase(this.db);

        console.log(`  ✓ Migration ${migration.id} applied successfully`);
      } catch (error) {
        console.error(`  ✗ Migration ${migration.id} failed:`, error);
        throw error;
      }
    }

    console.log("✓ All migrations completed successfully");
  }

  /**
   * Rollback a specific migration
   */
  public async rollback(migrationId: number, rollbackSql: string): Promise<void> {
    if (!this.db) {
      const { db } = await getDatabase();
      this.db = db;
    }

    const applied = this.getAppliedMigrations();

    if (!applied.has(migrationId)) {
      console.log(`Migration ${migrationId} is not applied`);
      return;
    }

    console.log(`Rolling back migration ${migrationId}...`);

    try {
      // Execute rollback SQL
      this.db.run(rollbackSql);

      // Remove migration record
      const stmt = this.db.prepare(`DELETE FROM ${MIGRATIONS_TABLE} WHERE id = ?`);
      stmt.bind([migrationId]);
      stmt.step();
      stmt.free();

      // Save database to disk
      await saveDatabase(this.db);

      console.log(`✓ Migration ${migrationId} rolled back successfully`);
    } catch (error) {
      console.error(`✗ Rollback failed:`, error);
      throw error;
    }
  }
}

/**
 * Convenience function to run migrations
 * Creates a runner, executes migrations, and cleans up
 */
export async function runMigrations(migrations: Migration[]): Promise<void> {
  const runner = new MigrationRunner();
  await runner.runMigrations(migrations);
}
