import clsx from 'clsx';

/**
 * AdminFlow's mark: three rows flowing into one another, the shape of the roster the product manages.
 * Drawn in the product teal; decorative (the wordmark beside it carries the name).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={clsx('size-6 text-accent', className)}>
      <rect x="3" y="4" width="18" height="4" rx="2" fill="currentColor" />
      <rect x="3" y="10" width="13" height="4" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="3" y="16" width="8" height="4" rx="2" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx('flex items-center gap-2', className)}>
      <BrandMark />
      <span className="text-[15px] font-semibold text-ink">AdminFlow</span>
    </span>
  );
}
