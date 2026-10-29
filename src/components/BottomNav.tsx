import { ReactNode } from 'react';
import { Home, GraduationCap, FlaskConical, CheckSquare, Link as LinkIcon, Terminal } from 'lucide-react';
import type { TabId } from '../types';

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const navItems: { id: TabId; label: string; icon: ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'learn', label: 'Learn', icon: <GraduationCap size={18} /> },
    { id: 'labs', label: 'Labs', icon: <FlaskConical size={18} /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={18} /> },
    { id: 'tracker', label: 'Tracker', icon: <CheckSquare size={18} /> },
    { id: 'links', label: 'Links', icon: <LinkIcon size={18} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] safe-bottom transition-colors">
      <div className="flex justify-around items-center px-2 py-2 max-w-4xl mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex flex-col items-center justify-center w-full sm:w-20 px-1 py-1.5 rounded-lg transition-colors duration-200 ${
              activeTab === item.id 
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' 
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className={`mb-1 ${activeTab === item.id ? 'transform scale-110 text-indigo-600 dark:text-indigo-400' : ''} transition-transform`}>
              {item.icon}
            </div>
            <span className={`text-[10px] ${activeTab === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
