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
import type { Route } from "./+types/leads";
import { useLoaderData } from "react-router";
import { LayoutGrid, List } from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { getDemoLeads } from "../../services/erp";

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
  const leads = await getDemoLeads();

  // Group leads by status
  const leadsByStatus = {
    new: leads.filter(l => l.stage === "new"),
    contacted: leads.filter(l => l.stage === "contacted"),
    qualified: leads.filter(l => l.stage === "qualified"),
    proposal: leads.filter(l => l.stage === "proposal"),
    won: leads.filter(l => l.stage === "won"),
    lost: leads.filter(l => l.stage === "negotiation"), // Using negotiation as lost for demo
  };

  return { leadsByStatus };
}

/**
 * Client loader - enables fast client-side navigation
 */
export async function clientLoader({
  serverLoader,
}: Route.ClientLoaderArgs): Promise<{
  leadsByStatus: {
    new: Lead[];
    contacted: Lead[];
    qualified: Lead[];
    proposal: Lead[];
    won: Lead[];
    lost: Lead[];
  };
}> {
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
        { label: "Sales & CRM", href: "/sales" },
        { label: "Leads" },
      ]}
    >
      <PageHeader
        title="Leads (Demo Data)"
        description="Manage your sales pipeline and track lead progress."
      />
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"].map((title) => (
            <div key={title} className="flex-1 min-w-[300px]">
              <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-surface-300" />
                  <span className="font-semibold text-surface-400">{title}</span>
                </div>
                <CardSkeleton count={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
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
      <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-4">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
            <span className="px-2 py-0.5 text-xs font-semibold bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-full">
              {count}
            </span>
          </div>
        </div>

        {/* Lead Cards */}
        <div className="space-y-3">
          {leads.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-surface-500 dark:text-surface-400">No leads in this stage</p>
            </div>
          ) : (
            leads.map((lead) => (
              <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">{lead.company_name}</h4>
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">{lead.contact_name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    ${lead.estimated_value.toLocaleString()}
                  </span>
                  <span className="text-xs text-surface-500 dark:text-surface-400">{lead.probability}%</span>
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
        title="Leads (Demo Data)"
        description="Manage your sales pipeline and track lead progress."
        actions={
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-sm"
                  : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-sm"
                  : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
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
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Pipeline Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {columns.map((column) => {
            const count = leadsByStatus[column.key as keyof typeof leadsByStatus]?.length || 0;
            return (
              <div key={column.key} className="text-center">
                <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{count}</div>
                <div className="text-sm text-surface-600 dark:text-surface-400">{column.title}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </PageLayout>
  );
}
