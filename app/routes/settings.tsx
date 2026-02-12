import type { ReactElement } from "react";
import { useState } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

export default function SettingsPage(): ReactElement {
  const [currency, setCurrency] = useState("USD");

  return (
    <PageLayout breadcrumbs={[{ label: "Settings" }]}>
      <PageHeader
        title="Settings"
        description="Manage your application preferences and configuration."
      />

      <div className="max-w-4xl space-y-6">
        {/* General Settings */}
        <Card>
          <h3 className="text-lg font-bold text-surface-900 mb-4 tracking-tight text-white">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Company Name</label>
              <Input defaultValue="Demo ERP Corp" placeholder="Enter company name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Default Currency</label>
              <Select
                options={[
                  { label: "USD ($)", value: "USD" },
                  { label: "EUR (€)", value: "EUR" },
                  { label: "GBP (£)", value: "GBP" },
                ]}
                value={currency}
                onChange={setCurrency}
              />
            </div>
          </div>
        </Card>

        {/* User Preferences */}
        <Card>
          <h3 className="text-lg font-bold text-surface-900 mb-4 tracking-tight text-white">User Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Receive weekly summary reports via email.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-200 dark:bg-surface-700 cursor-pointer">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-surface-100 dark:border-surface-800 pt-4">
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Switch between light and dark themes.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 cursor-pointer">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
              </div>
            </div>
          </div>
        </Card>

        {/* Database Info */}
        <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-900/10 dark:border-amber-900/20">
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-4 tracking-tight flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            System Information
          </h3>
          <div className="space-y-2 text-sm text-amber-800 dark:text-amber-500/80">
            <p><span className="font-semibold">Database:</span> SQLite (sql.js)</p>
            <p><span className="font-semibold">Persistence:</span> local database.db</p>
            <p><span className="font-semibold">Environment:</span> Development</p>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </PageLayout>
  );
}
