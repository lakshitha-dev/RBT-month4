import { memo } from 'react';
import clsx from 'clsx';
import type { AppNotification, NotificationType } from '@/types';
import { formatRelative } from '@/utils/format';
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from '@/components/common/icons';

const ICONS = { info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon };
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  info: 'text-sky-700 dark:text-sky-300',
  success: 'text-emerald-700 dark:text-emerald-300',
  warning: 'text-amber-700 dark:text-amber-300',
  error: 'text-red-700 dark:text-red-300',
};

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const NotificationItem = memo(function NotificationItem({ notification: n, onMarkRead, onRemove }: NotificationItemProps) {
  const Icon = ICONS[n.type];
  return (
    <div className={clsx('flex gap-3 px-4 py-3', !n.read && 'bg-brand-50/60 dark:bg-brand-800/20')}>
      <Icon className={clsx('mt-0.5 size-5 shrink-0', NOTIFICATION_COLORS[n.type])} />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-slate-900 dark:text-white">
          {!n.read && <span className="sr-only">Unread: </span>}
          {n.title}
        </p>
        {n.message && <p className="text-slate-600 dark:text-slate-300">{n.message}</p>}
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          <time dateTime={n.createdAt}>{formatRelative(n.createdAt)}</time>
        </p>
        <div className="mt-1 flex gap-3 text-xs">
          {!n.read && (
            <button
              type="button"
              onClick={() => onMarkRead(n.id)}
              className="font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              Mark as read<span className="sr-only">: {n.title}</span>
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(n.id)}
              className="font-medium text-slate-700 hover:underline dark:text-slate-300"
            >
              Remove<span className="sr-only">: {n.title}</span>
            </button>
          )}
        </div>
      </div>
      {!n.read && <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600 dark:bg-brand-300" />}
    </div>
  );
});
