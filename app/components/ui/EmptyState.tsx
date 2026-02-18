import type { ReactElement, ReactNode } from "react";
import { PackageOpen } from "lucide-react";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps): ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl bg-muted/30",
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-muted text-muted-foreground">
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
