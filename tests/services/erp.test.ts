/**
 * Integration tests for ERP customer service functions backed by Drizzle ORM.
 */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDatabase } from "../../server/db/index.js";
import { customers } from "../../server/db/schemas.js";
import { runMigrations } from "../../server/db/migrate.js";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../../server/services/erp.js";

/**
 * Ensures schema exists before integration tests execute.
 */
beforeAll(async () => {
  await runMigrations();
});

/**
 * Removes customers before each test to keep deterministic assertions.
 */
beforeEach(async () => {
  const db = getDatabase();
  await db.delete(customers);
});

describe("ERP Service - Customer Operations", () => {
  it("creates a customer with required fields", async () => {
    const result = await createCustomer({
      company_name: "Acme Corp",
      email: "info@acme.com",
    });

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      return;
    }

    expect(result.value.company_name).toBe("Acme Corp");
    expect(result.value.email).toBe("info@acme.com");
    expect(result.value.status).toBe("active");
  });

  it("returns customers with status and search filters", async () => {
    await createCustomer({
      company_name: "Active Customer",
      email: "active-only@alpha.com",
      status: "active",
    });
    await createCustomer({
      company_name: "Inactive Customer",
      email: "inactive-only@beta.com",
      status: "inactive",
    });

    const activeOnly = await getCustomers({ status: "active" });
    const searchOnly = await getCustomers({ search: "active-only@alpha.com" });

    expect(activeOnly.isOk()).toBe(true);
    expect(searchOnly.isOk()).toBe(true);

    if (activeOnly.isErr() || searchOnly.isErr()) {
      return;
    }

    expect(activeOnly.value).toHaveLength(1);
    expect(activeOnly.value[0].company_name).toBe("Active Customer");
    expect(searchOnly.value).toHaveLength(1);
  });

  it("updates customer fields", async () => {
    const created = await createCustomer({
      company_name: "Before Update",
      email: "before@example.com",
    });

    expect(created.isOk()).toBe(true);
    if (created.isErr()) {
      return;
    }

    const updated = await updateCustomer(created.value.id, {
      company_name: "After Update",
      phone: "555-1234",
    });

    expect(updated.isOk()).toBe(true);
    if (updated.isErr()) {
      return;
    }

    expect(updated.value.company_name).toBe("After Update");
    expect(updated.value.phone).toBe("555-1234");
  });

  it("soft-deletes customers by setting status to inactive", async () => {
    const created = await createCustomer({
      company_name: "To Delete",
      email: "delete@example.com",
    });

    expect(created.isOk()).toBe(true);
    if (created.isErr()) {
      return;
    }

    const deleted = await deleteCustomer(created.value.id);
    expect(deleted.isOk()).toBe(true);

    const fetched = await getCustomerById(created.value.id);
    expect(fetched.isOk()).toBe(true);

    if (fetched.isErr() || !fetched.value) {
      return;
    }

    expect(fetched.value.status).toBe("inactive");
  });

  it("returns null for missing customer id", async () => {
    const result = await getCustomerById(99999);

    expect(result.isOk()).toBe(true);
    if (result.isErr()) {
      return;
    }

    expect(result.value).toBeNull();
  });

  it("writes rows to the underlying customers table", async () => {
    const created = await createCustomer({
      company_name: "Table Assert",
      email: "table@example.com",
    });

    expect(created.isOk()).toBe(true);

    const db = getDatabase();
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.company_name, "Table Assert"));

    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("table@example.com");
  });
});
