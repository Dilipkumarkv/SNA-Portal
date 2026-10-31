import { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
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
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search viva questions and answers…"
          className="w-full rounded-control border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-brand"
          aria-label="Search viva questions"
        />
      </div>

      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-control bg-sunken p-1">
        <button
          onClick={() => setWeek('all')}
          className={`shrink-0 rounded-[0.5rem] px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            week === 'all' ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'
          }`}
          aria-pressed={week === 'all'}
        >
          All weeks
        </button>
        {WEEKS.map(id => (
          <button
            key={id}
            onClick={() => setWeek(id)}
            className={`shrink-0 rounded-[0.5rem] px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              week === id ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'
            }`}
            aria-pressed={week === id}
          >
            Week {id}
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-3">{filtered.length} of {ALL_VIVA.length} questions</p>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="rounded-control border border-dashed border-line-strong p-4 text-sm text-ink-2">
            No viva questions match that search.
          </p>
        )}
        {filtered.map(item => {
          const key = `${item.week}-${item.number}`;
          const expanded = open.has(key);
          return (
            <div key={key} className="overflow-hidden rounded-control border border-line">
              <button
                onClick={() => toggle(key)}
                className="flex w-full items-start gap-2.5 p-3 text-left transition-colors hover:bg-sunken"
                aria-expanded={expanded}
              >
                <span className="mt-0.5 shrink-0 text-xs font-semibold text-ink-3">Wk {item.week}</span>
                <span className="flex-1 text-sm font-medium leading-snug text-ink">
                  Q{item.number}. {item.question}
                </span>
                <ChevronDown size={15} className={`mt-0.5 shrink-0 text-ink-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && (
                <p className="border-t border-line bg-sunken px-3 py-3 text-sm leading-relaxed text-ink-2">
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
