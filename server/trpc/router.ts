import { TRPCError, initTRPC } from "@trpc/server";
import {
  CreateCustomerInputSchema,
  ListCustomersFilterSchema,
} from "../contracts/customer.js";
import { createCustomer, listCustomers } from "../services/customer.js";
import type { AppError } from "../types/errors.js";

const t = initTRPC.create();

/**
 * Maps typed app errors into tRPC errors for transport.
 */
function toTrpcError(error: AppError): TRPCError {
  if (error.type === "VALIDATION_ERROR") {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error.message,
  });
}

/**
 * Minimal template router with one related customer example flow.
 */
export const appRouter = t.router({
  listCustomers: t.procedure
    .input(ListCustomersFilterSchema.optional())
    .query(async ({ input }) => {
      const result = await listCustomers(input ?? {});
      if (result.isErr()) {
        throw toTrpcError(result.error);
      }

      return result.value;
    }),

  createCustomer: t.procedure
    .input(CreateCustomerInputSchema)
    .mutation(async ({ input }) => {
      const result = await createCustomer(input);
      if (result.isErr()) {
        throw toTrpcError(result.error);
      }

      return result.value;
    }),
});

export type AppRouter = typeof appRouter;
