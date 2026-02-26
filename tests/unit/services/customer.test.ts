import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDatabase } from "../../../server/db/index.js";
import { runMigrations } from "../../../server/db/migrate.js";
import { customers } from "../../../server/db/schemas.js";
import {
  createCustomer,
  listCustomers,
} from "../../../server/services/customer.js";

/**
 * Ensures the template schema exists before service tests execute.
 */
beforeAll(async () => {
  await runMigrations();
});

/**
 * Clears customer rows between test cases for deterministic assertions.
 */
beforeEach(async () => {
  const db = getDatabase();
  await db.delete(customers);
});

describe("customer service example", () => {
  it("creates a customer with default active status", async () => {
    const result = await createCustomer({
      company_name: "Template Co",
      email: "hello@template.co",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) {
      return;
    }

    expect(result.value.company_name).toBe("Template Co");
    expect(result.value.email).toBe("hello@template.co");
    expect(result.value.status).toBe("active");
  });

  it("returns validation error for invalid create payload", async () => {
    const result = await createCustomer({
      company_name: "",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) {
      return;
    }

    expect(result.error.type).toBe("VALIDATION_ERROR");
  });

  it("lists customers with status filter", async () => {
    await createCustomer({
      company_name: "Active Example",
      status: "active",
      email: "active@example.com",
    });
    await createCustomer({
      company_name: "Inactive Example",
      status: "inactive",
      email: "inactive@example.com",
    });

    const activeOnly = await listCustomers({ status: "active" });
    expect(activeOnly.isOk()).toBe(true);

    if (activeOnly.isErr()) {
      return;
    }

    expect(activeOnly.value).toHaveLength(1);
    expect(activeOnly.value[0].company_name).toBe("Active Example");

    const db = getDatabase();
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.status, "inactive"));

    expect(rows).toHaveLength(1);
    expect(rows[0].company_name).toBe("Inactive Example");
  });
});
