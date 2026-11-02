import { memo } from 'react';
import clsx from 'clsx';
import type { Metric } from '@/types';
import { formatMetric } from '@/utils/format';
import { Skeleton } from '@/components/common/Skeleton';
import { CartIcon, DollarIcon, PercentIcon, TrendDownIcon, TrendUpIcon, UsersIcon } from '@/components/common/icons';

const ICONS = { users: UsersIcon, revenue: DollarIcon, orders: CartIcon, conversion: PercentIcon };

export const MetricCard = memo(function MetricCard({ metric }: { metric: Metric }) {
  const Icon = ICONS[metric.id];
  const up = metric.change >= 0;
  const Trend = up ? TrendUpIcon : TrendDownIcon;
  const change = Math.abs(metric.change).toFixed(1);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.label}</h3>
        <span className="hidden rounded-lg bg-brand-50 p-2 text-brand-700 sm:inline-flex dark:bg-brand-800/40 dark:text-brand-300">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-2 text-xl font-bold sm:mt-3 sm:text-2xl tracking-tight text-slate-900 dark:text-white">
        {formatMetric(metric.value, metric.format)}
      </p>
      <p
        className={clsx(
          'mt-1 flex flex-wrap items-center gap-x-1 text-xs font-medium sm:text-sm',
          up ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
        )}
      >
        <Trend className="size-4" />
        {/* Flex items carry no whitespace, so screen readers would read "Up4.2%vs"; give them one sentence instead. */}
        <span aria-hidden="true">{change}%</span>
        <span aria-hidden="true" className="font-normal text-slate-600 dark:text-slate-400">
          vs last period
        </span>
        <span className="sr-only">{`${up ? 'Up' : 'Down'} ${change}% vs last period`}</span>
      </p>
    </article>
  );
});

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-40" />
    </div>
  );
}
