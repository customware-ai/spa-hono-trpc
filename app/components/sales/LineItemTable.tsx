/**
 * Line Item Table Component
 *
 * Reusable table for line items on quotes, orders, and invoices.
 * Features:
 * - Add/remove line items
 * - Calculate line totals automatically
 * - Display subtotal, tax, and total
 */

import type { ReactElement } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  tax_rate?: number;
  line_total: number;
}

interface LineItemTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  readonly?: boolean;
}

export function LineItemTable({
  items,
  onChange,
  readonly = false,
}: LineItemTableProps): ReactElement {
  const handleAddItem = (): void => {
    onChange([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        discount_percent: 0,
        tax_rate: 0,
        line_total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number): void => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number): void => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate line total
    const item = newItems[index];
    const subtotal = item.quantity * item.unit_price;
    const afterDiscount = subtotal * (1 - (item.discount_percent || 0) / 100);
    const withTax = afterDiscount * (1 + (item.tax_rate || 0) / 100);
    newItems[index].line_total = withTax;

    onChange(newItems);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const totalDiscount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price * ((item.discount_percent || 0) / 100),
    0
  );
  const totalTax = items.reduce(
    (sum, item) =>
      sum +
      (item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100) *
        (item.tax_rate || 0)) /
        100,
    0
  );
  const total = subtotal - totalDiscount + totalTax;

  return (
    <div className="space-y-4">
      {/* Line Items Table */}
      <div className="border border-surface-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase w-24">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase w-32">
                Unit Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase w-24">
                Discount %
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase w-24">
                Tax %
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-surface-600 uppercase w-32">
                Total
              </th>
              {!readonly && <th className="w-12"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {items.map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td className="px-4 py-3">
                  {readonly ? (
                    <span className="text-surface-900">{item.description}</span>
                  ) : (
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {readonly ? (
                    <span className="text-surface-900">{item.quantity}</span>
                  ) : (
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="1"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {readonly ? (
                    <span className="text-surface-900">${item.unit_price.toFixed(2)}</span>
                  ) : (
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {readonly ? (
                    <span className="text-surface-900">{item.discount_percent || 0}%</span>
                  ) : (
                    <Input
                      type="number"
                      value={item.discount_percent || 0}
                      onChange={(e) => handleItemChange(index, "discount_percent", parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {readonly ? (
                    <span className="text-surface-900">{item.tax_rate || 0}%</span>
                  ) : (
                    <Input
                      type="number"
                      value={item.tax_rate || 0}
                      onChange={(e) => handleItemChange(index, "tax_rate", parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-surface-900">
                  ${item.line_total.toFixed(2)}
                </td>
                {!readonly && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Button */}
      {!readonly && (
        <Button variant="outline" type="button" onClick={handleAddItem}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Line Item
        </Button>
      )}

      {/* Totals */}
      <div className="border border-surface-200 rounded-lg p-4 bg-surface-50">
        <div className="space-y-2 max-w-md ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-surface-600">Subtotal:</span>
            <span className="font-semibold text-surface-900">${subtotal.toFixed(2)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-surface-600">Discount:</span>
              <span className="font-semibold text-red-600">-${totalDiscount.toFixed(2)}</span>
            </div>
          )}
          {totalTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-surface-600">Tax:</span>
              <span className="font-semibold text-surface-900">${totalTax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg pt-2 border-t border-surface-300">
            <span className="font-bold text-surface-900">Total:</span>
            <span className="font-bold text-primary-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
