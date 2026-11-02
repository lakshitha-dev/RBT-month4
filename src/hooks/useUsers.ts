import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import * as usersApi from '@/api/users';
import { notify } from '@/stores/notificationStore';
import type { User, UserInput, UsersPage, UsersQuery } from '@/types';

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (query: UsersQuery) => [...usersKeys.lists(), query] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

/** Users feed the lists, the roster (under ['users']) and the dashboard's Members figure. */
const invalidateUserData = (client: QueryClient) =>
  Promise.all([
    client.invalidateQueries({ queryKey: usersKeys.all }),
    client.invalidateQueries({ queryKey: ['dashboard', 'metrics'] }),
  ]);

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.');

export function useUsersList(query: UsersQuery) {
  return useQuery({
    queryKey: usersKeys.list(query),
    queryFn: () => usersApi.listUsers(query),
    // Keep showing the previous page while the next one loads (no table flash).
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(id ?? ''),
    queryFn: () => usersApi.getUser(id!),
    enabled: Boolean(id),
  });
}

type ListSnapshot = [readonly unknown[], UsersPage | undefined][];

/** Applies `patch` to a user in every cached list page and detail entry; returns a rollback snapshot. */
async function patchCachedUser(client: QueryClient, id: string, patch: Partial<User>) {
  await client.cancelQueries({ queryKey: usersKeys.all });
  const lists: ListSnapshot = client.getQueriesData<UsersPage>({ queryKey: usersKeys.lists() });
  const detail = client.getQueryData<User>(usersKeys.detail(id));

  client.setQueriesData<UsersPage>({ queryKey: usersKeys.lists() }, (page) =>
    page ? { ...page, items: page.items.map((u) => (u.id === id ? { ...u, ...patch } : u)) } : page,
  );
  if (detail) client.setQueryData<User>(usersKeys.detail(id), { ...detail, ...patch });

  return { lists, detail };
}

function rollback(client: QueryClient, id: string, snapshot?: Awaited<ReturnType<typeof patchCachedUser>>) {
  if (!snapshot) return;
  snapshot.lists.forEach(([key, data]) => client.setQueryData(key, data));
  if (snapshot.detail) client.setQueryData(usersKeys.detail(id), snapshot.detail);
}

export function useCreateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UserInput) => usersApi.createUser(input),
    onSuccess: (user) => {
      notify({ type: 'success', title: 'User created', message: `${user.name} was added as ${user.role}.` });
    },
    onSettled: () => invalidateUserData(client),
  });
}

/** Optimistic update: the table reflects the edit immediately and rolls back on failure. */
export function useUpdateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UserInput> }) => usersApi.updateUser(id, input),
    onMutate: ({ id, input }) => patchCachedUser(client, id, input),
    onError: (error, { id }, snapshot) => {
      rollback(client, id, snapshot);
      notify({ type: 'error', title: 'Update failed', message: errorMessage(error) });
    },
    onSuccess: (user) => notify({ type: 'success', title: 'User updated', message: `${user.name} was saved.` }),
    onSettled: () => invalidateUserData(client),
  });
}

/** Not tied to a component lifecycle, so it is safe to call from a toast after the page unmounts. */
function undoDelete(client: QueryClient, user: User) {
  usersApi
    .restoreUser(user.id)
    .then(() => notify({ type: 'success', title: 'User restored', message: `${user.name} is back.` }))
    .catch((error) => notify({ type: 'error', title: 'Restore failed', message: errorMessage(error) }))
    .finally(() => invalidateUserData(client));
}

export function useDeleteUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => usersApi.deleteUser(user.id),
    onMutate: (user) =>
      patchCachedUser(client, user.id, { deletedAt: new Date().toISOString(), isActive: false }),
    onError: (error, user, snapshot) => {
      rollback(client, user.id, snapshot);
      notify({ type: 'error', title: 'Delete failed', message: errorMessage(error) });
    },
    onSuccess: (user) =>
      notify({
        type: 'success',
        title: 'User deleted',
        message: `${user.name} was moved to deleted users.`,
        action: { label: 'Undo', onClick: () => undoDelete(client, user) },
      }),
    onSettled: () => invalidateUserData(client),
  });
}

export function useRestoreUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => usersApi.restoreUser(user.id),
    onMutate: (user) => patchCachedUser(client, user.id, { deletedAt: null }),
    onError: (error, user, snapshot) => {
      rollback(client, user.id, snapshot);
      notify({ type: 'error', title: 'Restore failed', message: errorMessage(error) });
    },
    onSuccess: (user) => notify({ type: 'success', title: 'User restored', message: `${user.name} is back.` }),
    onSettled: () => invalidateUserData(client),
  });
}
