import type { ReactElement } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Status } from "../components/ui/StatusBadge";
import { Table } from "../components/ui/Table";
import type { Column } from "../components/ui/Table";

// Sample data for demonstration
const metrics = [
  {
    label: "Total Revenue",
    value: "$124,590",
    change: "+12.5%",
    trend: "up" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Outstanding Invoices",
    value: "$32,450",
    change: "+8.2%",
    trend: "up" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "New Leads",
    value: "48",
    change: "+24%",
    trend: "up" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Active Orders",
    value: "23",
    change: "-3.4%",
    trend: "down" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
];

interface InvoiceData extends Record<string, unknown> {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

const recentInvoices: InvoiceData[] = [
  { id: "INV-001", customer: "Sample Corp A", amount: "$5,240", status: "paid", date: "2024-02-01" },
  { id: "INV-002", customer: "Sample Corp B", amount: "$12,890", status: "pending", date: "2024-02-02" },
  { id: "INV-003", customer: "Sample Corp C", amount: "$3,450", status: "sent", date: "2024-02-03" },
  { id: "INV-004", customer: "Sample Corp D", amount: "$8,920", status: "paid", date: "2024-02-04" },
  { id: "INV-005", customer: "Sample Corp E", amount: "$15,600", status: "pending", date: "2024-02-05" },
];

const invoiceColumns: Column<InvoiceData>[] = [
  {
    key: "id",
    label: "Invoice",
    sortable: true,
    render: (value: unknown): ReactElement => <span className="font-mono font-semibold text-surface-900">{value as string}</span>,
  },
  {
    key: "customer",
    label: "Customer",
    sortable: true,
  },
  {
    key: "date",
    label: "Date",
    sortable: true,
    render: (value: unknown): string => new Date(value as string).toLocaleDateString(),
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    render: (value: unknown): ReactElement => <span className="font-semibold">{value as string}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (value: unknown): ReactElement => {
      const statusValue = value as string;
      const statusMap: Record<string, Status> = {
        draft: "draft",
        sent: "sent",
        paid: "paid",
        pending: "pending",
      };
      return <StatusBadge status={statusMap[statusValue] || "info"} showDot />;
    },
  },
];

export default function Dashboard(): ReactElement {
  return (
    <PageLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your business today."
        actions={
          <Button variant="primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </Button>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.label} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-surface-900 mb-2">{metric.value}</p>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-sm font-semibold ${
                      metric.trend === "up" ? "text-primary-600" : "text-red-600"
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="text-xs text-surface-500">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                {metric.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart Placeholder */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-surface-900">Revenue Overview</h3>
              <p className="text-sm text-surface-600">Last 12 months performance</p>
            </div>
            <Button variant="outline" size="sm">
              View Report
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center bg-surface-50 rounded-lg border-2 border-dashed border-surface-200">
            <div className="text-center">
              <svg className="w-16 h-16 text-surface-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-surface-500 font-medium">Chart component will be added</p>
              <p className="text-sm text-surface-400">Using Recharts library</p>
            </div>
          </div>
        </Card>

        {/* Sales Pipeline Placeholder */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-surface-900">Sales Pipeline</h3>
              <p className="text-sm text-surface-600">Current opportunities by stage</p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { stage: "Qualified", count: 12, value: "$45,300", color: "bg-blue-500" },
              { stage: "Proposal", count: 8, value: "$32,100", color: "bg-primary-500" },
              { stage: "Negotiation", count: 5, value: "$28,900", color: "bg-amber-500" },
              { stage: "Closed Won", count: 15, value: "$124,500", color: "bg-primary-600" },
            ].map((stage) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-surface-700">{stage.stage}</span>
                  <span className="text-sm text-surface-600">{stage.count} deals · {stage.value}</span>
                </div>
                <div className="w-full bg-surface-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stage.color}`}
                    style={{ width: `${(stage.count / 40) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-surface-900">Recent Invoices</h3>
            <p className="text-sm text-surface-600">Your latest billing activity</p>
          </div>
          <Button variant="outline" size="sm">
            View All Invoices
          </Button>
        </div>
        <Table
          columns={invoiceColumns}
          data={recentInvoices}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => console.log("Clicked:", row)}
        />
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-surface-900 mb-1">Add Customer</h4>
              <p className="text-sm text-surface-600">Create a new customer record</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-surface-900 mb-1">Create Quote</h4>
              <p className="text-sm text-surface-600">Generate a new quotation</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-surface-900 mb-1">View Reports</h4>
              <p className="text-sm text-surface-600">Access financial reports</p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
