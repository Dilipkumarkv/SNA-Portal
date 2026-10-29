import React, { useState } from 'react';
import { ChevronDown, CheckSquare } from 'lucide-react';
import { Card } from '../Card';
import { WEEKLY_CHECKLISTS } from '../../data/staticTracker';

function WeekAccordion({ 
  weekObj, 
  checks, 
  onToggleCheck, 
  expanded, 
  onToggleExpand 
}: { 
  weekObj: typeof WEEKLY_CHECKLISTS[0], 
  checks: Record<string, boolean>, 
  onToggleCheck: (id: string) => void,
  expanded: boolean,
  onToggleExpand: () => void
}) {
  const total = weekObj.items.length;
  const completed = weekObj.items.filter((_, i) => checks[`w${weekObj.week}_i${i}`]).length;
  const progressPct = Math.round((completed / total) * 100);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl mb-3 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
      <button 
        className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/70 border-b border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-xs font-bold text-indigo-700 dark:text-indigo-400">
            {weekObj.week}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 text-left min-w-0 truncate">
            {weekObj.title}
          </span>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-16 sm:w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden hidden sm:block">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'}`} 
              style={{ width: `${progressPct}%` }} 
            />
          </div>
          <span className={`text-[11px] sm:text-xs font-bold tabular-nums w-10 text-right ${progressPct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
            {progressPct}%
          </span>
          <ChevronDown className={`text-slate-400 dark:text-slate-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} size={16} />
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="p-3 sm:p-4 space-y-1 sm:space-y-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
             {weekObj.items.map((item, i) => {
               const id = `w${weekObj.week}_i${i}`;
               const isChecked = !!checks[id];
               return (
                 <label key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors">
                   <input 
                     type="checkbox" 
                     checked={isChecked}
                     onChange={() => onToggleCheck(id)}
                     className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer shrink-0 accent-indigo-600 dark:bg-slate-800" 
                   />
                   <span className={`text-xs leading-snug select-none line-clamp-2 sm:line-clamp-none ${isChecked ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'}`}>
                     {item}
                   </span>
                 </label>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabTracker() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('sna_progress');
      return saved ? JSON.parse(saved) : { 1: 0, 2: 0, 3: 0 };
    } catch {
      return { 1: 0, 2: 0, 3: 0 };
    }
  });
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sna_week_checks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const updateProgress = (phase: number, pct: number) => {
    const updated = { ...progress, [phase]: pct };
    setProgress(updated);
    localStorage.setItem('sna_progress', JSON.stringify(updated));
  };

  const toggleCheck = (id: string) => {
    const updated = { ...checks, [id]: !checks[id] };
    setChecks(updated);
    localStorage.setItem('sna_week_checks', JSON.stringify(updated));
  };

  const toggleExpand = (week: number) => {
    setExpandedWeek(expandedWeek === week ? null : week);
  };

  return (
    <div className="space-y-6">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Progress Tracker</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-4 flex flex-col">
          <Card className="p-5 flex flex-col sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Mini Project (Wk 13)</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Hardware procurement, installation & safety.</p>
            
            <div className="space-y-6 flex-1">
              {[
                { phase: 1, title: 'Phase 1: Hardware & Layout', col: 'bg-indigo-600', textCol: 'text-indigo-600 dark:text-indigo-400' },
                { phase: 2, title: 'Phase 2: Installation & Safety', col: 'bg-emerald-500', textCol: 'text-emerald-600 dark:text-emerald-400' },
                { phase: 3, title: 'Phase 3: Security & Docs', col: 'bg-amber-500', textCol: 'text-amber-600 dark:text-amber-400' },
              ].map((item) => (
                <div key={item.phase}>
                  <div className="flex justify-between text-[11px] font-bold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">{item.title}</span>
                    <span className={`${item.textCol} tabular-nums font-bold`}>{progress[item.phase as keyof typeof progress]}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`${item.col} h-1.5 rounded-full transition-all duration-500`} 
                      style={{ width: `${progress[item.phase as keyof typeof progress]}%` }}
                    />
                  </div>
                  <div className="flex space-x-1.5 mt-3">
                    {[25, 50, 75, 100].map(pct => {
                      const isActive = progress[item.phase as keyof typeof progress] === pct;
                      return (
                        <button 
                          key={pct}
                          onClick={() => updateProgress(item.phase, pct)} 
                          className={`text-[10px] py-1 px-1.5 rounded-lg font-bold flex-1 transition-all border ${
                            isActive 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {pct}%
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-8 flex flex-col">
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span> Weekly Checklists (1 - 13)
          </h3>
          
          <div className="space-y-0 relative z-10 pb-8">
            {WEEKLY_CHECKLISTS.map((weekObj) => (
              <div key={weekObj.week}>
                <WeekAccordion 
                  weekObj={weekObj}
                  checks={checks}
                  onToggleCheck={toggleCheck}
                  expanded={expandedWeek === weekObj.week}
                  onToggleExpand={() => toggleExpand(weekObj.week)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
