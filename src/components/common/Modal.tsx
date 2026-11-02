import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { CloseIcon } from './icons';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Rendered under the title and wired to `aria-describedby`. */
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Element to focus when the dialog opens (defaults to the first focusable element). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** `alertdialog` for destructive confirmations. */
  role?: 'dialog' | 'alertdialog';
  closeOnOverlayClick?: boolean;
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

/**
 * Accessible modal dialog: portal, focus trap, Esc to close, focus restore,
 * background scroll lock and `aria-modal` with labelled title/description.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  initialFocus,
  role = 'dialog',
  closeOnOverlayClick = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useFocusTrap(panelRef, open, initialFocus);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="animate-fade-in absolute inset-0 bg-black/45"
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={clsx(
          // A dialog floats, so it may carry a shadow. taste-skill-ignore: real overlay
          'animate-rise-in relative flex max-h-[90vh] w-full flex-col rounded-[12px] border border-line bg-surface shadow-[0_16px_48px_rgb(0_0_0/0.18)]',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <div id={descriptionId} className="mt-1 text-sm text-muted">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mt-1 -mr-2 rounded-control p-2 text-muted hover:bg-raised hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>
        {children && <div className="overflow-y-auto px-6 pt-2 pb-5">{children}</div>}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-rule px-6 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
