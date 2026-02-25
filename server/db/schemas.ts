import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Foundational tables used by legacy db.ts CRUD helpers.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Sales and CRM tables used by the ERP service layer.
 */
export const customers = sqliteTable(
  "customers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    company_name: text("company_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    status: text("status").notNull().default("active"),
    notes: text("notes"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_customers_email").on(table.email),
    index("idx_customers_status").on(table.status),
  ],
);

export const contacts = sqliteTable(
  "contacts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customer_id: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    position: text("position"),
    is_primary: integer("is_primary", { mode: "boolean" }).default(false),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_contacts_customer").on(table.customer_id),
    index("idx_contacts_email").on(table.email),
  ],
);

export const leads = sqliteTable(
  "leads",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    company_name: text("company_name").notNull(),
    contact_name: text("contact_name"),
    email: text("email"),
    phone: text("phone"),
    status: text("status").notNull().default("new"),
    source: text("source"),
    estimated_value: real("estimated_value").notNull().default(0),
    probability: integer("probability").notNull().default(0),
    expected_close_date: text("expected_close_date"),
    notes: text("notes"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_leads_status").on(table.status),
    index("idx_leads_email").on(table.email),
  ],
);

export const opportunities = sqliteTable(
  "opportunities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customer_id: integer("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    lead_id: integer("lead_id").references(() => leads.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    description: text("description"),
    stage: text("stage").notNull().default("qualification"),
    estimated_value: real("estimated_value").notNull().default(0),
    probability: integer("probability").notNull().default(0),
    expected_close_date: text("expected_close_date"),
    actual_close_date: text("actual_close_date"),
    notes: text("notes"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_opportunities_customer").on(table.customer_id),
    index("idx_opportunities_stage").on(table.stage),
  ],
);

export const quotes = sqliteTable(
  "quotes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    quote_number: text("quote_number").notNull(),
    customer_id: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    opportunity_id: integer("opportunity_id").references(() => opportunities.id, {
      onDelete: "set null",
    }),
    issue_date: text("issue_date").notNull(),
    expiry_date: text("expiry_date"),
    status: text("status").notNull().default("draft"),
    subtotal: real("subtotal").notNull().default(0),
    tax_rate: real("tax_rate").notNull().default(0),
    tax_amount: real("tax_amount").notNull().default(0),
    discount_amount: real("discount_amount").notNull().default(0),
    total: real("total").notNull().default(0),
    terms: text("terms"),
    notes: text("notes"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_quotes_number").on(table.quote_number),
    index("idx_quotes_customer").on(table.customer_id),
    index("idx_quotes_status").on(table.status),
  ],
);

export const quoteItems = sqliteTable(
  "quote_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    quote_id: integer("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: real("quantity").notNull().default(1),
    unit_price: real("unit_price").notNull().default(0),
    discount_percent: real("discount_percent").notNull().default(0),
    tax_rate: real("tax_rate").notNull().default(0),
    line_total: real("line_total").notNull().default(0),
    sort_order: integer("sort_order").notNull().default(0),
  },
  (table) => [index("idx_quote_items_quote").on(table.quote_id)],
);

export const salesOrders = sqliteTable(
  "sales_orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    order_number: text("order_number").notNull(),
    customer_id: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    quote_id: integer("quote_id").references(() => quotes.id, {
      onDelete: "set null",
    }),
    order_date: text("order_date").notNull(),
    delivery_date: text("delivery_date"),
    status: text("status").notNull().default("pending"),
    subtotal: real("subtotal").notNull().default(0),
    tax_rate: real("tax_rate").notNull().default(0),
    tax_amount: real("tax_amount").notNull().default(0),
    discount_amount: real("discount_amount").notNull().default(0),
    shipping_amount: real("shipping_amount").notNull().default(0),
    total: real("total").notNull().default(0),
    notes: text("notes"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_sales_orders_number").on(table.order_number),
    index("idx_sales_orders_customer").on(table.customer_id),
    index("idx_sales_orders_status").on(table.status),
  ],
);

export const salesOrderItems = sqliteTable(
  "sales_order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    order_id: integer("order_id")
      .notNull()
      .references(() => salesOrders.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: real("quantity").notNull().default(1),
    unit_price: real("unit_price").notNull().default(0),
    discount_percent: real("discount_percent").notNull().default(0),
    tax_rate: real("tax_rate").notNull().default(0),
    line_total: real("line_total").notNull().default(0),
    sort_order: integer("sort_order").notNull().default(0),
  },
  (table) => [index("idx_sales_order_items_order").on(table.order_id)],
);

export const activities = sqliteTable(
  "activities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type").notNull(),
    subject: text("subject").notNull(),
    description: text("description"),
    customer_id: integer("customer_id").references(() => customers.id, {
      onDelete: "cascade",
    }),
    lead_id: integer("lead_id").references(() => leads.id, {
      onDelete: "cascade",
    }),
    opportunity_id: integer("opportunity_id").references(() => opportunities.id, {
      onDelete: "cascade",
    }),
    status: text("status").notNull().default("pending"),
    due_date: text("due_date"),
    completed_at: text("completed_at"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_activities_customer").on(table.customer_id),
    index("idx_activities_lead").on(table.lead_id),
    index("idx_activities_status").on(table.status),
  ],
);
