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

const styles: Record<AlertVariant, string> = {
  info: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100',
  warning: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100',
  error: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100',
};

const icons = { info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon };
const labels: Record<AlertVariant, string> = { info: 'Information', success: 'Success', warning: 'Warning', error: 'Error' };

export function Alert({ variant = 'info', title, children, onDismiss, action, className }: AlertProps) {
  const Icon = icons[variant];
  // Errors/warnings interrupt (role=alert); info/success are polite status updates.
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

  return (
    <div role={role} className={clsx('flex gap-3 rounded-lg border p-4 text-sm', styles[variant], className)}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="sr-only">{labels[variant]}: </span>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx(title && 'mt-1')}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="-m-1 h-fit rounded p-1 opacity-80 hover:opacity-100"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
