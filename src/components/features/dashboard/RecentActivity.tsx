import { Link } from 'react-router-dom';
import { useActivity } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/common/Skeleton';
import { ActivityItem } from './ActivityItem';

const ROWS = 5;

/** Rail block: the heading sits outside its card; capped rows closed by "View all", never pagination. */
export function RecentActivity() {
  const { data, isPending, isError, refetch } = useActivity(ROWS);

  return (
    <section aria-labelledby="recent-activity-heading">
      <h2 id="recent-activity-heading" className="mb-2 text-base font-semibold text-ink">
        Recent activity
      </h2>
      <div className="rounded-card border border-line bg-surface px-4">
        {isError ? (
          <div className="flex items-center justify-between gap-3 py-4 text-sm">
            <p className="text-ink">Couldn't load activity.</p>
            <button type="button" className="font-medium text-ink underline underline-offset-2" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        ) : isPending ? (
          <div role="status" aria-label="Loading activity" className="divide-y divide-rule">
            {Array.from({ length: ROWS }, (_, i) => (
              <div key={i} className="flex h-12 items-center gap-3">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-4 text-sm text-muted">No changes have been made in this workspace yet.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {data.map((activity) => (
              <li key={activity.id}>
                <ActivityItem activity={activity} />
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-rule py-3">
          <Link
            to="/activity"
            className="flex h-8 w-full items-center justify-center rounded-control border border-control text-sm font-medium text-ink hover:bg-raised"
          >
            View all<span className="sr-only"> activity</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
