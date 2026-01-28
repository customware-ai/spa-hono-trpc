import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-surface-200',
  elevated: 'bg-white shadow-soft',
  outlined: 'bg-transparent border border-surface-300',
};

export function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps): ReactElement {
  const baseStyles = 'rounded-xl p-5';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className = '',
  children,
  ...props
}: CardHeaderProps): ReactElement {
  return (
    <div
      className={`flex items-start justify-between mb-4 pb-3 border-b border-surface-100 ${className}`}
      {...props}
    >
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-surface-800">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-surface-500 mt-0.5">{description}</p>
        )}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
