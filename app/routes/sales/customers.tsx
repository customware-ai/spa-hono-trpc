/**
 * Customers List Route
 *
 * Displays a searchable, filterable table of all customers.
 * Features:
 * - Search by company name, contact, or email
 * - Filter by status (active/inactive)
 * - Sortable columns
 * - Click row to view customer details
 * - "New Customer" button to create new records
 *
 * @template-code Sample route demonstrating loader/action patterns
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
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { getCustomers } from "../../services/erp";
import type { Customer } from "../../schemas";

/**
 * Loader function - fetches customers from database
 * Runs on the server before rendering the page
 */
export async function loader({ request }: LoaderFunctionArgs): Promise<{ customers: Customer[]; error: string | null }> {
  // Get query parameters from URL for filtering
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const status = (url.searchParams.get("status") as "active" | "inactive") || undefined;

  // Fetch customers with filters
  const result = await getCustomers({ search, status });

  if (result.isErr()) {
    return {
      customers: [],
      error: result.error.message,
    };
  }

  return {
    customers: result.value,
    error: null,
  };
}

export default function CustomersPage(): ReactElement {
  const { customers, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Local state for filters (client-side filtering for demo)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter customers based on local state
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch =
      !searchQuery ||
      customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Define table columns
  const columns: Column<Customer>[] = [
    {
      key: "company_name",
      label: "Company",
      sortable: true,
      render: (value: unknown, row: Customer): JSX.Element => (
        <div>
          <div className="font-semibold text-surface-900">{value as string}</div>
          {row.contact_name && (
            <div className="text-sm text-surface-500">{row.contact_name}</div>
          )}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value: unknown): JSX.Element => {
        const email = value as string | null;
        return email ? <>{email}</> : <span className="text-surface-400">—</span>;
      },
    },
    {
      key: "phone",
      label: "Phone",
      render: (value: unknown): JSX.Element => {
        const phone = value as string | null;
        return phone ? <>{phone}</> : <span className="text-surface-400">—</span>;
      },
    },
    {
      key: "payment_terms",
      label: "Terms",
      render: (value: unknown): JSX.Element => <span className="text-surface-600">{value as number} days</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown): JSX.Element => {
        const status = value as string;
        return (
          <StatusBadge status={(status === "active" || status === "inactive") ? status : "info"} showDot />
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (_value: unknown, row: Customer): JSX.Element => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e): void => {
              e.stopPropagation();
              void navigate(`/sales/customers/${row.id}`);
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
        { label: "Customers" },
      ]}
    >
      <PageHeader
        title="Customers"
        description="Manage your customer relationships and contact information."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate("/sales/customers/new")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Customer
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search customers by name, email, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />
        </div>
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-24 h-24 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title="No customers found"
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters to find what you're looking for."
              : "Get started by creating your first customer record."
          }
          action={
            !searchQuery && statusFilter === "all" ? (
              <Button variant="primary" onClick={() => navigate("/sales/customers/new")}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Customer
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filteredCustomers}
          keyExtractor={(row) => row.id.toString()}
          onRowClick={(row) => void navigate(`/sales/customers/${row.id}`)}
        />
      )}

      {/* Summary Stats */}
      {filteredCustomers.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-surface-600">
          <div>
            Showing <span className="font-semibold text-surface-900">{filteredCustomers.length}</span> of{" "}
            <span className="font-semibold text-surface-900">{customers.length}</span> customers
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="font-semibold text-surface-900">
                {customers.filter((c: Customer) => c.status === "active").length}
              </span>{" "}
              Active
            </div>
            <div>
              <span className="font-semibold text-surface-900">
                {customers.filter((c: Customer) => c.status === "inactive").length}
              </span>{" "}
              Inactive
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
