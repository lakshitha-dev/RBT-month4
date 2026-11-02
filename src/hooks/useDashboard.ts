import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as dashboardApi from '@/api/dashboard';
import type { TrendRange } from '@/types';

export const dashboardKeys = {
  metrics: ['dashboard', 'metrics'] as const,
  trend: (range: TrendRange) => ['dashboard', 'trend', range] as const,
  activity: (limit?: number) => ['activity', limit ?? 'all'] as const,
};

export const useMetrics = () =>
  useQuery({ queryKey: dashboardKeys.metrics, queryFn: dashboardApi.getMetrics });

export const useTrend = (range: TrendRange) =>
  useQuery({
    queryKey: dashboardKeys.trend(range),
    queryFn: () => dashboardApi.getTrend(range),
    placeholderData: keepPreviousData,
  });

export const useActivity = (limit?: number) =>
  useQuery({ queryKey: dashboardKeys.activity(limit), queryFn: () => dashboardApi.getActivity(limit) });
