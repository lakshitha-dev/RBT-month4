import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Badge } from './Badge';
import { Pagination } from './Pagination';
import { Table, type Column, type SortState } from './Table';

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
}

const PEOPLE: Person[] = Array.from({ length: 23 }, (_, i) => ({
  id: String(i + 1),
  name: ['Amara Perera', 'Ben Smith', 'Chen Kim', 'Dilani Silva', 'Elena Rossi', 'Farah Khan'][i % 6]! + ` ${i + 1}`,
  email: `person${i + 1}@adminflow.dev`,
  role: ['admin', 'editor', 'user'][i % 3]!,
  joined: new Date(2026, i % 12, (i % 27) + 1).toISOString().slice(0, 10),
}));

const columns: Column<Person>[] = [
  { key: 'name', header: 'Name', sortable: true, isRowHeader: true, render: (p) => <span className="font-medium">{p.name}</span> },
  { key: 'email', header: 'Email', sortable: true, render: (p) => p.email },
  { key: 'role', header: 'Role', sortable: true, render: (p) => <Badge className="capitalize">{p.role}</Badge> },
  { key: 'joined', header: 'Joined', sortable: true, render: (p) => p.joined },
];

const PAGE_SIZE = 5;

function SortableTable({ isLoading = false, rows = PEOPLE }: { isLoading?: boolean; rows?: Person[] }) {
  const [sort, setSort] = useState<SortState>({ by: 'name', dir: 'asc' });
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const key = sort.by as keyof Person;
    return [...rows].sort((a, b) => a[key].localeCompare(b[key]) * (sort.dir === 'asc' ? 1 : -1));
  }, [rows, sort]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-surface">
      <Table
        caption="Team members"
        columns={columns}
        rows={isLoading ? [] : visible}
        rowKey={(p) => p.id}
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        isLoading={isLoading}
        emptyMessage="No team members yet."
      />
      {!isLoading && rows.length > 0 && (
        <div className="mt-2 border-t border-rule pt-4">
          <Pagination page={page} pageCount={pageCount} pageSize={PAGE_SIZE} total={rows.length} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Components/Table',
  component: SortableTable,
  parameters: {
    docs: {
      description: {
        component:
          'Generic table with sortable column headers (`aria-sort`), a caption, a loading skeleton and an empty state, shown here with `Pagination`.',
      },
    },
  },
} satisfies Meta<typeof SortableTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SortableWithPagination: Story = {
  play: async ({ canvas, userEvent }) => {
    const nameHeader = canvas.getByRole('columnheader', { name: /name/i });
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(canvas.getByRole('button', { name: /name/i }));
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(canvas.getByRole('button', { name: 'Page 2' }));
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  },
};

export const Loading: Story = { args: { isLoading: true } };

export const Empty: Story = { args: { rows: [] } };
