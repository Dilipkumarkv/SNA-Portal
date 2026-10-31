import { ReactNode } from 'react';
import { Home, GraduationCap, FlaskConical, Terminal, Link as LinkIcon } from 'lucide-react';
import type { TabId } from '../types';

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const ITEMS: { id: TabId; label: string; icon: (active: boolean) => ReactNode }[] = [
  { id: 'home', label: 'Home', icon: (a) => <Home size={21} strokeWidth={a ? 2.4 : 1.9} /> },
  { id: 'learn', label: 'Learn', icon: (a) => <GraduationCap size={22} strokeWidth={a ? 2.4 : 1.9} /> },
  { id: 'labs', label: 'Labs', icon: (a) => <FlaskConical size={21} strokeWidth={a ? 2.4 : 1.9} /> },
  { id: 'terminal', label: 'Terminal', icon: (a) => <Terminal size={21} strokeWidth={a ? 2.4 : 1.9} /> },
  { id: 'links', label: 'Resources', icon: (a) => <LinkIcon size={21} strokeWidth={a ? 2.4 : 1.9} /> },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/92 backdrop-blur-xl shadow-float"
      aria-label="Primary"
    >
      <div className="mx-auto grid h-16 w-full max-w-lg grid-cols-5 px-1">
        {ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors duration-150 ${
                active ? 'text-brand-text' : 'text-ink-3 active:text-ink-2'
              }`}
            >
              <span
                className={`grid h-7 w-12 place-items-center rounded-full transition-colors duration-150 ${
                  active ? 'bg-brand-soft' : ''
                }`}
              >
                {item.icon(active)}
              </span>
              <span className={`text-[0.6875rem] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
