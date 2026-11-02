import type { Paginated, User, UserInput, UsersQuery } from '@/types';
import { createId } from '@/utils/id';
import { ApiError, clone, latency } from './client';
import { getDb, logActivity, persist } from './db';

const ACTOR = 'Alex Admin';
// One shared collator: String#localeCompare builds a new one on every call, which is slow when sorting.
const collator = new Intl.Collator('en', { sensitivity: 'base' });

function matches(user: User, query: UsersQuery): boolean {
  if (!query.includeDeleted && user.deletedAt) return false;
  if (query.role !== 'all' && user.role !== query.role) return false;
  if (query.status === 'active' && !user.isActive) return false;
  if (query.status === 'inactive' && user.isActive) return false;
  const term = query.search.trim().toLowerCase();
  if (term && !`${user.name} ${user.email} ${user.department}`.toLowerCase().includes(term)) return false;
  return true;
}

export async function listUsers(query: UsersQuery): Promise<Paginated<User>> {
  await latency();
  const filtered = getDb().users.filter((u) => matches(u, query));
  const dir = query.sortDir === 'asc' ? 1 : -1;
  filtered.sort((a, b) => collator.compare(a[query.sortBy], b[query.sortBy]) * dir);

  const pageCount = Math.max(1, Math.ceil(filtered.length / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * query.pageSize;
  return {
    items: clone(filtered.slice(start, start + query.pageSize)),
    total: filtered.length,
    page,
    pageSize: query.pageSize,
    pageCount,
  };
}

export async function getAllUsers(): Promise<User[]> {
  await latency(100, 200);
  return clone(getDb().users.filter((u) => !u.deletedAt));
}

function findUser(id: string): User {
  const user = getDb().users.find((u) => u.id === id);
  if (!user) throw new ApiError('User not found.', 404);
  return user;
}

function assertUniqueEmail(email: string, ignoreId?: string) {
  const taken = getDb().users.some(
    (u) => u.id !== ignoreId && !u.deletedAt && u.email.toLowerCase() === email.toLowerCase(),
  );
  if (taken) throw new ApiError(`A user with the email ${email} already exists.`, 409);
}

export async function getUser(id: string): Promise<User> {
  await latency(150, 350);
  return clone(findUser(id));
}

export async function createUser(input: UserInput): Promise<User> {
  await latency();
  assertUniqueEmail(input.email);
  const now = new Date().toISOString();
  const user: User = {
    id: createId('usr'),
    department: 'Operations',
    ...input,
    createdAt: now,
    lastActiveAt: now,
    deletedAt: null,
  };
  getDb().users.unshift(user);
  logActivity(ACTOR, 'create', `created user ${user.name}`);
  persist();
  return clone(user);
}

export async function updateUser(id: string, input: Partial<UserInput>): Promise<User> {
  await latency();
  const user = findUser(id);
  if (input.email) assertUniqueEmail(input.email, id);
  Object.assign(user, input);
  logActivity(ACTOR, 'update', `updated user ${user.name}`);
  persist();
  return clone(user);
}

/** Soft delete: the record is kept with a `deletedAt` timestamp so it can be restored. */
export async function deleteUser(id: string): Promise<User> {
  await latency();
  const user = findUser(id);
  user.deletedAt = new Date().toISOString();
  user.isActive = false;
  logActivity(ACTOR, 'delete', `deleted user ${user.name}`);
  persist();
  return clone(user);
}

export async function restoreUser(id: string): Promise<User> {
  await latency();
  const user = findUser(id);
  user.deletedAt = null;
  logActivity(ACTOR, 'restore', `restored user ${user.name}`);
  persist();
  return clone(user);
}
