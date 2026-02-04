/**
 * Financial Reports Route
 *
 * Generates and displays financial reports:
 * - Balance Sheet (Assets = Liabilities + Equity)
 * - Income Statement (Revenue - Expenses = Net Income)
 * - Cash Flow Statement
 * - Aged Receivables Report
 *
 * Features:
 * - Select report type
 * - Choose date range
 * - Generate report
 * - Export to PDF/CSV
 * - Print-friendly view
 */

import type { ReactElement } from "react";
import { useState } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";

/**
 * Report type definitions
 */
const reportTypes = [
  {
    value: "balance_sheet",
    label: "Balance Sheet",
    description: "Assets, Liabilities, and Equity at a point in time",
  },
  {
    value: "income_statement",
    label: "Income Statement",
    description: "Revenue and Expenses over a period",
  },
  {
    value: "cash_flow",
    label: "Cash Flow Statement",
    description: "Cash inflows and outflows",
  },
  {
    value: "aged_receivables",
    label: "Aged Receivables",
    description: "Outstanding invoices by age",
  },
];

export default function ReportsPage(): ReactElement {
  const [selectedReport, setSelectedReport] = useState("balance_sheet");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = (): void => {
    // TODO: Implement report generation
    setReportGenerated(true);
  };

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Accounting", href: "/accounting" },
        { label: "Reports" },
      ]}
    >
      <PageHeader
        title="Financial Reports"
        description="Generate and view financial statements and analytics."
      />

      {/* Report Selection */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Generate Report</h3>

        <div className="space-y-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Report Type
            </label>
            <Select
              options={reportTypes.map((r) => ({
                label: r.label,
                value: r.value,
              }))}
              value={selectedReport}
              onChange={setSelectedReport}
            />
            <p className="mt-1 text-sm text-surface-600">
              {reportTypes.find((r) => r.value === selectedReport)?.description}
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-2 pt-4 border-t border-surface-200">
            <Button variant="outline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </Button>
            <Button variant="outline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </Button>
            <Button variant="primary" onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Display */}
      {reportGenerated ? (
        <Card>
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-primary-200 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-xl font-bold text-surface-900 mb-2">
              {reportTypes.find((r) => r.value === selectedReport)?.label}
            </h3>
            <p className="text-surface-600 mb-6">
              {startDate && endDate
                ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                : "No date range selected"}
            </p>
            <div className="max-w-2xl mx-auto text-left space-y-6">
              <div>
                <h4 className="font-semibold text-surface-900 mb-2">Report Data</h4>
                <p className="text-surface-600">
                  Report generation functionality will be implemented here.
                  This will display formatted financial data based on ledger entries.
                </p>
              </div>

              {selectedReport === "balance_sheet" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-surface-900">Assets</h5>
                    <div className="ml-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Current Assets</span>
                        <span className="font-mono">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fixed Assets</span>
                        <span className="font-mono">$0.00</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-surface-900">Liabilities</h5>
                    <div className="ml-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Current Liabilities</span>
                        <span className="font-mono">$0.00</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Equity</span>
                      <span className="font-mono">$0.00</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === "income_statement" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-surface-900">Revenue</h5>
                    <div className="ml-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Sales Revenue</span>
                        <span className="font-mono">$0.00</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-surface-900">Expenses</h5>
                    <div className="ml-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Operating Expenses</span>
                        <span className="font-mono">$0.00</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Net Income</span>
                      <span className="font-mono">$0.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-surface-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No Report Generated</h3>
            <p className="text-surface-600">Select report parameters and click Generate Report</p>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
