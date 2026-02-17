import type { ReactElement, ReactNode } from "react";
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
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors">
      <TopBar breadcrumbs={breadcrumbs} />

      {/* Main Content Area */}
      <main className="relative pt-24 pb-12 min-h-screen max-w-7xl mx-auto px-6">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
