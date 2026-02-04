import type { ReactElement, ReactNode } from "react";
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
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <TopBar breadcrumbs={breadcrumbs} />

      {/* Main Content Area */}
      <main className="ml-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
