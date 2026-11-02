import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '@/api/users';
import { notify, useNotificationStore } from '@/stores/notificationStore';
import { toCsv, downloadFile } from '@/utils/csv';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { BellIcon, DownloadIcon, PlusIcon, UsersIcon } from '@/components/common/icons';

export function QuickActions() {
  const navigate = useNavigate();
  const markAllRead = useNotificationStore((s) => s.markAllRead);
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
    <Card>
      <Card.Header title="Quick actions" />
      <Card.Body className="grid gap-2 sm:grid-cols-2">
        <Button leftIcon={<PlusIcon />} onClick={() => navigate('/users/new')}>
          Add user
        </Button>
        <Button variant="secondary" leftIcon={<UsersIcon />} onClick={() => navigate('/users')}>
          Manage users
        </Button>
        <Button variant="secondary" leftIcon={<DownloadIcon />} isLoading={exporting} onClick={exportUsers}>
          Export CSV
        </Button>
        <Button
          variant="secondary"
          leftIcon={<BellIcon />}
          onClick={() => {
            markAllRead();
            notify({ type: 'info', title: 'Inbox cleared', message: 'All notifications marked as read.', inbox: false });
          }}
        >
          Mark all read
        </Button>
      </Card.Body>
    </Card>
  );
}
