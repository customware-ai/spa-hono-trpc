import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import NewCustomerPage from "../../app/routes/customers.new";
import {
  clearCustomersFromStorage,
  getCustomersFromStorage,
} from "../../app/lib/local-storage";

const navigateMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return {
    ...actual,
    useNavigate: (): typeof navigateMock => navigateMock,
  };
});

describe("new customer route", () => {
  beforeEach(() => {
    clearCustomersFromStorage();
    navigateMock.mockReset();
  });

  it("creates customer and redirects to list", async () => {
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

    const customers = getCustomersFromStorage();
    expect(customers).toHaveLength(1);
    expect(customers[0].company_name).toBe("Umbrella Corp");
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
