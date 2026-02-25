import { and, asc, eq, like, or, type SQL } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import type { CreateCustomerInput, ListCustomersFilter } from "../../contracts/customer.js";
import type { DatabaseError } from "../../types/errors.js";
import { getDatabase } from "../index.js";
import { customers } from "../schemas.js";

/**
 * Maps unknown errors to a typed database error contract.
 */
function mapDatabaseError(message: string, error: unknown): DatabaseError {
  return {
    type: "DATABASE_ERROR",
    message,
    originalError: error instanceof Error ? error : undefined,
  };
}

/**
 * Reads customers with optional status and text search filters.
 */
export function listCustomerRows(
  filters: ListCustomersFilter,
): ResultAsync<(typeof customers.$inferSelect)[], DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();
    const predicates: SQL[] = [];

    if (filters.status) {
      predicates.push(eq(customers.status, filters.status));
    }

    if (filters.search) {
      const pattern = `%${filters.search}%`;
      const searchPredicate = or(
        like(customers.company_name, pattern),
        like(customers.email, pattern),
      );

      if (searchPredicate) {
        predicates.push(searchPredicate);
      }
    }

    if (predicates.length === 0) {
      return db.select().from(customers).orderBy(asc(customers.company_name));
    }

    const whereClause =
      predicates.length === 1 ? predicates[0] : and(...predicates);

    return db
      .select()
      .from(customers)
      .where(whereClause)
      .orderBy(asc(customers.company_name));
  }, (error: unknown) => mapDatabaseError("Failed to list customers", error));

  return run();
}

/**
 * Inserts a customer and returns the created row.
 */
export function createCustomerRow(
  input: CreateCustomerInput,
): ResultAsync<typeof customers.$inferSelect, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();
    const createdRows = await db
      .insert(customers)
      .values({
        company_name: input.company_name,
        email: input.email ?? null,
        status: input.status ?? "active",
      })
      .returning();

    const created = createdRows[0];
    if (!created) {
      throw new Error("Customer insert returned no rows");
    }

    return created;
  }, (error: unknown) => mapDatabaseError("Failed to create customer", error));

  return run();
}
