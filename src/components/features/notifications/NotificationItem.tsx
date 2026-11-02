import { memo } from 'react';
import clsx from 'clsx';
import type { AppNotification, NotificationType } from '@/types';
import { formatRelative } from '@/utils/format';
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from '@/components/common/icons';

const ICONS = { info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon };
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  info: 'text-muted',
  success: 'text-positive',
  warning: 'text-warning',
  error: 'text-negative',
};

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const NotificationItem = memo(function NotificationItem({ notification: n, onMarkRead, onRemove }: NotificationItemProps) {
  const Icon = ICONS[n.type];
  return (
    <div className={clsx('flex gap-3 px-4 py-3', !n.read && 'bg-raised/70')}>
      <Icon className={clsx('mt-0.5 size-4 shrink-0', NOTIFICATION_COLORS[n.type])} />
      <div className="min-w-0 flex-1 text-sm">
        <p className={clsx('text-ink', n.read ? 'font-normal' : 'font-semibold')}>
          {!n.read && <span className="sr-only">Unread: </span>}
          {n.title}
        </p>
        {n.message && <p className="text-muted">{n.message}</p>}
        <p className="mt-1 text-xs text-muted">
          <time dateTime={n.createdAt}>{formatRelative(n.createdAt)}</time>
        </p>
        <div className="mt-1 flex gap-3 text-xs">
          {!n.read && (
            <button
              type="button"
              onClick={() => onMarkRead(n.id)}
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Mark as read<span className="sr-only">: {n.title}</span>
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(n.id)}
              className="font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Remove<span className="sr-only">: {n.title}</span>
            </button>
          )}
        </div>
      </div>
      {!n.read && <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
    </div>
  );
});
