import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '@/api/users';
import { notify, selectUnreadCount, useNotificationStore } from '@/stores/notificationStore';
import { toCsv, downloadFile } from '@/utils/csv';
import { Spinner } from '@/components/common/Spinner';
import { ChevronRightIcon, DownloadIcon, BellIcon, UsersIcon } from '@/components/common/icons';

const row =
  'flex h-12 w-full items-center gap-3 text-left text-sm text-ink transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-muted';

/** The jobs an admin does from here besides adding a user (the primary action in the title row). */
export function QuickActions() {
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unread = useNotificationStore(selectUnreadCount);
  const [exporting, setExporting] = useState(false);

  const exportUsers = async () => {
    setExporting(true);
    try {
      const users = await getAllUsers();
      downloadFile(
        `adminflow-users-${new Date().toISOString().slice(0, 10)}.csv`,
        toCsv(users, ['id', 'name', 'email', 'role', 'department', 'isActive', 'createdAt']),
      );
      notify({ type: 'success', title: 'Export complete', message: `${users.length} users exported to CSV.` });
    } catch {
      notify({ type: 'error', title: 'Export failed', message: 'Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-2 text-base font-semibold text-ink">
        Quick actions
      </h2>
      <ul className="divide-y divide-rule rounded-card border border-line bg-surface px-4">
        <li>
          <Link to="/users" className={row}>
            <UsersIcon className="size-4 text-muted" />
            <span className="flex-1">Manage users and roles</span>
            <ChevronRightIcon className="size-4 text-muted" />
          </Link>
        </li>
        <li>
          <button type="button" className={row} onClick={exportUsers} disabled={exporting} aria-busy={exporting || undefined}>
            {exporting ? <Spinner size="sm" label={null} className="text-muted" /> : <DownloadIcon className="size-4 text-muted" />}
            <span className="flex-1">{exporting ? 'Exporting users…' : 'Export users as CSV'}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={row}
            disabled={unread === 0}
            onClick={() => {
              markAllRead();
              notify({ type: 'info', title: 'Inbox cleared', message: 'All notifications marked as read.', inbox: false });
            }}
          >
            <BellIcon className="size-4 text-muted" />
            <span className="flex-1">Mark all notifications read</span>
            <span className="num text-xs text-muted">
              <span className="sr-only">, </span>
              {unread === 0 ? 'None unread' : `${unread} unread`}
            </span>
          </button>
        </li>
      </ul>
    </section>
  );
}
