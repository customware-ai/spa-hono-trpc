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
  phone: z.string().nullable(),
  status: CustomerStatusSchema,
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Runtime contract for customer creation input.
 */
export const CreateCustomerInputSchema = z.object({
  company_name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(50).optional(),
  status: CustomerStatusSchema.optional(),
  notes: z.string().max(2_000).optional(),
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
