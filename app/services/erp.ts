/**
 * ERP Service Layer - SAMPLE IMPLEMENTATION
 *
 * This module demonstrates business logic patterns for an ERP system.
 * It shows how to:
 * - Organize service functions by domain
 * - Use Result pattern for error handling
 * - Implement CRUD operations with validation
 * - Structure database queries
 *
 * This is example code from Customware AI - adapt the patterns to your
 * specific business requirements.
 *
 * @module services/erp
 *
 * Provides CRUD operations for all ERP entities:
 * - Sales & CRM: Customers, Leads, Opportunities, Quotes, Sales Orders, Activities
 *
 * All functions follow these patterns:
 * - Use Result<T, Error> for error handling (neverthrow library)
 * - Validate input with Zod schemas before database operations
 * - Return typed objects, not raw SQL rows
 * - Auto-save database after modifications
 *
 * Database: SQLite via sql.js (in-memory with file persistence)
 */

import { Result, ok, err } from "neverthrow";
import { getDatabase } from "../db";
import type { Database, SqlValue } from "sql.js";
import {
  generateDocumentNumber,
} from "../utils/calculations";
import type {
  Customer,
  CreateCustomer,
  UpdateCustomer,
} from "../schemas";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Saves the current database state to disk.
 * Must be called after any INSERT, UPDATE, or DELETE operation.
 */
async function saveDb(db: Database): Promise<void> {
  const fs = await import("fs");
  const path = await import("path");
  const dbPath = path.join(process.cwd(), "database.db");
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

/**
 * Executes a SQL query and returns the first row as an object.
 *
 * @param db - Database instance
 * @param sql - SQL query string
 * @param params - Query parameters (optional)
 * @returns First row as object, or null if no results
 */
function queryOne(db: Database, sql: string, params?: SqlValue[]): Record<string, unknown> | null {
  const stmt = db.prepare(sql);
  if (params) {
    stmt.bind(params);
  }

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as Record<string, unknown>;
  }

  stmt.free();
  return null;
}

/**
 * Executes a SQL query and returns all rows as objects.
 *
 * @param db - Database instance
 * @param sql - SQL query string
 * @param params - Query parameters (optional)
 * @returns Array of row objects
 */
function queryAll(db: Database, sql: string, params?: SqlValue[]): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  if (params) {
    stmt.bind(params);
  }

  const results: Record<string, unknown>[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as Record<string, unknown>);
  }

  stmt.free();
  return results;
}

/**
 * Executes an INSERT/UPDATE/DELETE query.
 *
 * @param db - Database instance
 * @param sql - SQL query string
 * @param params - Query parameters (optional)
 * @returns Number of affected rows
 */
function execute(db: Database, sql: string, params?: SqlValue[]): number {
  const stmt = db.prepare(sql);
  if (params) {
    stmt.bind(params);
  }

  stmt.step();
  const changes = db.getRowsModified();
  stmt.free();
  return changes;
}

// ============================================================
// CUSTOMER CRUD OPERATIONS
// ============================================================

/**
 * Retrieves all customers from the database.
 *
 * @param filters - Optional filters (status, search query)
 * @returns Result containing array of customers
 *
 * @example
 * const result = await getCustomers({ status: 'active' });
 * if (result.isOk()) {
 *   const customers = result.value;
 * }
 */
