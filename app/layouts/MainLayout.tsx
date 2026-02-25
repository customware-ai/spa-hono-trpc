import { Fragment } from "react";
import type { ReactElement, ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Moon, Plus, Sun, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Separator } from "../components/ui/Separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/Sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/Breadcrumb";

interface BreadcrumbConfig {
  label: string;
  href?: string;
}

interface HeaderConfig {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbConfig[];
  showCreateAction: boolean;
}

interface MainHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

const navItems = [{ label: "Customers", href: "/", icon: Users }];

/**
 * Resolves page-level header and breadcrumb content from the current route.
 * This centralizes layout metadata so routes only render page bodies.
 */
function getHeaderConfig(pathname: string): HeaderConfig {
  if (pathname === "/customers/new") {
    return {
      title: "New Customer",
      description: "Create a new customer record in local storage.",
      breadcrumbs: [
        { label: "Customers", href: "/" },
        { label: "New Customer" },
      ],
      showCreateAction: false,
    };
  }

  return {
    title: "Customers",
    description: "Manage customer records stored in your browser.",
    breadcrumbs: [{ label: "Customers" }],
    showCreateAction: true,
  };
}

/**
 * Renders the main page header section used by customer pages.
 */
function MainHeader({
  title,
  description,
  actions,
}: MainHeaderProps): ReactElement {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/**
 * Shared application layout route with integrated shell and page header.
 */
export default function MainLayout(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const headerConfig = getHeaderConfig(location.pathname);
  const createCustomerAction = headerConfig.showCreateAction ? (
    <Button variant="default" onClick={() => navigate("/customers/new")}>
      <Plus className="mr-2 h-4 w-4" />
      New Customer
    </Button>
  ) : undefined;

  const toggleTheme = (): void => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="text-sm font-bold">C</span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Customware</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Enterprise
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Sales</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.href === "/"
                          ? location.pathname === "/" ||
                            location.pathname.startsWith("/customers")
                          : location.pathname.startsWith(item.href)
                      }
                      tooltip={item.label}
                    >
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleTheme} tooltip="Toggle theme">
                <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Toggle theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

          {headerConfig.breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {headerConfig.breadcrumbs.map((crumb, index) => (
                  <Fragment key={crumb.href ?? crumb.label}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <MainHeader
            title={headerConfig.title}
            description={headerConfig.description}
            actions={createCustomerAction}
          />
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
