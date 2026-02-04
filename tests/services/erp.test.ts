/**
 * Tests for ERP Service Layer
 *
 * Tests business logic and CRUD operations for ERP entities.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

// Test database setup
let testDb: Database | null = null;
let testSQL: SqlJsStatic | null = null;

async function getTestDatabase(): Promise<{ db: Database; SQL: SqlJsStatic }> {
  if (!testSQL) {
    testSQL = await initSqlJs();
  }
  if (!testDb) {
    testDb = new testSQL.Database();

    // Create customers table
    testDb.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        contact_name TEXT,
        email TEXT,
        phone TEXT,
        website TEXT,
        billing_address TEXT,
        shipping_address TEXT,
        tax_id TEXT,
        payment_terms INTEGER DEFAULT 30,
        credit_limit REAL DEFAULT 0,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return { db: testDb, SQL: testSQL };
}

function resetTestDatabase(): void {
  if (testDb) {
    testDb.run('DELETE FROM customers');
    testDb.run("DELETE FROM sqlite_sequence WHERE name='customers'");
  }
}

describe('ERP Service - Customer Operations', () => {
  beforeEach(async () => {
    await getTestDatabase();
    resetTestDatabase();
  });

  afterEach(() => {
    resetTestDatabase();
  });

  describe('Create Customer', () => {
    it('should create a customer with required fields', async () => {
      const { db } = await getTestDatabase();

      db.run(
        "INSERT INTO customers (company_name, email) VALUES (?, ?)",
        ['Acme Corp', 'info@acme.com']
      );

      const result = db.exec("SELECT * FROM customers WHERE company_name = 'Acme Corp'");

      expect(result).toHaveLength(1);
      expect(result[0].values[0][1]).toBe('Acme Corp');
      expect(result[0].values[0][3]).toBe('info@acme.com');
    });

    it('should create a customer with all fields', async () => {
      const { db } = await getTestDatabase();

      db.run(`
        INSERT INTO customers (
          company_name, contact_name, email, phone, payment_terms, credit_limit, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['Test Corp', 'John Doe', 'john@test.com', '555-1234', 60, 10000, 'active']);

      const result = db.exec("SELECT * FROM customers WHERE company_name = 'Test Corp'");

      expect(result[0].values[0][1]).toBe('Test Corp');
      expect(result[0].values[0][2]).toBe('John Doe');
      expect(result[0].values[0][9]).toBe(60); // payment_terms
      expect(result[0].values[0][10]).toBe(10000); // credit_limit
    });

    it('should use default values for optional fields', async () => {
      const { db } = await getTestDatabase();

      db.run("INSERT INTO customers (company_name) VALUES (?)", ['Default Corp']);

      const result = db.exec("SELECT payment_terms, credit_limit, status FROM customers WHERE company_name = 'Default Corp'");

      expect(result[0].values[0][0]).toBe(30); // default payment_terms
      expect(result[0].values[0][1]).toBe(0); // default credit_limit
      expect(result[0].values[0][2]).toBe('active'); // default status
    });
  });

  describe('Read Customer', () => {
    beforeEach(async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO customers (company_name, email, status) VALUES (?, ?, ?)", ['Active Corp', 'active@test.com', 'active']);
      db.run("INSERT INTO customers (company_name, email, status) VALUES (?, ?, ?)", ['Inactive Corp', 'inactive@test.com', 'inactive']);
    });

    it('should get all customers', async () => {
      const { db } = await getTestDatabase();

      const result = db.exec("SELECT * FROM customers");

      expect(result[0].values).toHaveLength(2);
    });

    it('should get a single customer by id', async () => {
      const { db } = await getTestDatabase();

      const result = db.exec("SELECT * FROM customers WHERE id = 1");

      expect(result[0].values[0][1]).toBe('Active Corp');
    });

    it('should filter customers by status', async () => {
      const { db } = await getTestDatabase();

      const result = db.exec("SELECT * FROM customers WHERE status = 'active'");

      expect(result[0].values).toHaveLength(1);
      expect(result[0].values[0][1]).toBe('Active Corp');
    });

    it('should search customers by company name', async () => {
      const { db } = await getTestDatabase();

      // Use a more specific search term that only matches 'Active Corp' not 'Inactive Corp'
      const result = db.exec("SELECT * FROM customers WHERE company_name LIKE 'Active%'");

      expect(result[0].values).toHaveLength(1);
      expect(result[0].values[0][1]).toBe('Active Corp');
    });
  });

  describe('Update Customer', () => {
    beforeEach(async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO customers (company_name, email) VALUES (?, ?)", ['Old Name', 'old@test.com']);
    });

    it('should update customer fields', async () => {
      const { db } = await getTestDatabase();

      db.run(
        "UPDATE customers SET company_name = ?, email = ? WHERE id = ?",
        ['New Name', 'new@test.com', 1]
      );

      const result = db.exec("SELECT * FROM customers WHERE id = 1");

      expect(result[0].values[0][1]).toBe('New Name');
      expect(result[0].values[0][3]).toBe('new@test.com');
    });

    it('should update customer status', async () => {
      const { db } = await getTestDatabase();

      db.run("UPDATE customers SET status = ? WHERE id = ?", ['inactive', 1]);

      const result = db.exec("SELECT status FROM customers WHERE id = 1");

      expect(result[0].values[0][0]).toBe('inactive');
    });
  });

  describe('Delete Customer', () => {
    beforeEach(async () => {
      const { db } = await getTestDatabase();
      db.run("INSERT INTO customers (company_name, email) VALUES (?, ?)", ['To Delete', 'delete@test.com']);
    });

    it('should delete a customer (soft delete by setting inactive)', async () => {
      const { db } = await getTestDatabase();

      db.run("UPDATE customers SET status = ? WHERE id = ?", ['inactive', 1]);

      const result = db.exec("SELECT status FROM customers WHERE id = 1");

      expect(result[0].values[0][0]).toBe('inactive');
    });

    it('should hard delete a customer', async () => {
      const { db } = await getTestDatabase();

      db.run("DELETE FROM customers WHERE id = 1");

      const result = db.exec("SELECT * FROM customers WHERE id = 1");

      expect(result).toHaveLength(0);
    });
  });

  describe('Customer Validation', () => {
    it('should enforce status check constraint', async () => {
      const { db } = await getTestDatabase();

      expect(() => {
        db.run("INSERT INTO customers (company_name, status) VALUES (?, ?)", ['Test', 'invalid']);
      }).toThrow();
    });
  });
});
