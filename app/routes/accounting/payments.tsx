/**
 * Payments List Route
 *
 * Displays all payment records.
 * Features:
 * - View all payments received
 * - Filter by date range
 * - Search by payment number or customer
 * - Link to related invoices
 * - Record new payments
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import type { Column } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";

interface Payment extends Record<string, unknown> {
  id: number;
  payment_number: string;
  customer_id: number;
  invoice_id: number | null;
  payment_date: string;
  amount: number;
  payment_method: string | null;
  reference_number?: string | null;
}

/**
 * Loader - fetches payments from database
 */
export async function loader({ request: _request }: LoaderFunctionArgs): Promise<{
  payments: Payment[];
}> {
  // TODO: Implement getPayments in erp service
  return {
    payments: [],
  };
}

export default function PaymentsPage(): ReactElement {
  const { payments } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    return (
      !searchQuery ||
      payment.payment_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate total received
  const totalReceived = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  // Table columns
  const columns: Column<Payment>[] = [
    {
      key: "payment_number",
      label: "Payment #",
      sortable: true,
      render: (value: unknown): ReactElement => (
        <span className="font-mono font-semibold text-surface-900">{value as string}</span>
      ),
    },
    {
      key: "customer_id",
      label: "Customer",
      render: (value: unknown): string => `Customer #${value as number}`,
    },
    {
      key: "invoice_id",
      label: "Invoice",
      render: (value: unknown): ReactElement => {
        const invoiceId = value as number | null;
        return invoiceId ? (
          <span className="font-mono text-primary-600 cursor-pointer hover:underline">
            INV-{String(invoiceId).padStart(6, "0")}
          </span>
        ) : (
          <span className="text-surface-400">—</span>
        );
      },
    },
    {
      key: "payment_date",
      label: "Date",
      sortable: true,
      render: (value: unknown): string => new Date(value as string).toLocaleDateString(),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: unknown): ReactElement => (
        <span className="font-semibold text-primary-600">
          ${(value as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "payment_method",
      label: "Method",
      render: (value: unknown): string => {
        const method = value as string;
        const methodLabels: Record<string, string> = {
          cash: "Cash",
          check: "Check",
          credit_card: "Credit Card",
          bank_transfer: "Bank Transfer",
          other: "Other",
        };
        return methodLabels[method] || method;
      },
    },
    {
      key: "reference_number",
      label: "Reference",
      render: (value: unknown): ReactElement | string => {
        const ref = value as string | null;
        return ref || <span className="text-surface-400">—</span>;
      },
    },
  ];

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Accounting", href: "/accounting" },
        { label: "Payments" },
      ]}
    >
      <PageHeader
        title="Payments"
        description="Track and manage customer payments."
        actions={
          <Button variant="primary" onClick={() => navigate("/accounting/payments/new")}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Record Payment
          </Button>
        }
      />

      {/* Summary Card */}
      <div className="mb-6 bg-white border border-surface-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-surface-600 mb-1">Total Received</div>
            <div className="text-3xl font-bold text-primary-600">
              ${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-surface-600 mb-1">Total Payments</div>
            <div className="text-3xl font-bold text-surface-900">{filteredPayments.length}</div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search by payment number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-24 h-24 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          title="No payments found"
          description={
            searchQuery
              ? "Try adjusting your search"
              : "Payments will appear here when recorded"
          }
          action={
            !searchQuery ? (
              <Button variant="primary" onClick={() => navigate("/accounting/payments/new")}>
                Record Your First Payment
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filteredPayments}
          keyExtractor={(row) => row.id.toString()}
        />
      )}
    </PageLayout>
  );
}
