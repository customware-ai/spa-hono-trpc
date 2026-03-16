import { expect, test } from "@playwright/test";
import { resetCustomerTable, seedCustomers } from "./database";

/**
 * Keeps backend customer state isolated between browser scenarios.
 */
test.beforeEach(() => {
  resetCustomerTable();
});

test.describe("customers e2e", () => {
  test("shows empty state and navigates to the new-customer form", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "No customers found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Your First Customer" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Create Your First Customer" })
      .click();

    await expect(page).toHaveURL(/\/customers\/new$/);
    await expect(
      page.getByRole("heading", { name: "New Customer" }),
    ).toBeVisible();
  });

  test("creates a customer and persists it across reload", async ({ page }) => {
    await page.goto("/customers/new");

    await page.getByLabel("Company Name *").fill("Acme Logistics");
    await page.getByLabel("Email").fill("ops@acme-logistics.com");
    await page.getByLabel("Phone").fill("+1 (555) 010-1234");
    await page.getByLabel("Notes").fill("High-priority shipping account.");

    await page.getByRole("button", { name: "Create Customer" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Acme Logistics")).toBeVisible();
    await expect(page.getByText("ops@acme-logistics.com")).toBeVisible();
    await expect(page.getByText("+1 (555) 010-1234")).toBeVisible();
    await expect(page.getByText("Active", { exact: true }).first()).toBeVisible();

    await page.reload();

    await expect(page.getByText("Acme Logistics")).toBeVisible();
    await expect(page.getByText("1 of 1 customer(s)")).toBeVisible();
  });

  test("filters seeded customers by search query and status", async ({
    page,
  }) => {
    seedCustomers([
      {
        company_name: "Northwind Traders",
        email: "sales@northwind.example",
        status: "active",
      },
      {
        company_name: "Southridge Retail",
        email: "ops@southridge.example",
        status: "inactive",
      },
    ]);

    await page.goto("/");

    await expect(page.getByText("Northwind Traders")).toBeVisible();
    await expect(page.getByText("Southridge Retail")).toBeVisible();
    await expect(page.getByText("2 of 2 customer(s)")).toBeVisible();

    await page.getByPlaceholder("Filter customers...").fill("northwind");
    await expect(page.getByText("Northwind Traders")).toBeVisible();
    await expect(page.getByText("Southridge Retail")).not.toBeVisible();
    await expect(page.getByText("1 of 2 customer(s)")).toBeVisible();

    await page.getByPlaceholder("Filter customers...").clear();

    await page.locator('[data-slot="select-trigger"]').click();
    await page
      .locator('[data-slot="select-item"]', { hasText: "Inactive" })
      .click();

    await expect(page.getByText("Southridge Retail")).toBeVisible();
    await expect(page.getByText("Northwind Traders")).not.toBeVisible();
    await expect(page.getByText("1 of 2 customer(s)")).toBeVisible();
  });

  test("navigates back to list when cancel is clicked", async ({ page }) => {
    await page.goto("/customers/new");

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Customers", exact: true }),
    ).toBeVisible();
  });

  test("loads customer list with PostHog iframe bootstrap params", async ({
    page,
  }) => {
    await page.goto("/?ph_distinct_id=user-123&ph_session_id=session-456");

    await expect(
      page.getByRole("heading", { name: "No customers found" }),
    ).toBeVisible();
  });
});
