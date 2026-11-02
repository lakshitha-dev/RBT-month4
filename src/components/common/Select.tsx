import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import { fieldClasses } from './Input';
import { ChevronDownIcon } from './icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  placeholder?: string;
}

/**
 * Native <select> wrapper: single or multi-select (`multiple`). Native controls give
 * screen-reader and keyboard support for free.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, hint, hideLabel, placeholder, id, className, multiple, required, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint || multiple ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          multiple={multiple}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={clsx(hintId, errorId) || undefined}
          className={clsx(fieldClasses(Boolean(error)), multiple ? 'min-h-28 py-1' : 'h-10 appearance-none pr-9')}
          {...props}
        >
          {placeholder && !multiple && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {!multiple && (
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
        )}
      </div>
      {(hint || multiple) && (
        <p id={hintId} className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
          {hint ?? 'Hold Ctrl (Cmd on Mac) or Shift to select multiple options.'}
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
