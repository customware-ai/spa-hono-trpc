import { z } from "zod";
import type { SqlValue } from "../db/index.js";

/**
 * Generic API error payload schema.
 */
export const ApiErrorSchema = z.object({
  error: z.string(),
  field: z.string().optional(),
});

/**
 * Generic API success payload schema.
 */
export const ApiSuccessSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
});

/**
 * Shared loader data type used by legacy route/tests.
 */
export interface LoaderData {
  users: SqlValue[][];
  tasks: Record<number, SqlValue[][]>;
  error?: string;
}

export * from "./core.js";
export * from "./sales.js";
