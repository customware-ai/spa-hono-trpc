/**
 * Leads Kanban Board Route
 *
 * Displays leads in a kanban board organized by status:
 * - New: Newly acquired leads
 * - Contacted: Initial contact made
 * - Qualified: Qualified as potential customer
 * - Proposal: Proposal sent
 * - Won: Converted to customer
 * - Lost: Did not convert
 *
 * Features:
 * - Drag and drop to change status
 * - Quick lead creation
 * - Lead detail modal
 * - Convert to customer action
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";

interface Lead {
  id: number;
  company_name: string;
  contact_name: string;
  estimated_value: number;
  probability: number;
}

/**
 * Loader - will fetch leads grouped by status
 */
export async function loader({ request: _request }: LoaderFunctionArgs): Promise<{
  leadsByStatus: {
    new: Lead[];
    contacted: Lead[];
    qualified: Lead[];
    proposal: Lead[];
    won: Lead[];
    lost: Lead[];
  };
}> {
  // TODO: Implement getLeads function in erp service
  // For now, return mock data structure
  return {
    leadsByStatus: {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      won: [],
      lost: [],
    },
  };
}

/**
 * Kanban column component
 */
function KanbanColumn({
  title,
  status: _status,
  count,
  leads,
  color,
}: {
  title: string;
  status: string;
  count: number;
  leads: Lead[];
  color: string;
}): ReactElement {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="bg-surface-50 rounded-lg p-4">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <h3 className="font-semibold text-surface-900">{title}</h3>
            <span className="px-2 py-0.5 text-xs font-semibold bg-surface-200 text-surface-700 rounded-full">
              {count}
            </span>
          </div>
          <button className="p-1 hover:bg-surface-200 rounded">
            <svg className="w-4 h-4 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Lead Cards */}
        <div className="space-y-3">
          {leads.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-surface-500">No leads in this stage</p>
            </div>
          ) : (
            leads.map((lead) => (
              <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-surface-900 mb-1">{lead.company_name}</h4>
                <p className="text-sm text-surface-600 mb-2">{lead.contact_name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary-600">
                    ${lead.estimated_value.toLocaleString()}
                  </span>
                  <span className="text-xs text-surface-500">{lead.probability}%</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage(): ReactElement {
  const { leadsByStatus } = useLoaderData<typeof loader>();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Define kanban columns
  const columns = [
    { key: "new", title: "New", color: "bg-blue-500" },
    { key: "contacted", title: "Contacted", color: "bg-purple-500" },
    { key: "qualified", title: "Qualified", color: "bg-primary-500" },
    { key: "proposal", title: "Proposal", color: "bg-amber-500" },
    { key: "won", title: "Won", color: "bg-primary-600" },
    { key: "lost", title: "Lost", color: "bg-red-500" },
  ];

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Sales & CRM", href: "/sales" },
        { label: "Leads" },
      ]}
    >
      <PageHeader
        title="Leads"
        description="Manage your sales pipeline and track lead progress."
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === "kanban"
                    ? "bg-white text-surface-900 shadow-sm"
                    : "text-surface-600 hover:text-surface-900"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-surface-900 shadow-sm"
                    : "text-surface-600 hover:text-surface-900"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            <Button variant="primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Lead
            </Button>
          </div>
        }
      />

      {viewMode === "kanban" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {columns.map((column) => (
              <KanbanColumn
                key={column.key}
                title={column.title}
                status={column.key}
                count={leadsByStatus[column.key as keyof typeof leadsByStatus]?.length || 0}
                leads={leadsByStatus[column.key as keyof typeof leadsByStatus] || []}
                color={column.color}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="List view coming soon"
          description="Switch to kanban view to see your leads"
          action={
            <Button variant="primary" onClick={() => setViewMode("kanban")}>
              View Kanban
            </Button>
          }
        />
      )}

      {/* Pipeline Summary */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Pipeline Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {columns.map((column) => {
            const count = leadsByStatus[column.key as keyof typeof leadsByStatus]?.length || 0;
            return (
              <div key={column.key} className="text-center">
                <div className="text-2xl font-bold text-surface-900">{count}</div>
                <div className="text-sm text-surface-600">{column.title}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </PageLayout>
  );
}
