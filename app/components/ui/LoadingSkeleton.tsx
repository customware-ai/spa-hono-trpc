import type { ReactElement } from "react";
import clsx from "clsx";

/* ==========================================================================
   SKELETON COMPONENTS

   Loading skeleton components for showing placeholder UI while data loads.
   Use these in HydrateFallback, loading states, and anywhere content is loading.

   See AGENTS.md > Loading States for usage patterns.
   ========================================================================== */

interface LoadingSkeletonProps {
  /** The visual style of the skeleton */
  variant?: "text" | "card" | "table-row" | "circle" | "rectangular";
  /** Number of skeleton elements to render */
  count?: number;
  /** Additional CSS classes */
  className?: string;
  /** Width (for rectangular variant) */
  width?: string | number;
  /** Height (for rectangular variant) */
  height?: string | number;
}

/**
 * Base skeleton component with multiple variants.
 * Use this for custom skeleton layouts or use the specific components below.
 *
 * @example
 * // Text lines
 * <LoadingSkeleton variant="text" count={3} />
 *
 * // Custom rectangular skeleton
 * <LoadingSkeleton variant="rectangular" className="h-32 w-full" />
 */
export function LoadingSkeleton({
  variant = "text",
  count = 1,
  className = "",
  width,
  height,
}: LoadingSkeletonProps): ReactElement {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  const baseClasses = "bg-surface-200 dark:bg-surface-700 animate-pulse";

  if (variant === "rectangular") {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            className={clsx(baseClasses, "rounded-md", className)}
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
          <div
            key={i}
            className={clsx(baseClasses, "h-4 rounded", className)}
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
            className={clsx(baseClasses, "w-12 h-12 rounded-full", className)}
          />
        ))}
      </>
    );
  }

  if (variant === "table-row") {
    return (
      <>
        {skeletons.map((i) => (
          <tr key={i} className="border-b border-surface-100 dark:border-surface-700">
            <td className="px-6 py-4">
              <div className={clsx(baseClasses, "h-4 rounded w-3/4")} />
            </td>
            <td className="px-6 py-4">
              <div className={clsx(baseClasses, "h-4 rounded w-1/2")} />
            </td>
            <td className="px-6 py-4">
              <div className={clsx(baseClasses, "h-4 rounded w-2/3")} />
            </td>
            <td className="px-6 py-4">
              <div className={clsx(baseClasses, "h-4 rounded w-1/3")} />
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
          className={clsx("bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-6", className)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={clsx(baseClasses, "w-12 h-12 rounded-full")} />
              <div className="flex-1 space-y-2">
                <div className={clsx(baseClasses, "h-4 rounded w-1/3")} />
                <div className={clsx(baseClasses, "h-3 rounded w-1/2")} />
              </div>
            </div>
            <div className="space-y-2">
              <div className={clsx(baseClasses, "h-4 rounded")} />
              <div className={clsx(baseClasses, "h-4 rounded w-5/6")} />
              <div className={clsx(baseClasses, "h-4 rounded w-4/6")} />
            </div>
            <div className="flex gap-2">
              <div className={clsx(baseClasses, "h-8 rounded-lg w-20")} />
              <div className={clsx(baseClasses, "h-8 rounded-lg w-24")} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/* ==========================================================================
   SPINNER COMPONENT

   Animated spinner for inline loading states, button loading, and actions.
   Use for operations where layout structure isn't preserved (form submissions,
   button actions, inline operations).

   See AGENTS.md > Loading States for usage patterns.
   ========================================================================== */

interface SpinnerProps {
  /** Size of the spinner */
  size?: "xs" | "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Accessibility label (defaults to "Loading") */
  label?: string;
}

const spinnerSizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

/**
 * Animated spinner for inline loading states.
 * Use in buttons, inline operations, and anywhere a spinner is appropriate.
 *
 * @example
 * // In a button
 * <Button disabled={isLoading}>
 *   {isLoading && <Spinner size="sm" className="mr-2" />}
 *   {isLoading ? "Saving..." : "Save"}
 * </Button>
 *
 * // Standalone
 * <Spinner size="lg" />
 */
export function Spinner({
  size = "md",
  className,
  label = "Loading",
}: SpinnerProps): ReactElement {
  return (
    <div className={clsx("inline-flex items-center", className)} role="status">
      <svg
        className={clsx("animate-spin text-primary-500", spinnerSizeClasses[size])}
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

/* ==========================================================================
   CONVENIENCE SKELETON COMPONENTS

   Pre-configured skeletons for common UI patterns.
   Import these directly for quick loading states.
   ========================================================================== */

interface CardSkeletonProps {
  /** Number of skeleton cards to render */
  count?: number;
  /** Additional CSS classes for each card */
  className?: string;
}

/**
 * Skeleton for card components with avatar, text, and action buttons.
 * Use in grids or lists where cards are loading.
 *
 * @example
 * // Single card
 * <CardSkeleton />
 *
 * // Grid of loading cards
 * <div className="grid grid-cols-3 gap-4">
 *   <CardSkeleton count={6} />
 * </div>
 */
export function CardSkeleton({ count = 1, className }: CardSkeletonProps): ReactElement {
  return <LoadingSkeleton variant="card" count={count} className={className} />;
}

interface TextSkeletonProps {
  /** Number of text lines to render */
  lines?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton for text content with multiple lines.
 * Lines have varying widths for a natural look.
 *
 * @example
 * <TextSkeleton lines={4} />
 */
export function TextSkeleton({ lines = 3, className }: TextSkeletonProps): ReactElement {
  return (
    <div className={clsx("space-y-2", className)}>
      <LoadingSkeleton variant="text" count={lines} />
    </div>
  );
}

interface TableSkeletonProps {
  /** Number of skeleton rows to render */
  rows?: number;
  /** Number of columns (defaults to 4) */
  columns?: number;
  /** Additional CSS classes for the table container */
  className?: string;
}

/**
 * Generates an array of unique skeleton IDs for stable React keys.
 */
function generateSkeletonIds(count: number, prefix: string): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
}

/**
 * Full table skeleton with header and body rows.
 * Matches the styling of the Table component.
 *
 * @example
 * // In a HydrateFallback
 * export function HydrateFallback(): ReactElement {
 *   return (
 *     <PageLayout>
 *       <TableSkeleton rows={10} columns={5} />
 *     </PageLayout>
 *   );
 * }
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps): ReactElement {
  const baseClasses = "bg-surface-200 dark:bg-surface-700 animate-pulse";
  const columnIds = generateSkeletonIds(columns, "col");
  const rowIds = generateSkeletonIds(rows, "row");

  return (
    <div className={clsx(
      "bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden",
      className
    )}>
      <table className="w-full">
        <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
          <tr>
            {columnIds.map((colId) => (
              <th key={colId} className="px-6 py-4 text-left">
                <div
                  className={clsx(baseClasses, "h-4 rounded")}
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowIds.map((rowId) => (
            <tr key={rowId} className="border-b border-surface-100 dark:border-surface-700">
              {columnIds.map((colId) => (
                <td key={`${rowId}-${colId}`} className="px-6 py-4">
                  <div
                    className={clsx(baseClasses, "h-4 rounded")}
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

interface PageSkeletonProps {
  /** Show a header skeleton */
  showHeader?: boolean;
  /** Type of content skeleton to show */
  contentType?: "table" | "cards" | "form";
  /** Number of content items */
  itemCount?: number;
}

/**
 * Full page skeleton combining header and content.
 * Use in HydrateFallback for complete page loading states.
 *
 * @example
 * export function HydrateFallback(): ReactElement {
 *   return <PageSkeleton showHeader contentType="table" itemCount={10} />;
 * }
 */
export function PageSkeleton({
  showHeader = true,
  contentType = "table",
  itemCount = 5,
}: PageSkeletonProps): ReactElement {
  const baseClasses = "bg-surface-200 dark:bg-surface-700 animate-pulse";

  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className={clsx(baseClasses, "h-8 w-48 rounded")} />
            <div className={clsx(baseClasses, "h-4 w-64 rounded")} />
          </div>
          <div className={clsx(baseClasses, "h-10 w-32 rounded-lg")} />
        </div>
      )}

      {/* Content skeleton based on type */}
      {contentType === "table" && <TableSkeleton rows={itemCount} />}

      {contentType === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton count={itemCount} />
        </div>
      )}

      {contentType === "form" && (
        <div className="max-w-md space-y-4">
          {generateSkeletonIds(itemCount, "form-field").map((fieldId) => (
            <div key={fieldId} className="space-y-2">
              <div className={clsx(baseClasses, "h-4 w-24 rounded")} />
              <div className={clsx(baseClasses, "h-10 w-full rounded-lg")} />
            </div>
          ))}
          <div className={clsx(baseClasses, "h-10 w-full rounded-lg mt-6")} />
        </div>
      )}
    </div>
  );
}

interface FormSkeletonProps {
  /** Number of form fields to show */
  fields?: number;
  /** Show submit button skeleton */
  showSubmitButton?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton for form layouts with labels and inputs.
 *
 * @example
 * <FormSkeleton fields={4} showSubmitButton />
 */
export function FormSkeleton({
  fields = 4,
  showSubmitButton = true,
  className,
}: FormSkeletonProps): ReactElement {
  const baseClasses = "bg-surface-200 dark:bg-surface-700 animate-pulse";

  const fieldIds = generateSkeletonIds(fields, "form-field");

  return (
    <div className={clsx("space-y-4", className)}>
      {fieldIds.map((fieldId) => (
        <div key={fieldId} className="space-y-2">
          <div className={clsx(baseClasses, "h-4 w-24 rounded")} />
          <div className={clsx(baseClasses, "h-10 w-full rounded-lg")} />
        </div>
      ))}
      {showSubmitButton && (
        <div className={clsx(baseClasses, "h-10 w-full rounded-lg mt-6")} />
      )}
    </div>
  );
}
