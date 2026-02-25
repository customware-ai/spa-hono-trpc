import { z } from "zod";

/**
 * Shared log levels used for both frontend- and backend-originated logs.
 */
export const LogLevelSchema = z.enum(["debug", "info", "warn", "error"]);

/**
 * Identifies which environment produced the log line.
 */
export const LogSourceSchema = z.enum(["app", "server"]);

/**
 * Base payload accepted by the backend logger.
 */
const BaseLogEntrySchema = z.object({
  source: LogSourceSchema,
  level: LogLevelSchema.default("error"),
  message: z.string().trim().min(1),
  timestamp: z.string().datetime({ offset: true }).optional(),
  page_url: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Frontend logs are explicitly marked with `app` source.
 */
export const FrontendLogSchema = BaseLogEntrySchema.extend({
  source: z.literal("app"),
});

/**
 * Server logs are explicitly marked with `server` source.
 */
export const ServerLogSchema = BaseLogEntrySchema.extend({
  source: z.literal("server"),
});

/**
 * Full entry schema for all persisted logs.
 */
export const LogEntrySchema = z.discriminatedUnion("source", [
  FrontendLogSchema,
  ServerLogSchema,
]);

export type LogLevel = z.infer<typeof LogLevelSchema>;
export type LogSource = z.infer<typeof LogSourceSchema>;
export type FrontendLogPayload = z.infer<typeof FrontendLogSchema>;
export type ServerLogPayload = z.infer<typeof ServerLogSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
