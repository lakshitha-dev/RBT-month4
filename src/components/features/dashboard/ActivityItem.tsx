import { memo } from 'react';
import type { Activity } from '@/types';
import { formatRelative } from '@/utils/format';
import { Avatar } from '@/components/common/Avatar';

/** One event: who, what, when. The words carry the kind of change; no coloured dot per type. */
export const ActivityItem = memo(function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex h-12 items-center gap-3">
      <Avatar name={activity.actor} size="sm" />
      <p className="min-w-0 flex-1 truncate text-sm text-muted">
        <span className="font-medium text-ink">{activity.actor}</span> {activity.message}
      </p>
      <time dateTime={activity.timestamp} className="num shrink-0 text-xs text-muted">
        {formatRelative(activity.timestamp)}
      </time>
    </div>
  );
});
