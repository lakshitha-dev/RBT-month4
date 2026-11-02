import type { ReactNode } from 'react';
import clsx from 'clsx';
import { CloseIcon, ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from './icons';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  onDismiss?: () => void;
  action?: ReactNode;
  className?: string;
}

// The colour sits on the icon only; the box is a quiet tone step so an error reads as a fact, not an alarm.
const iconTone: Record<AlertVariant, string> = {
  info: 'text-accent',
  success: 'text-positive',
  warning: 'text-warning',
  error: 'text-negative',
};
const boxTone: Record<AlertVariant, string> = {
  info: 'bg-raised',
  success: 'bg-pill-positive-bg/60',
  warning: 'bg-pill-warning-bg',
  error: 'bg-pill-negative-bg/70',
};

const icons = { info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon };
const labels: Record<AlertVariant, string> = { info: 'Information', success: 'Success', warning: 'Warning', error: 'Error' };

export function Alert({ variant = 'info', title, children, onDismiss, action, className }: AlertProps) {
  const Icon = icons[variant];
  // Errors/warnings interrupt (role=alert); info/success are polite status updates.
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

  return (
    <div role={role} className={clsx('flex gap-3 rounded-card p-4 text-sm text-ink', boxTone[variant], className)}>
      <Icon className={clsx('mt-0.5 size-4 shrink-0', iconTone[variant])} />
      <div className="min-w-0 flex-1">
        <span className="sr-only">{labels[variant]}: </span>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx(title && 'mt-0.5', 'text-ink')}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="-m-1 h-fit rounded-control p-1 text-muted hover:text-ink"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
