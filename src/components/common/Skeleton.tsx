import clsx from 'clsx';

/** Decorative loading placeholder; pair with a `role="status"` / `aria-busy` container. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)} />;
}
