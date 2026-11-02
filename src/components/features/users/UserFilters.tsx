import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { PAGE_SIZES } from '@/hooks/useUsersQueryParams';
import type { Role, StatusFilter, UsersQuery } from '@/types';
import { Checkbox } from '@/components/common/Checkbox';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { SearchIcon } from '@/components/common/icons';
import { ROLE_OPTIONS } from './UserForm';

interface UserFiltersProps {
  query: UsersQuery;
  onChange: (patch: Partial<UsersQuery>) => void;
}

export function UserFilters({ query, onChange }: UserFiltersProps) {
  // The input is local state for instant typing; only the debounced value hits the "server".
  const [search, setSearch] = useState(query.search);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch.trim() !== query.search) onChange({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debouncedSearch]);

  // Keep the input in sync if the URL changes externally (back button, "Clear filters").
  useEffect(() => {
    setSearch((current) => (current.trim() === query.search ? current : query.search));
  }, [query.search]);

  return (
    <div role="search" aria-label="Filter users" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:items-end">
      <Input
        label="Search users"
        type="search"
        placeholder="Name, email or department"
        leftIcon={<SearchIcon />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
      />
      <Select
        label="Role"
        value={query.role}
        onChange={(e) => onChange({ role: e.target.value as Role | 'all' })}
        options={[{ value: 'all', label: 'All roles' }, ...ROLE_OPTIONS]}
      />
      <Select
        label="Status"
        value={query.status}
        onChange={(e) => onChange({ status: e.target.value as StatusFilter })}
        options={[
          { value: 'all', label: 'All statuses' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />
      <Select
        label="Rows per page"
        value={String(query.pageSize)}
        onChange={(e) => onChange({ pageSize: Number(e.target.value) })}
        options={PAGE_SIZES.map((size) => ({ value: String(size), label: String(size) }))}
      />
      <Checkbox
        label="Show deleted users"
        checked={query.includeDeleted}
        onChange={(e) => onChange({ includeDeleted: e.target.checked })}
        className="sm:col-span-2 lg:col-span-4"
      />
    </div>
  );
}
