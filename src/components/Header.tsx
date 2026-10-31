import { useEffect, useState } from 'react';
import { CloudOff } from 'lucide-react';
import { ThemeToggle } from '../context/ThemeContext';

export const SCREEN_TITLES: Record<string, { title: string; caption: string }> = {
  home: { title: 'SNA Portal', caption: '25CS34I · Semester III' },
  learn: { title: 'Learn', caption: '13 weeks · 52 lessons' },
  labs: { title: 'Laboratory', caption: '58 experiments · M83 workstations' },
  terminal: { title: 'Terminal', caption: 'Sandboxed command practice' },
  links: { title: 'Resources', caption: 'Course reading and regulations' },
  admin: { title: 'Admin', caption: 'Staff tools · local demo' },
};

export function Header({ activeTab }: { activeTab: string }) {
  const [isOnline, setIsOnline] = useState(true);
  const screen = SCREEN_TITLES[activeTab] ?? SCREEN_TITLES.home;

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return (
    <header className="safe-top fixed inset-x-0 top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="safe-x mx-auto flex h-14 w-full max-w-5xl items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-brand text-white shadow-sm">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
            <path d="M5 12.5 9.5 17 19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.0625rem] font-semibold leading-tight tracking-[-0.01em] text-ink">
            {screen.title}
          </h1>
          <p className="truncate text-xs leading-tight text-ink-3">{screen.caption}</p>
        </div>
        {!isOnline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-2">
            <CloudOff size={12} aria-hidden="true" />
            Offline
          </span>
        )}
        <ThemeToggle size="sm" />
      </div>
    </header>
  );
}
