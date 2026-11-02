import { useMemo, type ReactNode } from 'react';
import clsx from 'clsx';
import type { Role, User, UserSortField } from '@/types';
import { formatDate } from '@/utils/format';
import { Avatar } from '@/components/common/Avatar';
import { Badge, type BadgeTone } from '@/components/common/Badge';
import { Table, type Column, type SortState } from '@/components/common/Table';
import { EditIcon, RestoreIcon, TrashIcon } from '@/components/common/icons';

const ROLE_TONE: Record<Role, BadgeTone> = { admin: 'brand', editor: 'warning', user: 'neutral' };

const actionButton =
  'rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  sort: SortState;
  onSortChange: (sort: { by: UserSortField; dir: SortState['dir'] }) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  emptyMessage: ReactNode;
}

export function UsersTable({ users, isLoading, sort, onSortChange, onEdit, onDelete, onRestore, emptyMessage }: UsersTableProps) {
  // Stable column definitions so memoised rows only re-render when their user changes.
  const columns = useMemo<Column<User>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        isRowHeader: true,
        render: (u) => (
          <span className="flex items-center gap-3">
            <Avatar name={u.name} size="sm" />
            <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
          </span>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        render: (u) => <span className="text-slate-700 dark:text-slate-300">{u.email}</span>,
      },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        render: (u) => <Badge tone={ROLE_TONE[u.role]} className="capitalize">{u.role}</Badge>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (u) =>
          u.deletedAt ? (
            <Badge tone="danger">Deleted</Badge>
          ) : u.isActive ? (
            <Badge tone="success">Active</Badge>
          ) : (
            <Badge>Inactive</Badge>
          ),
      },
      {
        key: 'createdAt',
        header: 'Joined',
        sortable: true,
        render: (u) => (
          <time dateTime={u.createdAt} className="whitespace-nowrap text-slate-700 dark:text-slate-300">
            {formatDate(u.createdAt)}
          </time>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        hideHeader: true,
        className: 'text-right',
        render: (u) =>
          u.deletedAt ? (
            <button type="button" className={actionButton} onClick={() => onRestore(u)} aria-label={`Restore ${u.name}`} title="Restore">
              <RestoreIcon className="size-4" />
            </button>
          ) : (
            <span className="inline-flex gap-1">
              <button type="button" className={actionButton} onClick={() => onEdit(u)} aria-label={`Edit ${u.name}`} title="Edit">
                <EditIcon className="size-4" />
              </button>
              <button
                type="button"
                className={clsx(actionButton, 'hover:text-red-700 dark:hover:text-red-400')}
                onClick={() => onDelete(u)}
                aria-label={`Delete ${u.name}`}
                title="Delete"
              >
                <TrashIcon className="size-4" />
              </button>
            </span>
          ),
      },
    ],
    [onEdit, onDelete, onRestore],
  );

  return (
    <Table
      caption="Users"
      hideCaption
      columns={columns}
      rows={users}
      rowKey={(u) => u.id}
      sort={sort}
      onSortChange={(s) => onSortChange({ by: s.by as UserSortField, dir: s.dir })}
      isLoading={isLoading}
      skeletonRows={8}
      emptyMessage={emptyMessage}
      rowClassName={(u) => (u.deletedAt ? 'bg-slate-100/70 dark:bg-slate-800/40' : undefined)}
    />
  );
}
