import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { selectUnreadCount, useNotificationStore } from '@/stores/notificationStore';
import { BellIcon } from '@/components/common/icons';
import { NotificationItem } from './NotificationItem';

/** Disclosure-style popover listing the latest notifications. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = useNotificationStore(selectUnreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const label = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications';

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-raised hover:text-ink"
      >
        <BellIcon className="size-[18px]" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="num absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-negative px-1 text-[11px] leading-4 font-semibold text-white dark:text-black"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Recent notifications"
          // taste-skill-ignore: a popover floats over the page, so it carries a shadow
          className="animate-rise-in absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line bg-surface shadow-[0_8px_28px_rgb(0_0_0/0.14)]"
        >
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Notifications</h2>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="text-xs font-medium text-ink underline-offset-2 hover:underline disabled:text-muted disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">You're all caught up.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-rule overflow-y-auto">
              {notifications.slice(0, 6).map((n) => (
                <li key={n.id}>
                  <NotificationItem notification={n} onMarkRead={markRead} />
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-rule px-4 py-2.5">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ink underline-offset-2 hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
