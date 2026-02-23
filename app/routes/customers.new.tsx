/**
 * New Customer Form Route - Client-Side Rendered with tRPC
 *
 * Form for creating new customer records using tRPC mutation.
 */

import type { ReactElement } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Select } from "../components/ui/Select";
import { Label } from "../components/ui/Label";
import { Alert } from "../components/ui/Alert";
import { trpc } from "../lib/trpc";

/**
 * New Customer Form Component
 */

export default function NewCustomerPage(): ReactElement {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  
  // tRPC mutation for creating customer
  const createCustomer = trpc.createCustomer.useMutation({
    onSuccess: () => {
      // Invalidate customers query to refetch data
      void utils.getCustomers.invalidate();
      // Navigate back to customers list
      void navigate("/");
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Extract and validate form data
    const data = {
      company_name: formData.get("company_name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      status: (formData.get("status") as "active" | "inactive") || "active",
      notes: (formData.get("notes") as string) || undefined,
    };

    createCustomer.mutate(data);
  };

  const isSubmitting = createCustomer.isPending;
  const error = createCustomer.error;

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
      {error && (
        <Alert variant="destructive" className="mb-6">
          {error.message}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 pt-0 space-y-6">
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
                disabled={isSubmitting}
              />
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <input type="hidden" name="status" value="active" />
              <Select
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value="active"
                placeholder="Select status"
                disabled={isSubmitting}
                onChange={(_val) => {
                  // Controlled by hidden input for now
                }}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Add any additional notes about this customer..."
                disabled={isSubmitting}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center mt-2 justify-end gap-3 pt-6 border-t">
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
        </form>
      </Card>
    </PageLayout>
  );
}
