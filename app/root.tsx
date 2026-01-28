import type { ReactElement } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

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
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
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
      </head>
      <body>
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
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
        <Card className="max-w-md text-center">
          <h1 className="text-6xl font-bold text-danger mb-4">{error.status}</h1>
          <p className="text-lg text-surface-600 mb-2">
            {error.status === 404 ? "Page Not Found" : "Something went wrong"}
          </p>
          <p className="text-surface-500">
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
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <Card className="max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-light flex items-center justify-center">
          <svg
            className="w-8 h-8 text-danger"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-danger mb-2">Application Error</h1>
        <p className="text-surface-600 mb-4">
          An unexpected error occurred. Please try again.
        </p>
        {import.meta.env.DEV && error instanceof Error && (
          <pre className="mt-4 p-4 bg-surface-100 rounded-lg text-left text-xs overflow-auto max-h-48 text-surface-700">
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
