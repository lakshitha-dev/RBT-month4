import { memo, type ReactNode } from 'react';
import clsx from 'clsx';
import type { SortDirection } from '@/types';
import { ArrowDownIcon, ArrowUpIcon, SortIcon } from './icons';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  /** Visually hide the header text (still read by screen readers). */
  hideHeader?: boolean;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  className?: string;
  /** Marks the column whose cell acts as the row header (`<th scope="row">`). */
  isRowHeader?: boolean;
}

export interface SortState {
  by: string;
  dir: SortDirection;
}

export interface TableProps<T> {
  caption: string;
  /** Hide the caption visually; it still labels the table for assistive tech. */
  hideCaption?: boolean;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  isLoading?: boolean;
  emptyMessage?: ReactNode;
  rowClassName?: (row: T) => string | undefined;
  skeletonRows?: number;
}

function SortButton({ column, sort, onSortChange }: { column: Column<unknown>; sort?: SortState; onSortChange?: (s: SortState) => void }) {
  const active = sort?.by === column.key;
  const Icon = !active ? SortIcon : sort.dir === 'asc' ? ArrowUpIcon : ArrowDownIcon;
  return (
    <button
      type="button"
      onClick={() => onSortChange?.({ by: column.key, dir: active && sort.dir === 'asc' ? 'desc' : 'asc' })}
      className="group -mx-1 inline-flex items-center gap-1 rounded-control px-1 hover:text-ink"
    >
      {column.header}
      <Icon className={clsx('size-3.5', !active && 'opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60')} />
    </button>
  );
}

function TableRowInner<T>({ row, columns, className }: { row: T; columns: Column<T>[]; className?: string }) {
  return (
    <tr className={clsx('border-t border-rule transition-colors hover:bg-raised/60', className)}>
      {columns.map((column) =>
        column.isRowHeader ? (
          <th key={column.key} scope="row" className={clsx('h-12 px-4 text-left font-normal', column.className)}>
            {column.render(row)}
          </th>
        ) : (
          <td key={column.key} className={clsx('h-12 px-4', column.className)}>
            {column.render(row)}
          </td>
        ),
      )}
    </tr>
  );
}

/** Memoised so unchanged rows skip re-rendering when other rows update optimistically. */
const TableRow = memo(TableRowInner) as typeof TableRowInner;

/**
 * Generic data table: sortable headers with `aria-sort`, caption, loading skeleton and empty state.
 * Horizontally scrollable on small screens via a focusable region.
 */
export function Table<T>({
  caption,
  hideCaption,
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  isLoading,
  emptyMessage = 'No results.',
  rowClassName,
  skeletonRows = 5,
}: TableProps<T>) {
  const showSkeleton = isLoading && rows.length === 0;

  return (
    <div
      className="overflow-x-auto"
      role="region"
      aria-label={caption}
      // Keyboard users must be able to scroll the region (WCAG 2.1.1).
      tabIndex={0}
    >
      <table className="w-full min-w-[640px] text-sm" aria-busy={isLoading || undefined}>
        <caption className={clsx('px-4 py-3 text-left text-sm text-muted', hideCaption && 'sr-only')}>
          {caption}
        </caption>
        <thead className="text-left text-xs font-normal text-muted">
          <tr>
            {columns.map((column) => {
              const active = sort?.by === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.sortable ? (active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                  className={clsx('h-10 px-4 font-normal whitespace-nowrap', column.className)}
                >
                  {column.sortable ? (
                    <SortButton column={column as Column<unknown>} sort={sort} onSortChange={onSortChange} />
                  ) : (
                    <span className={clsx(column.hideHeader && 'sr-only')}>{column.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {showSkeleton &&
            Array.from({ length: skeletonRows }, (_, i) => (
              <tr key={i} className="border-t border-rule">
                {columns.map((column) => (
                  <td key={column.key} className="h-12 px-4">
                    <Skeleton className="h-4 w-full max-w-32" />
                  </td>
                ))}
              </tr>
            ))}
          {!showSkeleton && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <TableRow key={rowKey(row)} row={row} columns={columns} className={rowClassName?.(row)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
