import type { ReactElement } from "react";
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
import { Card } from "./components/ui/Card";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }): ReactElement {
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
      <body className="bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App(): ReactElement {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): ReactElement {
  // Log error for monitoring
  logger.error("Application error", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    isRouteError: isRouteErrorResponse(error),
  });

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
        <Card className="max-w-md text-center">
          <h1 className="text-6xl font-bold text-danger mb-4">{error.status}</h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 mb-2">
            {error.status === 404 ? "Page Not Found" : "Something went wrong"}
          </p>
          <p className="text-surface-500 dark:text-surface-400">
            {error.statusText || "The requested page could not be found."}
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
      <Card className="max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-light flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-danger" />
        </div>
        <h1 className="text-2xl font-bold text-danger mb-2">Application Error</h1>
        <p className="text-surface-600 dark:text-surface-400 mb-4">
          An unexpected error occurred. Please try again.
        </p>
        {import.meta.env.DEV && error instanceof Error && (
          <pre className="mt-4 p-4 bg-surface-100 dark:bg-surface-800 rounded-lg text-left text-xs overflow-auto max-h-48 text-surface-700 dark:text-surface-300">
            {error.stack}
          </pre>
        )}
        <a
          href="/"
          className="inline-block mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go Home
        </a>
      </Card>
    </div>
  );
}
