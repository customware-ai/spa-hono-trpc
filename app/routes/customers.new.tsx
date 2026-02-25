/**
 * New Customer Form Route
 *
 * Persists customer records directly to browser localStorage.
 */

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Select } from "../components/ui/Select";
import { Label } from "../components/ui/Label";
import { Alert } from "../components/ui/Alert";
import { addCustomerToStorage } from "../lib/local-storage";

/**
 * Customer creation form component.
 */
export default function NewCustomerPage(): ReactElement {
  const navigate = useNavigate();

  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Safely reads a string value from FormData entries.
   * This avoids implicit object stringification for File values.
   */
  const readFormString = (value: FormDataEntryValue | null): string => {
    if (typeof value !== "string") {
      return "";
    }

    return value.trim();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    const createdCustomer = addCustomerToStorage({
      company_name: readFormString(formData.get("company_name")),
      email: readFormString(formData.get("email")) || undefined,
      phone: readFormString(formData.get("phone")) || undefined,
      status,
      notes: readFormString(formData.get("notes")) || undefined,
    });

    if (!createdCustomer) {
      setErrorMessage("Please provide valid customer details and try again.");
      setIsSubmitting(false);
      return;
    }

    void navigate("/");
  };

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          {errorMessage}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-6 pt-0">
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value={status}
                onChange={(value) =>
                  setStatus(value === "inactive" ? "inactive" : "active")
                }
                placeholder="Select status"
                disabled={isSubmitting}
              />
            </div>

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

          <CardFooter className="mt-2 flex items-center justify-end gap-3 border-t pt-6">
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
    </>
  );
}
