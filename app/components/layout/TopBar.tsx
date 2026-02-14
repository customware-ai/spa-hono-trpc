import { Link } from "react-router";
import { useState } from "react";
import type { ReactElement } from "react";
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
                    <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
              <svg className="w-4 h-4 text-surface-500 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
              <svg className="w-5 h-5 text-surface-600 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
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
              <svg className="w-4 h-4 text-surface-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger-light rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
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
