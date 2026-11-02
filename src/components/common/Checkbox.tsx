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
        className="mt-0.5 size-4 shrink-0 accent-primary"
        {...props}
      />
      <div>
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description && (
          <p id={descId} className="text-sm text-muted">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-xs font-medium text-negative">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});
