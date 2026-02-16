import { ArrowUp } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import clsx from "clsx";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selected: Set<string | number>) => void;
  loading?: boolean;
  emptyState?: ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

type SortDirection = "asc" | "desc" | null;

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  loading = false,
  emptyState,
  pagination,
}: TableProps<T>): ReactElement {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string): void => {
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (): void => {
    if (selectedRows.size === data.length) {
      onSelectionChange?.(new Set());
    } else {
      const allKeys = new Set(data.map(keyExtractor));
      onSelectionChange?.(allKeys);
    }
  };

  const handleSelectRow = (key: string | number): void => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    onSelectionChange?.(newSelection);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-4 text-left">
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["row-1", "row-2", "row-3", "row-4", "row-5"].map((rowId) => (
                <tr key={`skeleton-${rowId}`} className="border-b border-surface-100 dark:border-surface-700">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <div className="h-4 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
              <tr>
                {selectable && (
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-600 border-surface-300 dark:border-surface-600 rounded focus:ring-primary-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={clsx(
                      "px-6 py-4 text-left text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wider",
                      column.sortable && "cursor-pointer select-none hover:text-surface-900 dark:hover:text-surface-200",
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <ArrowUp
                          className={clsx(
                            "w-4 h-4 transition-transform",
                            sortColumn === column.key && sortDirection === "desc" && "rotate-180",
                            sortColumn === column.key ? "text-primary-600" : "text-surface-400"
                          )}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {data.map((row) => {
                const rowKey = keyExtractor(row);
                const isSelected = selectedRows.has(rowKey);
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50",
                      isSelected && "bg-primary-50 dark:bg-primary-900/20"
                    )}
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowKey)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-primary-600 border-surface-300 dark:border-surface-600 rounded focus:ring-primary-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={clsx("px-6 py-4 text-sm text-surface-900 dark:text-surface-100", column.className)}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : (row[column.key] as ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6">
          <div className="text-sm text-surface-600 dark:text-surface-400">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{" "}
            {pagination.totalItems} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrent = page === pagination.currentPage;
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page)}
                      className={clsx(
                        "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isCurrent
                          ? "bg-primary-600 text-white"
                          : "text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-700"
                      )}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-surface-500 dark:text-surface-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
