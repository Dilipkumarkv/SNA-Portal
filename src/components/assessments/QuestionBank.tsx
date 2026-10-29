import { useMemo, useState } from 'react';
import { Search, ClipboardList } from 'lucide-react';
import { CURRICULUM } from '../../data/curriculum';

interface BankQuestion {
  week: number;
  day: number;
  lessonTitle: string;
  question: string;
}

const ALL_QUESTIONS: BankQuestion[] = CURRICULUM.flatMap(module =>
  module.lessons.flatMap(lesson =>
    lesson.questions.map(question => ({
      week: module.id,
      day: lesson.number,
      lessonTitle: lesson.title,
      question,
    })),
  ),
);

const WEEKS = CURRICULUM.map(module => module.id);

export function QuestionBank() {
  const [query, setQuery] = useState('');
  const [week, setWeek] = useState<number | 'all'>('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ALL_QUESTIONS.filter(item => {
      if (week !== 'all' && item.week !== week) return false;
      if (!needle) return true;
      return item.question.toLowerCase().includes(needle) || item.lessonTitle.toLowerCase().includes(needle);
    });
  }, [query, week]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          <ClipboardList size={14} /> CIE question bank
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {filtered.length}/{ALL_QUESTIONS.length}
        </span>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search exam questions by topic…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label="Search exam questions"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setWeek('all')}
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${
            week === 'all' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          All
        </button>
        {WEEKS.map(id => (
          <button
            key={id}
            onClick={() => setWeek(id)}
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${
              week === id ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            Wk {id}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No questions match that search.
        </p>
      ) : (
        <ol className="space-y-2">
          {filtered.map((item, index) => (
            <li key={`${item.week}-${item.day}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">Wk {item.week}</span>
                <span>Day {item.day}</span>
                <span className="truncate">· {item.lessonTitle}</span>
              </div>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">{item.question}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
