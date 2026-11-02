import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteUser, useRestoreUser, useUpdateUser, useUsersList } from '@/hooks/useUsers';
import { useUsersQueryParams } from '@/hooks/useUsersQueryParams';
import type { User } from '@/types';
import { formatNumber } from '@/utils/format';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { PlusIcon } from '@/components/common/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeleteUserDialog } from '@/components/features/users/DeleteUserDialog';
import { UserFilters } from '@/components/features/users/UserFilters';
import { UserForm } from '@/components/features/users/UserForm';
import { UsersTable } from '@/components/features/users/UsersTable';

export default function UsersPage() {
  const { query, update, reset } = useUsersQueryParams();
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

  const hasFilters = query.search || query.role !== 'all' || query.status !== 'all' || query.includeDeleted;
  const total = data?.total ?? 0;

  return (
    <>
      <PageHeader
        title="Users"
        description="Create, edit and manage user accounts."
        actions={
          <Link
            to="/users/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <PlusIcon />
            Add user
          </Link>
        }
      />

      <Card>
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <UserFilters query={query} onChange={update} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
          <h2 ref={resultsHeadingRef} tabIndex={-1} className="text-base font-semibold text-slate-900 dark:text-white">
            All users
          </h2>
          {/* Announces result counts after debounced searches and filter changes. */}
          <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
            {isPending ? 'Loading users…' : isFetching ? 'Updating results…' : `${formatNumber(total)} ${total === 1 ? 'user' : 'users'} found`}
          </p>
        </div>

        <div className="defer-offscreen py-2">
          {isError ? (
            <div className="p-5">
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
            </div>
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
                <div className="space-y-2">
                  <p className="font-medium text-slate-900 dark:text-white">No users match your filters.</p>
                  {hasFilters && (
                    <Button size="sm" variant="secondary" onClick={reset}>
                      Clear filters
                    </Button>
                  )}
                </div>
              }
            />
          )}
        </div>

        {data && data.total > 0 && (
          <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
            <Pagination
              page={data.page}
              pageCount={data.pageCount}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={(page) => update({ page })}
            />
          </div>
        )}
      </Card>

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
