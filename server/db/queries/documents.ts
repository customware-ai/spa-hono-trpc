import { desc } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import type { DatabaseError } from "../../types/errors.js";
import { getDatabase } from "../index.js";
import { quotes, salesOrders } from "../schemas.js";

/**
 * Supported document lookup targets for document number generation.
 */
export type DocumentLookupTarget =
  | { tableName: "quotes"; columnName: "quote_number" }
  | { tableName: "sales_orders"; columnName: "order_number" };

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
 * Returns the latest document number for the requested table/column target.
 */
export function selectLatestDocumentNumber(
  target: DocumentLookupTarget,
): ResultAsync<string | null, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    if (target.tableName === "quotes" && target.columnName === "quote_number") {
      const rows = await db
        .select({ value: quotes.quote_number })
        .from(quotes)
        .orderBy(desc(quotes.id))
        .limit(1);
      return rows[0]?.value ?? null;
    }

    const rows = await db
      .select({ value: salesOrders.order_number })
      .from(salesOrders)
      .orderBy(desc(salesOrders.id))
      .limit(1);

    return rows[0]?.value ?? null;
  }, (error: unknown) => mapDatabaseError("Failed to select latest document number", error));

  return run();
}
