/**
 * Customer Detail Route
 *
 * Displays comprehensive customer information with tabs:
 * - Overview: Customer details, statistics, recent activity
 * - Contacts: List of contacts for this customer
 * - Orders: Related sales orders
 * - Invoices: Customer invoices with payment status
 * - Activities: CRM activity timeline
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Tabs } from "../../components/ui/Tabs";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getCustomerById } from "../../services/erp";
import type { Customer } from "../../schemas";

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

export default function CustomerDetailPage(): ReactElement {
  const { customer } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState("overview");

  if (!customer) {
    return (
      <PageLayout>
        <Card>
          <p className="text-center text-surface-600 py-8">Customer not found</p>
        </Card>
      </PageLayout>
    );
  }

  // Tab definitions
  const tabs = [
    {
      label: "Overview",
      value: "overview",
      content: (
        <div className="space-y-6">
          {/* Customer Details Card */}
          <Card>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-surface-500">Company Name</label>
                <p className="text-surface-900 font-semibold">{customer.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">Contact Name</label>
                <p className="text-surface-900">{customer.contact_name || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">Email</label>
                <p className="text-surface-900">{customer.email || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">Phone</label>
                <p className="text-surface-900">{customer.phone || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">Payment Terms</label>
                <p className="text-surface-900">{customer.payment_terms} days</p>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">Credit Limit</label>
                <p className="text-surface-900">
                  ${customer.credit_limit.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={(customer.status === "active" || customer.status === "inactive") ? customer.status : "info"} showDot />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">Tax ID</label>
                <p className="text-surface-900">{customer.tax_id || "—"}</p>
              </div>
            </div>

            {customer.address && (
              <div className="mt-4 pt-4 border-t border-surface-200">
                <label className="text-sm font-medium text-surface-500">Address</label>
                <p className="text-surface-900 mt-1">
                  {customer.address}
                  {customer.city && `, ${customer.city}`}
                  {customer.state && `, ${customer.state}`}
                  {customer.postal_code && ` ${customer.postal_code}`}
                  {customer.country && `, ${customer.country}`}
                </p>
              </div>
            )}

            {customer.notes && (
              <div className="mt-4 pt-4 border-t border-surface-200">
                <label className="text-sm font-medium text-surface-500">Notes</label>
                <p className="text-surface-700 mt-1">{customer.notes}</p>
              </div>
            )}
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-600">Total Orders</p>
                  <p className="text-2xl font-bold text-surface-900 mt-1">0</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-600">Outstanding</p>
                  <p className="text-2xl font-bold text-surface-900 mt-1">$0</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-surface-900 mt-1">$0</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      label: "Contacts",
      value: "contacts",
      badge: 0,
      content: (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-surface-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No Contacts Yet</h3>
            <p className="text-surface-600">Contacts feature not available in template</p>
          </div>
        </Card>
      ),
    },
    {
      label: "Orders",
      value: "orders",
      badge: 0,
      content: (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-surface-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No Orders Yet</h3>
            <p className="text-surface-600">Orders feature not available in template</p>
          </div>
        </Card>
      ),
    },
    {
      label: "Activities",
      value: "activities",
      badge: 0,
      content: (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-surface-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No Activities Yet</h3>
            <p className="text-surface-600">Activities feature not available in template</p>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Sales & CRM", href: "/sales" },
        { label: "Customers", href: "/sales/customers" },
        { label: customer.company_name },
      ]}
    >
      <PageHeader
        title={customer.company_name}
        description={customer.contact_name ? `Contact: ${customer.contact_name}` : undefined}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </PageLayout>
  );
}
