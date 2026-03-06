import { z } from "zod";
import {
  clearLocalStorageKey,
  useLocalStorage,
} from "../hooks/use-local-storage";

/**
 * Storage key used for persisted customer records in the browser.
 */
export const CUSTOMERS_STORAGE_KEY = "cohesiv_customers";

/**
 * Stable empty-state reference used by the customer wrapper hook.
 * Keeping the default value stable prevents unnecessary effect churn.
 */
const EMPTY_CUSTOMERS: LocalCustomer[] = [];

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
export type CreateLocalCustomerInput = z.infer<
  typeof CreateLocalCustomerSchema
>;

/**
 * Public hook contract for customer persistence.
 */
interface UseCustomersStorageResult {
  customers: LocalCustomer[];
  isHydrated: boolean;
  addCustomer: (input: unknown) => LocalCustomer | null;
  replaceCustomers: (customers: LocalCustomer[]) => void;
  clearCustomers: () => void;
}

/**
 * Test/helper utility to clear customer storage state.
 * The helper removes the key instead of persisting an empty list so tests can
 * verify first-load behavior against a truly empty storage slot.
 */
export function clearCustomersFromStorage(): void {
  clearLocalStorageKey(CUSTOMERS_STORAGE_KEY);
}

/**
 * Customer-specific wrapper around the generic localStorage hook.
 * Business rules stay here while synchronization concerns stay in
 * `useLocalStorage`.
 */
export function useCustomersStorage(): UseCustomersStorageResult {
  const [customers, setCustomers, isHydrated] = useLocalStorage(
    CUSTOMERS_STORAGE_KEY,
    EMPTY_CUSTOMERS,
  );

  /**
   * Persists a validated customer list.
   * Re-validating here keeps callers from bypassing the shared customer schema.
   */
  const replaceCustomers = (nextCustomers: LocalCustomer[]): void => {
    const validation = LocalCustomerListSchema.safeParse(nextCustomers);
    if (!validation.success) {
      return;
    }

    setCustomers(validation.data);
  };

  /**
   * Creates and persists a new customer record.
   * The wrapper uses the generic setter's functional update form so ID
   * generation always sees the latest stored list.
   */
  const addCustomer = (input: unknown): LocalCustomer | null => {
    const validation = CreateLocalCustomerSchema.safeParse(input);
    if (!validation.success) {
      return null;
    }

    let createdCustomer: LocalCustomer | null = null;

    setCustomers((existingCustomers) => {
      const nextId =
        existingCustomers.reduce(
          (maxId, customer) => (customer.id > maxId ? customer.id : maxId),
          0,
        ) + 1;
      const now = new Date().toISOString();

      createdCustomer = {
        id: nextId,
        company_name: validation.data.company_name,
        email: validation.data.email ?? null,
        phone: validation.data.phone ?? null,
        status: validation.data.status,
        notes: validation.data.notes ?? null,
        created_at: now,
        updated_at: now,
      };

      return [createdCustomer, ...existingCustomers];
    });

    return createdCustomer;
  };

  /**
   * Clears the customer storage slot and broadcasts the removal.
   * Consumers use this instead of calling browser APIs directly.
   */
  const clearCustomers = (): void => {
    clearLocalStorageKey(CUSTOMERS_STORAGE_KEY);
  };

  return {
    customers,
    isHydrated,
    addCustomer,
    replaceCustomers,
    clearCustomers,
  };
}
