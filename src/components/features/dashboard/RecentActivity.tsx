import { Link } from 'react-router-dom';
import { useActivity } from '@/hooks/useDashboard';
import { Alert } from '@/components/common/Alert';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { ActivityItem } from './ActivityItem';

export function RecentActivity() {
  const { data, isPending, isError, refetch } = useActivity(8);

  return (
    <Card className="h-full">
      <Card.Header
        title="Recent activity"
        actions={
          <Link to="/activity" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
            View all<span className="sr-only"> activity</span>
          </Link>
        }
      />
      <Card.Body className="py-1">
        {isError ? (
          <Alert
            variant="error"
            title="Couldn't load activity"
            className="my-3"
            action={
              <button type="button" className="font-semibold underline" onClick={() => refetch()}>
                Retry
              </button>
            }
          />
        ) : isPending ? (
          <div role="status" aria-label="Loading activity" className="space-y-4 py-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-7" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.map((activity) => (
              <li key={activity.id}>
                <ActivityItem activity={activity} />
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
}
