/**
 * tRPC Initialization
 * 
 * This file initializes tRPC with type-safe context and procedures.
 * The router and procedure exports are used throughout the server.
 */

import { initTRPC } from "@trpc/server";

/**
 * Initialize tRPC instance with default configuration.
 * No context needed for this simple setup.
 */
const t = initTRPC.create();

/**
 * Export router builder - used to define API routes
 */
export const router = t.router;

/**
 * Export procedure builder - used to define API endpoints
 */
export const procedure = t.procedure;
