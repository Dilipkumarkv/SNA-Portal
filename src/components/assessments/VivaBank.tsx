import { useMemo, useState } from 'react';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';
import { CURRICULUM } from '../../data/curriculum';

interface BankViva {
  week: number;
  labTitle: string;
  number: number;
  question: string;
  answer: string;
}

const ALL_VIVA: BankViva[] = CURRICULUM.flatMap(module =>
  module.viva.map(item => ({
    week: module.id,
    labTitle: module.labTitle,
    number: item.number,
    question: item.question,
    answer: item.answer,
  })),
);

const WEEKS = CURRICULUM.map(module => module.id);

export function VivaBank() {
  const [query, setQuery] = useState('');
  const [week, setWeek] = useState<number | 'all'>('all');
  const [open, setOpen] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ALL_VIVA.filter(item => {
      if (week !== 'all' && item.week !== week) return false;
      if (!needle) return true;
      return item.question.toLowerCase().includes(needle) || item.answer.toLowerCase().includes(needle);
    });
  }, [query, week]);

  const toggle = (key: string) => {
    setOpen(current => {
      const updated = new Set(current);
      if (updated.has(key)) updated.delete(key);
      else updated.add(key);
      return updated;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          <HelpCircle size={14} /> Viva question bank
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {filtered.length}/{ALL_VIVA.length}
        </span>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search viva questions and answers…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label="Search viva questions"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setWeek('all')}
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${
            week === 'all' ? 'bg-amber-500 text-white' : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          All
        </button>
        {WEEKS.map(id => (
          <button
            key={id}
            onClick={() => setWeek(id)}
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${
              week === id ? 'bg-amber-500 text-white' : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            Wk {id}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No viva questions match that search.
          </p>
        )}
        {filtered.map(item => {
          const key = `${item.week}-${item.number}`;
          const expanded = open.has(key);
          return (
            <div key={key} className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <button
                onClick={() => toggle(key)}
                className="flex w-full items-start gap-2 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                aria-expanded={expanded}
              >
                <span className="mt-0.5 shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                  Wk {item.week}
                </span>
                <span className="flex-1 text-xs font-bold leading-snug text-slate-800 dark:text-slate-200">
                  Q{item.number}. {item.question}
                </span>
                <ChevronDown size={14} className={`mt-0.5 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && (
                <p className="border-l-2 border-amber-400 px-3 pb-3 pl-4 text-xs leading-relaxed text-slate-600 dark:border-amber-500 dark:text-slate-300">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
