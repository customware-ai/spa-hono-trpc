import type { ReactElement, ReactNode } from "react";

interface Tab {
  label: string;
  value: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: number | string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  variant?: "default" | "pills";
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
}: TabsProps): ReactElement {
  const activeTabContent = tabs.find((tab) => tab.value === activeTab)?.content;

  if (variant === "pills") {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-surface-100 rounded-lg">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-white text-surface-900 shadow-sm"
                    : "text-surface-600 hover:text-surface-900"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      isActive
                        ? "bg-primary-100 text-primary-700"
                        : "bg-surface-200 text-surface-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="animate-fade-in">{activeTabContent}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200">
        <nav className="flex gap-8" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.value)}
                className={`relative flex items-center gap-2 pb-4 px-1 text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-primary-600"
                    : "text-surface-600 hover:text-surface-900"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      isActive
                        ? "bg-primary-100 text-primary-700"
                        : "bg-surface-100 text-surface-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="animate-fade-in">{activeTabContent}</div>
    </div>
  );
}
