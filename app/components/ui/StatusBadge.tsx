import { cn } from "~/lib/utils";
import type { ReactElement } from "react";

export type Status =
  | "draft"
  | "sent"
  | "paid"
  | "pending"
  | "active"
  | "inactive"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusStyles: Record<Status, { text: string; dot: string }> = {
  active: {
    text: "text-emerald-600 dark:text-emerald-500",
    dot: "bg-emerald-500",
  },
  inactive: {
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  paid: {
    text: "text-sky-600 dark:text-sky-500",
    dot: "bg-sky-500",
  },
  sent: {
    text: "text-blue-600 dark:text-blue-500",
    dot: "bg-blue-500",
  },
  pending: {
    text: "text-amber-600 dark:text-amber-500",
    dot: "bg-amber-500",
  },
  draft: {
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  success: {
    text: "text-emerald-600 dark:text-emerald-500",
    dot: "bg-emerald-500",
  },
  warning: {
    text: "text-amber-600 dark:text-amber-500",
    dot: "bg-amber-500",
  },
  danger: {
    text: "text-red-600 dark:text-red-500",
    dot: "bg-red-500",
  },
  info: {
    text: "text-sky-600 dark:text-sky-500",
    dot: "bg-sky-500",
  },
};

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const dotSizes = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export function StatusBadge({
  status,
  label,
  showDot = false,
  size = "md",
}: StatusBadgeProps): ReactElement {
  const { text, dot } = statusStyles[status];
  const displayLabel = label ?? (status.charAt(0).toUpperCase() + status.slice(1));

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-medium",
        text,
        sizeClasses[size]
      )}
    >
      {showDot && (
        <span className={cn("rounded-full flex-shrink-0", dot, dotSizes[size])} />
      )}
      {displayLabel}
    </span>
  );
}
