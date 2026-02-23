/**
 * tRPC Application Router
 * 
 * This file defines all tRPC procedures (API endpoints) for the application.
 * It wraps the existing ERP service layer with type-safe tRPC procedures.
 * 
 * Patterns:
 * - All procedures use Zod schemas for input validation
 * - Service layer returns Result<T, Error> - convert to tRPC errors
 * - Maintain existing business logic from services/erp.ts
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, procedure } from "./index.js";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDemoLeads,
  getDemoQuotes,
} from "../services/erp.js";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
} from "../schemas/sales.js";

/**
 * Main application router with all API procedures
 */
export const appRouter = router({
  // ============================================================
  // CUSTOMER PROCEDURES
  // ============================================================

  /**
   * Get all customers with optional filters
   */
  getCustomers: procedure
    .input(
      z
        .object({
          status: z.enum(["active", "inactive"]).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const result = await getCustomers(input);

      if (result.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.message,
        });
      }

      return result.value;
    }),

  /**
   * Get a single customer by ID
   */
  getCustomer: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await getCustomerById(input.id);

      if (result.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.message,
        });
      }

      if (!result.value) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      return result.value;
    }),

  /**
   * Create a new customer
   */
  createCustomer: procedure
    .input(CreateCustomerSchema)
    .mutation(async ({ input }) => {
      const result = await createCustomer(input);

      if (result.isErr()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error.message,
        });
      }

      return result.value;
    }),

  /**
   * Update an existing customer
   */
  updateCustomer: procedure
    .input(
      z.object({
        id: z.number(),
        data: UpdateCustomerSchema,
      })
    )
    .mutation(async ({ input }) => {
      const result = await updateCustomer(input.id, input.data);

      if (result.isErr()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error.message,
        });
      }

      return result.value;
    }),

  /**
   * Delete a customer (soft delete - sets status to inactive)
   */
  deleteCustomer: procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const result = await deleteCustomer(input.id);

      if (result.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.message,
        });
      }

      return { success: true };
    }),

  // ============================================================
  // DEMO DATA PROCEDURES
  // ============================================================

  /**
   * Get demo leads data
   */
  getDemoLeads: procedure.query(async () => {
    return await getDemoLeads();
  }),

  /**
   * Get demo quotes data
   */
  getDemoQuotes: procedure.query(async () => {
    return await getDemoQuotes();
  }),
});

/**
 * Export the router type for client-side type inference
 */
export type AppRouter = typeof appRouter;
