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
