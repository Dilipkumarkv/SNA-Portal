import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // If iOS and not standalone, show the prompt (unless already dismissed)
    const hasDismissed = localStorage.getItem('pwaPromptDismissed');
    
    if (!hasDismissed) {
      if (isIOSDevice) {
        // Small delay so it's not jarring
        setTimeout(() => setShowPrompt(true), 2000);
      }
    }

    // Android / Chrome: Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Also check if it was caught before this component mounted
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
    <div className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-80 z-50 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
      >
        <X size={16} />
      </button>
      
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
          <Download className="text-indigo-600" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Install App</h3>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            Install this app on your device for quick access and offline use.
          </p>
          
          {isIOS && !deferredPrompt ? (
            <div className="text-[11px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-600">
              Tap <Share size={12} className="inline mx-1" /> and select <strong>Add to Home Screen</strong>
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
            >
              Install Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
