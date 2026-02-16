import { Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import clsx from "clsx";

type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the banner */
  variant?: BannerVariant;
  /** Optional custom icon to display */
  icon?: ReactNode;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Callback when the banner is dismissed */
  onDismiss?: () => void;
  /** Optional action button/link to display */
  action?: ReactNode;
}

const variantStyles: Record<BannerVariant, string> = {
  info: 'bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800',
  success: 'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 border-primary-200 dark:border-primary-800',
  warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  danger: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
};

const iconMap: Record<BannerVariant, ReactNode> = {
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  danger: <AlertCircle className="w-5 h-5" />,
};

/**
 * Banner component for displaying prominent messages across the page.
 * Use for important notifications, warnings, or status updates that need attention.
 *
 * @example
 * ```tsx
 * // Warning banner with action
 * <Banner variant="warning" action={<button onClick={refresh}>Refresh</button>}>
 *   You're viewing cached data. Some information may be outdated.
 * </Banner>
 *
 * // Dismissible info banner
 * <Banner variant="info" dismissible onDismiss={() => setShowBanner(false)}>
 *   New features available! Check out the changelog.
 * </Banner>
 * ```
 */
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
  const baseStyles = 'px-4 py-3 rounded-lg border flex items-center gap-3';

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      role="status"
      {...props}
    >
      <div className="flex-shrink-0">{icon || iconMap[variant]}</div>
      <div className="flex-1 text-sm">{children}</div>
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
    </div>
  );
}
