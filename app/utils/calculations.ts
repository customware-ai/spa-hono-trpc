/**
 * Utility functions for financial calculations used throughout the ERP system.
 * All calculations use precise decimal arithmetic to avoid floating-point errors.
 */

/**
 * Rounds a number to 2 decimal places (standard for currency).
 * Uses toFixed to avoid floating-point precision issues.
 *
 * @param value - The number to round
 * @returns The rounded value
 *
 * @example
 * roundCurrency(10.456) // Returns 10.46
 * roundCurrency(10.454) // Returns 10.45
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates the line total for a single item on an invoice, quote, or order.
 *
 * Formula: (quantity × unit_price) × (1 - discount_percent/100) × (1 + tax_rate/100)
 *
 * @param quantity - Number of units
 * @param unitPrice - Price per unit
 * @param discountPercent - Discount percentage (0-100)
 * @param taxRate - Tax rate percentage (0-100)
 * @returns The calculated line total
 *
 * @example
 * calculateLineTotal(5, 100, 10, 8.5)
 * // 5 × $100 = $500
 * // $500 - 10% discount = $450
 * // $450 + 8.5% tax = $488.25
 */
export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0,
  taxRate: number = 0
): number {
  const subtotal = quantity * unitPrice;
  const afterDiscount = subtotal * (1 - discountPercent / 100);
  const withTax = afterDiscount * (1 + taxRate / 100);
  return roundCurrency(withTax);
}

/**
 * Calculates document totals (invoice, quote, or sales order).
 *
 * Calculation flow:
 * 1. Sum all line item subtotals
 * 2. Subtract document-level discount
 * 3. Add tax on the discounted amount
 * 4. Add shipping (for orders)
 *
 * @param items - Array of line items with { quantity, unit_price, discount_percent }
 * @param documentDiscount - Document-level discount amount (not percentage)
 * @param taxRate - Tax rate percentage to apply to subtotal
 * @param shippingAmount - Shipping cost (optional, for orders)
 * @returns Object with subtotal, tax_amount, discount_amount, and total
 *
 * @example
 * const items = [
 *   { quantity: 2, unit_price: 50, discount_percent: 0 },
 *   { quantity: 1, unit_price: 100, discount_percent: 10 }
 * ];
 * calculateDocumentTotals(items, 0, 8.5, 15)
 * // Subtotal: (2×$50) + (1×$100×0.9) = $190
 * // Tax: $190 × 8.5% = $16.15
 * // Total: $190 + $16.15 + $15 = $221.15
 */
export function calculateDocumentTotals(
  items: Array<{ quantity: number; unit_price: number; discount_percent?: number }>,
  documentDiscount: number = 0,
  taxRate: number = 0,
  shippingAmount: number = 0
): {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
} {
  // Calculate subtotal from all line items
  const subtotal = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unit_price;
    const itemDiscount = itemSubtotal * ((item.discount_percent || 0) / 100);
    return sum + (itemSubtotal - itemDiscount);
  }, 0);

  // Apply document-level discount
  const afterDiscount = subtotal - documentDiscount;

  // Calculate tax on discounted amount
  const taxAmount = afterDiscount * (taxRate / 100);

  // Calculate final total
  const total = afterDiscount + taxAmount + shippingAmount;

  return {
    subtotal: roundCurrency(subtotal),
    tax_amount: roundCurrency(taxAmount),
    discount_amount: roundCurrency(documentDiscount),
    total: roundCurrency(total),
  };
}

/**
 * Calculates the amount due on an invoice after payments.
 *
 * @param total - Invoice total amount
 * @param amountPaid - Total amount already paid
 * @returns The remaining amount due
 *
 * @example
 * calculateAmountDue(1000, 400) // Returns 600
 * calculateAmountDue(1000, 1000) // Returns 0 (fully paid)
 */
export function calculateAmountDue(total: number, amountPaid: number): number {
  return roundCurrency(Math.max(0, total - amountPaid));
}

/**
 * Determines invoice status based on payment and due date.
 *
 * Status logic:
 * - paid: amount_due = 0
 * - partial: 0 < amount_due < total
 * - overdue: amount_due > 0 AND past due_date
 * - sent: amount_due = total AND not past due_date
 * - draft: not sent yet (must be set manually)
 *
 * @param total - Invoice total
 * @param amountPaid - Amount already paid
 * @param dueDate - Due date (ISO string)
 * @param currentStatus - Current invoice status
 * @returns The calculated status
 *
 * @example
 * calculateInvoiceStatus(1000, 1000, '2024-01-01', 'sent') // Returns 'paid'
 * calculateInvoiceStatus(1000, 500, '2024-01-01', 'sent') // Returns 'partial'
 * calculateInvoiceStatus(1000, 0, '2023-01-01', 'sent') // Returns 'overdue' (if past date)
 */
