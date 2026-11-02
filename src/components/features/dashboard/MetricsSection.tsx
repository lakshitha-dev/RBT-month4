import { useMetrics } from '@/hooks/useDashboard';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { MetricCard, MetricCardSkeleton } from './MetricCard';

export function MetricsSection() {
  const metrics = useMetrics();

  return (
    <section aria-labelledby="metrics-heading" className="mb-6">
      <h2 id="metrics-heading" className="sr-only">
        Key metrics
      </h2>
      {metrics.isError ? (
        <Alert
          variant="error"
          title="Couldn't load metrics"
          action={
            <Button size="sm" variant="secondary" onClick={() => metrics.refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-busy={metrics.isPending}>
          {metrics.isPending
            ? Array.from({ length: 4 }, (_, i) => <MetricCardSkeleton key={i} />)
            : metrics.data.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
        </div>
      )}
    </section>
  );
}
