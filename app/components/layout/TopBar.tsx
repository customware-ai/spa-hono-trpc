import { Link } from "react-router";
import { useState } from "react";
import type { ReactElement } from "react";
import { Search, Bell, ChevronDown, Settings, LogOut, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface TopBarProps {
  breadcrumbs?: Breadcrumb[];
  sidebarCollapsed?: boolean;
}

export function TopBar({ breadcrumbs = [], sidebarCollapsed = false }: TopBarProps): ReactElement {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className={clsx(
      "fixed top-0 right-0 h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 z-30 transition-all duration-300",
      sidebarCollapsed ? "left-16" : "left-64"
    )}>
      <div className="h-full flex items-center justify-between px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.length > 0 ? (
            <>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href || crumb.label} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-surface-400" />
                  )}
                  {crumb.href ? (
                    <Link to={crumb.href} className="text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 font-medium transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-surface-900 dark:text-surface-100 font-semibold">{crumb.label}</span>
                  )}
                </div>
              ))}
            </>
          ) : (
            <span className="text-surface-600 dark:text-surface-400 font-medium">Dashboard</span>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Global Search */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors border border-surface-200 dark:border-surface-600"
            >
              <Search className="w-4 h-4 text-surface-500 dark:text-surface-400" />
              <span className="text-sm text-surface-600 dark:text-surface-400">Search...</span>
              <kbd className="px-2 py-0.5 text-xs bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded text-surface-500 dark:text-surface-400">
                ⌘K
              </kbd>
            </button>

            {searchOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-surface-800 rounded-xl shadow-strong border border-surface-200 dark:border-surface-700 z-50 overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-surface-200 dark:border-surface-700">
                    <input
                      type="text"
                      placeholder="Search customers, invoices, orders..."
                      className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-600 rounded-lg text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <div className="p-2 max-h-96 overflow-y-auto">
                    <div className="px-3 py-2 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide">
                      Recent Searches
                    </div>
                    <div className="text-sm text-surface-500 dark:text-surface-400 px-3 py-8 text-center">
                      No recent searches
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-800 rounded-xl shadow-strong border border-surface-200 dark:border-surface-700 z-50 overflow-hidden animate-scale-in">
                  <div className="p-4 border-b border-surface-200 dark:border-surface-700">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-8 text-center text-sm text-surface-500 dark:text-surface-400">
                      No new notifications
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                CA
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-semibold text-surface-900 dark:text-surface-100">Demo User</div>
                <div className="text-xs text-surface-500 dark:text-surface-400">Sample Account</div>
              </div>
              <ChevronDown className="w-4 h-4 text-surface-400 hidden lg:block" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-surface-800 rounded-xl shadow-strong border border-surface-200 dark:border-surface-700 z-50 overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-surface-200 dark:border-surface-700">
                    <div className="font-medium text-sm text-surface-900 dark:text-surface-100">Demo User</div>
                    <div className="text-xs text-surface-500 dark:text-surface-400">template@example.com</div>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger-light rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
