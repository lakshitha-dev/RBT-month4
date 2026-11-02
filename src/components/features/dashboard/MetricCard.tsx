import { memo } from 'react';
import clsx from 'clsx';
import type { Metric } from '@/types';
import { formatMetric } from '@/utils/format';
import { Skeleton } from '@/components/common/Skeleton';

/** Colour says good or bad, never just up or down; no change or nothing to compare stays grey. */
function deltaTone(metric: Metric) {
  if (metric.change === null || metric.change === 0) return 'text-muted';
  const good = metric.change > 0 === (metric.goodDirection === 'up');
  return good ? 'text-positive' : 'text-negative';
}

function deltaText(change: number) {
  return `${change > 0 ? '+' : change < 0 ? '−' : ''}${Math.abs(change).toFixed(1)}%`;
}

/** One cell of the KPI strip: label over value, a caption naming the baseline. No icon, no sparkline. */
export const MetricCard = memo(function MetricCard({ metric }: { metric: Metric }) {
  const value = formatMetric(metric.value, metric.format);
  const spoken =
    metric.change === null
      ? `${metric.label}: ${value}. ${metric.caption}.`
      : `${metric.label}: ${value}. ${metric.change >= 0 ? 'Up' : 'Down'} ${Math.abs(metric.change).toFixed(1)}% ${metric.caption}.`;

  return (
    <div className="px-5 py-4">
      <h3 className="text-sm font-medium text-muted">{metric.label}</h3>
      {/* Flex/inline pieces carry no whitespace for screen readers, so the cell is also one sr-only sentence. */}
      <p aria-hidden="true" className="num mt-1.5 text-[28px] leading-8 font-normal tracking-[-0.01em] text-ink">
        {value}
      </p>
      <p aria-hidden="true" className="num mt-1 text-xs text-muted">
        {metric.change !== null && <span className={clsx('font-medium', deltaTone(metric))}>{deltaText(metric.change)} </span>}
        {metric.caption}
      </p>
      <p className="sr-only">{spoken}</p>
    </div>
  );
});

export function MetricCardSkeleton() {
  return (
    <div className="px-5 py-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-2 h-8 w-28" />
      <Skeleton className="mt-1.5 h-4 w-36" />
    </div>
  );
}
