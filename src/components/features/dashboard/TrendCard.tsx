import { useCallback, useMemo, useState } from 'react';
import { RANGE_DAYS } from '@/api/dashboard';
import { useTrend } from '@/hooks/useDashboard';
import type { TrendRange } from '@/types';
import { formatDate, formatMetric, formatNumber } from '@/utils/format';
import { Card } from '@/components/common/Card';
import { Select } from '@/components/common/Select';
import { Skeleton } from '@/components/common/Skeleton';
import { LineChart } from './LineChart';

type Series = 'revenue' | 'orders';

/** The screen's largest block: one series at a time, switched by a control rather than overlaid. */
export function TrendCard({ range }: { range: TrendRange }) {
  const [series, setSeries] = useState<Series>('revenue');
  // The data table is only rendered once requested, keeping the initial DOM small.
  const [showTable, setShowTable] = useState(false);
  const { data, isPending, isError, refetch, isFetching } = useTrend(range);

  const points = useMemo(() => (data ?? []).map((d) => ({ x: d.date, y: d[series] })), [data, series]);
  const formatValue = useCallback(
    (v: number) => (series === 'revenue' ? formatMetric(v, 'currency') : formatNumber(v)),
    [series],
  );
  const seriesLabel = series === 'revenue' ? 'Revenue' : 'Orders';
  const total = points.reduce((sum, p) => sum + p.y, 0);
  const days = RANGE_DAYS[range];

  return (
    <Card>
      <Card.Header
        title={`${seriesLabel} per day`}
        description={
          isPending ? (
            <Skeleton className="mt-1 h-4 w-40" />
          ) : (
            <span className="num">
              {formatValue(total)} in the last {days} days
            </span>
          )
        }
        actions={
          <Select
            label="Metric"
            hideLabel
            value={series}
            onChange={(e) => setSeries(e.target.value as Series)}
            options={[
              { value: 'revenue', label: 'Revenue' },
              { value: 'orders', label: 'Orders' },
            ]}
            className="w-32"
          />
        }
      />
      <Card.Body className="pt-2">
        {isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 py-16 text-sm">
            <p className="text-ink">Couldn't load the trend.</p>
            <button type="button" className="font-medium text-ink underline underline-offset-2" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        ) : isPending ? (
          <div role="status" aria-label="Loading chart">
            <Skeleton className="aspect-[640/240] w-full" />
          </div>
        ) : (
          <div aria-busy={isFetching} className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
            <LineChart data={points} seriesLabel={seriesLabel} formatValue={formatValue} />
            <details className="mt-2 text-sm" onToggle={(e) => setShowTable(e.currentTarget.open)}>
              <summary className="cursor-pointer text-muted hover:text-ink">View chart data as a table</summary>
              {showTable && (
                <div className="mt-2 max-h-64 overflow-y-auto" tabIndex={0} role="region" aria-label={`${seriesLabel} data table`}>
                  <table className="w-full text-left">
                    <caption className="sr-only">{`${seriesLabel} per day, last ${days} days`}</caption>
                    <thead className="sticky top-0 bg-surface text-xs text-muted">
                      <tr>
                        <th scope="col" className="py-1.5 pr-4 font-normal">Date</th>
                        <th scope="col" className="py-1.5 text-right font-normal">{seriesLabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {points.map((p) => (
                        <tr key={p.x} className="border-t border-rule">
                          <td className="py-1.5 pr-4">{formatDate(p.x)}</td>
                          <td className="py-1.5 text-right">{formatValue(p.y)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </details>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
