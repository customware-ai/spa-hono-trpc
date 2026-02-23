/**
 * tRPC Client Setup for React
 * 
 * This file sets up the tRPC React Query integration for the frontend.
 * It provides type-safe hooks for calling backend procedures.
 * 
 * Usage in components:
 * ```tsx
 * const { data, isLoading } = trpc.getCustomers.useQuery();
 * const createMutation = trpc.createCustomer.useMutation();
 * ```
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../server/trpc/router";

/**
 * Create typed tRPC React hooks
 * The AppRouter type import provides full end-to-end type safety
 */
export const trpc = createTRPCReact<AppRouter>();
