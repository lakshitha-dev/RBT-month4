import { useCallback, useMemo, useState } from 'react';
import { useTrend } from '@/hooks/useDashboard';
import type { TrendRange } from '@/types';
import { formatDate, formatMetric, formatNumber } from '@/utils/format';
import { Alert } from '@/components/common/Alert';
import { Card } from '@/components/common/Card';
import { Select } from '@/components/common/Select';
import { Skeleton } from '@/components/common/Skeleton';
import { Tabs } from '@/components/common/Tabs';
import { LineChart } from './LineChart';

type Series = 'revenue' | 'orders';

const RANGES: { value: TrendRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export function TrendCard() {
  const [range, setRange] = useState<TrendRange>('30d');
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

  return (
    <Card>
      <Card.Header
        title="Performance trend"
        description="Daily revenue and orders"
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
      <Card.Body>
        <Tabs value={range} onValueChange={(v) => setRange(v as TrendRange)}>
          <Tabs.List label="Date range">
            {RANGES.map((r) => (
              <Tabs.Tab key={r.value} value={r.value}>
                {r.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {RANGES.map((r) => (
            <Tabs.Panel key={r.value} value={r.value} className="mt-4 rounded-lg">
              {isError ? (
                <Alert
                  variant="error"
                  title="Couldn't load trend data"
                  action={
                    <button type="button" className="font-semibold underline" onClick={() => refetch()}>
                      Retry
                    </button>
                  }
                />
              ) : isPending ? (
                <div role="status" aria-label="Loading chart">
                  <Skeleton className="aspect-[640/260] w-full" />
                </div>
              ) : (
                <div aria-busy={isFetching} className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
                  <LineChart data={points} seriesLabel={seriesLabel} formatValue={formatValue} />
                  <details className="mt-3 text-sm" onToggle={(e) => setShowTable(e.currentTarget.open)}>
                    <summary className="cursor-pointer font-medium text-brand-700 dark:text-brand-300">
                      View chart data as a table
                    </summary>
                    {showTable && (
                    <div className="mt-2 max-h-64 overflow-y-auto" tabIndex={0} role="region" aria-label={`${seriesLabel} data table`}>
                      <table className="w-full text-left">
                        <caption className="sr-only">{`${seriesLabel} per day, last ${r.label}`}</caption>
                        <thead className="sticky top-0 bg-white dark:bg-slate-900">
                          <tr>
                            <th scope="col" className="py-1 pr-4 font-semibold">Date</th>
                            <th scope="col" className="py-1 font-semibold">{seriesLabel}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {points.map((p) => (
                            <tr key={p.x} className="border-t border-slate-200 dark:border-slate-800">
                              <td className="py-1 pr-4">{formatDate(p.x)}</td>
                              <td className="py-1 tabular-nums">{formatValue(p.y)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    )}
                  </details>
                </div>
              )}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Card.Body>
    </Card>
  );
}
