import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

/** Compound component: <Card><Card.Header /><Card.Body /><Card.Footer /></Card>. */
function CardRoot({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={clsx(
        'flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Heading level for the title so pages keep a logical outline. */
  as?: 'h2' | 'h3';
  actions?: ReactNode;
  titleId?: string;
}

function CardHeader({ title, description, as: Heading = 'h2', actions, titleId, className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800',
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        {title && (
          <Heading id={titleId} className="text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </Heading>
        )}
        {description && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('flex-1 px-5 py-4', className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800',
        className,
      )}
      {...props}
    />
  );
}

export const Card = Object.assign(CardRoot, { Header: CardHeader, Body: CardBody, Footer: CardFooter });
