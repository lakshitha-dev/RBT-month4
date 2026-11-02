import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

// Pale tint with dark ink of the same hue. Never squeezed: chips keep their width and never wrap.
const tones: Record<BadgeTone, string> = {
  neutral: 'bg-pill-neutral-bg text-pill-neutral-ink',
  success: 'bg-pill-positive-bg text-pill-positive-ink',
  warning: 'bg-pill-warning-bg text-pill-warning-ink',
  danger: 'bg-pill-negative-bg text-pill-negative-ink',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex h-5 flex-none items-center rounded-full px-2 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
