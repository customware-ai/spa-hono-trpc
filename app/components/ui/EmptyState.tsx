import { FileX } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon ? (
        <div className="mb-6 text-surface-300 dark:text-surface-600">{icon}</div>
      ) : (
        <div className="mb-6">
          <FileX className="w-24 h-24 text-surface-200 dark:text-surface-700 mx-auto" />
        </div>
      )}

      <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-2">{title}</h3>

      {description && (
        <p className="text-surface-600 dark:text-surface-400 max-w-md mb-6">{description}</p>
      )}

      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
