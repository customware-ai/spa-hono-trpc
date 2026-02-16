import { z } from "zod";

// ============================================================
// CUSTOMER SCHEMAS
// ============================================================

/**
 * Schema for a complete customer record from the database.
 * Simplified schema with essential fields only.
 */
export const CustomerSchema = z.object({
  id: z.number().int().positive(),
  company_name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email format").nullable(),
  phone: z.string().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Schema for creating a new customer.
 * Excludes auto-generated fields (id, timestamps).
 */
export const CreateCustomerSchema = CustomerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  email: true,
  phone: true,
  status: true,
  notes: true,
});

/**
 * Schema for updating an existing customer.
 * All fields are optional to support partial updates.
 */
export const UpdateCustomerSchema = CreateCustomerSchema.partial();

// TypeScript types derived from schemas
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;

// ============================================================
// CONTACT SCHEMAS
// ============================================================

/**
 * Schema for a contact record (multiple contacts per customer).
 */
export const ContactSchema = z.object({
  id: z.number().int().positive(),
  customer_id: z.number().int().positive(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format").nullable(),
  phone: z.string().nullable(),
  position: z.string().nullable(), // Job title/role
  is_primary: z.number().int().min(0).max(1).default(0), // SQLite boolean (0 or 1)
  created_at: z.string(),
});

export const CreateContactSchema = ContactSchema.omit({
  id: true,
  created_at: true,
}).partial({
  email: true,
  phone: true,
  position: true,
  is_primary: true,
});

export type Contact = z.infer<typeof ContactSchema>;
export type CreateContact = z.infer<typeof CreateContactSchema>;

// ============================================================
// LEAD SCHEMAS
// ============================================================

/**
 * Schema for a lead (prospective customer).
 * Status represents the stage in the sales pipeline.
 */
export const LeadSchema = z.object({
  id: z.number().int().positive(),
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().nullable(),
  email: z.string().email("Invalid email format").nullable(),
  phone: z.string().nullable(),
  status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).default("new"),
  source: z.string().nullable(), // How the lead was acquired (website, referral, etc.)
  estimated_value: z.number().min(0).default(0), // Potential deal value
  probability: z.number().int().min(0).max(100).default(0), // Likelihood of closing (0-100%)
  expected_close_date: z.string().nullable(), // ISO date string
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  contact_name: true,
  email: true,
  phone: true,
  status: true,
  source: true,
  estimated_value: true,
  probability: true,
  expected_close_date: true,
  notes: true,
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

export type Lead = z.infer<typeof LeadSchema>;
export type CreateLead = z.infer<typeof CreateLeadSchema>;
export type UpdateLead = z.infer<typeof UpdateLeadSchema>;

// ============================================================
// OPPORTUNITY SCHEMAS
// ============================================================

/**
 * Schema for a sales opportunity.
 * Can be linked to a customer (existing) or lead (prospective).
 */
export const OpportunitySchema = z.object({
  id: z.number().int().positive(),
  customer_id: z.number().int().positive().nullable(),
  lead_id: z.number().int().positive().nullable(),
  name: z.string().min(1, "Opportunity name is required"),
  description: z.string().nullable(),
  stage: z.enum([
    "qualification",
    "needs_analysis",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
  ]).default("qualification"),
  estimated_value: z.number().min(0).default(0),
  probability: z.number().int().min(0).max(100).default(0),
  expected_close_date: z.string().nullable(),
  actual_close_date: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateOpportunitySchema = OpportunitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  customer_id: true,
  lead_id: true,
  description: true,
  stage: true,
  estimated_value: true,
  probability: true,
  expected_close_date: true,
  actual_close_date: true,
  notes: true,
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export type CreateOpportunity = z.infer<typeof CreateOpportunitySchema>;

// ============================================================
// QUOTE SCHEMAS
// ============================================================

/**
 * Schema for a quote line item.
 * Represents a single product/service on a quote.
 */
export const QuoteItemSchema = z.object({
  id: z.number().int().positive(),
  quote_id: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive().default(1),
  unit_price: z.number().min(0).default(0),
  discount_percent: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
  line_total: z.number().default(0), // Calculated: (quantity * unit_price) * (1 - discount_percent/100) * (1 + tax_rate/100)
  sort_order: z.number().int().default(0), // Display order of line items
});

export const CreateQuoteItemSchema = QuoteItemSchema.omit({
  id: true,
  quote_id: true,
}).partial({
  quantity: true,
  unit_price: true,
  discount_percent: true,
  tax_rate: true,
  line_total: true,
  sort_order: true,
});

export type QuoteItem = z.infer<typeof QuoteItemSchema>;
export type CreateQuoteItem = z.infer<typeof CreateQuoteItemSchema>;

/**
 * Schema for a quote document.
 * Includes document totals and status tracking.
 */
export const QuoteSchema = z.object({
  id: z.number().int().positive(),
  quote_number: z.string().min(1, "Quote number is required"), // e.g., "QT-000001"
  customer_id: z.number().int().positive(),
  opportunity_id: z.number().int().positive().nullable(),
  issue_date: z.string(), // ISO date string
  expiry_date: z.string().nullable(), // ISO date string
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).default("draft"),
  subtotal: z.number().min(0).default(0), // Sum of all line totals before tax
  tax_rate: z.number().min(0).max(100).default(0), // Overall tax rate percentage
  tax_amount: z.number().min(0).default(0), // Calculated: subtotal * (tax_rate/100)
  discount_amount: z.number().min(0).default(0), // Total discount applied
  total: z.number().min(0).default(0), // Final total: subtotal + tax_amount - discount_amount
  terms: z.string().nullable(), // Terms and conditions
  notes: z.string().nullable(), // Internal notes
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateQuoteSchema = QuoteSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  opportunity_id: true,
  expiry_date: true,
  status: true,
  subtotal: true,
  tax_rate: true,
  tax_amount: true,
  discount_amount: true,
  total: true,
  terms: true,
  notes: true,
});

export type Quote = z.infer<typeof QuoteSchema>;
export type CreateQuote = z.infer<typeof CreateQuoteSchema>;

// ============================================================
// SALES ORDER SCHEMAS
// ============================================================

/**
 * Schema for a sales order line item.
 * Similar structure to quote items but for confirmed orders.
 */
export const SalesOrderItemSchema = z.object({
  id: z.number().int().positive(),
  order_id: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive().default(1),
  unit_price: z.number().min(0).default(0),
  discount_percent: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
  line_total: z.number().default(0),
  sort_order: z.number().int().default(0),
});

export const CreateSalesOrderItemSchema = SalesOrderItemSchema.omit({
  id: true,
  order_id: true,
}).partial({
  quantity: true,
  unit_price: true,
  discount_percent: true,
  tax_rate: true,
  line_total: true,
  sort_order: true,
});

export type SalesOrderItem = z.infer<typeof SalesOrderItemSchema>;
export type CreateSalesOrderItem = z.infer<typeof CreateSalesOrderItemSchema>;

/**
 * Schema for a sales order (confirmed order from customer).
 * Tracks order fulfillment through various statuses.
 */
export const SalesOrderSchema = z.object({
  id: z.number().int().positive(),
  order_number: z.string().min(1, "Order number is required"), // e.g., "SO-000001"
  customer_id: z.number().int().positive(),
  quote_id: z.number().int().positive().nullable(), // Reference to quote if order was created from quote
  order_date: z.string(), // ISO date string
  delivery_date: z.string().nullable(), // Expected delivery date
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]).default("pending"),
  subtotal: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
  tax_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  shipping_amount: z.number().min(0).default(0), // Shipping/delivery cost
  total: z.number().min(0).default(0), // subtotal + tax_amount + shipping_amount - discount_amount
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSalesOrderSchema = SalesOrderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  quote_id: true,
  delivery_date: true,
  status: true,
  subtotal: true,
  tax_rate: true,
  tax_amount: true,
  discount_amount: true,
  shipping_amount: true,
  total: true,
  notes: true,
});

export type SalesOrder = z.infer<typeof SalesOrderSchema>;
export type CreateSalesOrder = z.infer<typeof CreateSalesOrderSchema>;

// ============================================================
// ACTIVITY SCHEMAS
// ============================================================

/**
 * Schema for CRM activities (calls, meetings, tasks, etc.).
 * Can be linked to customers, leads, or opportunities for tracking.
 */
export const ActivitySchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(["call", "meeting", "email", "task", "note"]),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().nullable(),
  customer_id: z.number().int().positive().nullable(),
  lead_id: z.number().int().positive().nullable(),
  opportunity_id: z.number().int().positive().nullable(),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
  due_date: z.string().nullable(), // ISO date string
  completed_at: z.string().nullable(), // ISO date string
  created_at: z.string(),
});

export const CreateActivitySchema = ActivitySchema.omit({
  id: true,
  created_at: true,
}).partial({
  description: true,
  customer_id: true,
  lead_id: true,
  opportunity_id: true,
  status: true,
  due_date: true,
  completed_at: true,
});

export type Activity = z.infer<typeof ActivitySchema>;
export type CreateActivity = z.infer<typeof CreateActivitySchema>;
