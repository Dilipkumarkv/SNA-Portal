import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const hasDismissed = localStorage.getItem('pwaPromptDismissed');

    if (!hasDismissed && isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 2000);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.deferredPrompt && !hasDismissed) {
      setDeferredPrompt(window.deferredPrompt);
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 rounded-card border border-line bg-surface p-4 shadow-raise sm:bottom-5 sm:left-auto sm:right-5 sm:w-80">
      <button
        onClick={handleDismiss}
        className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-control text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
        aria-label="Dismiss install prompt"
      >
        <X size={15} />
      </button>

      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-text">
          <Download size={19} />
        </div>
        <div className="pr-6">
          <h3 className="font-display text-sm font-semibold text-ink">Install the portal</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">
            Keep notes and labs on your home screen, and open them without a network.
          </p>

          {isIOS && !deferredPrompt ? (
            <p className="mt-2 rounded-control bg-sunken p-2 text-xs text-ink-2">
              Tap <Share size={12} className="mx-0.5 inline" /> then <strong className="font-semibold text-ink">Add to Home Screen</strong>.
            </p>
          ) : (
            <button
              onClick={handleInstallClick}
              className="mt-2.5 inline-flex min-h-9 items-center rounded-control bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Install app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
