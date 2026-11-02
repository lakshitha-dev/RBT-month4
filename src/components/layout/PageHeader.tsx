import { useEffect, useRef, type ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

let isInitialPage = true;

interface PageHeaderProps {
  title: string;
  /** One sentence about the data: the screen's finding, the period or the scope, never about the interface. */
  description?: ReactNode;
  actions?: ReactNode;
}

/**
 * Title row: a noun at 22px/600, an optional grey line under it, and the real actions on the right,
 * bottom-aligned with that line. After client-side navigation focus moves to the <h1> so screen-reader and
 * keyboard users land at the start of the new page (initial load keeps the browser default).
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 ref={headingRef} tabIndex={-1} className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h1>
        {description && <div className="mt-1 text-sm text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
