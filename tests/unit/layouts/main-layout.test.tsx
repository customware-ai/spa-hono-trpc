import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import MainLayout from "../../../app/layouts/MainLayout";

/**
 * Builds a memory router around the shared customer layout.
 */
function createLayoutRouter(initialEntries: string[]): ReturnType<typeof createMemoryRouter> {
  return createMemoryRouter(
    [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <div>List body</div> },
          { path: "customers/new", element: <div>New body</div> },
        ],
      },
    ],
    { initialEntries },
  );
}

describe("main layout", () => {
  it("renders customers page header content for root route", () => {
    const router = createLayoutRouter(["/"]);
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { name: "Customers" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Manage customer records stored in your browser."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Customer" })).toBeInTheDocument();
    expect(screen.getByText("List body")).toBeInTheDocument();
  });

  it("navigates to customer creation route from shared header action", async () => {
    const router = createLayoutRouter(["/"]);
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole("button", { name: "New Customer" }));

    expect(
      await screen.findByRole("heading", { name: "New Customer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Create a new customer record in local storage."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New Customer" })).toBeNull();
    expect(screen.getByText("New body")).toBeInTheDocument();
  });
});