export async function getCustomers(filters?: {
  status?: "active" | "inactive";
  search?: string;
}): Promise<Result<Customer[], Error>> {
  try {
    const { db } = await getDatabase();

    let sql = "SELECT * FROM customers WHERE 1=1";
    const params: SqlValue[] = [];

    // Apply status filter
    if (filters?.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    // Apply search filter (searches company name, contact name, email)
    if (filters?.search) {
      sql += " AND (company_name LIKE ? OR contact_name LIKE ? OR email LIKE ?)";
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += " ORDER BY company_name ASC";

    const rows = queryAll(db, sql, params.length > 0 ? params : undefined);
    return ok(rows as Customer[]);
  } catch (error) {
    return err(error as Error);
  }
}

/**
 * Retrieves a single customer by ID.
 *
 * @param id - Customer ID
 * @returns Result containing customer or null if not found
 */
export async function getCustomerById(id: number): Promise<Result<Customer | null, Error>> {
  try {
    const { db } = await getDatabase();
    const row = queryOne(db, "SELECT * FROM customers WHERE id = ?", [id]);
    return ok(row as Customer | null);
  } catch (error) {
    return err(error as Error);
  }
}

/**
 * Creates a new customer record.
 *
 * @param data - Customer data (validated with CreateCustomerSchema)
 * @returns Result containing the created customer with ID
 *
 * @example
 * const result = await createCustomer({
 *   company_name: "Sample Company",
 *   email: "contact@sample-company.com",
 *   payment_terms: 30
 * });
 */
export async function createCustomer(data: CreateCustomer): Promise<Result<Customer, Error>> {
  try {
    const { db } = await getDatabase();

    const sql = `
      INSERT INTO customers (
        company_name, contact_name, email, phone, address, city, state,
        postal_code, country, tax_id, payment_terms, credit_limit, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.company_name,
      data.contact_name || null,
      data.email || null,
      data.phone || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.postal_code || null,
      data.country || "USA",
      data.tax_id || null,
      data.payment_terms || 30,
      data.credit_limit || 0,
      data.status || "active",
      data.notes || null,
    ];

    execute(db, sql, params);
    await saveDb(db);

    // Get the inserted record
    const insertedId = queryOne(db, "SELECT last_insert_rowid() as id", [])?.id as number;
    const customer = queryOne(db, "SELECT * FROM customers WHERE id = ?", [insertedId]);

    return ok(customer as Customer);
  } catch (error) {
    return err(error as Error);
  }
}

/**
 * Updates an existing customer.
 *
 * @param id - Customer ID
 * @param data - Partial customer data to update
 * @returns Result containing the updated customer
 */
export async function updateCustomer(
  id: number,
  data: UpdateCustomer
): Promise<Result<Customer, Error>> {
  try {
    const { db } = await getDatabase();

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const params: SqlValue[] = [];

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      params.push(value);
    });

    if (updates.length === 0) {
      // No updates provided, just return existing customer
      const customer = queryOne(db, "SELECT * FROM customers WHERE id = ?", [id]);
      return ok(customer as Customer);
    }

    params.push(id);
    const sql = `UPDATE customers SET ${updates.join(", ")} WHERE id = ?`;

    execute(db, sql, params);
    await saveDb(db);

    const customer = queryOne(db, "SELECT * FROM customers WHERE id = ?", [id]);
    return ok(customer as Customer);
  } catch (error) {
    return err(error as Error);
  }
}

/**
 * Deletes a customer (soft delete by setting status to inactive).
 *
 * @param id - Customer ID
 * @returns Result indicating success
 */
export async function deleteCustomer(id: number): Promise<Result<void, Error>> {
  try {
    const { db } = await getDatabase();
    execute(db, "UPDATE customers SET status = 'inactive' WHERE id = ?", [id]);
    await saveDb(db);
    return ok(undefined);
  } catch (error) {
    return err(error as Error);
  }
}

// ============================================================
// DOCUMENT NUMBER GENERATION
// ============================================================

/**
 * Generates the next available document number for a given type.
 *
 * @param prefix - Document prefix (INV, QT, SO, PAY, JE)
 * @param tableName - Table to query for last number
 * @param columnName - Column containing document numbers
 * @returns The next document number
 *
 * @example
 * await getNextDocumentNumber("INV", "invoices", "invoice_number")
 * // Returns "INV-000001" if no invoices exist
 * // Returns "INV-000124" if last invoice was "INV-000123"
 */
export async function getNextDocumentNumber(
  prefix: string,
  tableName: string,
  columnName: string
): Promise<Result<string, Error>> {
  try {
    const { db } = await getDatabase();

    const sql = `SELECT ${columnName} FROM ${tableName} ORDER BY id DESC LIMIT 1`;
    const row = queryOne(db, sql, []);

    const lastNumber = row ? (row[columnName] as string | null) : null;
    const nextNumber = generateDocumentNumber(prefix, lastNumber);

    return ok(nextNumber);
  } catch (error) {
    return err(error as Error);
  }
}

// Demo data functions
export async function getDemoLeads(): Promise<Array<{ id: number; company_name: string; contact_name: string; estimated_value: number; probability: number; stage: string; created_at: string }>> {
  const stages = ["new", "contacted", "qualified", "proposal", "negotiation", "won"];
  return stages.map((stage, index) => ({
    id: index + 1,
    company_name: `${["Acme Corp", "TechStart Inc", "Global Solutions", "Innovation Labs", "Future Systems", "Prime Industries"][index]}`,
    contact_name: `${["John Smith", "Sarah Johnson", "Mike Chen", "Lisa Anderson", "David Kim", "Emily Brown"][index]}`,
    estimated_value: [25000, 50000, 75000, 100000, 150000, 200000][index],
    probability: [20, 40, 60, 70, 80, 100][index],
    stage,
    created_at: new Date(Date.now() - (6 - index) * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
}

export async function getDemoQuotes(): Promise<Array<{ id: number; quote_number: string; customer: string; amount: number; status: string; date: string; valid_until: string }>> {
  const statuses = ["draft", "sent", "approved", "rejected", "expired"];
  return Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    quote_number: `QT-2026-${String(index + 1).padStart(3, "0")}`,
    customer: `${["Acme Corp", "TechStart Inc", "Global Solutions", "Innovation Labs", "Future Systems"][index]}`,
    amount: [5000, 12500, 8000, 15000, 6500][index],
    status: statuses[index],
    date: new Date(Date.now() - (5 - index) * 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    valid_until: new Date(Date.now() + (index + 1) * 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  }));
}

// Export all functions
export * from "../schemas";
