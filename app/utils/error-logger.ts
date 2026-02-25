"use client";

import { logger } from "./logger";

type FrontendLogLevel = "debug" | "info" | "warn" | "error";

interface ErrorLoggerOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

interface ErrorContext {
  eventType: "window-error" | "document-error" | "unhandled-rejection";
  filename?: string;
  line?: number;
  column?: number;
  target?: string;
  stack?: string;
  reason?: unknown;
}

interface FrontendLogPayload {
  source: "app";
  level: FrontendLogLevel;
  message: string;
  timestamp: string;
  page_url: string;
  context: Record<string, unknown>;
}

const defaultLoggerOptions: Required<Pick<ErrorLoggerOptions, "endpoint">> = {
  endpoint: "/logs",
};

let attachCount = 0;
let windowErrorHandler: ((event: ErrorEvent) => void) | null = null;
let documentErrorHandler: ((event: ErrorEvent) => void) | null = null;
let rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

function normalizeErrorContext(
  event: ErrorEvent,
  eventType: ErrorContext["eventType"],
): ErrorContext {
  const eventTarget = event.target;
  const targetNodeName =
    eventTarget instanceof Element ? eventTarget.nodeName : undefined;

  return {
    eventType,
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
    target: targetNodeName,
    stack: event.error?.stack,
  };
}

function normalizeRejectionContext(reason: unknown): ErrorContext {
  if (reason instanceof Error) {
    return {
      eventType: "unhandled-rejection",
      reason: {
        name: reason.name,
        message: reason.message,
        stack: reason.stack,
      },
    };
  }

  return {
    eventType: "unhandled-rejection",
    reason,
  };
}

function buildLogPayload(
  message: string,
  context: ErrorContext,
): FrontendLogPayload {
  return {
    source: "app",
    level: "error",
    message,
    timestamp: new Date().toISOString(),
    page_url: window.location.href,
    context: context as unknown as Record<string, unknown>,
  };
}

function formatContextMessage(
  message: string,
  context: unknown,
): string {
  return `${message} ${JSON.stringify(context)}`;
}

/**
 * Sends a single app error payload to backend logging endpoint.
 */
export function sendFrontendLog(
  payload: FrontendLogPayload,
  fetchImpl: typeof fetch,
  endpoint: string,
): void {
  void fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch((error: unknown) => {
    logger.warn("Failed to forward frontend log.", {
      error: error instanceof Error ? error.message : "Unknown fetch error",
      logContext: formatContextMessage(payload.message, {
        eventType: "window-error",
        reason: {
          message: payload.message,
          context: payload.context,
        },
      } as ErrorContext),
    });
  });
}

/**
 * Converts untyped error input into a typed payload and dispatches to backend.
 */
export function logFrontendError(
  message: string,
  context: Record<string, unknown>,
  options?: ErrorLoggerOptions,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedContext: ErrorContext = {
    eventType: "window-error",
    reason: context,
  };

  const payload = buildLogPayload(message, normalizedContext);
  const finalOptions = {
    endpoint: options?.endpoint ?? defaultLoggerOptions.endpoint,
    fetchImpl: options?.fetchImpl ?? window.fetch,
  };

  sendFrontendLog(payload, finalOptions.fetchImpl, finalOptions.endpoint);
}

/**
 * Attach browser error handlers to window + document and async rejection hook.
 * Returns a cleanup function for predictable listener lifecycle.
 */
export function attachGlobalFrontendErrorHandlers(
  options: ErrorLoggerOptions = {},
): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const finalOptions = {
    endpoint: options.endpoint ?? defaultLoggerOptions.endpoint,
    fetchImpl: options.fetchImpl ?? window.fetch,
  };

  attachCount += 1;
  if (windowErrorHandler !== null && documentErrorHandler !== null) {
    const trackedWindowHandler = windowErrorHandler;
    const trackedDocumentHandler = documentErrorHandler;

    return () => {
      attachCount -= 1;
      if (attachCount > 0) {
        return;
      }

      if (trackedWindowHandler !== null) {
        window.removeEventListener("error", trackedWindowHandler);
      }

      if (trackedDocumentHandler !== null) {
        document.removeEventListener("error", trackedDocumentHandler, true);
      }

      if (rejectionHandler !== null) {
        window.removeEventListener("unhandledrejection", rejectionHandler);
      }

      windowErrorHandler = null;
      documentErrorHandler = null;
      rejectionHandler = null;
    };
  }

  windowErrorHandler = (event: ErrorEvent): void => {
    const context = normalizeErrorContext(event, "window-error");
    const message =
      event.message || `Window error: ${context.filename ?? "unknown source"}`;
    sendFrontendLog(
      buildLogPayload(message, context),
      finalOptions.fetchImpl,
      finalOptions.endpoint,
    );
  };

  documentErrorHandler = (event: ErrorEvent): void => {
    if (event.target === window) {
      return;
    }

    const context = normalizeErrorContext(event, "document-error");
    const message =
      event.message || `Document error: ${context.target ?? "unknown target"}`;
    sendFrontendLog(
      buildLogPayload(message, context),
      finalOptions.fetchImpl,
      finalOptions.endpoint,
    );
  };

  rejectionHandler = (event: PromiseRejectionEvent): void => {
    const context = normalizeRejectionContext(event.reason);
    const message =
      event.reason instanceof Error
        ? event.reason.message
        : `Unhandled promise rejection: ${String(event.reason)}`;

    sendFrontendLog(
      buildLogPayload(message, context),
      finalOptions.fetchImpl,
      finalOptions.endpoint,
    );
  };

  if (
    windowErrorHandler !== null &&
    documentErrorHandler !== null &&
    rejectionHandler !== null
  ) {
    window.addEventListener("error", windowErrorHandler);
    document.addEventListener("error", documentErrorHandler, true);
    window.addEventListener("unhandledrejection", rejectionHandler);
  }

  return () => {
    attachCount -= 1;
    if (attachCount > 0) {
      return;
    }

    if (windowErrorHandler !== null) {
      window.removeEventListener("error", windowErrorHandler);
    }

    if (documentErrorHandler !== null) {
      document.removeEventListener("error", documentErrorHandler, true);
    }

    if (rejectionHandler !== null) {
      window.removeEventListener("unhandledrejection", rejectionHandler);
    }
    windowErrorHandler = null;
    documentErrorHandler = null;
    rejectionHandler = null;
  };
}
