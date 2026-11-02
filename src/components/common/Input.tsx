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

export const labelClasses = 'mb-2 block text-sm font-medium text-ink';
export const hintClasses = 'mt-1.5 text-xs text-muted';
export const errorClasses = 'mt-1.5 text-xs font-medium text-negative';

/** Shared field look. The border is --control (3:1 or more, WCAG 1.4.11); errors switch it to --negative. */
export const fieldClasses = (invalid: boolean) =>
  clsx(
    'block w-full rounded-control border bg-surface px-3 text-sm text-ink placeholder:text-muted',
    'transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:bg-raised disabled:text-muted',
    invalid ? 'border-negative' : 'border-control hover:border-ink',
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
      <label htmlFor={inputId} className={clsx(labelClasses, hideLabel && 'sr-only')}>
        {label}
        {required && (
          <span className="ml-0.5 text-negative" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">{leftIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && revealed ? 'text' : type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={clsx(hintId, errorId) || undefined}
          className={clsx(fieldClasses(Boolean(error)), 'h-9', leftIcon && 'pl-9', isPassword && 'pr-10')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-control text-muted hover:text-ink"
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {hint && (
        <p id={hintId} className={hintClasses}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={errorClasses}>
          {error}
        </p>
      )}
    </div>
  );
});
