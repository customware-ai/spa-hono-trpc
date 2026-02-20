import type { ReactElement } from "react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/index";
import {
  useLoaderData,
  useNavigate,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import { Plus, Users } from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Alert } from "../components/ui/Alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import { getCustomers } from "../services/erp";
import type { Customer } from "../schemas";

/**
 * Loader function - fetches customers from database
 * Runs on the server before rendering the page
 */
export async function loader({ request }: LoaderFunctionArgs): Promise<{
  customers: Customer[];
  error: string | null;
}> {
  // Get query parameters from URL for filtering
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const status =
    (url.searchParams.get("status") as "active" | "inactive") || undefined;

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
}: Route.ClientLoaderArgs): Promise<{
  customers: Customer[];
  error: string | null;
}> {
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
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"].map((key) => (
          <Skeleton key={key} className="h-12 w-full" />
        ))}
      </div>
    </PageLayout>
  );
}

/**
 * ErrorBoundary - Handles errors in this route
 */
export function ErrorBoundary(): ReactElement {
  const error = useRouteError();

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
      <Alert variant="destructive">{errorMessage}</Alert>
    </PageLayout>
  );
}

export default function IndexPage(): ReactElement {
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

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <PageLayout breadcrumbs={[{ label: "Customers" }]}>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships and contact information."
        actions={
          <Button variant="default" onClick={() => navigate("/customers/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Filter customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status"
          />
        </div>
      </div>

      {/* Customers Table or Empty State */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <Users className="w-16 h-16 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No customers found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for."
                : "Get started by creating your first customer record."}
            </p>
          </div>
          {!searchQuery && statusFilter === "all" && (
            <Button
              variant="default"
              onClick={() => navigate("/customers/new")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Customer
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer"
                onClick={() => void navigate(`/customers/${customer.id}`)}
              >
                <TableCell>
                  <div className="font-semibold text-foreground">
                    {customer.company_name}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.email ? (
                    <span className="font-mono text-xs">{customer.email}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {customer.phone ? (
                    <span className="font-mono text-xs">{customer.phone}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      customer.status === "active" ? "success" : "secondary"
                    }
                    className="gap-1.5"
                  >
                    <span
                      className={
                        customer.status === "active"
                          ? "size-1.5 rounded-full bg-green-600"
                          : "size-1.5 rounded-full bg-gray-400"
                      }
                    />
                    {customer.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        void navigate(`/customers/${customer.id}`);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Summary Stats */}
      {filteredCustomers.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          {filteredCustomers.length} of {customers.length} customer(s)
        </div>
      )}
    </PageLayout>
  );
}
