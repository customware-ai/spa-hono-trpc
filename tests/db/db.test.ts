/**
 * Tests for Database Layer
 *
 * Tests the core database functionality including table creation,
 * CRUD operations, and data persistence using sql.js.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

// Create a test-specific database module
let testDb: Database | null = null;
let testSQL: SqlJsStatic | null = null;

async function getTestDatabase(): Promise<{ db: Database; SQL: SqlJsStatic }> {
  if (!testSQL) {
    testSQL = await initSqlJs();
  }
  if (!testDb) {
    testDb = new testSQL.Database();
    // Initialize a simple test table
    testDb.run(`
      CREATE TABLE IF NOT EXISTS test_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return { db: testDb, SQL: testSQL };
}

function resetTestDatabase(): void {
  if (testDb) {
    testDb.run('DELETE FROM test_data');
    testDb.run("DELETE FROM sqlite_sequence WHERE name='test_data'");
  }
}

describe('Database Operations', () => {
  beforeEach(async () => {
    await getTestDatabase();
    resetTestDatabase();
  });

  afterEach(() => {
    resetTestDatabase();
  });

  describe('Basic CRUD Operations', () => {
    it('should create a record', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Test Item', 42]);
      const result = db.exec("SELECT * FROM test_data WHERE name = 'Test Item'");

      expect(result).toHaveLength(1);
      expect(result[0].values).toHaveLength(1);
      expect(result[0].values[0][1]).toBe('Test Item');
      expect(result[0].values[0][2]).toBe(42);
    });

    it('should read all records', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Item 1', 10]);
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Item 2', 20]);

      const result = db.exec("SELECT * FROM test_data ORDER BY id");

      expect(result[0].values).toHaveLength(2);
    });

    it('should read a single record by id', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Single Item', 100]);

      const result = db.exec("SELECT * FROM test_data WHERE id = 1");

      expect(result[0].values[0][1]).toBe('Single Item');
      expect(result[0].values[0][2]).toBe(100);
    });

    it('should update a record', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Old Name', 50]);
      db.run("UPDATE test_data SET name = ?, value = ? WHERE id = ?", ['New Name', 60, 1]);

      const result = db.exec("SELECT * FROM test_data WHERE id = 1");

      expect(result[0].values[0][1]).toBe('New Name');
      expect(result[0].values[0][2]).toBe(60);
    });

    it('should delete a record', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['To Delete', 99]);
      db.run("DELETE FROM test_data WHERE id = 1");

      const result = db.exec("SELECT * FROM test_data WHERE id = 1");

      expect(result).toHaveLength(0);
    });
  });

  describe('Query Results', () => {
    it('should return empty array when no records exist', async () => {
      const { db } = await getTestDatabase();
      const result = db.exec("SELECT * FROM test_data");

      expect(result).toHaveLength(0);
    });

    it('should return null for non-existent record', async () => {
      const { db } = await getTestDatabase();
      const result = db.exec("SELECT * FROM test_data WHERE id = 999");

      expect(result).toHaveLength(0);
    });

    it('should filter records by condition', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['High Value', 100]);
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Low Value', 10]);

      const result = db.exec("SELECT * FROM test_data WHERE value > 50");

      expect(result[0].values).toHaveLength(1);
      expect(result[0].values[0][1]).toBe('High Value');
    });
  });

  describe('Database Export', () => {
    it('should export database as Uint8Array', async () => {
      const { db } = await getTestDatabase();
      const exported = db.export();

      expect(exported).toBeInstanceOf(Uint8Array);
      expect(exported.length).toBeGreaterThan(0);
    });

    it('should export and import database data', async () => {
      const { db, SQL } = await getTestDatabase();

      // Add data
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Export Test', 123]);

      // Export
      const exported = db.export();

      // Create new database from exported data
      const importedDb = new SQL.Database(exported);
      const result = importedDb.exec("SELECT * FROM test_data WHERE name = 'Export Test'");

      expect(result[0].values[0][1]).toBe('Export Test');
      expect(result[0].values[0][2]).toBe(123);

      importedDb.close();
    });
  });

  describe('Parameterized Queries', () => {
    it('should handle parameterized inserts', async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Param Test', 456]);

      const result = db.exec("SELECT * FROM test_data WHERE name = 'Param Test'");

      expect(result[0].values[0][2]).toBe(456);
    });

    it('should prevent SQL injection via parameters', async () => {
      const { db } = await getTestDatabase();
      const maliciousInput = "'; DROP TABLE test_data; --";

      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", [maliciousInput, 1]);

      // Table should still exist and contain the literal string
      const result = db.exec("SELECT * FROM test_data");
      expect(result[0].values).toHaveLength(1);
      expect(result[0].values[0][1]).toBe(maliciousInput);
    });
  });

  describe('Transaction Support', () => {
    it('should support manual transactions', async () => {
      const { db } = await getTestDatabase();

      db.run("BEGIN TRANSACTION");
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['TX Item 1', 10]);
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['TX Item 2', 20]);
      db.run("COMMIT");

      const result = db.exec("SELECT * FROM test_data");

      expect(result[0].values).toHaveLength(2);
    });

    it('should rollback failed transactions', async () => {
      const { db } = await getTestDatabase();

      db.run("BEGIN TRANSACTION");
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['TX Item', 10]);
      db.run("ROLLBACK");

      const result = db.exec("SELECT * FROM test_data");

      expect(result).toHaveLength(0);
    });
  });

  describe('Schema Validation', () => {
    it('should enforce NOT NULL constraint', async () => {
      const { db } = await getTestDatabase();

      expect(() => {
        db.run("INSERT INTO test_data (value) VALUES (?)", [100]);
      }).toThrow();
    });

    it('should auto-increment primary key', async () => {
      const { db } = await getTestDatabase();

      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['First', 1]);
      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Second', 2]);

      const result = db.exec("SELECT id FROM test_data ORDER BY id");

      expect(result[0].values[0][0]).toBe(1);
      expect(result[0].values[1][0]).toBe(2);
    });

    it('should set default timestamp', async () => {
      const { db } = await getTestDatabase();

      db.run("INSERT INTO test_data (name, value) VALUES (?, ?)", ['Timestamp Test', 1]);

      const result = db.exec("SELECT created_at FROM test_data WHERE id = 1");

      expect(result[0].values[0][0]).toBeTruthy(); // Should have a timestamp
    });
  });
});
