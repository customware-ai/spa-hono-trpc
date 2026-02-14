import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import clsx from "clsx";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  children: ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function PageLayout({
  children,
  breadcrumbs,
}: PageLayoutProps): ReactElement {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-surface-100/50 to-surface-50 dark:from-surface-950 dark:via-surface-900/50 dark:to-surface-950 transition-colors">
      {/* Subtle Grid Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(120, 113, 108, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 113, 108, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 162, 158, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 162, 158, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <TopBar breadcrumbs={breadcrumbs} sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <main
        className={clsx(
          "relative pt-20 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64",
        )}
      >
        <div className="p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
