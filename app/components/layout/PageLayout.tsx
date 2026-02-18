import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router";
import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/Button";

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
  breadcrumbs = [],
}: PageLayoutProps): ReactElement {
  const toggleTheme = (): void => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-sm font-bold">C</span>
              </div>
              <span className="font-semibold">Cohesiv</span>
            </Link>

            {breadcrumbs.length > 0 && (
              <>
                <span className="text-muted-foreground">/</span>
                <nav className="flex items-center gap-1 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <div
                      key={crumb.href || crumb.label}
                      className="flex items-center gap-1"
                    >
                      {index > 0 && (
                        <span className="text-muted-foreground">/</span>
                      )}
                      {crumb.href ? (
                        <Link
                          to={crumb.href}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-foreground">{crumb.label}</span>
                      )}
                    </div>
                  ))}
                </nav>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
