/**
 * Customer Detail Route - Client-Side Rendered with tRPC
 *
 * Displays comprehensive customer information.
 * Fetches data using tRPC React Query hooks.
 */

import type { ReactElement } from "react";
import { useParams } from "react-router";
import { ShoppingBag, DollarSign, Activity } from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Alert } from "../components/ui/Alert";
import { trpc } from "../lib/trpc";

/**
 * Customer Detail Page Component
 */

export default function CustomerDetailPage(): ReactElement {
  const params = useParams();
  const customerId = parseInt(params.id || "0");

  // Fetch customer using tRPC
  const { data: customer, isLoading, error } = trpc.getCustomer.useQuery(
    { id: customerId },
    { enabled: customerId > 0 }
  );

  // Show loading state
  if (isLoading) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Customers", href: "/" }, { label: "Loading..." }]}
      >
        <PageHeader title="Loading..." />
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "company",
                  "status",
                  "email",
                  "phone",
                ].map((field) => (
                  <div key={field}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["orders", "outstanding", "revenue"].map((stat) => (
              <Card key={stat}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (error || !customer) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Customers", href: "/" }, { label: "Error" }]}
      >
        <PageHeader title="Customer" />
        <Alert variant="destructive">
          {error?.message || "Customer not found"}
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Customers", href: "/" },
        { label: customer.company_name },
      ]}
    >
      <PageHeader
        title={customer.company_name}
        description={customer.email || undefined}
      />

      <div className="space-y-6">
        {/* Customer Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Company Name
                </label>
                <p className="font-semibold">{customer.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
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
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p>{customer.email || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p>{customer.phone || "—"}</p>
              </div>
            </div>

            {customer.notes && (
              <div className="mt-4 pt-4 border-t">
                <label className="text-sm font-medium text-muted-foreground">
                  Notes
                </label>
                <p className="text-muted-foreground mt-1">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Outstanding
                </p>
                <p className="text-2xl font-bold mt-1">$0</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold mt-1">$0</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
