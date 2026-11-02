import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useRoster } from '@/hooks/useDashboard';
import type { TrendRange } from '@/types';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { Tabs } from '@/components/common/Tabs';
import { PlusIcon, RestoreIcon } from '@/components/common/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricsSection } from '@/components/features/dashboard/MetricsSection';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { RecentActivity } from '@/components/features/dashboard/RecentActivity';
import { TrendCard } from '@/components/features/dashboard/TrendCard';
import { WorkspaceRoster } from '@/components/features/dashboard/WorkspaceRoster';

const RANGES: { value: TrendRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

/**
 * The screen's question: "Who's in the workspace, and does anything need my attention?"
 * The finding (inactive accounts) leads under the title, next to the action it drives; the most frequent
 * job (adding a user) is the one primary button. Each widget owns its query, so one response re-renders one widget.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [range, setRange] = useState<TrendRange>('30d');
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const refreshing = useIsFetching() > 0;
  const roster = useRoster();

  // The finding and the roster read the same rows, so the two copies of the count always agree.
  const people = roster.data?.flatMap((g) => g.people) ?? [];
  const inactive = people.filter((p) => !p.isActive).length;

  const refresh = async () => {
    await queryClient.invalidateQueries();
    setUpdatedAt(new Date());
  };

  return (
    <>
      <PageHeader
        title="Overview"
        description={
          roster.isPending ? (
            // The finding wraps to two lines on phones, so its placeholder does too (no layout shift when it lands).
            <span className="flex h-10 flex-col justify-around sm:h-5">
              <Skeleton className="h-4 w-72 max-w-full" />
              <Skeleton className="h-4 w-40 sm:hidden" />
            </span>
          ) : roster.isError ? (
            'Workspace health and activity.'
          ) : inactive === 0 ? (
            `All ${people.length} accounts in the workspace are active.`
          ) : (
            <>
              <span className="num">
                {inactive} of {people.length} accounts are inactive and can't sign in.
              </span>{' '}
              <Link to="/users?status=inactive" className="font-medium text-ink underline underline-offset-2 hover:text-accent">
                Review inactive
              </Link>
            </>
          )
        }
        actions={
          <Button leftIcon={<PlusIcon />} onClick={() => navigate('/users/new')}>
            Add user
          </Button>
        }
      />

      <Tabs value={range} onValueChange={(v) => setRange(v as TrendRange)}>
        {/* Scope row: the date range drives every figure below; freshness and refresh on the right of the same rule. */}
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-line">
          <Tabs.List label="Date range" ruled={false}>
            {RANGES.map((r) => (
              <Tabs.Tab key={r.value} value={r.value}>
                {r.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <div className="flex items-center gap-2 pb-2 text-xs text-muted">
            <span className="num hidden sm:inline">Updated {timeFmt.format(updatedAt)}</span>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="flex h-7 items-center gap-1.5 rounded-control px-2 font-medium text-ink hover:bg-raised disabled:text-muted"
            >
              <RestoreIcon className={refreshing ? 'size-3.5 animate-spin [animation-direction:reverse]' : 'size-3.5'} />
              {refreshing ? 'Refreshing' : 'Refresh'}
            </button>
          </div>
        </div>

        <Tabs.Panel value={range} className="rounded-card">
          {/* 1fr main column + a 384px rail, one 24px gutter everywhere. */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_384px]">
            <div className="flex min-w-0 flex-col gap-6">
              <MetricsSection range={range} />
              <TrendCard range={range} />
            </div>
            <div className="defer-offscreen flex min-w-0 flex-col gap-6">
              <RecentActivity />
              <QuickActions />
            </div>
          </div>
        </Tabs.Panel>
      </Tabs>

      <div className="defer-offscreen mt-6">
        <WorkspaceRoster
          roster={roster.data}
          isPending={roster.isPending}
          isError={roster.isError}
          onRetry={() => roster.refetch()}
        />
      </div>
    </>
  );
}
