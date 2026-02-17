import type { ReactElement, JSX } from "react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/home";
import { useLoaderData, useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { Plus, Users } from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import type { Column } from "../components/ui/Table";
import { StatusBadge } from "../components/ui/StatusBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { TableSkeleton } from "../components/ui/LoadingSkeleton";
import { ErrorDisplay } from "../components/ui/ErrorDisplay";
import { getCustomers } from "../services/erp";
import type { Customer } from "../schemas";

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

/**
 * Client loader - enables fast client-side navigation
 * On initial load: uses server data (SSR)
 * On subsequent navigations: fetches directly on client (faster)
 */
export async function clientLoader({
  serverLoader,
}: Route.ClientLoaderArgs): Promise<{ customers: Customer[]; error: string | null }> {
  return serverLoader();
}

// Enable client loader during hydration for consistent behavior
clientLoader.hydrate = true as const;

/**
 * HydrateFallback - shown while clientLoader runs
 */
export function HydrateFallback(): ReactElement {
  return (
    <PageLayout breadcrumbs={[{ label: "Customers" }]}>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships and contact information."
      />
      <TableSkeleton rows={8} columns={5} />
    </PageLayout>
  );
}

/**
 * ErrorBoundary - Handles errors in this route
 */
export function ErrorBoundary(): ReactElement {
  const error = useRouteError();

  const errorType = isRouteErrorResponse(error)
    ? error.status === 404
      ? "NOT_FOUND"
      : "SERVER_ERROR"
    : "SERVER_ERROR";

  const errorMessage = isRouteErrorResponse(error)
    ? error.statusText || "An error occurred"
    : error instanceof Error
      ? error.message
      : "An unexpected error occurred";

  return (
    <PageLayout breadcrumbs={[{ label: "Customers" }]}>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships and contact information."
      />
      <ErrorDisplay
        error={{ type: errorType, message: errorMessage }}
        variant="page"
      />
    </PageLayout>
  );
}

export default function HomePage(): ReactElement {
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
      render: (value: unknown): JSX.Element => (
        <div className="font-semibold text-surface-900 dark:text-surface-100">{value as string}</div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value: unknown): JSX.Element => {
        const email = value as string | null;
        return email ? <span className="font-mono text-xs">{email}</span> : <span className="text-surface-400">—</span>;
      },
    },
    {
      key: "phone",
      label: "Phone",
      render: (value: unknown): JSX.Element => {
        const phone = value as string | null;
        return phone ? <span className="font-mono text-xs">{phone}</span> : <span className="text-surface-400">—</span>;
      },
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
              void navigate(`/customers/${row.id}`);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout breadcrumbs={[{ label: "Customers" }]}>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships and contact information."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate("/customers/new")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <ErrorDisplay
          error={{ type: "DATABASE_ERROR", message: error }}
          variant="inline"
          className="mb-6"
        />
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search customers..."
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
            <Users className="w-24 h-24 text-surface-200 dark:text-surface-700" />
          }
          title="No customers found"
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters to find what you're looking for."
              : "Get started by creating your first customer record."
          }
          action={
            !searchQuery && statusFilter === "all" ? (
              <Button variant="primary" onClick={() => navigate("/customers/new")}>
                <Plus className="w-4 h-4 mr-2" />
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
          onRowClick={(row) => void navigate(`/customers/${row.id}`)}
        />
      )}

      {/* Summary Stats */}
      {filteredCustomers.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-surface-600 dark:text-surface-400">
          <div>
            Showing <span className="font-semibold text-surface-900 dark:text-surface-100">{filteredCustomers.length}</span> of{" "}
            <span className="font-semibold text-surface-900 dark:text-surface-100">{customers.length}</span> customers
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="font-semibold text-surface-900 dark:text-surface-100">
                {customers.filter((c: Customer) => c.status === "active").length}
              </span>{" "}
              Active
            </div>
            <div>
              <span className="font-semibold text-surface-900 dark:text-surface-100">
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
