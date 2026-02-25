/**
 * Typed database failure contract.
 */
export type DatabaseError = {
  type: "DATABASE_ERROR";
  message: string;
  originalError?: Error;
};

/**
 * Typed validation failure contract.
 */
export type ValidationError = {
  type: "VALIDATION_ERROR";
  message: string;
  issues: string[];
};

/**
 * App-level error union used by services and route adapters.
 */
export type AppError = DatabaseError | ValidationError;
