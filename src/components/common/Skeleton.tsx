import clsx from 'clsx';

/**
 * Decorative loading placeholder: a flat bar at the real size of what it stands for (no shimmer),
 * so nothing shifts when the data lands. Pair with a `role="status"` / `aria-busy` container.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx('rounded-control bg-raised', className)} />;
}
