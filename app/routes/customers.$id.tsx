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
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { CardSkeleton, LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { ErrorDisplay } from "../components/ui/ErrorDisplay";
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
        { label: "Customers", href: "/home" },
        { label: "Loading..." },
      ]}
    >
      <PageHeader title="Loading..." />
      <div className="space-y-6">
        <Card>
          <LoadingSkeleton variant="rectangular" className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["field-1", "field-2", "field-3", "field-4", "field-5", "field-6", "field-7", "field-8"].map((fieldId) => (
              <div key={fieldId}>
                <LoadingSkeleton variant="rectangular" className="h-4 w-24 mb-2" />
                <LoadingSkeleton variant="rectangular" className="h-5 w-40" />
              </div>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton count={3} />
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
    <PageLayout
      breadcrumbs={[
        { label: "Customers", href: "/home" },
        { label: "Error" },
      ]}
    >
      <PageHeader title="Customer" />
      <ErrorDisplay
        error={{ type: errorType, message: errorMessage }}
        variant="page"
      />
    </PageLayout>
  );
}

export default function CustomerDetailPage(): ReactElement {
  const { customer } = useLoaderData<typeof loader>();

  if (!customer) {
    return (
      <PageLayout>
        <Card>
          <p className="text-center text-surface-600 dark:text-surface-400 py-8">Customer not found</p>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Customers", href: "/home" },
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
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-surface-500 dark:text-surface-400">Company Name</label>
              <p className="text-surface-900 dark:text-surface-100 font-semibold">{customer.company_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500 dark:text-surface-400">Status</label>
              <div className="mt-1">
                <StatusBadge status={(customer.status === "active" || customer.status === "inactive") ? customer.status : "info"} showDot />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500 dark:text-surface-400">Email</label>
              <p className="text-surface-900 dark:text-surface-100">{customer.email || "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500 dark:text-surface-400">Phone</label>
              <p className="text-surface-900 dark:text-surface-100">{customer.phone || "—"}</p>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
              <label className="text-sm font-medium text-surface-500 dark:text-surface-400">Notes</label>
              <p className="text-surface-700 dark:text-surface-300 mt-1">{customer.notes}</p>
            </div>
          )}
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Total Orders</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">0</p>
              </div>
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Outstanding</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">$0</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Total Revenue</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">$0</p>
              </div>
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
