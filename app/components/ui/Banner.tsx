import { Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { cn } from "~/lib/utils";
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { Alert, AlertDescription } from "~/components/ui/Alert";

type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BannerVariant;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: ReactNode;
}

const iconMap: Record<BannerVariant, ReactNode> = {
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  danger: <AlertCircle className="w-5 h-5" />,
};

const variantMap: Record<BannerVariant, "default" | "destructive"> = {
    info: "default",
    success: "default",
    warning: "default",
    danger: "destructive"
}

export function Banner({
  variant = 'info',
  icon,
  dismissible = false,
  onDismiss,
  action,
  className = '',
  children,
  ...props
}: BannerProps): ReactElement {
  return (
    <Alert
      variant={variantMap[variant]}
      className={cn(
        "flex items-center gap-3",
        variant === 'success' && "bg-primary/10 text-primary border-primary/20",
        variant === 'warning' && "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0">{icon || iconMap[variant]}</div>
      <AlertDescription className="flex-1 text-sm m-0">{children}</AlertDescription>
      {action && <div className="flex-shrink-0">{action}</div>}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </Alert>
  );
}
