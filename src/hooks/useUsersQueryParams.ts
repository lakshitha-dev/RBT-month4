import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ROLES, type Role, type StatusFilter, type UserSortField, type UsersQuery } from '@/types';

const SORT_FIELDS: UserSortField[] = ['name', 'email', 'role', 'createdAt'];
const STATUSES: StatusFilter[] = ['all', 'active', 'inactive'];
export const PAGE_SIZES = [10, 20, 50];

export const DEFAULT_USERS_QUERY: UsersQuery = {
  page: 1,
  pageSize: 10,
  search: '',
  role: 'all',
  status: 'all',
  sortBy: 'createdAt',
  sortDir: 'desc',
  includeDeleted: false,
};

const oneOf = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

/**
 * Users list state lives in the URL (?q=&role=&page=…), so filters survive reloads,
 * can be shared as links and work with the browser back button.
 */
export function useUsersQueryParams() {
  const [params, setParams] = useSearchParams();

  const query = useMemo<UsersQuery>(() => {
    const d = DEFAULT_USERS_QUERY;
    const pageSize = Number(params.get('size'));
    return {
      page: Math.max(1, Number(params.get('page')) || 1),
      pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : d.pageSize,
      search: params.get('q') ?? '',
      role: oneOf<Role | 'all'>(params.get('role'), ['all', ...ROLES], d.role),
      status: oneOf(params.get('status'), STATUSES, d.status),
      sortBy: oneOf(params.get('sort'), SORT_FIELDS, d.sortBy),
      sortDir: oneOf(params.get('dir'), ['asc', 'desc'], d.sortDir),
      includeDeleted: params.get('deleted') === '1',
    };
  }, [params]);

  /** Updates the query. Any change other than the page itself resets to page 1. */
  const update = useCallback(
    (patch: Partial<UsersQuery>) => {
      setParams(
        (prev) => {
          const current = Object.fromEntries(prev);
          const next = new URLSearchParams(current);
          const set = (key: string, value: string | number | boolean, isDefault: boolean) =>
            isDefault ? next.delete(key) : next.set(key, String(value));

          const d = DEFAULT_USERS_QUERY;
          if (patch.search !== undefined) set('q', patch.search.trim(), !patch.search.trim());
          if (patch.role !== undefined) set('role', patch.role, patch.role === d.role);
          if (patch.status !== undefined) set('status', patch.status, patch.status === d.status);
          if (patch.sortBy !== undefined) set('sort', patch.sortBy, patch.sortBy === d.sortBy);
          if (patch.sortDir !== undefined) set('dir', patch.sortDir, patch.sortDir === d.sortDir);
          if (patch.pageSize !== undefined) set('size', patch.pageSize, patch.pageSize === d.pageSize);
          if (patch.includeDeleted !== undefined) set('deleted', '1', !patch.includeDeleted);
          const page = patch.page ?? 1;
          set('page', page, page === 1);
          return next;
        },
        { replace: patch.page === undefined },
      );
    },
    [setParams],
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  return { query, update, reset };
}
