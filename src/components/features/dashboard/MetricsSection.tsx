import { useMetrics } from '@/hooks/useDashboard';
import type { TrendRange } from '@/types';
import { MetricCard, MetricCardSkeleton } from './MetricCard';

/** One container split by 1px dividers into four equal cells (2 x 2 on phones). */
export function MetricsSection({ range }: { range: TrendRange }) {
  const metrics = useMetrics(range);

  return (
    <section aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="sr-only">
        Key metrics
      </h2>
      {metrics.isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line px-5 py-4 text-sm">
          <p className="text-ink">Couldn't load the metrics.</p>
          <button type="button" className="font-medium text-ink underline underline-offset-2" onClick={() => metrics.refetch()}>
            Retry
          </button>
        </div>
      ) : (
        <div
          aria-busy={metrics.isFetching}
          className="grid grid-cols-2 overflow-hidden rounded-card border border-line xl:grid-cols-4 [&>*]:border-line max-xl:[&>*:nth-child(-n+2)]:border-b max-xl:[&>*:nth-child(odd)]:border-r xl:[&>*:not(:last-child)]:border-r"
        >
          {metrics.isPending
            ? Array.from({ length: 4 }, (_, i) => <MetricCardSkeleton key={i} />)
            : metrics.data.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
        </div>
      )}
    </section>
  );
}