export function calculateInvoiceStatus(
  total: number,
  amountPaid: number,
  dueDate: string,
  currentStatus: string
): "draft" | "sent" | "partial" | "paid" | "overdue" | "cancelled" {
  // Don't change draft or cancelled statuses
  if (currentStatus === "draft" || currentStatus === "cancelled") {
    return currentStatus as "draft" | "cancelled";
  }

  const amountDue = calculateAmountDue(total, amountPaid);

  // Fully paid
  if (amountDue === 0) {
    return "paid";
  }

  // Partially paid
  if (amountDue > 0 && amountPaid > 0) {
    return "partial";
  }

  // Check if overdue
  const now = new Date();
  const due = new Date(dueDate);
  if (due < now && amountDue > 0) {
    return "overdue";
  }

  // Default to sent if not paid and not overdue
  return "sent";
}

/**
 * Generates the next document number in a sequence.
 *
 * Format: PREFIX-NNNNNN (e.g., INV-000123, QT-000045)
 *
 * @param prefix - Document prefix (e.g., "INV", "QT", "SO")
 * @param lastNumber - The last number used in the sequence
 * @returns The next document number
 *
 * @example
 * generateDocumentNumber("INV", "INV-000122") // Returns "INV-000123"
 * generateDocumentNumber("QT", null) // Returns "QT-000001" (first number)
 */
export function generateDocumentNumber(prefix: string, lastNumber: string | null): string {
  if (!lastNumber) {
    return `${prefix}-000001`;
  }

  // Extract number from last document number
  const match = lastNumber.match(/(\d+)$/);
  if (!match) {
    return `${prefix}-000001`;
  }

  const nextNum = parseInt(match[1], 10) + 1;
  return `${prefix}-${nextNum.toString().padStart(6, "0")}`;
}

/**
 * Validates that a journal entry is balanced (debits = credits).
 * Required for double-entry bookkeeping.
 *
 * @param lines - Array of journal entry lines with debit and credit amounts
 * @returns True if balanced (within 0.01 tolerance for rounding), false otherwise
 *
 * @example
 * validateJournalEntryBalance([
 *   { debit: 100, credit: 0 },
 *   { debit: 0, credit: 100 }
 * ]) // Returns true
 *
 * validateJournalEntryBalance([
 *   { debit: 100, credit: 0 },
 *   { debit: 0, credit: 50 }
 * ]) // Returns false (not balanced)
 */
export function validateJournalEntryBalance(
  lines: Array<{ debit: number; credit: number }>
): boolean {
  const totalDebits = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredits = lines.reduce((sum, line) => sum + line.credit, 0);

  // Allow small floating-point tolerance
  return Math.abs(totalDebits - totalCredits) < 0.01;
}

/**
 * Calculates running balance for a ledger account.
 *
 * Accounting equation rules:
 * - Asset/Expense accounts: Debit increases, Credit decreases
 * - Liability/Equity/Revenue accounts: Credit increases, Debit decreases
 *
 * @param currentBalance - Current account balance
 * @param debit - Debit amount for this transaction
 * @param credit - Credit amount for this transaction
 * @param accountType - Type of account (asset, liability, equity, revenue, expense)
 * @returns The new balance after applying the transaction
 *
 * @example
 * // Asset account (Cash): Receiving $100
 * calculateLedgerBalance(500, 100, 0, 'asset') // Returns 600
 *
 * // Revenue account: Recording $100 sale
 * calculateLedgerBalance(1000, 0, 100, 'revenue') // Returns 1100
 */
export function calculateLedgerBalance(
  currentBalance: number,
  debit: number,
  credit: number,
  accountType: "asset" | "liability" | "equity" | "revenue" | "expense"
): number {
  let newBalance = currentBalance;

  // Debit increases: Assets, Expenses
  // Credit increases: Liabilities, Equity, Revenue
  if (accountType === "asset" || accountType === "expense") {
    newBalance += debit - credit;
  } else {
    newBalance += credit - debit;
  }

  return roundCurrency(newBalance);
}
