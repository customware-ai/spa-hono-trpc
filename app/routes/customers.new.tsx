/**
 * New Customer Form Route
 *
 * Form for creating new customer records.
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { ActionFunctionArgs } from "react-router";
import { Form, useNavigate, useActionData, useRouteError, isRouteErrorResponse } from "react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { ErrorDisplay } from "../components/ui/ErrorDisplay";
import { createCustomer } from "../services/erp";
import { CreateCustomerSchema } from "../schemas";
import { redirect } from "react-router";

/**
 * Action function - handles form submission
 */
export async function action({ request }: ActionFunctionArgs): Promise<Response | {
  error: string;
  fieldErrors: Record<string, string[]>;
}> {
  const formData = await request.formData();

  // Extract form data
  const data = {
    company_name: formData.get("company_name") as string,
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    status: (formData.get("status") as string) || "active",
    notes: formData.get("notes") as string || null,
  };

  // Validate with Zod schema
  const validation = CreateCustomerSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: "Validation failed",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Create customer in database
  const result = await createCustomer(validation.data);

  if (result.isErr()) {
    return {
      error: result.error.message,
      fieldErrors: {},
    };
  }

  // Redirect to customers list (home) on success
  return redirect("/home");
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
        { label: "New Customer" },
      ]}
    >
      <PageHeader
        title="New Customer"
        description="Create a new customer record with contact and billing information."
      />
      <ErrorDisplay
        error={{ type: errorType, message: errorMessage }}
        variant="page"
      />
    </PageLayout>
  );
}

export default function NewCustomerPage(): ReactElement {
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Customers", href: "/home" },
        { label: "New Customer" },
      ]}
    >
      <PageHeader
        title="New Customer"
        description="Create a new customer record with contact and billing information."
      />

      {/* Error Alert */}
      {actionData?.error && (
        <ErrorDisplay
          error={{
            type: actionData.error === "Validation failed" ? "VALIDATION_ERROR" : "DATABASE_ERROR",
            message: actionData.error,
          }}
          variant="inline"
          className="mb-6"
        />
      )}

      <Card>
        <Form method="post" onSubmit={() => setIsSubmitting(true)}>
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="company_name"
                type="text"
                required
                placeholder="Sample Company Inc"
              />
              {actionData?.fieldErrors?.company_name && (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.fieldErrors.company_name[0]}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="contact@sample-company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                  Phone
                </label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue="active"
                className="w-full px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 text-surface-900 dark:text-surface-100 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                Notes
              </label>
              <Textarea
                name="notes"
                rows={3}
                placeholder="Add any additional notes about this customer..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-surface-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/home")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Create Customer
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </PageLayout>
  );
}
