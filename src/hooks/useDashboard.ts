import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as dashboardApi from '@/api/dashboard';
import type { TrendRange } from '@/types';

export const dashboardKeys = {
  metrics: (range: TrendRange) => ['dashboard', 'metrics', range] as const,
  trend: (range: TrendRange) => ['dashboard', 'trend', range] as const,
  activity: (limit?: number) => ['activity', limit ?? 'all'] as const,
  // Under 'users' so any user mutation (which invalidates ['users']) refreshes the roster too.
  roster: ['users', 'roster'] as const,
};

export const useMetrics = (range: TrendRange) =>
  useQuery({
    queryKey: dashboardKeys.metrics(range),
    queryFn: () => dashboardApi.getMetrics(range),
    placeholderData: keepPreviousData,
  });

export const useTrend = (range: TrendRange) =>
  useQuery({
    queryKey: dashboardKeys.trend(range),
    queryFn: () => dashboardApi.getTrend(range),
    placeholderData: keepPreviousData,
  });

export const useActivity = (limit?: number) =>
  useQuery({ queryKey: dashboardKeys.activity(limit), queryFn: () => dashboardApi.getActivity(limit) });

export const useRoster = () => useQuery({ queryKey: dashboardKeys.roster, queryFn: dashboardApi.getRoster });
