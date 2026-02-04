/**
 * Customer Card Component
 *
 * Displays customer information in a card format.
 * Used in dashboards, lists, and summary views.
 */

import type { ReactElement } from "react";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";
import type { Customer } from "../../schemas";

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
  showStats?: boolean;
}

export function CustomerCard({
  customer,
  onClick,
  showStats = false,
}: CustomerCardProps): ReactElement {
  return (
    <Card
      className={`${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-surface-900 mb-1">{customer.company_name}</h3>
          {customer.contact_name && (
            <p className="text-sm text-surface-600">{customer.contact_name}</p>
          )}
        </div>
        <StatusBadge status={(customer.status === "active" || customer.status === "inactive") ? customer.status : "info"} showDot />
      </div>

      <div className="space-y-1 text-sm">
        {customer.email && (
          <div className="flex items-center gap-2 text-surface-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {customer.email}
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-surface-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {customer.phone}
          </div>
        )}
      </div>

      {showStats && (
        <div className="mt-4 pt-4 border-t border-surface-200 flex items-center justify-between text-sm">
          <div>
            <span className="text-surface-500">Terms:</span>{" "}
            <span className="font-medium text-surface-900">{customer.payment_terms} days</span>
          </div>
          <div>
            <span className="text-surface-500">Credit:</span>{" "}
            <span className="font-medium text-surface-900">
              ${customer.credit_limit.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
