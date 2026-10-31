import { useEffect, useState, type ReactNode } from 'react';
import { Clock3, FolderKanban, Monitor, SquareTerminal, CloudOff } from 'lucide-react';
import { ThemeToggle } from '../../context/ThemeContext';
import type { ExamTab } from '../types';

const NAV: { id: ExamTab; label: string; icon: typeof Monitor }[] = [
  { id: 'machine', label: 'Machine', icon: Monitor },
  { id: 'day', label: 'Exam day', icon: Clock3 },
  { id: 'terminal', label: 'Terminal', icon: SquareTerminal },
  { id: 'project', label: 'CIE-5', icon: FolderKanban },
];

function Wordmark() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="font-display text-[1.4rem] font-bold leading-none tracking-[-0.045em] text-ink">SNA</span>
        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
      </div>
      <p className="mt-1.5 text-xs leading-tight text-ink-3">Practical exam guide · 25CS34I</p>
    </div>
  );
}

function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

function ExamFacts() {
  return (
    <div className="rounded-card border border-line bg-raised p-4" aria-label="Exam facts">
      <p className="text-xs text-ink-3">Practical exam</p>
      <dl className="mt-2 space-y-1.5 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-3">Time</dt>
          <dd className="font-medium text-ink tnum">180 min</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-3">Marks</dt>
          <dd className="font-medium text-ink tnum">50 · pass 20</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-3">Paper</dt>
          <dd className="font-medium text-ink tnum">45 + 5</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-3">Machine</dt>
          <dd className="font-medium text-ink">M73 tower</dd>
        </div>
      </dl>
    </div>
  );
}

export function ExamShell({
  tab,
  wide = false,
  onNavigate,
  children,
}: {
  tab: ExamTab;
  wide?: boolean;
  onNavigate: (tab: ExamTab) => void;
  children: ReactNode;
}) {
  const online = useOnline();

  return (
    <div className="min-h-[100dvh] bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-surface lg:flex">
        <div className="px-6 pb-6 pt-8">
          <Wordmark />
        </div>
        <nav className="flex-1 px-3" aria-label="Exam sections">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = tab === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm transition-colors ${
                      active
                        ? 'bg-brand-soft font-semibold text-brand-text'
                        : 'font-medium text-ink-2 hover:bg-sunken hover:text-ink'
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="px-4 pb-5">
          {!online ? (
            <p className="mb-3 flex items-center gap-2 px-1 text-xs text-ink-3">
              <CloudOff size={13} aria-hidden="true" /> Offline · saved on this device
            </p>
          ) : null}
          <ExamFacts />
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-xs text-ink-3">Appearance</span>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </aside>

      <header className="safe-top sticky top-0 z-40 border-b border-line bg-canvas lg:hidden">
        <div className="safe-x flex h-14 items-center justify-between gap-3">
          <Wordmark />
          <div className="flex items-center gap-2">
            {!online ? <CloudOff size={16} className="text-ink-3" aria-label="Offline" /> : null}
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      <main className="lg:pl-[248px]">
        <div
          className={`safe-x mx-auto w-full pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-7 lg:pb-20 lg:pt-12 ${
            wide ? 'max-w-6xl' : 'max-w-3xl'
          }`}
        >
          {children}
        </div>
      </main>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden"
        aria-label="Exam sections"
      >
        <div className="mx-auto grid h-[4.25rem] w-full max-w-lg grid-cols-4 px-1">
          {NAV.map((item) => {
            const active = tab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-brand-text' : 'text-ink-3 active:text-ink-2'
                }`}
              >
                <span className={`grid h-7 w-11 place-items-center rounded-full ${active ? 'bg-brand-soft' : ''}`}>
                  <Icon size={20} strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
                </span>
                <span className={`text-[0.6875rem] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
