import { memo } from 'react';
import clsx from 'clsx';
import type { Activity, ActivityType } from '@/types';
import { formatRelative } from '@/utils/format';
import { Avatar } from '@/components/common/Avatar';

const TYPE_STYLES: Record<ActivityType, string> = {
  create: 'bg-emerald-600',
  update: 'bg-sky-600',
  delete: 'bg-red-600',
  restore: 'bg-amber-500',
  login: 'bg-slate-400',
};

export const ActivityItem = memo(function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative">
        <Avatar name={activity.actor} size="sm" />
        <span
          aria-hidden="true"
          className={clsx('absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-white dark:ring-slate-900', TYPE_STYLES[activity.type])}
        />
      </div>
      <p className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
        <span className="font-medium text-slate-900 dark:text-white">{activity.actor}</span> {activity.message}
      </p>
      <time dateTime={activity.timestamp} className="shrink-0 text-xs text-slate-600 dark:text-slate-400">
        {formatRelative(activity.timestamp)}
      </time>
    </div>
  );
});
