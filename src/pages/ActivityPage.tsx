import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useActivity } from '@/hooks/useDashboard';
import { useDebounce } from '@/hooks/useDebounce';
import { formatNumber } from '@/utils/format';
import { Alert } from '@/components/common/Alert';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';
import { SearchIcon } from '@/components/common/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivityItem } from '@/components/features/dashboard/ActivityItem';
import { BreakdownList } from '@/components/features/dashboard/BreakdownList';
import type { ActivityType } from '@/types';

const ROW_HEIGHT = 49; // 48px row + 1px rule

const KIND_LABELS: Record<ActivityType, string> = {
  create: 'Users created',
  update: 'Users updated',
  delete: 'Users deleted',
  restore: 'Users restored',
  login: 'Sign-ins',
};

export default function ActivityPage() {
  const { data, isPending, isError, refetch } = useActivity();
  const [search, setSearch] = useState('');
  const term = useDebounce(search, 300).trim().toLowerCase();
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => (data ?? []).filter((a) => !term || `${a.actor} ${a.message}`.toLowerCase().includes(term)),
    [data, term],
  );

  // The rail counts the same rows the list shows, so it follows the search.
  const byKind = useMemo(
    () =>
      (Object.keys(KIND_LABELS) as ActivityType[]).map((type) => ({
        label: KIND_LABELS[type],
        value: items.filter((a) => a.type === type).length,
      })),
    [items],
  );
  const byPerson = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of items) counts.set(a.actor, (counts.get(a.actor) ?? 0) + 1);
    return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [items]);

  // Only the visible rows (+ overscan) are in the DOM, however long the log grows.
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <>
      <PageHeader title="Activity" description="Every change made in this workspace, newest first." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div role="search" aria-label="Filter activity" className="w-full sm:w-80">
              <Input
                label="Search activity"
                hideLabel
                type="search"
                leftIcon={<SearchIcon className="size-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by person or action"
              />
            </div>
            <p role="status" className="num pb-2 text-sm text-muted">
              {isPending ? 'Loading activity…' : `${formatNumber(items.length)} events`}
            </p>
          </div>

          {isError ? (
            <Alert
              variant="error"
              title="Couldn't load the activity log"
              action={
                <button type="button" className="font-medium text-ink underline underline-offset-2" onClick={() => refetch()}>
                  Retry
                </button>
              }
            />
          ) : isPending ? (
            <div className="divide-y divide-rule rounded-card border border-line px-4" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex h-12 items-center gap-3">
                  <Skeleton className="size-7 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-card border border-line px-4 py-6 text-sm text-muted">No events match “{term}”.</p>
          ) : (
            <div
              ref={scrollRef}
              className="h-[640px] max-h-[70vh] overflow-y-auto rounded-card border border-line px-4"
              tabIndex={0}
              role="region"
              aria-label="Activity events"
            >
              <ul className="relative" style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map((row) => (
                  <li
                    key={items[row.index]!.id}
                    aria-posinset={row.index + 1}
                    aria-setsize={items.length}
                    className="absolute inset-x-0 border-b border-rule"
                    style={{ height: row.size, transform: `translateY(${row.start}px)` }}
                  >
                    <ActivityItem activity={items[row.index]!} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <BreakdownList title="By kind of change" rows={byKind} empty="No events match this search." />
          <BreakdownList title="Most active people" rows={byPerson} empty="No events match this search." />
        </div>
      </div>
    </>
  );
}
