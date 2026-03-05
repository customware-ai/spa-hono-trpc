import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import NewCustomerPage from "../../../app/routes/customers.new";
import type { Customer } from "../../../server/contracts/customer.js";

const navigateMock = vi.fn();
const createCustomerMutateAsyncMock = vi.fn();
const listCustomersCancelMock = vi.fn();
const listCustomersGetDataMock = vi.fn();
const listCustomersSetDataMock = vi.fn();
const listCustomersInvalidateMock = vi.fn();
const createCustomerUseMutationMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return {
    ...actual,
    useNavigate: (): typeof navigateMock => navigateMock,
  };
});

vi.mock("../../../app/lib/trpc", () => ({
  trpc: {
    createCustomer: {
      useMutation: (...args: unknown[]): unknown =>
        createCustomerUseMutationMock(...args),
    },
    useUtils: (): {
      listCustomers: {
        cancel: typeof listCustomersCancelMock;
        getData: typeof listCustomersGetDataMock;
        setData: typeof listCustomersSetDataMock;
        invalidate: typeof listCustomersInvalidateMock;
      };
    } => ({
      listCustomers: {
        cancel: listCustomersCancelMock,
        getData: listCustomersGetDataMock,
        setData: listCustomersSetDataMock,
        invalidate: listCustomersInvalidateMock,
      },
    }),
  },
}));

/**
 * Creates a persisted customer fixture for successful mutation flows.
 */
function createCustomerFixture(): Customer {
  return {
    id: 1,
    company_name: "Umbrella Corp",
    email: "contact@umbrella.com",
    phone: null,
    status: "active",
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

describe("new customer route", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    createCustomerMutateAsyncMock.mockReset();
    listCustomersCancelMock.mockReset();
    listCustomersGetDataMock.mockReset();
    listCustomersSetDataMock.mockReset();
    listCustomersInvalidateMock.mockReset();
    listCustomersGetDataMock.mockReturnValue([]);

    createCustomerUseMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: createCustomerMutateAsyncMock,
    });
  });

  it("creates a customer through the backend mutation and redirects to list", async () => {
    createCustomerMutateAsyncMock.mockResolvedValue(createCustomerFixture());

    render(
      <MemoryRouter>
        <NewCustomerPage />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByLabelText(/Company Name/i),
      "Umbrella Corp",
    );
    await userEvent.type(
      screen.getByLabelText(/^Email$/i),
      "contact@umbrella.com",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Create Customer" }),
    );

    expect(createCustomerMutateAsyncMock).toHaveBeenCalledWith({
      company_name: "Umbrella Corp",
      email: "contact@umbrella.com",
      notes: undefined,
      phone: undefined,
      status: "active",
    });
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
