import { useState } from 'react';
import { selectUnreadCount, useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Tabs } from '@/components/common/Tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { NotificationItem } from '@/components/features/notifications/NotificationItem';

type Filter = 'all' | 'unread';

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = useNotificationStore(selectUnreadCount);
  const { markRead, markAllRead, remove, clearAll, notify } = useNotificationStore.getState();
  const [filter, setFilter] = useState<Filter>('all');

  const list = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <>
      <PageHeader
        title="Notifications"
        description="System messages and updates about changes you've made."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                notify({ type: 'info', title: 'Test notification', message: 'This is how new notifications appear.' })
              }
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
      <Card>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <Tabs.List label="Filter notifications">
              <Tabs.Tab value="all">All ({notifications.length})</Tabs.Tab>
              <Tabs.Tab value="unread">Unread ({unread})</Tabs.Tab>
            </Tabs.List>
          </div>
          {(['all', 'unread'] as const).map((value) => (
            <Tabs.Panel key={value} value={value}>
              {list.length === 0 ? (
                <p className="px-5 py-12 text-center text-sm text-slate-600 dark:text-slate-400">
                  {value === 'unread' ? 'No unread notifications.' : "You're all caught up."}
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
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
      </Card>
    </>
  );
}
