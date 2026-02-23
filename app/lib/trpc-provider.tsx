/**
 * tRPC Provider Component
 * 
 * This component wraps the application with:
 * 1. React Query's QueryClientProvider (for caching and state management)
 * 2. tRPC's Provider (for type-safe API calls)
 * 
 * Must be placed at the root of the application.
 */

import { useState, type ReactNode, type ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./trpc";

interface TRPCProviderProps {
  children: ReactNode;
}

/**
 * Get the tRPC API URL based on environment
 * In development: http://localhost:8080/trpc
 * In production: Uses the same host as the frontend
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Browser: use relative URL
    return "";
  }
  // SSR: this shouldn't happen in CSR mode, but fallback to localhost
  return `http://localhost:${process.env.PORT ?? 8080}`;
}

/**
 * TRPCProvider component
 * Initializes React Query and tRPC clients
 */
export function TRPCProvider({ children }: TRPCProviderProps): ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent automatic refetching on window focus in development
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // Cache data for 5 minutes
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          // Optional: Add headers (auth tokens, etc.)
          // headers() {
          //   return {
          //     authorization: getAuthToken(),
          //   };
          // },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
