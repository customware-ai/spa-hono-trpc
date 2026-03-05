import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import IndexPage from "../../../app/routes/index";
import type { Customer } from "../../../server/contracts/customer.js";

const listCustomersUseQueryMock = vi.fn();

vi.mock("../../../app/lib/trpc", () => ({
  trpc: {
    listCustomers: {
      useQuery: (...args: unknown[]): unknown => listCustomersUseQueryMock(...args),
    },
  },
}));

/**
 * Builds a customer fixture that matches the shared backend contract.
 */
function createCustomerFixture(
  overrides: Partial<Customer> = {},
): Customer {
  return {
    id: 1,
    company_name: "Globex",
    email: "sales@globex.com",
    phone: "+1 555 0100",
    status: "active",
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("customers index route", () => {
  beforeEach(() => {
    listCustomersUseQueryMock.mockReset();
  });

  it("shows empty state when the backend returns no customers", async () => {
    listCustomersUseQueryMock.mockReturnValue({
      data: [],
      error: null,
      isError: false,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "No customers found" }),
    ).toBeInTheDocument();
  });

  it("renders customers loaded from the backend", async () => {
    listCustomersUseQueryMock.mockReturnValue({
      data: [createCustomerFixture()],
      error: null,
      isError: false,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Globex")).toBeInTheDocument();
    expect(screen.getByText("1 of 1 customer(s)")).toBeInTheDocument();
  });
});
