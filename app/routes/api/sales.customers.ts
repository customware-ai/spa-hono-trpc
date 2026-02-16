/**
 * Customer API Route
 *
 * RESTful API endpoints for customer CRUD operations.
 * Used by forms and AJAX calls throughout the application.
 *
 * Endpoints:
 * - GET /api/sales/customers - List all customers
 * - GET /api/sales/customers/:id - Get single customer
 * - POST /api/sales/customers - Create customer
 * - PUT /api/sales/customers/:id - Update customer
 * - DELETE /api/sales/customers/:id - Delete customer
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/erp";
import { CreateCustomerSchema, UpdateCustomerSchema } from "../../schemas";
import { json } from "../../utils/json";

/**
 * GET /api/sales/customers
 * GET /api/sales/customers?status=active&search=acme
 *
 * Returns list of customers with optional filtering
 */
export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") as "active" | "inactive" | null;
  const search = url.searchParams.get("search");

  const result = await getCustomers({
    status: status || undefined,
    search: search || undefined,
  });

  if (result.isErr()) {
    return json(
      { error: result.error.message },
      { status: 500 }
    );
  }

  return json({
    customers: result.value,
    total: result.value.length,
  });
}

/**
 * POST /api/sales/customers - Create new customer
 * PUT /api/sales/customers/:id - Update existing customer
 * DELETE /api/sales/customers/:id - Delete customer
 */
export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  const method = request.method;

  try {
    // POST - Create new customer
    if (method === "POST") {
      const formData = await request.formData();
      const data = Object.fromEntries(formData);

      // Validate with Zod
      const validation = CreateCustomerSchema.safeParse(data);
      if (!validation.success) {
        return json(
          {
            error: "Validation failed",
            fieldErrors: validation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      // Create customer
      const result = await createCustomer(validation.data);
      if (result.isErr()) {
        return json(
          { error: result.error.message },
          { status: 500 }
        );
      }

      return json(
        { customer: result.value, message: "Customer created successfully" },
        { status: 201 }
      );
    }

    // PUT - Update customer
    if (method === "PUT") {
      const url = new URL(request.url);
      const id = parseInt(url.searchParams.get("id") || "0");

      if (!id) {
        return json(
          { error: "Customer ID is required" },
          { status: 400 }
        );
      }

      const formData = await request.formData();
      const data = Object.fromEntries(formData);

      // Validate with Zod
      const validation = UpdateCustomerSchema.safeParse(data);
      if (!validation.success) {
        return json(
          {
            error: "Validation failed",
            fieldErrors: validation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      // Update customer
      const result = await updateCustomer(id, validation.data);
      if (result.isErr()) {
        return json(
          { error: result.error.message },
          { status: 500 }
        );
      }

      return json({
        customer: result.value,
        message: "Customer updated successfully",
      });
    }

    // DELETE - Delete customer
    if (method === "DELETE") {
      const url = new URL(request.url);
      const id = parseInt(url.searchParams.get("id") || "0");

      if (!id) {
        return json(
          { error: "Customer ID is required" },
          { status: 400 }
        );
      }

      const result = await deleteCustomer(id);
      if (result.isErr()) {
        return json(
          { error: result.error.message },
          { status: 500 }
        );
      }

      return json({
        message: "Customer deleted successfully",
      });
    }

    // Method not allowed
    return json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
