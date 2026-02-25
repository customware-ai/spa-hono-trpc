import { z } from "zod";

/**
 * Storage key used for persisted customer records in the browser.
 */
export const CUSTOMERS_STORAGE_KEY = "cohesiv_customers";

/**
 * Runtime schema for a stored customer row.
 */
export const LocalCustomerSchema = z.object({
  id: z.number().int().positive(),
  company_name: z.string().min(1),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  status: z.enum(["active", "inactive"]),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Runtime schema for creating a customer from form input.
 */
export const CreateLocalCustomerSchema = z.object({
  company_name: z.string().trim().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional(),
});

const LocalCustomerListSchema = z.array(LocalCustomerSchema);

export type LocalCustomer = z.infer<typeof LocalCustomerSchema>;
export type CreateLocalCustomerInput = z.infer<typeof CreateLocalCustomerSchema>;

/**
 * Guards all localStorage operations so route modules remain safe in non-browser contexts.
 */
function isBrowserRuntime(): boolean {
  return typeof window !== "undefined";
}

/**
 * Reads and validates persisted customers from localStorage.
 * Invalid payloads are treated as empty state to keep UI recoverable.
 */
export function getCustomersFromStorage(): LocalCustomer[] {
  if (!isBrowserRuntime()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(CUSTOMERS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsedJson: unknown = JSON.parse(rawValue);
    const validation = LocalCustomerListSchema.safeParse(parsedJson);

    if (!validation.success) {
      return [];
    }

    return validation.data;
  } catch {
    return [];
  }
}

/**
 * Persists customers after validating list shape.
 */
export function setCustomersInStorage(customers: LocalCustomer[]): void {
  if (!isBrowserRuntime()) {
    return;
  }

  const validation = LocalCustomerListSchema.safeParse(customers);
  if (!validation.success) {
    return;
  }

  window.localStorage.setItem(
    CUSTOMERS_STORAGE_KEY,
    JSON.stringify(validation.data),
  );
}

/**
 * Creates and persists a new customer record.
 * Returns null when input does not satisfy runtime contract validation.
 */
export function addCustomerToStorage(input: unknown): LocalCustomer | null {
  const validation = CreateLocalCustomerSchema.safeParse(input);
  if (!validation.success) {
    return null;
  }

  const existingCustomers = getCustomersFromStorage();
  const nextId =
    existingCustomers.reduce((maxId, customer) =>
      customer.id > maxId ? customer.id : maxId,
    0) + 1;

  const now = new Date().toISOString();

  const newCustomer: LocalCustomer = {
    id: nextId,
    company_name: validation.data.company_name,
    email: validation.data.email ?? null,
    phone: validation.data.phone ?? null,
    status: validation.data.status,
    notes: validation.data.notes ?? null,
    created_at: now,
    updated_at: now,
  };

  setCustomersInStorage([newCustomer, ...existingCustomers]);

  return newCustomer;
}

/**
 * Test/helper utility to clear customer storage state.
 */
export function clearCustomersFromStorage(): void {
  if (!isBrowserRuntime()) {
    return;
  }

  window.localStorage.removeItem(CUSTOMERS_STORAGE_KEY);
}
