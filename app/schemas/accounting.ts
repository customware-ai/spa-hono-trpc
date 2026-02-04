import { z } from "zod";

// ============================================================
// CHART OF ACCOUNTS SCHEMAS
// ============================================================

/**
 * Schema for a Chart of Accounts entry.
 * Represents a single account in the accounting system's hierarchy.
 *
 * Account Types:
 * - asset: Resources owned by the business (cash, inventory, equipment)
 * - liability: Debts owed by the business (loans, accounts payable)
 * - equity: Owner's stake in the business (capital, retained earnings)
 * - revenue: Income from business operations (sales, services)
 * - expense: Costs of running the business (rent, salaries, supplies)
 */
export const ChartOfAccountsSchema = z.object({
  id: z.number().int().positive(),
  account_code: z.string().min(1, "Account code is required"), // e.g., "1110" for Cash
  account_name: z.string().min(1, "Account name is required"), // e.g., "Cash"
  account_type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parent_id: z.number().int().positive().nullable(), // For hierarchical account structure
  description: z.string().nullable(), // Explanation of what this account tracks
  is_active: z.number().int().min(0).max(1).default(1), // SQLite boolean: 1 = active, 0 = inactive
  created_at: z.string(),
});

/**
 * Schema for creating a new account in the Chart of Accounts.
 */
export const CreateChartOfAccountsSchema = ChartOfAccountsSchema.omit({
  id: true,
  created_at: true,
}).partial({
  parent_id: true,
  description: true,
  is_active: true,
});

export type ChartOfAccounts = z.infer<typeof ChartOfAccountsSchema>;
export type CreateChartOfAccounts = z.infer<typeof CreateChartOfAccountsSchema>;

// ============================================================
// INVOICE SCHEMAS
// ============================================================

/**
 * Schema for an invoice line item.
 * Represents a single product/service billed to a customer.
 */
export const InvoiceItemSchema = z.object({
  id: z.number().int().positive(),
  invoice_id: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive().default(1),
  unit_price: z.number().min(0).default(0),
  discount_percent: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
  line_total: z.number().default(0), // Calculated amount for this line
  account_id: z.number().int().positive().nullable(), // Link to revenue account in Chart of Accounts
  sort_order: z.number().int().default(0), // Display order
});

