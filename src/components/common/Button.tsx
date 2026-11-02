import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

// One filled primary per screen (near-black); secondary is white with a control border; danger is the
// negative colour as an outline, so a destructive action never shouts louder than the main job.
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90 active:opacity-100',
  secondary: 'bg-surface text-ink border border-control hover:bg-raised',
  danger: 'bg-surface text-negative border border-negative hover:bg-pill-negative-bg',
  ghost: 'text-ink hover:bg-raised',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 gap-1.5',
  md: 'h-9 px-3.5 gap-2',
  lg: 'h-11 px-5 gap-2 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, fullWidth, className, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-control text-sm font-medium whitespace-nowrap',
        'transition-[background-color,opacity,transform] duration-150 active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner size="sm" label={null} /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});
