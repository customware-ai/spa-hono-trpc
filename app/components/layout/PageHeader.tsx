import type { ReactElement, ReactNode } from "react";

interface Tab {
  label: string;
  value: string;
  count?: number;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export function PageHeader({
  title,
  description,
  actions,
  tabs,
  activeTab,
  onTabChange,
}: PageHeaderProps): ReactElement {
  return (
    <div className="mb-6">
      {/* Title and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight mb-1">
            {title}
          </h1>
          {description && (
            <p className="text-surface-600 text-base max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="border-b border-surface-200">
          <nav className="flex gap-8" role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange?.(tab.value)}
                  className={`relative pb-4 px-1 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-primary-600"
                      : "text-surface-600 hover:text-surface-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        isActive
                          ? "bg-primary-100 text-primary-700"
                          : "bg-surface-100 text-surface-600"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
