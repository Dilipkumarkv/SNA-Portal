import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search exam questions by topic…"
          className="w-full rounded-control border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-brand"
          aria-label="Search exam questions"
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

      <p className="text-xs text-ink-3">{filtered.length} of {ALL_QUESTIONS.length} questions</p>

      {filtered.length === 0 ? (
        <p className="rounded-control border border-dashed border-line-strong p-4 text-sm text-ink-2">
          No questions match that search.
        </p>
      ) : (
        <ol className="space-y-2">
          {filtered.map((item, index) => (
            <li key={`${item.week}-${item.day}-${index}`} className="rounded-control border border-line p-3">
              <p className="text-xs text-ink-3">
                Week {item.week} · Day {item.day} · {item.lessonTitle}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{item.question}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
