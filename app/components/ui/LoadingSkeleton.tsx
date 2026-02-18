import { Skeleton } from "~/components/ui/Skeleton";
import { cn } from "~/lib/utils";
import type { ReactElement } from "react";

interface LoadingSkeletonProps {
  variant?: "text" | "card" | "table-row" | "circle" | "rectangular";
  count?: number;
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function LoadingSkeleton({
  variant = "text",
  count = 1,
  className = "",
  width,
  height,
}: LoadingSkeletonProps): ReactElement {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (variant === "rectangular") {
    return (
      <>
        {skeletons.map((i) => (
          <Skeleton
            key={i}
            className={cn("rounded-md", className)}
            style={{ width, height }}
          />
        ))}
      </>
    );
  }

  if (variant === "text") {
    return (
      <>
        {skeletons.map((i) => (
          <Skeleton
            key={i}
            className={cn("h-4 rounded", className)}
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        ))}
      </>
    );
  }

  if (variant === "circle") {
    return (
      <>
        {skeletons.map((i) => (
          <Skeleton
            key={i}
            className={cn("w-12 h-12 rounded-full", className)}
          />
        ))}
      </>
    );
  }

  if (variant === "table-row") {
    return (
      <>
        {skeletons.map((i) => (
          <tr key={i} className="border-b">
            <td className="px-6 py-4">
              <Skeleton className="h-4 rounded w-3/4" />
            </td>
            <td className="px-6 py-4">
              <Skeleton className="h-4 rounded w-1/2" />
            </td>
            <td className="px-6 py-4">
              <Skeleton className="h-4 rounded w-2/3" />
            </td>
            <td className="px-6 py-4">
              <Skeleton className="h-4 rounded w-1/3" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  // Card variant
  return (
    <>
      {skeletons.map((i) => (
        <div
          key={i}
          className={cn("bg-card border rounded-xl p-6", className)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 rounded w-1/3" />
                <Skeleton className="h-3 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 rounded" />
              <Skeleton className="h-4 rounded w-5/6" />
              <Skeleton className="h-4 rounded w-4/6" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 rounded-lg w-20" />
              <Skeleton className="h-8 rounded-lg w-24" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const spinnerSizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Spinner({
  size = "md",
  className,
  label = "Loading",
}: SpinnerProps): ReactElement {
  return (
    <div className={cn("inline-flex items-center", className)} role="status">
      <svg
        className={cn("animate-spin text-primary", spinnerSizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function CardSkeleton({ count = 1, className }: { count?: number; className?: string }): ReactElement {
  return <LoadingSkeleton variant="card" count={count} className={className} />;
}

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }): ReactElement {
  return (
    <div className={cn("space-y-2", className)}>
      <LoadingSkeleton variant="text" count={lines} />
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: { rows?: number; columns?: number; className?: string }): ReactElement {
  const columnIds = Array.from({ length: columns }, (_, i) => `col-${i}`);
  const rowIds = Array.from({ length: rows }, (_, i) => `row-${i}`);

  return (
    <div className={cn(
      "bg-card rounded-xl border overflow-hidden",
      className
    )}>
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            {columnIds.map((colId) => (
              <th key={colId} className="px-6 py-4 text-left">
                <Skeleton
                  className="h-4 rounded"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowIds.map((rowId) => (
            <tr key={rowId} className="border-b">
              {columnIds.map((colId) => (
                <td key={`${rowId}-${colId}`} className="px-6 py-4">
                  <Skeleton
                    className="h-4 rounded"
                    style={{ width: `${40 + Math.random() * 50}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageSkeleton({
  showHeader = true,
  contentType = "table",
  itemCount = 5,
}: { showHeader?: boolean; contentType?: "table" | "cards" | "form"; itemCount?: number }): ReactElement {
  return (
    <div className="space-y-6 p-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      )}

      {contentType === "table" && <TableSkeleton rows={itemCount} />}

      {contentType === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton count={itemCount} />
        </div>
      )}

      {contentType === "form" && (
        <div className="max-w-md space-y-4">
          {Array.from({ length: itemCount }, (_, i) => `form-field-${i}`).map((key) => (
            <div key={key} className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-lg mt-6" />
        </div>
      )}
    </div>
  );
}

export function FormSkeleton({
  fields = 4,
  showSubmitButton = true,
  className,
}: { fields?: number; showSubmitButton?: boolean; className?: string }): ReactElement {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }, (_, i) => `field-${i}`).map((key) => (
        <div key={key} className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      {showSubmitButton && (
        <Skeleton className="h-10 w-full rounded-lg mt-6" />
      )}
    </div>
  );
}
