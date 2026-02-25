import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Template example table used by the server contract/service/query flow.
 */
export const customers = sqliteTable(
  "customers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    company_name: text("company_name").notNull(),
    email: text("email"),
    status: text("status").notNull().default("active"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_customers_status").on(table.status),
    index("idx_customers_email").on(table.email),
  ],
);
