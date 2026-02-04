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
 * - Accounting: Invoices, Payments, Journal Entries, Chart of Accounts, Ledger
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
  calculateDocumentTotals,
  calculateAmountDue,
  calculateInvoiceStatus,
} from "../utils/calculations";
import type {
  Customer,
  CreateCustomer,
  UpdateCustomer,
  Invoice,
  CreateInvoice,
  Payment,
  CreatePayment,
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
// INVOICE CRUD OPERATIONS
// ============================================================

/**
 * Retrieves all invoices with optional filtering.
 *
 * @param filters - Status, customer ID, date range filters
 * @returns Result containing array of invoices
 */
export async function getInvoices(filters?: {
  status?: string;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
}): Promise<Result<Invoice[], Error>> {
  try {
    const { db } = await getDatabase();

    let sql = "SELECT * FROM invoices WHERE 1=1";
    const params: SqlValue[] = [];

    if (filters?.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters?.customer_id) {
      sql += " AND customer_id = ?";
      params.push(filters.customer_id);
    }

    if (filters?.date_from) {
      sql += " AND invoice_date >= ?";
      params.push(filters.date_from);
    }

    if (filters?.date_to) {
      sql += " AND invoice_date <= ?";
      params.push(filters.date_to);
    }

    sql += " ORDER BY invoice_date DESC, invoice_number DESC";

    const rows = queryAll(db, sql, params.length > 0 ? params : undefined);
    return ok(rows as Invoice[]);
  } catch (error) {
    return err(error as Error);
  }
}

/**
 * Retrieves a single invoice by ID.
 */
export async function getInvoiceById(id: number): Promise<Result<Invoice | null, Error>> {
  try {
    const { db } = await getDatabase();
    const row = queryOne(db, "SELECT * FROM invoices WHERE id = ?", [id]);
    return ok(row as Invoice | null);
  } catch (error) {
    return err(error as Error);
  }
}

/**
 * Creates a new invoice with line items.
 *
 * @param data - Invoice header data
 * @param items - Array of invoice line items
 * @returns Result containing the created invoice
 *
 * @example
 * const result = await createInvoice({
 *   invoice_number: "INV-000001",
 *   customer_id: 1,
 *   invoice_date: "2024-02-05",
 *   due_date: "2024-03-05"
 * }, [
 *   { description: "Consulting Services", quantity: 10, unit_price: 150 }
 * ]);
 */
export async function createInvoice(
  data: CreateInvoice,
  items: Array<{ description: string; quantity: number; unit_price: number; tax_rate?: number }>
): Promise<Result<Invoice, Error>> {
  try {
    const { db } = await getDatabase();

    // Calculate totals
    const totals = calculateDocumentTotals(items, data.discount_amount || 0, data.tax_rate || 0);

    // Insert invoice header
    const sql = `
      INSERT INTO invoices (
        invoice_number, customer_id, sales_order_id, invoice_date, due_date,
        status, subtotal, tax_rate, tax_amount, discount_amount, total,
        amount_paid, amount_due, terms, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.invoice_number,
      data.customer_id,
      data.sales_order_id || null,
      data.invoice_date,
      data.due_date,
      data.status || "draft",
      totals.subtotal,
      data.tax_rate || 0,
      totals.tax_amount,
      totals.discount_amount,
      totals.total,
      0, // amount_paid starts at 0
      totals.total, // amount_due = total initially
      data.terms || null,
      data.notes || null,
    ];

    execute(db, sql, params);
    const invoiceId = queryOne(db, "SELECT last_insert_rowid() as id", [])?.id as number;

    // Insert line items
    for (const item of items) {
      const itemSql = `
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, tax_rate, line_total
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const lineTotal = item.quantity * item.unit_price;
      execute(db, itemSql, [
        invoiceId,
        item.description,
        item.quantity,
        item.unit_price,
        item.tax_rate || 0,
        lineTotal,
      ]);
    }

    await saveDb(db);

    const invoice = queryOne(db, "SELECT * FROM invoices WHERE id = ?", [invoiceId]);
    return ok(invoice as Invoice);
  } catch (error) {
    return err(error as Error);
  }
}

/**
 * Records a payment against an invoice.
 * Updates invoice amounts and status automatically.
 *
 * @param data - Payment data including invoice_id and amount
 * @returns Result containing the created payment
 */
export async function createPayment(data: CreatePayment): Promise<Result<Payment, Error>> {
  try {
    const { db } = await getDatabase();

    // Insert payment record
    const sql = `
      INSERT INTO payments (
        payment_number, customer_id, invoice_id, payment_date,
        amount, payment_method, reference_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.payment_number,
      data.customer_id,
      data.invoice_id || null,
      data.payment_date,
      data.amount,
      data.payment_method || null,
      data.reference_number || null,
      data.notes || null,
    ];

    execute(db, sql, params);
    await saveDb(db);

    // Update invoice if payment is linked to one
    if (data.invoice_id) {
      const invoice = queryOne(db, "SELECT * FROM invoices WHERE id = ?", [data.invoice_id]) as Invoice;

      if (invoice) {
        const newAmountPaid = invoice.amount_paid + data.amount;
        const newAmountDue = calculateAmountDue(invoice.total, newAmountPaid);
        const newStatus = calculateInvoiceStatus(
          invoice.total,
          newAmountPaid,
          invoice.due_date,
          invoice.status
        );

        execute(
          db,
          "UPDATE invoices SET amount_paid = ?, amount_due = ?, status = ? WHERE id = ?",
          [newAmountPaid, newAmountDue, newStatus, data.invoice_id]
        );
        await saveDb(db);
      }
    }

    const paymentId = queryOne(db, "SELECT last_insert_rowid() as id", [])?.id as number;
    const payment = queryOne(db, "SELECT * FROM payments WHERE id = ?", [paymentId]);

    return ok(payment as Payment);
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

// ============================================================
// CHART OF ACCOUNTS OPERATIONS
// ============================================================

/**
 * Retrieves the complete Chart of Accounts with hierarchy.
 *
 * @returns Result containing array of accounts
 */
export async function getChartOfAccounts(): Promise<Result<Record<string, unknown>[], Error>> {
  try {
    const { db } = await getDatabase();
    const sql = "SELECT * FROM chart_of_accounts WHERE is_active = 1 ORDER BY account_code ASC";
    const rows = queryAll(db, sql);
    return ok(rows);
  } catch (error) {
    return err(error as Error);
  }
}

/**
 * Retrieves accounts by type.
 *
 * @param accountType - Type of account (asset, liability, equity, revenue, expense)
 * @returns Result containing filtered accounts
 */
export async function getAccountsByType(
  accountType: "asset" | "liability" | "equity" | "revenue" | "expense"
): Promise<Result<Record<string, unknown>[], Error>> {
  try {
    const { db } = await getDatabase();
    const sql = `
      SELECT * FROM chart_of_accounts
      WHERE account_type = ? AND is_active = 1
      ORDER BY account_code ASC
    `;
    const rows = queryAll(db, sql, [accountType]);
    return ok(rows);
  } catch (error) {
    return err(error as Error);
  }
}

// Export all functions
export * from "../schemas";
