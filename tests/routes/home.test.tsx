/**
 * Tests for Home/Customers Page Route
 *
 * Tests the loader function for the customers list page (now home).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ok, err } from "neverthrow";
import { createLoaderArgs } from "../helpers";
import type { Customer } from "~/schemas";

// Mock the ERP service module
vi.mock("~/services/erp", () => ({
  getCustomers: vi.fn(),
}));

import { loader } from "~/routes/index";
import * as erp from "~/services/erp";

function createMockCustomer(overrides?: Partial<Customer>): Customer {
  const baseCustomer: Customer = {
    id: 1,
    company_name: "Acme Corp",
    email: "info@acme.com",
    phone: null,
    status: "active",
    notes: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  };
  return { ...baseCustomer, ...overrides };
}

describe("Home Route (Customers)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should return all customers when no filters are provided", async () => {
      const mockCustomers: Customer[] = [createMockCustomer()];
      vi.mocked(erp.getCustomers).mockResolvedValue(ok(mockCustomers));

      const request = new Request("http://localhost/home");
      const result = await loader(createLoaderArgs(request));

      expect(result.customers).toEqual(mockCustomers);
      expect(result.error).toBeNull();
      expect(erp.getCustomers).toHaveBeenCalledWith({
        search: undefined,
        status: undefined,
      });
    });

    it("should pass search and status parameters from URL", async () => {
      const mockCustomers: Customer[] = [createMockCustomer()];
      vi.mocked(erp.getCustomers).mockResolvedValue(ok(mockCustomers));

      const request = new Request(
        "http://localhost/home?search=test&status=inactive",
      );
      const result = await loader(createLoaderArgs(request));

      expect(result.customers).toEqual(mockCustomers);
      expect(erp.getCustomers).toHaveBeenCalledWith({
        search: "test",
        status: "inactive",
      });
    });

    it("should return error message when database fetch fails", async () => {
      vi.mocked(erp.getCustomers).mockResolvedValue(
        err({
          type: "DATABASE_ERROR" as const,
          message: "Fetch failed",
        }),
      );

      const request = new Request("http://localhost/home");
      const result = await loader(createLoaderArgs(request));

      expect(result.customers).toEqual([]);
      expect(result.error).toBe("Fetch failed");
    });
  });
});
