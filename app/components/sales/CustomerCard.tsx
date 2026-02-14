/**
 * Customer Card Component
 *
 * Displays customer information in a card format.
 * Used in dashboards, lists, and summary views.
 */

import type { ReactElement } from "react";
import { Mail, Phone } from "lucide-react";
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
            <Mail className="w-4 h-4" />
            {customer.email}
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-surface-600">
            <Phone className="w-4 h-4" />
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
