/**
 * Invoices List Route
 *
 * Displays all customer invoices with comprehensive filtering.
 * Features:
 * - Filter by status (draft, sent, partial, paid, overdue, cancelled)
 * - Filter by date range
 * - Search by invoice number or customer
 * - View invoice details
 * - Record payments
 * - Generate PDF
 * - Track overdue invoices
 */

import type { ReactElement, JSX } from "react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { Status } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { getInvoices, type Invoice } from "../../services/erp";
import type { Column } from "../../components/ui/Table";

/**
 * Loader - fetches invoices from database
 */
export async function loader({ request: _request }: LoaderFunctionArgs): Promise<{ invoices: Invoice[]; error: string | null }> {
  const result = await getInvoices();

  if (result.isErr()) {
    return {
      invoices: [],
      error: result.error.message,
    };
  }

  return {
    invoices: result.value,
    error: null,
  };
}

export default function InvoicesPage(): ReactElement {
  const { invoices, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice: Invoice): boolean => {
    const matchesSearch =
      !searchQuery ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalOutstanding = filteredInvoices
    .filter((inv: Invoice): boolean => inv.status !== "paid" && inv.status !== "cancelled")
    .reduce((sum: number, inv: Invoice): number => sum + inv.amount_due, 0);

  const overdueCount = filteredInvoices.filter((inv: Invoice): boolean => inv.status === "overdue").length;

  // Table columns
  const columns: Column<Invoice>[] = [
    {
      key: "invoice_number",
      label: "Invoice #",
      sortable: true,
      render: (value: unknown): JSX.Element => (
        <span className="font-mono font-semibold text-surface-900">{value as string}</span>
      ),
    },
    {
      key: "customer_id",
      label: "Customer",
      render: (value: unknown): string => `Customer #${value as number}`,
    },
    {
      key: "invoice_date",
      label: "Date",
      sortable: true,
      render: (value: unknown): string => new Date(value as string).toLocaleDateString(),
    },
    {
      key: "due_date",
      label: "Due Date",
      sortable: true,
      render: (value: unknown, row: Invoice): JSX.Element => {
        const dateValue = value as string;
        const isOverdue = new Date(dateValue) < new Date() && row.status !== "paid";
        return (
          <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
            {new Date(dateValue).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (value: unknown): JSX.Element => (
        <span className="font-semibold text-surface-900">
          ${(value as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "amount_due",
      label: "Amount Due",
      sortable: true,
      render: (value: unknown): JSX.Element => {
        const amount = value as number;
        return (
          <span className={`font-semibold ${amount > 0 ? "text-amber-600" : "text-primary-600"}`}>
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown): JSX.Element => {
        const statusValue = value as string;
        const statusMap: Record<string, Status> = {
          draft: "draft",
          sent: "sent",
          partial: "warning",
          paid: "paid",
          overdue: "danger",
          cancelled: "inactive",
        };
        return <StatusBadge status={statusMap[statusValue] || "info"} label={statusValue} showDot />;
      },
    },
    {
      key: "actions",
      label: "",
      render: (_value: unknown, row: Invoice): JSX.Element => (
        <div className="flex items-center justify-end gap-2">
          {row.status !== "paid" && row.status !== "cancelled" && (
            <Button
              size="sm"
              variant="primary"
              onClick={(e): void => {
                e.stopPropagation();
                void navigate(`/accounting/payments/new?invoice=${row.id}`);
              }}
            >
              Record Payment
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e): void => {
              e.stopPropagation();
              void navigate(`/accounting/invoices/${row.id}`);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Accounting", href: "/accounting" },
        { label: "Invoices" },
      ]}
    >
      <PageHeader
        title="Invoices"
        description="Manage customer invoices and track payments."
        actions={
          <Button variant="primary" onClick={() => navigate("/accounting/invoices/new")}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <div className="text-sm font-medium text-surface-600 mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold text-amber-600">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <div className="text-sm font-medium text-surface-600 mb-1">Overdue Invoices</div>
          <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
        </div>
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <div className="text-sm font-medium text-surface-600 mb-1">Total Invoices</div>
          <div className="text-2xl font-bold text-surface-900">{invoices.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={[
              { label: "All Status", value: "all" },
              { label: "Draft", value: "draft" },
              { label: "Sent", value: "sent" },
              { label: "Partial", value: "partial" },
              { label: "Paid", value: "paid" },
              { label: "Overdue", value: "overdue" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-24 h-24 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="No invoices found"
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating your first invoice"
          }
          action={
            !searchQuery && statusFilter === "all" ? (
              <Button variant="primary" onClick={() => navigate("/accounting/invoices/new")}>
                Create Your First Invoice
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filteredInvoices}
          keyExtractor={(row) => row.id.toString()}
          onRowClick={(row) => void navigate(`/accounting/invoices/${row.id}`)}
        />
      )}
    </PageLayout>
  );
}
