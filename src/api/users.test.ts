import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_USERS_QUERY } from '@/hooks/useUsersQueryParams';
import { resetDb } from './db';
import { createUser, deleteUser, listUsers, restoreUser } from './users';

describe('mock users API', () => {
  beforeEach(() => resetDb());

  it('paginates, sorts and filters', async () => {
    const page = await listUsers({ ...DEFAULT_USERS_QUERY, sortBy: 'name', sortDir: 'asc', pageSize: 10 });
    expect(page.items).toHaveLength(10);
    const names = page.items.map((u) => u.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));

    const admins = await listUsers({ ...DEFAULT_USERS_QUERY, role: 'admin', pageSize: 50 });
    expect(admins.total).toBeGreaterThan(0);
    expect(admins.items.every((u) => u.role === 'admin')).toBe(true);
  });

  it('rejects duplicate emails', async () => {
    const [existing] = (await listUsers(DEFAULT_USERS_QUERY)).items;
    await expect(
      createUser({ name: 'Dup', email: existing!.email, role: 'user', isActive: true }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('soft deletes and restores', async () => {
    const search = 'temp.user@adminflow.dev';
    const user = await createUser({ name: 'Temp User', email: search, role: 'user', isActive: true });
    await deleteUser(user.id);
    expect((await listUsers({ ...DEFAULT_USERS_QUERY, search })).total).toBe(0);

    const withDeleted = await listUsers({ ...DEFAULT_USERS_QUERY, search, status: 'deleted' });
    expect(withDeleted.items[0]?.deletedAt).not.toBeNull();

    expect(withDeleted.counts).toMatchObject({ all: 0, deleted: 1 });

    await restoreUser(user.id);
    expect((await listUsers({ ...DEFAULT_USERS_QUERY, search })).total).toBe(1);
  });
});
