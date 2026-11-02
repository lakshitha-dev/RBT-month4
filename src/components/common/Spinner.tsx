import clsx from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label. Pass `null` when the spinner is purely decorative (e.g. inside a busy button). */
  label?: string | null;
  className?: string;
}

const sizes = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-10 border-[3px]' };

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  const circle = (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-block animate-spin rounded-full border-current border-r-transparent',
        sizes[size],
        className,
      )}
    />
  );
  if (label === null) return circle;
  return (
    <span role="status" className="inline-flex items-center gap-2">
      {circle}
      <span className="sr-only">{label}</span>
    </span>
  );
}
