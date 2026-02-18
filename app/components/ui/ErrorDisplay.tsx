import { AlertCircle, RefreshCw, ArrowLeft, X } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/Alert";
import { cn } from "~/lib/utils";
import type { ReactElement, ReactNode } from "react";

export type ErrorType =
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "VALIDATION_ERROR"
  | "PERMISSION_DENIED"
  | "DATABASE_ERROR"
  | "UNKNOWN";

export interface ErrorInfo {
  type?: ErrorType;
  message: string;
}

export interface ErrorDisplayProps {
  error: ErrorInfo;
  variant?: "page" | "inline" | "toast";
  onRetry?: () => void;
  onDismiss?: () => void;
  onGoBack?: () => void;
  action?: ReactNode;
  className?: string;
}

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

export function getUserFriendlyError(errorType?: ErrorType): {
  title: string;
  description: string;
  action?: string;
} {
  return ERROR_MESSAGES[errorType || "UNKNOWN"] || ERROR_MESSAGES.UNKNOWN;
}

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
        className={cn(
          "flex flex-col items-center justify-center min-h-[400px] p-8 text-center",
          className
        )}
      >
        <div className="p-4 bg-destructive/10 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {errorInfo.title}
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
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
            <Button onClick={onRetry}>
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
        className={cn(
          "flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg shadow-lg animate-in slide-in-from-right-full fade-in duration-300",
          className
        )}
      >
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-destructive">
            {errorInfo.title}
          </p>
          <p className="text-sm text-destructive/80 mt-1">
            {displayMessage}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-destructive hover:underline mt-2"
            >
              {errorInfo.action || "Retry"}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-destructive/50 hover:text-destructive transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{errorInfo.title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{displayMessage}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry} className="h-8">
              <RefreshCw className="w-3 h-3 mr-1" />
              {errorInfo.action || "Retry"}
            </Button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {action}
        </div>
      </AlertDescription>
    </Alert>
  );
}
