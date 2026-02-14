import { Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import clsx from "clsx";

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-500',
  success: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-500',
  warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-500',
  danger: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-500',
};

const iconMap: Record<AlertVariant, ReactNode> = {
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  danger: <AlertCircle className="w-5 h-5" />,
};

export function Alert({
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon,
  className = '',
  children,
  ...props
}: AlertProps): ReactElement {
  const baseStyles = 'p-4 rounded-lg border-l-4 flex items-start gap-3';

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0">{icon || iconMap[variant]}</div>
      <div className="flex-1">
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
