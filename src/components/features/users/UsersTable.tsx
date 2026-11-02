import { memo, useMemo, type ReactNode } from 'react';
import clsx from 'clsx';
import type { User, UserSortField } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { Table, type Column, type SortState } from '@/components/common/Table';
import { EditIcon, RestoreIcon, TrashIcon } from '@/components/common/icons';

const actionButton =
  'flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-raised hover:text-ink';

const roleLabel = (u: User) => u.role[0]!.toUpperCase() + u.role.slice(1);
const isoDate = (iso: string) => iso.slice(0, 10);

/** One status mark per row: a pale pill. */
function StatusPill({ user }: { user: User }) {
  if (user.deletedAt) return <Badge tone="danger">Deleted</Badge>;
  return user.isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>;
}

interface RowActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
}

function RowActions({ user: u, onEdit, onDelete, onRestore }: RowActionsProps) {
  if (u.deletedAt) {
    return (
      <button type="button" className={actionButton} onClick={() => onRestore(u)} aria-label={`Restore ${u.name}`} title="Restore">
        <RestoreIcon className="size-4" />
      </button>
    );
  }
  return (
    <span className="inline-flex gap-0.5">
      <button type="button" className={actionButton} onClick={() => onEdit(u)} aria-label={`Edit ${u.name}`} title="Edit">
        <EditIcon className="size-4" />
      </button>
      <button
        type="button"
        className={clsx(actionButton, 'hover:text-negative')}
        onClick={() => onDelete(u)}
        aria-label={`Delete ${u.name}`}
        title="Delete"
      >
        <TrashIcon className="size-4" />
      </button>
    </span>
  );
}

/** Phone layout: two-line rows (identity and status on line 1, the other fields on line 2). Nothing is dropped. */
const UserListRow = memo(function UserListRow(props: RowActionsProps) {
  const u = props.user;
  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar name={u.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span className="truncate font-medium text-ink">{u.name}</span>
          <span className="sr-only">, </span>
          <StatusPill user={u} />
        </p>
        <p className="text-[13px] break-words text-muted">
          {u.email} · {roleLabel(u)} · {u.department}
        </p>
      </div>
      <RowActions {...props} />
    </li>
  );
});

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
        className: 'w-[38%]',
        // Two measures stack in one cell: the name over the email, on one left edge.
        render: (u) => (
          <span className="flex items-center gap-3">
            <Avatar name={u.name} size="sm" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">{u.name}</span>
              {/* Stacked blocks have no space between them for screen readers (NVDA finding F6). */}
              <span className="sr-only">, </span>
              <span className="block truncate text-xs text-muted">{u.email}</span>
            </span>
          </span>
        ),
      },
      { key: 'role', header: 'Role', sortable: true, render: (u) => <span className="text-ink">{roleLabel(u)}</span> },
      { key: 'department', header: 'Department', render: (u) => <span className="text-muted">{u.department}</span> },
      { key: 'status', header: 'Status', render: (u) => <StatusPill user={u} /> },
      {
        key: 'createdAt',
        header: 'Joined',
        sortable: true,
        className: 'text-right',
        render: (u) => (
          <time dateTime={u.createdAt} className="num whitespace-nowrap text-muted">
            {isoDate(u.createdAt)}
          </time>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        hideHeader: true,
        className: 'w-24 text-right',
        render: (u) => <RowActions user={u} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />,
      },
    ],
    [onEdit, onDelete, onRestore],
  );

  return (
    <>
      <div className="hidden sm:block">
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
        />
      </div>
      <div className="sm:hidden">
        {users.length === 0 && isLoading ? (
          <div role="status" aria-label="Loading users" className="divide-y divide-rule">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-7 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3.5 w-56" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-muted">{emptyMessage}</div>
        ) : (
          <ul aria-label="Users" className="divide-y divide-rule">
            {users.map((u) => (
              <UserListRow key={u.id} user={u} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
