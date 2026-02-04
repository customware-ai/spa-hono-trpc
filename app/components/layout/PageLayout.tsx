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

export function PageLayout({ children, breadcrumbs }: PageLayoutProps): ReactElement {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <TopBar breadcrumbs={breadcrumbs} sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <main className={clsx(
        "pt-16 min-h-screen transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
