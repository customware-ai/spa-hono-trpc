"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { AlertTriangle } from "lucide-react";

import type { Route } from "./+types/root";
import "./app.css";
import { logger } from "./utils/logger";
import { attachGlobalFrontendErrorHandlers, logFrontendError } from "./utils/error-logger";
import { Card, CardContent } from "./components/ui/Card";
import { Button } from "./components/ui/Button";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
  },
];

export function Layout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                  document.documentElement.classList.toggle('dark', e.matches);
                });
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground transition-colors">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * HydrateFallback - Required for SPA mode
 * This is rendered during the initial page load while the app hydrates.
 */
export function HydrateFallback(): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

export default function App(): ReactElement {
  /**
   * @critical
   * @description
   * Attach global frontend error handlers once on app mount.
   * This forwards uncaught window/document errors and unhandled promise
   * rejections to `POST /logs`, which persists logs in `.runtime.logs`.
   * @important
   * Do NOT remove this initializer. Without it, frontend runtime errors
   * are no longer captured for the shared log pipeline.
   */
  useEffect(() => {
    const detach = attachGlobalFrontendErrorHandlers({ endpoint: "/logs" });
    return detach;
  }, []);

  return <Outlet />;
}

export function ErrorBoundary({
  error,
}: Route.ErrorBoundaryProps): ReactElement {
  // Log error for monitoring
  logger.error("Application error", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    isRouteError: isRouteErrorResponse(error),
  });
  logFrontendError(
    error instanceof Error ? error.message : "Route error",
    {
      type: "route-error",
      status: isRouteErrorResponse(error) ? error.status : undefined,
      statusText: isRouteErrorResponse(error) ? error.statusText : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    },
    { endpoint: "/logs" },
  );

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-6xl font-bold text-destructive mb-4">
              {error.status}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {error.status === 404 ? "Page Not Found" : "Something went wrong"}
            </p>
            <p className="text-muted-foreground">
              {error.statusText || "The requested page could not be found."}
            </p>
            <Button asChild className="mt-6">
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg text-center">
        <CardContent className="pt-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Application Error
          </h1>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. Please try again.
          </p>
          {import.meta.env.DEV && error instanceof Error && (
            <pre className="mt-4 p-4 bg-muted rounded-lg text-left text-xs overflow-auto max-h-48 text-muted-foreground">
              {error.stack}
            </pre>
          )}
          <Button asChild className="mt-6">
            <a href="/">Go Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
