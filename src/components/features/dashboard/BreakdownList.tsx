import clsx from 'clsx';
import { formatNumber } from '@/utils/format';

export interface BreakdownRow {
  label: string;
  value: number;
}

interface BreakdownListProps {
  title: string;
  rows: BreakdownRow[];
  /** One sentence shown when every value is zero (the block keeps its frame). */
  empty: string;
}

/**
 * A ranked list for a narrow rail: label and figure on one line, a 2px proportional bar under it,
 * grey with the top item in ink, so "most first" is seen as well as read.
 */
export function BreakdownList({ title, rows, empty }: BreakdownListProps) {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const max = sorted[0]?.value ?? 0;
  // A bar only says something when the values differ; equal counts are left as plain figures.
  const showBars = sorted.some((r) => r.value !== max);
  const id = `breakdown-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-2 text-base font-semibold text-ink">
        {title}
      </h2>
      <div className="rounded-card border border-line bg-surface px-4 py-2">
        {max === 0 ? (
          <p className="py-3 text-sm text-muted">{empty}</p>
        ) : (
          <ul>
            {sorted.map((row, i) => (
              <li key={row.label} className="py-2">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-ink">{row.label}</span>
                  {/* Flex items carry no whitespace for screen readers (NVDA finding F7). */}
                  <span className="sr-only">: </span>
                  <span className="num shrink-0 text-ink">{formatNumber(row.value)}</span>
                </div>
                {showBars && (
                  <div aria-hidden="true" className="mt-1.5 h-0.5 w-full">
                    <div
                      className={clsx('h-full rounded-full', i === 0 ? 'bg-ink' : 'bg-control')}
                      style={{ width: `${(row.value / max) * 100}%` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
