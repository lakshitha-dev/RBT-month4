import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { EyeIcon, EyeOffIcon } from './icons';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: string;
  /** Visually hide the label (it is still announced by screen readers). */
  hideLabel?: boolean;
  leftIcon?: ReactNode;
}

export const fieldClasses = (invalid: boolean) =>
  clsx(
    'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-500',
    'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400',
    'disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800',
    invalid
      ? 'border-red-600 dark:border-red-400'
      : // Boundaries meet WCAG 1.4.11 (3:1): slate-500 is 4.8:1 on white and 3.7:1 on slate-900.
      'border-slate-500 hover:border-slate-700 dark:border-slate-500 dark:hover:border-slate-400',
  );

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, hideLabel, leftIcon, id, type = 'text', className, required, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={clsx('mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200', hideLabel && 'sr-only')}
      >
        {label}
        {required && (
          <span className="ml-0.5 text-red-700 dark:text-red-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 dark:text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && revealed ? 'text' : type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={clsx(hintId, errorId) || undefined}
          className={clsx(fieldClasses(Boolean(error)), 'h-10', leftIcon && 'pl-9', isPassword && 'pr-10')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
