import clsx from 'clsx';
import { formatNumber } from '@/utils/format';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

export interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Returns page numbers with `null` gaps, e.g. [1, null, 4, 5, 6, null, 12]. */
export function pageWindow(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1]! > 1 ? [null, p] : [p]));
}

const btn =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-control px-2 text-sm num disabled:cursor-not-allowed disabled:opacity-40';

export function Pagination({ page, pageCount, pageSize, total, onPageChange, className }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className={clsx('flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-sm text-muted num">
        Showing <span className="text-ink">{formatNumber(from)}</span>–
        <span className="text-ink">{formatNumber(to)}</span> of{' '}
        <span className="text-ink">{formatNumber(total)}</span>
      </p>
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            className={clsx(btn, 'text-ink hover:bg-raised')}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </button>
        </li>
        {pageWindow(page, pageCount).map((p, i) =>
          p === null ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={clsx(
                  btn,
                  // Current page: an ink outline (well over 3:1), not a colour fill.
                  p === page ? 'font-semibold text-ink ring-1 ring-ink ring-inset' : 'text-muted hover:bg-raised hover:text-ink',
                )}
              >
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={clsx(btn, 'text-ink hover:bg-raised')}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
    </nav>
  );
}
