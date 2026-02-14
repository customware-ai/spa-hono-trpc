import { Link, useLocation } from "react-router";
import type { ReactElement } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  ChevronLeft,
  Settings,
} from "lucide-react";
import clsx from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: ReactElement;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/Home",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Sales & CRM",
    items: [
      {
        label: "Customers",
        href: "/sales/customers",
        icon: <Users className="w-5 h-5" />,
      },
      {
        label: "Leads",
        href: "/sales/leads",
        icon: <UserPlus className="w-5 h-5" />,
      },
      {
        label: "Quotes",
        href: "/sales/quotes",
        icon: <FileText className="w-5 h-5" />,
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
}: SidebarProps): ReactElement {
  const location = useLocation();

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 bg-gradient-to-b from-surface-900 to-surface-950 border-r border-surface-800/50 transition-all duration-300 ease-out z-40",
        "h-screen",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-800/50">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Demo ERP
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={clsx(
                "w-5 h-5 text-surface-400 transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                          isActive
                            ? "bg-primary-500/10 text-primary-400"
                            : "text-surface-300 hover:bg-surface-800 hover:text-white",
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
                        )}
                        <span className={clsx(isActive && "text-primary-500")}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="font-medium text-sm">
                            {item.label}
                          </span>
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-surface-800 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg z-50">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-800/50">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-300 hover:bg-surface-800 hover:text-white transition-all group"
          >
            <Settings className="w-5 h-5" />
            {!collapsed && (
              <span className="font-medium text-sm">Settings</span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
