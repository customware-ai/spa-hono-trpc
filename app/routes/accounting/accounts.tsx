/**
 * Chart of Accounts Route
 *
 * Displays the hierarchical account structure.
 * Features:
 * - Tree view showing parent-child relationships
 * - Grouped by account type (Assets, Liabilities, Equity, Revenue, Expenses)
 * - Account balances (calculated from ledger)
 * - Add/edit accounts
 * - Drill down to ledger entries
 */

import type { ReactElement } from "react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getChartOfAccounts } from "../../services/erp";

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  description?: string | null;
}

/**
 * Loader - fetches chart of accounts
 */
export async function loader({ request: _request }: LoaderFunctionArgs): Promise<{
  accounts: Account[];
  error: string | null;
}> {
  const result = await getChartOfAccounts();

  if (result.isErr()) {
    return {
      accounts: [],
      error: result.error.message,
    };
  }

  return {
    accounts: result.value as unknown as Account[],
    error: null,
  };
}

/**
 * Account tree item component
 */
function AccountItem({ account, level = 0 }: {
  account: Account;
  level?: number;
}): ReactElement {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = false; // TODO: Check for child accounts

  return (
    <div>
      <div
        className={`flex items-center justify-between py-3 px-4 hover:bg-surface-50 transition-colors ${
          level > 0 ? "ml-" + (level * 8) : ""
        }`}
        style={{ paddingLeft: `${level * 2 + 1}rem` }}
      >
        <div className="flex items-center gap-3 flex-1">
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-surface-200 rounded transition-colors"
            >
              <svg
                className={`w-4 h-4 text-surface-600 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-surface-600 font-medium">
                {account.account_code}
              </span>
              <span className="font-semibold text-surface-900">{account.account_name}</span>
            </div>
            {account.description && (
              <div className="text-sm text-surface-500 mt-0.5">{account.description}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="px-2 py-1 bg-surface-100 text-surface-700 rounded font-medium capitalize">
              {account.account_type}
            </span>
          </div>
          <div className="text-right min-w-[120px]">
            <span className="font-semibold text-surface-900">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage(): ReactElement {
  const { accounts, error } = useLoaderData<typeof loader>();

  // Group accounts by type
  const accountsByType = accounts.reduce((acc: Record<string, typeof accounts>, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  const accountTypes = [
    { key: "asset", label: "Assets", icon: "💰" },
    { key: "liability", label: "Liabilities", icon: "📊" },
    { key: "equity", label: "Equity", icon: "🏦" },
    { key: "revenue", label: "Revenue", icon: "💵" },
    { key: "expense", label: "Expenses", icon: "💸" },
  ];

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Accounting", href: "/accounting" },
        { label: "Chart of Accounts" },
      ]}
    >
      <PageHeader
        title="Chart of Accounts"
        description="View and manage your account structure and balances."
        actions={
          <Button variant="primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Account
          </Button>
        }
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Account Types */}
      <div className="space-y-6">
        {accountTypes.map((type) => {
          const typeAccounts = accountsByType[type.key] || [];
          if (typeAccounts.length === 0) return null;

          return (
            <Card key={type.key}>
              <div className="border-b border-surface-200 pb-4 mb-4">
                <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                  <span>{type.icon}</span>
                  {type.label}
                  <span className="text-sm font-normal text-surface-500">
                    ({typeAccounts.length} accounts)
                  </span>
                </h3>
              </div>

              <div className="divide-y divide-surface-100">
                {typeAccounts.map((account) => (
                  <AccountItem key={account.id} account={account} level={0} />
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-surface-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No Accounts Found</h3>
            <p className="text-surface-600 mb-4">Run migrations to seed default chart of accounts</p>
            <Button variant="primary">Seed Default Accounts</Button>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
