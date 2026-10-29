import { useState, useEffect } from 'react';
import { WifiIcon, CloudOff, LogOut } from 'lucide-react';
import { ThemeToggle } from '../context/ThemeContext';

export function Header({
  onAdminClick,
  isAdmin,
  onLogout,
}: {
  onAdminClick?: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm safe-top transition-colors">
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between max-w-4xl mx-auto gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onAdminClick}
            className="shrink-0 hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold text-xs shadow-sm"
            title="Admin Portal"
          >
            SNA
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight truncate">
              System & Network Administration
            </h1>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
              <span>25CS34I</span>
              {isOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0 rounded-full font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/60">
                  <WifiIcon size={10} /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-1.5 py-0 rounded-full font-bold uppercase tracking-wider border border-amber-100 dark:border-amber-800/60">
                  <CloudOff size={10} /> Offline
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="hidden xs:block sm:block text-right">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">S.E.T Polytechnic</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Melkote | 2026</p>
          </div>
          {isAdmin && onLogout ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-[10px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800/60"
            >
              <LogOut size={12} /> Sign Out
            </button>
          ) : null}
          <ThemeToggle size="sm" />
        </div>
      </div>
    </header>
  );
}
