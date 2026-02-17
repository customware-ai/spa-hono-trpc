import { Link } from "react-router";
import type { ReactElement } from "react";
import { Moon, Sun } from "lucide-react";

interface TopBarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function TopBar({ breadcrumbs = [] }: TopBarProps): ReactElement {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800 z-30 transition-colors">
      <div className="h-full flex items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white dark:text-black font-bold text-sm">
                C
              </span>
            </div>
            <span className="font-bold text-lg tracking-tight text-surface-900 dark:text-surface-100">
              Customware
            </span>
          </Link>

          {/* Divider */}
          {breadcrumbs.length > 0 && (
            <div className="h-6 w-px bg-surface-200 dark:bg-surface-800 mx-2" />
          )}

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div
                key={crumb.href || crumb.label}
                className="flex items-center gap-2"
              >
                {index > 0 && (
                  <span className="text-surface-300 dark:text-surface-600">
                    /
                  </span>
                )}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-surface-900 dark:text-surface-100">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => document.documentElement.classList.toggle("dark")}
            className="p-2 text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="w-5 h-5 hidden dark:block" />
            <Moon className="w-5 h-5 block dark:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