export const CreateInvoiceItemSchema = InvoiceItemSchema.omit({
  id: true,
  invoice_id: true,
}).partial({
  quantity: true,
  unit_price: true,
  discount_percent: true,
  tax_rate: true,
  line_total: true,
  account_id: true,
  sort_order: true,
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type CreateInvoiceItem = z.infer<typeof CreateInvoiceItemSchema>;

/**
 * Schema for an invoice (bill sent to customer).
 *
 * Status progression:
 * - draft: Being prepared, not sent yet
 * - sent: Sent to customer, awaiting payment
 * - partial: Partially paid
 * - paid: Fully paid
 * - overdue: Past due date, not paid
 * - cancelled: Voided/cancelled
 */
export const InvoiceSchema = z.object({
  id: z.number().int().positive(),
  invoice_number: z.string().min(1, "Invoice number is required"), // e.g., "INV-000001"
  customer_id: z.number().int().positive(),
  sales_order_id: z.number().int().positive().nullable(), // Reference to sales order if applicable
  invoice_date: z.string(), // ISO date string - when invoice was issued
  due_date: z.string(), // ISO date string - when payment is due
  status: z.enum(["draft", "sent", "partial", "paid", "overdue", "cancelled"]).default("draft"),
  subtotal: z.number().min(0).default(0), // Sum of all line items before tax
  tax_rate: z.number().min(0).max(100).default(0), // Tax percentage
  tax_amount: z.number().min(0).default(0), // Calculated tax: subtotal * (tax_rate/100)
  discount_amount: z.number().min(0).default(0), // Total discount applied
  total: z.number().min(0).default(0), // Final amount: subtotal + tax_amount - discount_amount
  amount_paid: z.number().min(0).default(0), // Amount already received
  amount_due: z.number().min(0).default(0), // Remaining balance: total - amount_paid
  terms: z.string().nullable(), // Payment terms and conditions
  notes: z.string().nullable(), // Internal notes
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateInvoiceSchema = InvoiceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  sales_order_id: true,
  status: true,
  subtotal: true,
  tax_rate: true,
  tax_amount: true,
  discount_amount: true,
  total: true,
  amount_paid: true,
  amount_due: true,
  terms: true,
  notes: true,
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

export type Invoice = z.infer<typeof InvoiceSchema>;
export type CreateInvoice = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof UpdateInvoiceSchema>;

// ============================================================
// PAYMENT SCHEMAS
// ============================================================

/**
 * Schema for a payment record.
 * Tracks money received from customers against invoices.
 *
 * Payment Methods:
 * - cash: Cash payment
 * - check: Check/cheque payment
 * - credit_card: Credit or debit card
 * - bank_transfer: Wire transfer, ACH, etc.
 * - other: Other payment methods
 */
export const PaymentSchema = z.object({
  id: z.number().int().positive(),
  payment_number: z.string().min(1, "Payment number is required"), // e.g., "PAY-000001"
  customer_id: z.number().int().positive(),
  invoice_id: z.number().int().positive().nullable(), // Payment can be applied to an invoice
  payment_date: z.string(), // ISO date string - when payment was received
  amount: z.number().positive(), // Payment amount (must be positive)
  payment_method: z.enum(["cash", "check", "credit_card", "bank_transfer", "other"]).nullable(),
  reference_number: z.string().nullable(), // Check number, transaction ID, etc.
  notes: z.string().nullable(), // Additional payment details
  created_at: z.string(),
});

export const CreatePaymentSchema = PaymentSchema.omit({
  id: true,
  created_at: true,
}).partial({
  invoice_id: true,
  payment_method: true,
  reference_number: true,
  notes: true,
});

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

// ============================================================
// JOURNAL ENTRY SCHEMAS
// ============================================================

/**
 * Schema for a journal entry line (debit or credit).
 * Each journal entry must have balanced debits and credits (total debits = total credits).
 *
 * Accounting equation: Assets = Liabilities + Equity
 *
 * Debits increase: Assets, Expenses
 * Credits increase: Liabilities, Equity, Revenue
 */
export const JournalEntryLineSchema = z.object({
  id: z.number().int().positive(),
  journal_entry_id: z.number().int().positive(),
  account_id: z.number().int().positive(), // Reference to Chart of Accounts
  debit: z.number().min(0).default(0), // Debit amount (left side of equation)
  credit: z.number().min(0).default(0), // Credit amount (right side of equation)
  description: z.string().nullable(), // Explanation for this line
});

/**
 * Validates that a line has either debit OR credit, not both or neither.
 */
export const CreateJournalEntryLineSchema = JournalEntryLineSchema.omit({
  id: true,
  journal_entry_id: true,
}).partial({
  debit: true,
  credit: true,
  description: true,
}).refine(
  (data) => {
    // Must have either debit or credit, but not both
    const hasDebit = data.debit !== undefined && data.debit > 0;
    const hasCredit = data.credit !== undefined && data.credit > 0;
    return (hasDebit && !hasCredit) || (!hasDebit && hasCredit);
  },
  {
    message: "Each line must have either a debit or credit amount, but not both",
  }
);

export type JournalEntryLine = z.infer<typeof JournalEntryLineSchema>;
export type CreateJournalEntryLine = z.infer<typeof CreateJournalEntryLineSchema>;

/**
 * Schema for a journal entry header.
 *
 * Entry Types:
 * - general: Regular business transactions
 * - adjusting: End-of-period adjustments
 * - closing: Year-end closing entries
 * - opening: Beginning balance entries
 *
 * Status:
 * - draft: Being prepared, not posted to ledger
 * - posted: Finalized and recorded in general ledger
 * - void: Cancelled/reversed
 */
export const JournalEntrySchema = z.object({
  id: z.number().int().positive(),
  entry_number: z.string().min(1, "Entry number is required"), // e.g., "JE-000001"
  entry_date: z.string(), // ISO date string - transaction date
  entry_type: z.enum(["general", "adjusting", "closing", "opening"]).default("general"),
  description: z.string().nullable(), // What this entry is for
  reference: z.string().nullable(), // Reference to source document (invoice, receipt, etc.)
  status: z.enum(["draft", "posted", "void"]).default("draft"),
  created_at: z.string(),
  posted_at: z.string().nullable(), // When entry was posted to ledger
});

export const CreateJournalEntrySchema = JournalEntrySchema.omit({
  id: true,
  created_at: true,
}).partial({
  entry_type: true,
  description: true,
  reference: true,
  status: true,
  posted_at: true,
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type CreateJournalEntry = z.infer<typeof CreateJournalEntrySchema>;

/**
 * Complete journal entry with lines included.
 * Used when creating/validating a full journal entry.
 */
export const CompleteJournalEntrySchema = CreateJournalEntrySchema.extend({
  lines: z.array(CreateJournalEntryLineSchema).min(2, "Journal entry must have at least 2 lines"),
}).refine(
  (data) => {
    // Validate that total debits equal total credits (balanced entry)
    const totalDebits = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for small floating point errors
  },
  {
    message: "Total debits must equal total credits (entry must be balanced)",
  }
);

export type CompleteJournalEntry = z.infer<typeof CompleteJournalEntrySchema>;

// ============================================================
// LEDGER SCHEMAS
// ============================================================

/**
 * Schema for a ledger entry (transaction in the general ledger).
 * The general ledger is the complete record of all financial transactions.
 *
 * Each ledger entry:
 * - Links to an account in the Chart of Accounts
 * - Has either a debit or credit (not both)
 * - Includes a running balance for the account
 * - References the source transaction (invoice, payment, journal entry, etc.)
 */
export const LedgerSchema = z.object({
  id: z.number().int().positive(),
  account_id: z.number().int().positive(), // Which account this affects
  transaction_date: z.string(), // ISO date string
  transaction_type: z.string(), // Type of transaction (invoice, payment, journal_entry, etc.)
  reference_id: z.number().int().positive().nullable(), // ID of the source record
  reference_type: z.string().nullable(), // Table name of the source record (invoices, payments, etc.)
  debit: z.number().min(0).default(0), // Debit amount
  credit: z.number().min(0).default(0), // Credit amount
  balance: z.number().default(0), // Running balance for this account after this transaction
  description: z.string().nullable(), // Transaction description
  created_at: z.string(),
});

export const CreateLedgerSchema = LedgerSchema.omit({
  id: true,
  created_at: true,
}).partial({
  reference_id: true,
  reference_type: true,
  debit: true,
  credit: true,
  balance: true,
  description: true,
});

export type Ledger = z.infer<typeof LedgerSchema>;
export type CreateLedger = z.infer<typeof CreateLedgerSchema>;

// ============================================================
// BANK ACCOUNT SCHEMAS
// ============================================================

/**
 * Schema for a bank account.
 * Links to a Cash account in the Chart of Accounts.
 *
 * Account Types:
 * - checking: Standard checking account
 * - savings: Savings account
 * - credit_card: Credit card account (liability)
 * - line_of_credit: Line of credit (liability)
 */
export const BankAccountSchema = z.object({
  id: z.number().int().positive(),
  account_id: z.number().int().positive(), // Reference to Chart of Accounts (must be asset or liability)
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().nullable(), // Last 4 digits or masked number
  routing_number: z.string().nullable(), // Bank routing number (for US banks)
  account_type: z.enum(["checking", "savings", "credit_card", "line_of_credit"]).nullable(),
  current_balance: z.number().default(0), // Current account balance
  is_active: z.number().int().min(0).max(1).default(1), // SQLite boolean
  created_at: z.string(),
});

export const CreateBankAccountSchema = BankAccountSchema.omit({
  id: true,
  created_at: true,
}).partial({
  account_number: true,
  routing_number: true,
  account_type: true,
  current_balance: true,
  is_active: true,
});

export type BankAccount = z.infer<typeof BankAccountSchema>;
export type CreateBankAccount = z.infer<typeof CreateBankAccountSchema>;
