import { useState } from 'react';
import { Info, X } from 'lucide-react';

const DISMISS_KEY = 'sna_demo_notice_dismissed';

export function DemoNotice() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (!import.meta.env.PROD || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Dismissing should never fail loudly in private mode.
    }
  };

  return (
    <div className="pt-3">
      <div className="flex items-start gap-2.5 rounded-control border border-line bg-sunken px-3 py-2.5 text-xs leading-relaxed text-ink-2">
        <Info size={14} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          <span className="font-semibold text-ink">Demo portal.</span> Instructor uploads stay in
          the browser that created them, so they do not appear on other devices.
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss demo notice"
          className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-control text-ink-3 transition-colors hover:bg-canvas hover:text-ink"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
