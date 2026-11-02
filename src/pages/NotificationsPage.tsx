import { useState } from 'react';
import { selectUnreadCount, useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/common/Button';
import { Tabs } from '@/components/common/Tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { NotificationItem } from '@/components/features/notifications/NotificationItem';
import { BreakdownList } from '@/components/features/dashboard/BreakdownList';
import type { NotificationType } from '@/types';

type Filter = 'all' | 'unread';

const KIND_LABELS: Record<NotificationType, string> = {
  error: 'Problems',
  warning: 'Warnings',
  success: 'Completed changes',
  info: 'Updates',
};

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = useNotificationStore(selectUnreadCount);
  const { markRead, markAllRead, remove, clearAll, notify } = useNotificationStore.getState();
  const [filter, setFilter] = useState<Filter>('all');

  const list = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const byKind = (Object.keys(KIND_LABELS) as NotificationType[]).map((type) => ({
    label: KIND_LABELS[type],
    value: notifications.filter((n) => n.type === type).length,
  }));

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          <span className="num">
            {unread === 0 ? 'Nothing unread.' : `${unread} unread`} · system messages and the results of changes you made
          </span>
        }
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => notify({ type: 'info', title: 'Test notification', message: 'This is how new notifications appear.' })}
            >
              Send test notification
            </Button>
            <Button variant="secondary" onClick={markAllRead} disabled={unread === 0}>
              Mark all as read
            </Button>
            <Button variant="danger" onClick={clearAll} disabled={notifications.length === 0}>
              Clear all
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <Tabs.List label="Filter notifications">
              <Tabs.Tab value="all">
                All{' '}
                <span className="num ml-0.5 font-normal text-muted">{notifications.length}</span>
              </Tabs.Tab>
              <Tabs.Tab value="unread">
                Unread{' '}
                <span className="num ml-0.5 font-normal text-muted">{unread}</span>
              </Tabs.Tab>
            </Tabs.List>
            {(['all', 'unread'] as const).map((value) => (
              <Tabs.Panel key={value} value={value} className="mt-4 rounded-card">
                {list.length === 0 ? (
                  <p className="rounded-card border border-line px-4 py-6 text-sm text-muted">
                    {value === 'unread' ? 'No unread notifications.' : "You're all caught up. New messages will appear here."}
                  </p>
                ) : (
                  <ul className="divide-y divide-rule overflow-hidden rounded-card border border-line">
                    {list.map((n) => (
                      <li key={n.id}>
                        <NotificationItem notification={n} onMarkRead={markRead} onRemove={remove} />
                      </li>
                    ))}
                  </ul>
                )}
              </Tabs.Panel>
            ))}
          </Tabs>
        </div>
        <BreakdownList title="Inbox by kind" rows={byKind} empty="The inbox is empty." />
      </div>
    </>
  );
}
