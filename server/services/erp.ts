/**
 * ERP Service Layer - SAMPLE IMPLEMENTATION
 *
 * This module demonstrates business logic patterns for an ERP system.
 * It shows how to:
 * - Organize service functions by domain
 * - Use Result pattern for error handling
 * - Implement CRUD operations with validation
 * - Delegate persistence to db/queries modules
 *
 * @module services/erp
 */

import { Result, ResultAsync, err, errAsync, okAsync } from "neverthrow";
import { z } from "zod";
import {
  insertCustomer,
  selectCustomerById,
  selectCustomers,
  softDeleteCustomerById,
  updateCustomerById,
} from "../db/queries/customers.js";
import { selectLatestDocumentNumber } from "../db/queries/documents.js";
import {
  CustomerSchema,
} from "../contracts/sales.js";
import type {
  CreateCustomer,
  Customer,
  UpdateCustomer,
} from "../contracts/sales.js";
import type { DatabaseError } from "../types/errors.js";
import { generateDocumentNumber } from "../utils/calculations.js";

/**
 * Creates a typed DatabaseError object.
 */
function createDatabaseError(
  message: string,
  originalError?: unknown,
): DatabaseError {
  return {
    type: "DATABASE_ERROR",
    message,
    originalError: originalError instanceof Error ? originalError : undefined,
  };
}

/**
 * Validates an array of customer rows and converts parsing failures to DatabaseError.
 */
function parseCustomers(
  rows: unknown,
): ResultAsync<Customer[], DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const validation = z.array(CustomerSchema).safeParse(rows);
    if (!validation.success) {
      throw new Error(validation.error.message);
    }

    return validation.data;
  }, (error: unknown) => createDatabaseError("Data validation failed", error));

  return run();
}

/**
 * Validates one customer row and converts parsing failures to DatabaseError.
 */
function parseCustomer(
  row: unknown,
): ResultAsync<Customer, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const validation = CustomerSchema.safeParse(row);
    if (!validation.success) {
      throw new Error(validation.error.message);
    }

    return validation.data;
  }, (error: unknown) => createDatabaseError("Data validation failed", error));

  return run();
}

/**
 * Retrieves all customers from the database using optional filters.
 */
export async function getCustomers(filters?: {
  status?: "active" | "inactive";
  search?: string;
}): Promise<Result<Customer[], DatabaseError>> {
  return await selectCustomers(filters).andThen((rows) => parseCustomers(rows));
}

/**
 * Retrieves a single customer by id.
 */
export async function getCustomerById(
  id: number,
): Promise<Result<Customer | null, DatabaseError>> {
  return await selectCustomerById(id).andThen((row) =>
    row ? parseCustomer(row) : okAsync(null),
  );
}

/**
 * Creates a new customer record and returns the created row.
 */
export async function createCustomer(
  data: CreateCustomer,
): Promise<Result<Customer, DatabaseError>> {
  return await insertCustomer(data).andThen((row) =>
    row
      ? parseCustomer(row)
      : errAsync(createDatabaseError("Failed to retrieve created customer")),
  );
}

/**
 * Updates a customer record by id and returns the updated row.
 */
export async function updateCustomer(
  id: number,
  data: UpdateCustomer,
): Promise<Result<Customer, DatabaseError>> {
  const updateData: {
    company_name?: string;
    email?: string | null;
    phone?: string | null;
    status?: "active" | "inactive";
    notes?: string | null;
  } = {};

  if (data.company_name !== undefined) {
    updateData.company_name = data.company_name;
  }

  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  return await updateCustomerById(id, updateData).andThen((row) =>
    row ? parseCustomer(row) : errAsync(createDatabaseError("Customer not found")),
  );
}

/**
 * Soft-deletes a customer by setting status to inactive.
 */
export async function deleteCustomer(
  id: number,
): Promise<Result<void, DatabaseError>> {
  return await softDeleteCustomerById(id).map(() => undefined);
}

/**
 * Generates the next available document number by inspecting the target table.
 */
export async function getNextDocumentNumber(
  prefix: string,
  tableName: string,
  columnName: string,
): Promise<Result<string, DatabaseError>> {
  if (
    tableName === "quotes" &&
    columnName === "quote_number"
  ) {
    return await selectLatestDocumentNumber({
      tableName: "quotes",
      columnName: "quote_number",
    }).map((lastNumber) => generateDocumentNumber(prefix, lastNumber));
  }

  if (
    tableName === "sales_orders" &&
    columnName === "order_number"
  ) {
    return await selectLatestDocumentNumber({
      tableName: "sales_orders",
      columnName: "order_number",
    }).map((lastNumber) => generateDocumentNumber(prefix, lastNumber));
  }

  return err(createDatabaseError("Invalid table or column name"));
}

/**
 * Returns static demo leads data for UI examples.
 */
export async function getDemoLeads(): Promise<
  Array<{
    id: number;
    company_name: string;
    contact_name: string;
    estimated_value: number;
    probability: number;
    stage: string;
    created_at: string;
  }>
> {
  const stages = [
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "won",
  ];

  return stages.map((stage, index) => ({
    id: index + 1,
    company_name: `${["Acme Corp", "TechStart Inc", "Global Solutions", "Innovation Labs", "Future Systems", "Prime Industries"][index]}`,
    contact_name: `${["John Smith", "Sarah Johnson", "Mike Chen", "Lisa Anderson", "David Kim", "Emily Brown"][index]}`,
    estimated_value: [25000, 50000, 75000, 100000, 150000, 200000][index],
    probability: [20, 40, 60, 70, 80, 100][index],
    stage,
    created_at: new Date(
      Date.now() - (6 - index) * 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }));
}

/**
 * Returns static demo quotes data for UI examples.
 */
export async function getDemoQuotes(): Promise<
  Array<{
    id: number;
    quote_number: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
    valid_until: string;
  }>
> {
  const statuses = ["draft", "sent", "approved", "rejected", "expired"];

  return Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    quote_number: `QT-2026-${String(index + 1).padStart(3, "0")}`,
    customer: `${["Acme Corp", "TechStart Inc", "Global Solutions", "Innovation Labs", "Future Systems"][index]}`,
    amount: [5000, 12500, 8000, 15000, 6500][index],
    status: statuses[index],
    date: new Date(
      Date.now() - (5 - index) * 5 * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split("T")[0],
    valid_until: new Date(Date.now() + (index + 1) * 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  }));
}

export * from "../contracts/sales.js";
