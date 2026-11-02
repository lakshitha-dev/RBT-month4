import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useActivity } from '@/hooks/useDashboard';
import { useDebounce } from '@/hooks/useDebounce';
import { formatNumber } from '@/utils/format';
import { Alert } from '@/components/common/Alert';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';
import { SearchIcon } from '@/components/common/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivityItem } from '@/components/features/dashboard/ActivityItem';

const ROW_HEIGHT = 57;

export default function ActivityPage() {
  const { data, isPending, isError, refetch } = useActivity();
  const [search, setSearch] = useState('');
  const term = useDebounce(search, 300).trim().toLowerCase();
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => (data ?? []).filter((a) => !term || `${a.actor} ${a.message}`.toLowerCase().includes(term)),
    [data, term],
  );

  // Only the visible rows (+ overscan) are in the DOM, however long the log grows.
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <>
      <PageHeader title="Activity log" description="Every change made in AdminFlow, newest first." />
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
          <div role="search" aria-label="Filter activity" className="w-full sm:w-80">
            <Input
              label="Search activity"
              type="search"
              leftIcon={<SearchIcon />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Person or action"
            />
          </div>
          <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
            {isPending ? 'Loading activity…' : `${formatNumber(items.length)} events`}
          </p>
        </div>

        {isError ? (
          <div className="p-5">
            <Alert
              variant="error"
              title="Couldn't load the activity log"
              action={
                <button type="button" className="font-semibold underline" onClick={() => refetch()}>
                  Retry
                </button>
              }
            />
          </div>
        ) : isPending ? (
          <div className="space-y-4 p-5" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="h-[600px] max-h-[70vh] overflow-y-auto px-5"
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
                  className="absolute inset-x-0 border-b border-slate-200 dark:border-slate-800"
                  style={{ height: row.size, transform: `translateY(${row.start}px)` }}
                >
                  <ActivityItem activity={items[row.index]!} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </>
  );
}
