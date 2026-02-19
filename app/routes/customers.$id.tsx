/**
 * Customer Detail Route
 *
 * Displays comprehensive customer information.
 */

import type { ReactElement } from "react";
import type { LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/customers.$id";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "react-router";
import { ShoppingBag, DollarSign, Activity } from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Alert } from "../components/ui/Alert";
import { getCustomerById } from "../services/erp";
import type { Customer } from "../schemas";

/**
 * Loader - fetches customer details
 */
export async function loader({ params }: LoaderFunctionArgs): Promise<{
  customer: Customer;
}> {
  const id = parseInt(params.id!);
  const result = await getCustomerById(id);

  if (result.isErr() || !result.value) {
    throw new Response("Customer not found", { status: 404 });
  }

  return {
    customer: result.value,
  };
}

/**
 * Client loader - enables fast client-side navigation
 */
export async function clientLoader({
  serverLoader,
}: Route.ClientLoaderArgs): Promise<{ customer: Customer }> {
  return serverLoader();
}

clientLoader.hydrate = true as const;

/**
 * HydrateFallback - shown while clientLoader runs
 */
export function HydrateFallback(): ReactElement {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Customers", href: "/" },
        { label: "Loading..." },
      ]}
    >
      <PageHeader title="Loading..." />
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["company", "status", "email", "phone", "city", "country", "website", "notes"].map((field) => (
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
    <PageLayout
      breadcrumbs={[
        { label: "Customers", href: "/" },
        { label: "Error" },
      ]}
    >
      <PageHeader title="Customer" />
      <Alert variant="destructive">{errorMessage}</Alert>
    </PageLayout>
  );
}

export default function CustomerDetailPage(): ReactElement {
  const { customer } = useLoaderData<typeof loader>();

  if (!customer) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Customer not found</p>
          </CardContent>
        </Card>
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
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="font-semibold">{customer.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge
                    variant={customer.status === "active" ? "success" : "secondary"}
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
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{customer.email || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p>{customer.phone || "—"}</p>
              </div>
            </div>

            {customer.notes && (
              <div className="mt-4 pt-4 border-t">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-muted-foreground mt-1">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold mt-1">$0</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
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
