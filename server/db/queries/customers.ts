import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import type { DatabaseError } from "../../types/errors.js";
import { getDatabase } from "../index.js";
import { customers } from "../schemas.js";

/**
 * Input type for querying customers.
 */
export interface CustomerFilters {
  status?: "active" | "inactive";
  search?: string;
}

/**
 * Converts unknown errors to the DatabaseError contract.
 */
function mapDatabaseError(message: string, error: unknown): DatabaseError {
  return {
    type: "DATABASE_ERROR",
    message,
    originalError: error instanceof Error ? error : undefined,
  };
}

/**
 * Returns customers with optional status and search filters.
 */
export function selectCustomers(
  filters?: CustomerFilters,
): ResultAsync<typeof customers.$inferSelect[], DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(customers.status, filters.status));
    }

    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          like(customers.company_name, searchPattern),
          like(customers.email, searchPattern),
        ),
      );
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(customers)
        .where(and(...conditions))
        .orderBy(asc(customers.company_name));
    }

    return db.select().from(customers).orderBy(asc(customers.company_name));
  }, (error: unknown) => mapDatabaseError("Failed to select customers", error));

  return run();
}

/**
 * Returns one customer by id.
 */
export function selectCustomerById(
  id: number,
): ResultAsync<typeof customers.$inferSelect | undefined, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);

    return rows[0];
  }, (error: unknown) => mapDatabaseError("Failed to select customer by id", error));

  return run();
}

/**
 * Inserts one customer and returns the created row.
 */
export function insertCustomer(
  data: {
    company_name: string;
    email?: string | null;
    phone?: string | null;
    status?: "active" | "inactive";
    notes?: string | null;
  },
): ResultAsync<typeof customers.$inferSelect | undefined, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.insert(customers).values({
      company_name: data.company_name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      status: data.status ?? "active",
      notes: data.notes ?? null,
    });

    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.company_name, data.company_name))
      .orderBy(desc(customers.id))
      .limit(1);

    return rows[0];
  }, (error: unknown) => mapDatabaseError("Failed to insert customer", error));

  return run();
}

/**
 * Updates one customer and returns the updated row.
 */
export function updateCustomerById(
  id: number,
  data: {
    company_name?: string;
    email?: string | null;
    phone?: string | null;
    status?: "active" | "inactive";
    notes?: string | null;
  },
): ResultAsync<typeof customers.$inferSelect | undefined, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    if (Object.keys(data).length > 0) {
      await db.update(customers).set(data).where(eq(customers.id, id));
    }

    const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);

    return rows[0];
  }, (error: unknown) => mapDatabaseError("Failed to update customer", error));

  return run();
}

/**
 * Soft deletes one customer by setting the status to inactive.
 */
export function softDeleteCustomerById(
  id: number,
): ResultAsync<void, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.update(customers).set({ status: "inactive" }).where(eq(customers.id, id));
  }, (error: unknown) => mapDatabaseError("Failed to soft delete customer", error));

  return run();
}
