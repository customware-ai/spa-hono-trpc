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
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Select } from "../components/ui/Select";
import { Label } from "../components/ui/Label";
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

  // Redirect to customers list on success
  return redirect("/");
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
        { label: "Customers", href: "/" },
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
        { label: "Customers", href: "/" },
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
          <CardContent className="pt-6 space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_name"
                name="company_name"
                type="text"
                required
                placeholder="Sample Company Inc"
              />
              {actionData?.fieldErrors?.company_name && (
                <p className="mt-1 text-sm text-destructive font-medium">
                  {actionData.fieldErrors.company_name[0]}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@sample-company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value="active"
                placeholder="Select status"
                onChange={(_val) => {
                    // Note: In a real Form submission with native select it would work,
                    // but shadcn Select needs a hidden input to work with native Form if not using controlled state.
                    // Or we can just use the primitive Select if we want to stay closer to native.
                    // For now I'll add a hidden input.
                }}
              />
              <input type="hidden" name="status" value="active" />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Add any additional notes about this customer..."
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Create Customer
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </PageLayout>
  );
}
