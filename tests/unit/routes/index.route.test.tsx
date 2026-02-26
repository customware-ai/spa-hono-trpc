import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import IndexPage from "../../../app/routes/index";
import {
  clearCustomersFromStorage,
  setCustomersInStorage,
} from "../../../app/lib/local-storage";

describe("customers index route", () => {
  beforeEach(() => {
    clearCustomersFromStorage();
  });

  it("shows empty state when no customers exist", async () => {
    render(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "No customers found" }),
    ).toBeInTheDocument();
  });

  it("renders customers loaded from localStorage", async () => {
    setCustomersInStorage([
      {
        id: 1,
        company_name: "Globex",
        email: "sales@globex.com",
        phone: "+1 555 0100",
        status: "active",
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    render(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Globex")).toBeInTheDocument();
    expect(screen.getByText("1 of 1 customer(s)")).toBeInTheDocument();
  });
});
