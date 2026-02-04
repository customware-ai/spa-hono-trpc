/**
 * Quotes List Route
 *
 * Displays all quotations with filtering and search.
 * Features:
 * - Filter by status (draft, sent, accepted, rejected, expired)
 * - Search by quote number or customer
 * - View quote details
 * - Create new quotes
 * - Convert to sales order
 */

import type { ReactElement, JSX } from "react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import type { Column } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { Status } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";

interface Quote extends Record<string, unknown> {
  id: number;
  quote_number: string;
  customer_name: string;
  issue_date: string;
  expiry_date: string;
  total: number;
  status: string;
}

/**
 * Loader - fetches quotes from database
 */
export async function loader({ request: _request }: LoaderFunctionArgs): Promise<{ quotes: Quote[] }> {
  // TODO: Implement getQuotes in erp service
  // Mock data for now
  return {
    quotes: [
      {
        id: 1,
        quote_number: "QT-000001",
        customer_name: "Acme Corp",
        issue_date: "2024-02-01",
        expiry_date: "2024-03-01",
        total: 5240.00,
        status: "sent",
      },
      {
        id: 2,
        quote_number: "QT-000002",
        customer_name: "TechStart Inc",
        issue_date: "2024-02-05",
        expiry_date: "2024-03-05",
        total: 12890.00,
        status: "draft",
      },
    ],
  };
}

export default function QuotesPage(): ReactElement {
  const { quotes } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter quotes
  const filteredQuotes = quotes.filter((quote: Quote): boolean => {
    const matchesSearch =
      !searchQuery ||
      quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customer_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Table columns
  const columns: Column<Quote>[] = [
    {
      key: "quote_number",
      label: "Quote #",
      sortable: true,
      render: (value: unknown): JSX.Element => (
        <span className="font-mono font-semibold text-surface-900">{value as string}</span>
      ),
    },
    {
      key: "customer_name",
      label: "Customer",
      sortable: true,
    },
    {
      key: "issue_date",
      label: "Issue Date",
      sortable: true,
      render: (value: unknown): string => new Date(value as string).toLocaleDateString(),
    },
    {
      key: "expiry_date",
      label: "Expiry Date",
      sortable: true,
      render: (value: unknown): string => new Date(value as string).toLocaleDateString(),
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
      key: "status",
      label: "Status",
      render: (value: unknown): JSX.Element => {
        const statusValue = value as string;
        const statusMap: Record<string, Status> = {
          draft: "draft",
          sent: "sent",
          accepted: "active",
          rejected: "danger",
          expired: "warning",
        };
        return <StatusBadge status={statusMap[statusValue] || "info"} label={statusValue} showDot />;
      },
    },
    {
      key: "actions",
      label: "",
      render: (_value: unknown, row: Quote): JSX.Element => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e): void => {
              e.stopPropagation();
              void navigate(`/sales/quotes/${row.id}`);
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
        { label: "Sales & CRM", href: "/sales" },
        { label: "Quotes" },
      ]}
    >
      <PageHeader
        title="Quotes"
        description="Create and manage sales quotations for your customers."
        actions={
          <Button variant="primary" onClick={() => navigate("/sales/quotes/new")}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Quote
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by quote number or customer..."
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
              { label: "Accepted", value: "accepted" },
              { label: "Rejected", value: "rejected" },
              { label: "Expired", value: "expired" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Quotes Table */}
      {filteredQuotes.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-24 h-24 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="No quotes found"
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating your first quote"
          }
          action={
            !searchQuery && statusFilter === "all" ? (
              <Button variant="primary" onClick={() => navigate("/sales/quotes/new")}>
                Create Your First Quote
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filteredQuotes}
          keyExtractor={(row) => row.id.toString()}
          onRowClick={(row) => void navigate(`/sales/quotes/${String(row.id)}`)}
        />
      )}

      {/* Summary */}
      {filteredQuotes.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-surface-600">
            Showing <span className="font-semibold text-surface-900">{filteredQuotes.length}</span>{" "}
            of <span className="font-semibold text-surface-900">{quotes.length}</span> quotes
          </div>
          <div className="flex items-center gap-6">
            <div>
              Total Value:{" "}
              <span className="font-semibold text-surface-900">
                ${filteredQuotes.reduce((sum: number, q: Quote): number => sum + q.total, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
