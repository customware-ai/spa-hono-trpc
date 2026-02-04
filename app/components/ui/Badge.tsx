import type { HTMLAttributes, ReactElement } from 'react';
import clsx from "clsx";

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-100 text-surface-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning-light text-warning-dark',
  danger: 'bg-danger-light text-danger-dark',
  info: 'bg-info-light text-info-dark',
};

export function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps): ReactElement {
  const baseStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  return (
    <span
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
