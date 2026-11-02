import clsx from 'clsx';
import { initials } from '@/utils/format';

const palette = [
  'bg-brand-100 text-brand-800 dark:bg-brand-800 dark:text-brand-50',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-50',
  'bg-amber-100 text-amber-900 dark:bg-amber-800 dark:text-amber-50',
  'bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-50',
  'bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-50',
];

/** Decorative initials avatar; the person's name should always be shown next to it. */
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md'; className?: string }) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        size === 'sm' ? 'size-7 text-[11px]' : 'size-9 text-xs',
        palette[hash % palette.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
