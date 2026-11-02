import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useNotificationStore, type Toast } from '@/stores/notificationStore';
import { CloseIcon, ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from '@/components/common/icons';
import { NOTIFICATION_COLORS } from './NotificationItem';

const ICONS = { info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon };
const DURATION = 6000;

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useNotificationStore((s) => s.dismissToast);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.action ? DURATION + 4000 : DURATION);
  const Icon = ICONS[toast.type];

  // Auto-dismiss, paused while hovered or focused so users have time to act (WCAG 2.2.1).
  useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const timer = setTimeout(() => dismiss(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, dismiss, toast.id]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="animate-toast-in pointer-events-auto flex w-full gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <Icon className={clsx('mt-0.5 size-5 shrink-0', NOTIFICATION_COLORS[toast.type])} />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-slate-900 dark:text-white">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-slate-600 dark:text-slate-300">{toast.message}</p>}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action!.onClick();
              dismiss(toast.id);
            }}
            className="mt-2 font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label={`Dismiss notification: ${toast.title}`}
        className="-m-1 h-fit rounded p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

/**
 * Toast region. The live regions are always mounted (empty) so screen readers
 * reliably announce toasts added later; errors use an assertive region.
 */
export function Toaster() {
  const toasts = useNotificationStore((s) => s.toasts);
  const urgent = toasts.filter((t) => t.type === 'error');
  const polite = toasts.filter((t) => t.type !== 'error');

  return (
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:w-96"
    >
      <div role="alert" aria-live="assertive" className="flex w-full flex-col gap-2">
        {urgent.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </div>
      <div role="status" aria-live="polite" className="flex w-full flex-col gap-2">
        {polite.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </div>
    </section>
  );
}
