import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import { errorClasses, fieldClasses, hintClasses, labelClasses } from './Input';
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
      <label htmlFor={selectId} className={clsx(labelClasses, hideLabel && 'sr-only')}>
        {label}
        {required && (
          <span className="ml-0.5 text-negative" aria-hidden="true">
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
          className={clsx(fieldClasses(Boolean(error)), multiple ? 'min-h-28 py-1' : 'h-9 appearance-none pr-9')}
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
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
        )}
      </div>
      {(hint || multiple) && (
        <p id={hintId} className={hintClasses}>
          {hint ?? 'Hold Ctrl (Cmd on Mac) or Shift to select multiple options.'}
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
