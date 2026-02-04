import type { ReactElement } from "react";
import clsx from "clsx";

interface LoadingSkeletonProps {
  variant?: "text" | "card" | "table-row" | "circle";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant = "text",
  count = 1,
  className = "",
}: LoadingSkeletonProps): ReactElement {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (variant === "text") {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            className={clsx("h-4 bg-surface-200 rounded animate-pulse", className)}
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
          <div
            key={i}
            className={clsx("w-12 h-12 bg-surface-200 rounded-full animate-pulse", className)}
          />
        ))}
      </>
    );
  }

  if (variant === "table-row") {
    return (
      <>
        {skeletons.map((i) => (
          <tr key={i} className="border-b border-surface-100">
            <td className="px-6 py-4">
              <div className="h-4 bg-surface-200 rounded animate-pulse w-3/4" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-surface-200 rounded animate-pulse w-1/2" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-surface-200 rounded animate-pulse w-2/3" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-surface-200 rounded animate-pulse w-1/3" />
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
          className={clsx("bg-white border border-surface-200 rounded-xl p-6", className)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-200 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-surface-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-surface-200 rounded animate-pulse" />
              <div className="h-4 bg-surface-200 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-surface-200 rounded animate-pulse w-4/6" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-surface-200 rounded-lg animate-pulse w-20" />
              <div className="h-8 bg-surface-200 rounded-lg animate-pulse w-24" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// Specific skeleton components for common use cases
export function CardSkeleton({ count = 1 }: { count?: number }): ReactElement {
  return <LoadingSkeleton variant="card" count={count} />;
}

export function TextSkeleton({ lines = 3 }: { lines?: number }): ReactElement {
  return (
    <div className="space-y-2">
      <LoadingSkeleton variant="text" count={lines} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }): ReactElement {
  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-surface-50 border-b border-surface-200">
          <tr>
            <th className="px-6 py-4 text-left">
              <div className="h-4 bg-surface-200 rounded animate-pulse w-24" />
            </th>
            <th className="px-6 py-4 text-left">
              <div className="h-4 bg-surface-200 rounded animate-pulse w-32" />
            </th>
            <th className="px-6 py-4 text-left">
              <div className="h-4 bg-surface-200 rounded animate-pulse w-28" />
            </th>
            <th className="px-6 py-4 text-left">
              <div className="h-4 bg-surface-200 rounded animate-pulse w-20" />
            </th>
          </tr>
        </thead>
        <tbody>
          <LoadingSkeleton variant="table-row" count={rows} />
        </tbody>
      </table>
    </div>
  );
}
