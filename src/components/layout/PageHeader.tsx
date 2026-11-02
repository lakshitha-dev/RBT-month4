import { useEffect, useRef, type ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

let isInitialPage = true;

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

/**
 * Page heading + document title. After client-side navigation, focus moves to the
 * <h1> so screen-reader and keyboard users land at the start of the new page
 * (initial load keeps the browser default).
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useDocumentTitle(title);

  useEffect(() => {
    if (isInitialPage) {
      isInitialPage = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: false });
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
