import { memo } from 'react';
import clsx from 'clsx';
import type { RosterGroup } from '@/types';
import { formatNumber } from '@/utils/format';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

/** A swatch is the mark itself, scaled down: filled for active, hollow for inactive (shape, not colour alone). */
function PersonMark({ active, className }: { active: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx('inline-block size-2.5 rounded-[2px]', active ? 'bg-accent' : 'border border-control', className)}
    />
  );
}

const DepartmentRow = memo(function DepartmentRow({ group }: { group: RosterGroup }) {
  const active = group.people.filter((p) => p.isActive).length;
  const total = group.people.length;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-2.5 sm:grid-cols-[136px_minmax(0,1fr)_auto]">
      <span aria-hidden="true" className="text-sm text-ink">
        {group.department}
      </span>
      {/* One square per person, active first; the row's text says the same for screen readers. */}
      <span aria-hidden="true" className="col-span-2 row-start-2 flex flex-wrap gap-[3px] sm:col-span-1 sm:row-start-auto">
        {group.people.map((p) => (
          <PersonMark key={p.id} active={p.isActive} />
        ))}
      </span>
      <span
        aria-hidden="true"
        className="num col-start-2 row-start-1 text-right text-sm whitespace-nowrap text-muted sm:col-start-auto sm:row-start-auto"
      >
        <span className="text-ink">{active}</span> of {total} active
      </span>
      {/* Grid cells carry no whitespace for screen readers, so the row is also one sentence (NVDA finding F4). */}
      <span className="sr-only">{`${group.department}: ${active} of ${total} active.`}</span>
    </li>
  );
});

interface WorkspaceRosterProps {
  roster: RosterGroup[] | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}

/**
 * AdminFlow's signature element: everyone in the workspace as one mark each, grouped by department,
 * so who is here, and how many accounts have gone quiet, is seen rather than read.
 */
export function WorkspaceRoster({ roster, isPending, isError, onRetry }: WorkspaceRosterProps) {
  const people = roster?.flatMap((g) => g.people) ?? [];
  const inactive = people.filter((p) => !p.isActive).length;

  return (
    <Card>
      <Card.Header
        title="Workspace roster"
        description={
          roster ? (
            <span className="num">
              {formatNumber(people.length)} people in {roster.length} departments · {inactive} inactive
            </span>
          ) : undefined
        }
        actions={
          <ul aria-label="Legend" className="flex items-center gap-4 text-xs text-muted">
            <li className="flex items-center gap-1.5">
              <PersonMark active />
              Active
            </li>
            <li className="flex items-center gap-1.5">
              <PersonMark active={false} />
              Inactive
            </li>
          </ul>
        }
      />
      <Card.Body className="pt-2 pb-3">
        {isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 py-6 text-sm">
            <p className="text-ink">Couldn't load the roster.</p>
            <button type="button" className="font-medium text-ink underline underline-offset-2" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : isPending || !roster ? (
          <div role="status" aria-label="Loading roster" className="space-y-3 py-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-5" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-rule">
            {roster.map((group) => (
              <DepartmentRow key={group.department} group={group} />
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
}
