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

const statusStyles: Record<
  Status,
  { bg: string; text: string; dot: string }
> = {
  draft: {
    bg: "bg-surface-100",
    text: "text-surface-700",
    dot: "bg-surface-500",
  },
  sent: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  paid: {
    bg: "bg-primary-100",
    text: "text-primary-700",
    dot: "bg-primary-500",
  },
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  active: {
    bg: "bg-primary-100",
    text: "text-primary-700",
    dot: "bg-primary-500",
  },
  inactive: {
    bg: "bg-surface-100",
    text: "text-surface-600",
    dot: "bg-surface-400",
  },
  success: {
    bg: "bg-primary-100",
    text: "text-primary-700",
    dot: "bg-primary-500",
  },
  warning: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  danger: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  info: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

const sizeStyles = {
  sm: {
    text: "text-xs",
    padding: "px-2 py-0.5",
    dot: "w-1.5 h-1.5",
  },
  md: {
    text: "text-sm",
    padding: "px-2.5 py-1",
    dot: "w-2 h-2",
  },
  lg: {
    text: "text-base",
    padding: "px-3 py-1.5",
    dot: "w-2.5 h-2.5",
  },
};

export function StatusBadge({
  status,
  label,
  showDot = false,
  size = "md",
}: StatusBadgeProps): ReactElement {
  const styles = statusStyles[status];
  const sizeStyle = sizeStyles[size];
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${styles.bg} ${styles.text} ${sizeStyle.padding} ${sizeStyle.text}`}
    >
      {showDot && (
        <span className={`${sizeStyle.dot} ${styles.dot} rounded-full`} />
      )}
      {displayLabel}
    </span>
  );
}
