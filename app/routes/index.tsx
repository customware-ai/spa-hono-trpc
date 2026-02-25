import type { ReactElement } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
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
import { trpc } from "../lib/trpc";
import type { Customer } from "../../server/contracts/sales";

/**
 * Customers Index Page - Client-Side Rendered with tRPC
 * 
 * This page fetches customer data using tRPC React Query hooks.
 * All data fetching happens on the client side.
 */

export default function IndexPage(): ReactElement {
  const navigate = useNavigate();

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch customers using tRPC
  const { data: customers = [], isLoading, error } = trpc.getCustomers.useQuery();

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

  // Show loading skeleton
  if (isLoading) {
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
          {error.message}
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
