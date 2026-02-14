import type { ReactElement } from "react";
import { useState } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Link } from "react-router";

export default function SettingsPage(): ReactElement {
  const [currency, setCurrency] = useState("USD");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode function
  const toggleDarkMode = (): void => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // Update DOM
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Initialize state based on current document class on mount
  // In a real app, this would use a context or effect
  useState(() => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  });

  return (
    <PageLayout breadcrumbs={[{ label: "Settings" }]}>
      <PageHeader
        title="Settings"
        description="Manage your application preferences and configuration."
      />

      <div className="max-w-4xl space-y-6">
        {/* General Settings */}
        <Card>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 tracking-tight">
            General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Company Name
              </label>
              <Input
                defaultValue="Demo ERP Corp"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Default Currency
              </label>
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
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 tracking-tight">
            User Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Receive weekly summary reports via email.
                </p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-200 dark:bg-surface-700 cursor-pointer">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-surface-100 dark:border-surface-800 pt-4">
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">
                  Dark Mode
                </p>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Switch between light and dark themes.
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isDarkMode ? "bg-primary-600" : "bg-surface-200 dark:bg-surface-700"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/">
            <Button variant="outline">Cancel</Button>
          </Link>

          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </PageLayout>
  );
}
