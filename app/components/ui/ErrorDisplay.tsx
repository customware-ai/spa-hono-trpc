/**
 * ErrorDisplay Component
 *
 * A reusable component for displaying user-friendly error messages.
 * Follows AGENTS.md UX Requirements for error handling.
 *
 * Features:
 * - Multiple variants: page (full-page), inline (banner), toast (notification)
 * - Maps error types to user-friendly messages
 * - Supports retry actions for recoverable errors
 * - Consistent styling across the application
 *
 * @module components/ui/ErrorDisplay
 */

import type { ReactElement, ReactNode } from "react";
import { AlertCircle, RefreshCw, ArrowLeft, X } from "lucide-react";
import { Button } from "./Button";

/**
 * Error type definitions for consistent error handling
 */
export type ErrorType =
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "VALIDATION_ERROR"
  | "PERMISSION_DENIED"
  | "DATABASE_ERROR"
  | "UNKNOWN";

/**
 * Error object structure
 */
export interface ErrorInfo {
  type?: ErrorType;
  message: string;
}

/**
 * Props for the ErrorDisplay component
 */
export interface ErrorDisplayProps {
  /** Error information to display */
  error: ErrorInfo;
  /** Display variant */
  variant?: "page" | "inline" | "toast";
  /** Callback for retry action */
  onRetry?: () => void;
  /** Callback for dismiss action (inline/toast only) */
  onDismiss?: () => void;
  /** Callback for go back action (page only) */
  onGoBack?: () => void;
  /** Custom action button */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Map of error types to user-friendly messages
 */
const ERROR_MESSAGES: Record<
  ErrorType,
  { title: string; description: string; action?: string }
> = {
  NETWORK_ERROR: {
    title: "Connection Problem",
    description: "Please check your internet connection and try again.",
    action: "Retry",
  },
  NOT_FOUND: {
    title: "Not Found",
    description: "The requested item doesn't exist or was removed.",
    action: "Go Back",
  },
  SERVER_ERROR: {
    title: "Something Went Wrong",
    description: "We're experiencing technical difficulties. Please try again later.",
    action: "Try Again",
  },
  VALIDATION_ERROR: {
    title: "Invalid Input",
    description: "Please check your input and try again.",
    action: "Fix",
  },
  PERMISSION_DENIED: {
    title: "Access Denied",
    description: "You don't have permission to perform this action.",
    action: "Go Back",
  },
  DATABASE_ERROR: {
    title: "Database Error",
    description: "There was an error accessing the database. Please try again.",
    action: "Retry",
  },
  UNKNOWN: {
    title: "Oops!",
    description: "Something unexpected happened. Please try again.",
    action: "Retry",
  },
};

/**
 * Get user-friendly error message from error type
 */
export function getUserFriendlyError(errorType?: ErrorType): {
  title: string;
  description: string;
  action?: string;
} {
  return ERROR_MESSAGES[errorType || "UNKNOWN"] || ERROR_MESSAGES.UNKNOWN;
}

/**
 * ErrorDisplay component for showing user-friendly error messages
 *
 * @example
 * // Page variant (full-page centered error)
 * <ErrorDisplay
 *   error={{ type: "NOT_FOUND", message: "Customer not found" }}
 *   variant="page"
 *   onGoBack={() => navigate(-1)}
 * />
 *
 * @example
 * // Inline variant (banner)
 * <ErrorDisplay
 *   error={{ message: "Failed to load data" }}
 *   variant="inline"
 *   onRetry={() => refetch()}
 *   onDismiss={() => setError(null)}
 * />
 */
export function ErrorDisplay({
  error,
  variant = "inline",
  onRetry,
  onDismiss,
  onGoBack,
  action,
  className = "",
}: ErrorDisplayProps): ReactElement {
  const errorInfo = getUserFriendlyError(error.type);
  const displayMessage = error.message || errorInfo.description;

  if (variant === "page") {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[400px] p-8 text-center ${className}`}
      >
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
          {errorInfo.title}
        </h2>
        <p className="text-surface-600 dark:text-surface-400 max-w-md mb-6">
          {displayMessage}
        </p>
        <div className="flex items-center gap-3">
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {errorInfo.action || "Retry"}
            </Button>
          )}
          {action}
        </div>
      </div>
    );
  }

  if (variant === "toast") {
    return (
      <div
        className={`flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg animate-in slide-in-from-right-full fade-in duration-300 ${className}`}
      >
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-red-800 dark:text-red-200">
            {errorInfo.title}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {displayMessage}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 mt-2 underline"
            >
              {errorInfo.action || "Retry"}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Default: inline variant (banner)
  return (
    <div
      className={`flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-800 dark:text-red-200">
          {errorInfo.title}
        </p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          {displayMessage}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />
            {errorInfo.action || "Retry"}
          </Button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
