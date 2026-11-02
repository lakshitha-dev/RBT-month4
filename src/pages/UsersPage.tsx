import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteUser, useRestoreUser, useUpdateUser, useUsersList } from '@/hooks/useUsers';
import { useUsersQueryParams } from '@/hooks/useUsersQueryParams';
import type { StatusFilter, User } from '@/types';
import { formatNumber } from '@/utils/format';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { Tabs } from '@/components/common/Tabs';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { PlusIcon } from '@/components/common/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeleteUserDialog } from '@/components/features/users/DeleteUserDialog';
import { UserFilters } from '@/components/features/users/UserFilters';
import { UserForm } from '@/components/features/users/UserForm';
import { UsersTable } from '@/components/features/users/UsersTable';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted', label: 'Deleted' },
];

export default function UsersPage() {
  const { query, update } = useUsersQueryParams();
  const { data, isPending, isFetching, isError, error, refetch } = useUsersList(query);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const { mutate: restoreUser } = useRestoreUser();

  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  const onEdit = useCallback((user: User) => setEditing(user), []);
  const onDelete = useCallback((user: User) => setDeleting(user), []);
  const onRestore = useCallback((user: User) => restoreUser(user), [restoreUser]);

  const confirmDelete = (user: User) => {
    deleteUser.mutate(user);
    setDeleting(null);
    // The deleted row (and its button) disappears, so move focus somewhere predictable.
    requestAnimationFrame(() => resultsHeadingRef.current?.focus());
  };

  const hasFilters = Boolean(query.search) || query.role !== 'all';
  const total = data?.total ?? 0;
  const counts = data?.counts;
  const statusLabel = STATUS_TABS.find((t) => t.value === query.status)!.label;

  return (
    <>
      <PageHeader
        title="Users"
        description={
          counts ? (
            <span className="num">
              {formatNumber(counts.all)} members · {formatNumber(counts.inactive)} inactive · {formatNumber(counts.deleted)} deleted
            </span>
          ) : isError ? (
            'Everyone with an account in this workspace.'
          ) : (
            // A one-line placeholder at the real size, so nothing below moves when the counts land (CLS).
            <Skeleton className="my-0.5 h-4 w-60" />
          )
        }
        actions={
          <Link
            to="/users/new"
            className="inline-flex h-9 items-center gap-2 rounded-control bg-primary px-3.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            <PlusIcon />
            Add user
          </Link>
        }
      />

      <Tabs value={query.status} onValueChange={(v) => update({ status: v as StatusFilter })}>
        <Tabs.List label="Account status">
          {STATUS_TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value}>
              {t.label}{' '}
              {/* The count's slot is reserved before it loads, so the tabs never shift sideways. */}
              <span className="num ml-0.5 inline-block min-w-[3ch] text-left font-normal text-muted">
                {counts ? formatNumber(counts[t.value]) : ''}
              </span>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value={query.status} className="rounded-card">
          <div className="mt-5 mb-3 flex flex-wrap items-end justify-between gap-3">
            <UserFilters query={query} onChange={update} />
            <div className="flex items-center gap-3 pb-2">
              <h2 ref={resultsHeadingRef} tabIndex={-1} className="sr-only">
                {statusLabel} users
              </h2>
              {/* Announces result counts after debounced searches and filter changes. */}
              <p role="status" className="num text-sm text-muted">
                {isPending ? 'Loading users…' : isFetching ? 'Updating results…' : `${formatNumber(total)} ${total === 1 ? 'user' : 'users'} found`}
              </p>
            </div>
          </div>

          {/* The table sits on the sheet with no card around it. */}
          <div className="defer-offscreen">
            {isError ? (
              <Alert
                variant="error"
                title="Couldn't load users"
                action={
                  <Button size="sm" variant="secondary" onClick={() => refetch()}>
                    Retry
                  </Button>
                }
              >
                {error.message}
              </Alert>
            ) : (
              <UsersTable
                users={data?.items ?? []}
                isLoading={isPending || isFetching}
                sort={{ by: query.sortBy, dir: query.sortDir }}
                onSortChange={({ by, dir }) => update({ sortBy: by, sortDir: dir })}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
                emptyMessage={
                  <div className="space-y-3">
                    <p className="text-ink">
                      {query.status === 'deleted' && !hasFilters ? 'No deleted accounts.' : 'No users match these filters.'}
                    </p>
                    {hasFilters && (
                      <Button size="sm" variant="secondary" onClick={() => update({ search: '', role: 'all' })}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                }
              />
            )}
          </div>

          {data && data.total > 0 && (
            <div className="mt-2 border-t border-rule pt-4">
              <Pagination
                page={data.page}
                pageCount={data.pageCount}
                pageSize={data.pageSize}
                total={data.total}
                onPageChange={(page) => update({ page })}
              />
            </div>
          )}
        </Tabs.Panel>
      </Tabs>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit user" description={editing ? `Update details for ${editing.name}.` : undefined}>
        {editing && (
          <UserForm
            defaultValues={{ name: editing.name, email: editing.email, role: editing.role, isActive: editing.isActive }}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={(input) => {
              // Optimistic: the table updates immediately and rolls back if the request fails.
              updateUser.mutate({ id: editing.id, input });
              setEditing(null);
            }}
          />
        )}
      </Modal>

      <DeleteUserDialog user={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </>
  );
}
