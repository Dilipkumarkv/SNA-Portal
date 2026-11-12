import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Download, RefreshCw, Share, X } from 'lucide-react';
import {
  INSTALL_DISMISS_KEY,
  applyPwaUpdate,
  getPwaSnapshot,
  installPromptMode,
  isNativeApp,
  requestPersistentStorage,
  subscribePwa,
  type InstallPromptMode,
} from '../pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(INSTALL_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function PwaPrompts() {
  const native = isNativeApp();
  const { needRefresh, offlineReady } = useSyncExternalStore(subscribePwa, getPwaSnapshot, getPwaSnapshot);
  const [mode, setMode] = useState<InstallPromptMode>('hidden');
  const [ready, setReady] = useState(false);
  const [updateLater, setUpdateLater] = useState(false);
  const [offlineToast, setOfflineToast] = useState(false);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (native) return;
    requestPersistentStorage();
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const evaluate = () =>
      setMode(installPromptMode({ standalone, dismissed: readDismissed(), ios, canPrompt: deferred.current !== null }));
    const onPrompt = (event: Event) => {
      event.preventDefault();
      deferred.current = event as BeforeInstallPromptEvent;
      evaluate();
    };
    const onInstalled = () => {
      deferred.current = null;
      setMode('hidden');
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    const timer = setTimeout(() => {
      setReady(true);
      evaluate();
    }, 1600);
    evaluate();
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
  }, [native]);

  useEffect(() => {
    if (!offlineReady) return;
    setOfflineToast(true);
    const timer = setTimeout(() => setOfflineToast(false), 4200);
    return () => clearTimeout(timer);
  }, [offlineReady]);

  if (native) return null;

  const dismissInstall = () => {
    try {
      localStorage.setItem(INSTALL_DISMISS_KEY, '1');
    } catch {
      // Private-mode storage can throw; the card still hides for this session.
    }
    setMode('hidden');
  };

  const install = async () => {
    const event = deferred.current;
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    deferred.current = null;
    setMode('hidden');
  };

  return (
    <>
      {needRefresh && !updateLater ? (
        <div className="safe-top fixed inset-x-0 top-0 z-[60] bg-brand text-on-brand" role="alert">
          <div className="safe-x mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-1 py-2">
            <p className="min-w-0 flex-1 text-sm font-medium">A new version of the guide is ready.</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setUpdateLater(true)}
                className="min-h-11 rounded-control px-3 text-sm font-medium text-on-brand transition-opacity hover:opacity-80"
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => applyPwaUpdate()}
                className="inline-flex min-h-11 items-center gap-2 rounded-control bg-on-brand px-4 text-sm font-semibold text-brand transition-opacity hover:opacity-90"
              >
                <RefreshCw size={15} aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {(ready && mode !== 'hidden') || offlineToast ? (
        <div className="pointer-events-none fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:items-end">
          {offlineToast ? (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-auto w-fit rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink shadow-raise"
            >
              Saved for offline use.
            </div>
          ) : null}

          {ready && mode !== 'hidden' ? (
            <div
              role="region"
              aria-label="Install the guide"
              className="pointer-events-auto relative w-full rounded-card border border-line bg-surface p-4 shadow-raise sm:w-96"
            >
              <button
                type="button"
                onClick={dismissInstall}
                className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-control text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
                aria-label="Dismiss install suggestion"
              >
                <X size={17} aria-hidden="true" />
              </button>
              <div className="flex gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-text">
                  <Download size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0 pr-8">
                  <h3 className="font-display text-sm font-semibold text-ink">Keep the guide on your phone</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-2">
                    Install it to open full-screen and revise offline. Your progress stays on this device.
                  </p>
                  {mode === 'ios' ? (
                    <p className="mt-3 rounded-control bg-sunken p-2.5 text-xs leading-relaxed text-ink-2">
                      Tap <Share size={12} className="mx-0.5 inline" aria-hidden="true" /> Share, then{' '}
                      <strong className="font-semibold text-ink">Add to Home Screen</strong>.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void install()}
                      className="mt-3 inline-flex min-h-11 items-center rounded-control bg-brand px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover"
                    >
                      Install app
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
