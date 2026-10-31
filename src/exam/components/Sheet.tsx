import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'default' | 'wide';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet({ open, onClose, title, meta, children, footer, size = 'default' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const closeFn = useRef(onClose);

  useEffect(() => {
    closeFn.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeFn.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-start sm:overflow-y-auto sm:p-6 sm:pt-[7vh]">
      <div className="sheet-backdrop fixed inset-0 bg-black/55" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`sheet-panel relative flex max-h-[91dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-raise sm:rounded-card ${
          size === 'wide' ? 'sm:max-w-3xl' : 'sm:max-w-2xl'
        }`}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            {meta ? <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-3">{meta}</div> : null}
            <h2 id={titleId} className="font-display text-title font-semibold text-ink">
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-transparent text-ink-3 transition-colors hover:border-line hover:bg-sunken hover:text-ink"
            aria-label="Close"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        {footer ? (
          <div className="safe-bottom border-t border-line bg-surface px-5 py-3.5 sm:px-6">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
