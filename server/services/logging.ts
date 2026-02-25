import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { err, ok, type Result } from "neverthrow";
import {
  FrontendLogSchema,
  type LogEntry,
  type LogLevel,
  type LogSource,
  type ServerLogPayload,
  ServerLogSchema,
} from "../contracts/logging.js";

/**
 * Maximum number of lines stored for the runtime log file.
 */
export const MAX_LOG_LINES = 100;

/**
 * Backend logger persistence error contract.
 */
export type LogPersistError =
  | {
      type: "LOG_VALIDATION_ERROR";
      message: string;
    }
  | {
      type: "LOG_WRITE_ERROR";
      message: string;
      originalError?: Error;
    };

/**
 * Prefixes written in each log line.
 */
const LOG_PREFIX: Record<LogSource, "app logs" | "server logs"> = {
  app: "app logs",
  server: "server logs",
};

/**
 * Default runtime log file in the project root.
 */
const DEFAULT_RUNTIME_LOG_FILE = ".runtime.logs";

/**
 * Resolve full log file path and ensure parent directory exists.
 */
function getLogFilePath(): string {
  const logFilePath = path.resolve(process.cwd(), DEFAULT_RUNTIME_LOG_FILE);
  const directory = path.dirname(logFilePath);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  return logFilePath;
}

/**
 * Exposed for test assertions and operational tooling.
 */
export function getLogFilePathForSource(): string {
  return getLogFilePath();
}

/**
 * Converts optional value into a serializable context record.
 */
function normalizeContext(value: unknown): Record<string, unknown> {
  if (value === undefined || value === null) {
    return {};
  }

  if (typeof value === "object" && value.constructor === Object) {
    return value as Record<string, unknown>;
  }

  return { value };
}

/**
 * Sanitizes invalid input and ensures valid timestamp.
 */
function normalizeTimestamp(timestamp?: string): string {
  return timestamp !== undefined && Number.isNaN(Date.parse(timestamp)) === false
    ? timestamp
    : new Date().toISOString();
}

/**
 * Returns human-readable single-line format with source prefix.
 */
function formatLogLine(entry: LogEntry & { timestamp: string }): string {
  const safeContext =
    entry.context === undefined || Object.keys(entry.context).length === 0
      ? ""
      : ` ${JSON.stringify(entry.context)}`;

  return `[${entry.timestamp}] [${LOG_PREFIX[entry.source]}] [${entry.level.toUpperCase()}] ${entry.message}${safeContext}`;
}

/**
 * Writes line and trims file to max row count.
 */
function persistLine(
  filePath: string,
  line: string,
): Result<void, LogPersistError> {
  try {
    const priorContent = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
    const priorLines = priorContent
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const nextLines = [...priorLines, line].slice(-MAX_LOG_LINES);
    writeFileSync(filePath, `${nextLines.join("\n")}\n`);
    return ok(undefined);
  } catch (error) {
    return err({
      type: "LOG_WRITE_ERROR",
      message: "Unable to write log file.",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

/**
 * Persist generic log entry after normalizing timestamp and context.
 */
function persistLogEntry(
  entry: Omit<LogEntry, "timestamp"> & { timestamp?: string },
): Result<void, LogPersistError> {
  const normalized: Omit<LogEntry, "timestamp"> & { timestamp: string } = {
    ...entry,
    timestamp: normalizeTimestamp(entry.timestamp),
    context: normalizeContext(entry.context),
  };

  const filePath = getLogFilePath();
  const line = formatLogLine(normalized);

  return persistLine(filePath, line);
}

/**
 * Persist logs produced by frontend caller.
 */
export function logFrontendPayload(input: unknown): Result<void, LogPersistError> {
  const parsed = FrontendLogSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      type: "LOG_VALIDATION_ERROR",
      message: "Invalid frontend log payload.",
    });
  }

  return persistLogEntry(parsed.data);
}

/**
 * Persist logs produced by backend services and handlers.
 */
export function logServerPayload(
  input: ServerLogPayload,
): Result<void, LogPersistError> {
  const parsed = ServerLogSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      type: "LOG_VALIDATION_ERROR",
      message: "Invalid server log payload.",
    });
  }

  return persistLogEntry(parsed.data);
}

/**
 * Normalizes unknown process-level exceptions for server log shape.
 */
function normalizeThrowable(error: unknown): ServerLogPayload {
  if (error instanceof Error) {
    return {
      source: "server",
      level: "error",
      message: error.message,
      context: {
        name: error.name,
        stack: error.stack,
      },
      page_url: "",
    };
  }

  return {
    source: "server",
    level: "error",
    message: `Unhandled error: ${String(error)}`,
    context: { value: String(error) },
    page_url: "",
  };
}

let processErrorHandlersInstalled = false;

/**
 * Captures process-level exceptions and rejections.
 */
export function installProcessErrorHandlers(): void {
  if (processErrorHandlersInstalled) {
    return;
  }

  processErrorHandlersInstalled = true;

  process.on("unhandledRejection", (reason) => {
    void logServerPayload(normalizeThrowable(reason));
  });

  process.on("uncaughtException", (error) => {
    void logServerPayload(normalizeThrowable(error));
  });
}

/**
 * Optional helper for explicitly logging server events.
 */
export function logServerEvent(
  level: LogLevel,
  message: string,
  context: Record<string, unknown> = {},
  pageUrl: string = "",
): void {
  void logServerPayload({
    source: "server",
    level,
    message,
    context: normalizeContext(context),
    page_url: pageUrl,
  });
}
