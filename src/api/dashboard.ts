import { DEPARTMENTS, type Activity, type Metric, type RosterGroup, type TrendPoint, type TrendRange } from '@/types';
import { clone, latency } from './client';
import { getDb } from './db';

export const RANGE_DAYS: Record<TrendRange, number> = { '7d': 7, '30d': 30, '90d': 90 };
const DAY = 86_400_000;
// The mock has no traffic data, so daily visits are a fixed synthetic figure.
const VISITS_PER_DAY = 3_150;

const sum = (points: TrendPoint[], key: 'revenue' | 'orders') => points.reduce((total, p) => total + p[key], 0);

const pctChange = (current: number, previous: number) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 10;

/** Every figure is computed from the rows for the chosen range, and compared with the period before it. */
export async function getMetrics(range: TrendRange = '30d'): Promise<Metric[]> {
  await latency();
  const days = RANGE_DAYS[range];
  const { users, trend } = getDb();
  const current = trend.slice(-days);
  const previous = trend.slice(-days * 2, -days);
  const baseline = `vs prior ${days} days`;

  const members = users.filter((u) => !u.deletedAt);
  const since = Date.now() - days * DAY;
  const joined = members.filter((u) => new Date(u.createdAt).getTime() > since).length;

  const revenue = sum(current, 'revenue');
  const orders = sum(current, 'orders');
  const conversion = Math.round((orders / (VISITS_PER_DAY * days)) * 1000) / 10;
  const prevConversion = Math.round((sum(previous, 'orders') / (VISITS_PER_DAY * days)) * 1000) / 10;

  return [
    {
      id: 'users',
      label: 'Members',
      value: members.length,
      change: null,
      goodDirection: 'up',
      caption: joined === 0 ? `No one joined in ${days} days` : `+${joined} joined in ${days} days`,
      format: 'number',
    },
    { id: 'revenue', label: 'Revenue', value: revenue, change: pctChange(revenue, sum(previous, 'revenue')), goodDirection: 'up', caption: baseline, format: 'currency' },
    { id: 'orders', label: 'Orders', value: orders, change: pctChange(orders, sum(previous, 'orders')), goodDirection: 'up', caption: baseline, format: 'number' },
    { id: 'conversion', label: 'Conversion', value: conversion, change: pctChange(conversion, prevConversion), goodDirection: 'up', caption: baseline, format: 'percent' },
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

/** Everyone in the workspace (deleted accounts excluded), grouped by department in a fixed order. */
export async function getRoster(): Promise<RosterGroup[]> {
  await latency(200, 450);
  const members = getDb().users.filter((u) => !u.deletedAt);
  return DEPARTMENTS.map((department) => ({
    department,
    people: members
      .filter((u) => u.department === department)
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name))
      .map(({ id, name, isActive }) => ({ id, name, isActive })),
  })).filter((g) => g.people.length > 0);
}
