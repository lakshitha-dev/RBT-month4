import clsx from 'clsx';
import { initials } from '@/utils/format';

// Identity tints, not data: pale, out of every legend, hues at least 60 degrees apart.
const palette = [
  'bg-[#dcefe9] text-[#14453a] dark:bg-[#16302a] dark:text-[#9fd8c6]', // teal-green
  'bg-[#e3ecf8] text-[#1d3c66] dark:bg-[#18263a] dark:text-[#a9c4ea]', // blue
  'bg-[#f6ead6] text-[#5c3d0b] dark:bg-[#33281a] dark:text-[#e8c487]', // amber
  'bg-[#f6e1e4] text-[#6b2430] dark:bg-[#36202a] dark:text-[#eeb0bc]', // rose
  'bg-[#e6ecd9] text-[#384a17] dark:bg-[#262d18] dark:text-[#c3d69a]', // olive
];

/** Decorative initials avatar; the person's name should always be shown next to it. */
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md'; className?: string }) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium',
        size === 'sm' ? 'size-7 text-[11px]' : 'size-8 text-xs',
        palette[hash % palette.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
