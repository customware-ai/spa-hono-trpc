import { ResultAsync, errAsync } from "neverthrow";
import {
  CreateCustomerInputSchema,
  CustomerSchema,
  ListCustomersFilterSchema,
  type Customer,
} from "../contracts/customer.js";
import { createCustomerRow, listCustomerRows } from "../db/queries/customers.js";
import type { AppError, ValidationError } from "../types/errors.js";

/**
 * Converts zod issues into a typed validation error payload.
 */
function validationError(message: string, issues: string[]): ValidationError {
  return {
    type: "VALIDATION_ERROR",
    message,
    issues,
  };
}

/**
 * Validates and returns customers for the template example service.
 */
export function listCustomers(
  input: unknown,
): ResultAsync<Customer[], AppError> {
  const filtersResult = ListCustomersFilterSchema.safeParse(input ?? {});
  if (!filtersResult.success) {
    return errAsync(
      validationError(
        "Invalid customer filters",
        filtersResult.error.issues.map((issue) => issue.message),
      ),
    );
  }

  return listCustomerRows(filtersResult.data).andThen((rows) => {
    const run = ResultAsync.fromThrowable(async () => {
      return rows.map((row) => CustomerSchema.parse(row));
    }, () =>
      validationError("Failed to parse customer rows", [
        "Database rows did not match the customer contract.",
      ]),
    );

    return run();
  });
}

/**
 * Validates input and creates a single customer.
 */
export function createCustomer(input: unknown): ResultAsync<Customer, AppError> {
  const createResult = CreateCustomerInputSchema.safeParse(input);
  if (!createResult.success) {
    return errAsync(
      validationError(
        "Invalid customer payload",
        createResult.error.issues.map((issue) => issue.message),
      ),
    );
  }

  return createCustomerRow(createResult.data).andThen((row) => {
    const run = ResultAsync.fromThrowable(async () => {
      return CustomerSchema.parse(row);
    }, () =>
      validationError("Failed to parse created customer", [
        "Database row did not match the customer contract.",
      ]),
    );

    return run();
  });
}
