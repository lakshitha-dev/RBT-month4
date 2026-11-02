import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { PAGE_SIZES } from '@/hooks/useUsersQueryParams';
import type { Role, UsersQuery } from '@/types';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { SearchIcon } from '@/components/common/icons';
import { ROLE_OPTIONS } from './UserForm';

interface UserFiltersProps {
  query: UsersQuery;
  onChange: (patch: Partial<UsersQuery>) => void;
}

/** Toolbar: search on the left, the role filter and page size beside it. Status lives in the tabs above. */
export function UserFilters({ query, onChange }: UserFiltersProps) {
  // The input is local state for instant typing; only the debounced value hits the "server".
  const [search, setSearch] = useState(query.search);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch.trim() !== query.search) onChange({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debouncedSearch]);

  // Keep the input in sync if the URL changes externally (back button, "Clear filters", the top-bar search).
  useEffect(() => {
    setSearch((current) => (current.trim() === query.search ? current : query.search));
  }, [query.search]);

  return (
    <div role="search" aria-label="Filter users" className="flex flex-wrap items-end gap-3">
      <Input
        label="Search users"
        hideLabel
        type="search"
        placeholder="Search name, email or department"
        leftIcon={<SearchIcon className="size-4" />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
        className="w-full sm:w-80"
      />
      <Select
        label="Role"
        hideLabel
        value={query.role}
        onChange={(e) => onChange({ role: e.target.value as Role | 'all' })}
        options={[{ value: 'all', label: 'All roles' }, ...ROLE_OPTIONS]}
        className="w-36"
      />
      <Select
        label="Rows per page"
        hideLabel
        value={String(query.pageSize)}
        onChange={(e) => onChange({ pageSize: Number(e.target.value) })}
        options={PAGE_SIZES.map((size) => ({ value: String(size), label: `${size} per page` }))}
        className="w-36"
      />
    </div>
  );
}
