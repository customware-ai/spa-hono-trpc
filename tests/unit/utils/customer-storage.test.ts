import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCustomersFromStorage,
  CUSTOMERS_STORAGE_KEY,
  useCustomersStorage,
} from "../../../app/utils/customer-storage";

describe("useCustomersStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCustomersFromStorage();
  });

  it("adds a validated customer and persists it", async () => {
    const { result } = renderHook(() => useCustomersStorage());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    act(() => {
      result.current.addCustomer({
        company_name: "Acme Corp",
        email: "hello@acme.com",
        status: "active",
      });
    });

    expect(result.current.customers).toHaveLength(1);
    expect(result.current.customers[0]?.company_name).toBe("Acme Corp");

    const storedCustomers = JSON.parse(
      window.localStorage.getItem(CUSTOMERS_STORAGE_KEY) ?? "[]",
    ) as Array<{ company_name: string }>;

    expect(storedCustomers).toHaveLength(1);
    expect(storedCustomers[0]?.company_name).toBe("Acme Corp");
  });

  it("rejects invalid customer input without writing storage", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useCustomersStorage());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    let createdCustomer: ReturnType<typeof result.current.addCustomer> = null;

    act(() => {
      createdCustomer = result.current.addCustomer({
        company_name: "",
        email: "not-an-email",
      });
    });

    expect(createdCustomer).toBeNull();
    expect(result.current.customers).toEqual([]);
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
