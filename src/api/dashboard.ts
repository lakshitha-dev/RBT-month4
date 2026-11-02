import type { Activity, Metric, TrendPoint, TrendRange } from '@/types';
import { clone, latency } from './client';
import { getDb } from './db';

const RANGE_DAYS: Record<TrendRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

const sum = (points: TrendPoint[], key: 'revenue' | 'orders') =>
  points.reduce((total, p) => total + p[key], 0);

const pctChange = (current: number, previous: number) =>
  previous === 0 ? 0 : Math.round(((current - previous) / previous) * 1000) / 10;

export async function getMetrics(): Promise<Metric[]> {
  await latency();
  const { users, trend } = getDb();
  const last30 = trend.slice(-30);
  const prev30 = trend.slice(-60, -30);
  const activeUsers = users.filter((u) => !u.deletedAt);
  const monthAgo = Date.now() - 30 * 86_400_000;
  const newUsers = activeUsers.filter((u) => new Date(u.createdAt).getTime() > monthAgo).length;

  const revenue = sum(last30, 'revenue');
  const orders = sum(last30, 'orders');
  const prevRevenue = sum(prev30, 'revenue');
  const prevOrders = sum(prev30, 'orders');
  // The mock has no traffic data, so visits are a fixed synthetic figure.
  const visits = 95_000;
  const conversion = Math.round((orders / visits) * 1000) / 10;
  const prevConversion = Math.round((prevOrders / visits) * 1000) / 10;

  return [
    {
      id: 'users',
      label: 'Total users',
      value: activeUsers.length,
      change: pctChange(activeUsers.length, activeUsers.length - newUsers),
      format: 'number',
    },
    { id: 'revenue', label: 'Revenue (30d)', value: revenue, change: pctChange(revenue, prevRevenue), format: 'currency' },
    { id: 'orders', label: 'Orders (30d)', value: orders, change: pctChange(orders, prevOrders), format: 'number' },
    { id: 'conversion', label: 'Conversion rate', value: conversion, change: pctChange(conversion, prevConversion), format: 'percent' },
  ];
}

export async function getTrend(range: TrendRange): Promise<TrendPoint[]> {
  await latency(200, 450);
  return clone(getDb().trend.slice(-RANGE_DAYS[range]));
}

export async function getActivity(limit?: number): Promise<Activity[]> {
  await latency(200, 450);
  const { activity } = getDb();
  return clone(limit ? activity.slice(0, limit) : activity);
}
