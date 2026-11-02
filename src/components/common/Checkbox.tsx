import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = description ? `${inputId}-desc` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={clsx('flex items-start gap-3', className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        aria-invalid={error ? true : undefined}
        aria-describedby={clsx(descId, errorId) || undefined}
        className="mt-0.5 size-4 shrink-0 rounded border-slate-400 accent-brand-600 dark:accent-brand-400"
        {...props}
      />
      <div className="text-sm">
        <label htmlFor={inputId} className="font-medium text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {description && (
          <p id={descId} className="text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});
