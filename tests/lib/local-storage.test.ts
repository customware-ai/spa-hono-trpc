import { beforeEach, describe, expect, it } from "vitest";
import {
  addCustomerToStorage,
  clearCustomersFromStorage,
  getCustomersFromStorage,
} from "../../app/lib/local-storage";

describe("local-storage util", () => {
  beforeEach(() => {
    clearCustomersFromStorage();
  });

  it("adds and reads customers from localStorage", () => {
    const created = addCustomerToStorage({
      company_name: "Acme Corp",
      email: "hello@acme.com",
      status: "active",
    });

    expect(created).not.toBeNull();

    const customers = getCustomersFromStorage();
    expect(customers).toHaveLength(1);
    expect(customers[0].company_name).toBe("Acme Corp");
    expect(customers[0].email).toBe("hello@acme.com");
  });

  it("returns null for invalid customer input", () => {
    const created = addCustomerToStorage({
      company_name: "",
      email: "not-an-email",
    });

    expect(created).toBeNull();
    expect(getCustomersFromStorage()).toHaveLength(0);
  });

  it("returns empty list when storage payload is invalid JSON", () => {
    window.localStorage.setItem("cohesiv_customers", "not-json");

    expect(getCustomersFromStorage()).toEqual([]);
  });
});
