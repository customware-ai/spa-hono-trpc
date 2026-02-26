import { expect, test } from "@playwright/test";

test("Playwright smoke test", async ({ page }) => {
  await page.goto("data:text/html,<html><body><h1>Playwright is installed</h1></body></html>");

  await expect(page.getByRole("heading", { name: "Playwright is installed" })).toBeVisible();
});
