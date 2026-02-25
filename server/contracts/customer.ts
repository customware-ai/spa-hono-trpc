import { z } from "zod";

/**
 * Customer status enum used across contracts, services, and queries.
 */
export const CustomerStatusSchema = z.enum(["active", "inactive"]);

/**
 * Runtime contract for a persisted customer row.
 */
export const CustomerSchema = z.object({
  id: z.number().int().positive(),
  company_name: z.string().min(1),
  email: z.string().email().nullable(),
  status: CustomerStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Runtime contract for customer creation input.
 */
export const CreateCustomerInputSchema = z.object({
  company_name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  status: CustomerStatusSchema.optional(),
});

/**
 * Runtime contract for customer list filters.
 */
export const ListCustomersFilterSchema = z.object({
  status: CustomerStatusSchema.optional(),
  search: z.string().min(1).optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerInputSchema>;
export type ListCustomersFilter = z.infer<typeof ListCustomersFilterSchema>;
