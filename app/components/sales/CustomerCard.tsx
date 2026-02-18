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
}

export function CustomerCard({
  customer,
  onClick,
}: CustomerCardProps): ReactElement {
  return (
    <Card
      className={`${onClick ? "cursor-pointer hover:shadow-xl transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-surface-900 mb-1">{customer.company_name}</h3>
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

    </Card>
  );
}
