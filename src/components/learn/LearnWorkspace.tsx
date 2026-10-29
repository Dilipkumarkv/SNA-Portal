import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Circle, ClipboardList, GraduationCap } from 'lucide-react';
import { CURRICULUM } from '../../data/curriculum';
import {
  getLastLesson, getSummary, isLessonComplete, nextLesson, previousLesson,
  setLastLesson, subscribeProgress, toggleLesson, type LessonRef,
} from '../../lib/progress';
import { LessonPane } from './LessonPane';
import { AssessmentBank } from './AssessmentBank';

type LearnMode = 'lessons' | 'assessments';

function findLesson(ref: LessonRef): boolean {
  const courseModule = CURRICULUM.find(item => item.id === ref.week);
  return Boolean(courseModule?.lessons.some(lesson => lesson.number === ref.day));
}

function parseHash(): { mode: LearnMode; ref: LessonRef | null } | null {
  const raw = window.location.hash.replace(/^#/, '');
  if (raw === 'learn/assessment' || raw === 'qps') return { mode: 'assessments', ref: null };
  if (raw === 'notes') return { mode: 'lessons', ref: null };
  const match = raw.match(/^learn\/(\d+)\/(\d+)$/);
  if (!match) return null;
  const ref = { week: Number(match[1]), day: Number(match[2]) };
  return findLesson(ref) ? { mode: 'lessons', ref } : null;
}

function initialRef(): LessonRef {
  const last = getLastLesson();
  if (last && findLesson(last)) return last;
  return { week: CURRICULUM[0].id, day: CURRICULUM[0].lessons[0].number };
}

/** #notes and #qps predate the merge into Learn; keep the links working without an extra history entry. */
function normalizeLegacyHash() {
  const raw = window.location.hash.replace(/^#/, '');
  if (raw === 'notes') window.history.replaceState(null, '', '#learn');
  if (raw === 'qps') window.history.replaceState(null, '', '#learn/assessment');
}

export function LearnWorkspace() {
  const [mode, setMode] = useState<LearnMode>(() => parseHash()?.mode ?? 'lessons');
  const [ref, setRef] = useState<LessonRef>(() => parseHash()?.ref ?? initialRef());
  const [, setProgressVersion] = useState(0);

  useEffect(() => subscribeProgress(() => setProgressVersion(version => version + 1)), []);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash();
      if (!parsed) return;
      normalizeLegacyHash();
      setMode(parsed.mode);
      if (parsed.ref) setRef(parsed.ref);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    normalizeLegacyHash();
  }, []);

  useEffect(() => {
    setLastLesson(ref.week, ref.day);
  }, [ref]);

  const navigate = useCallback((target: LessonRef) => {
    setMode('lessons');
    setRef(target);
    const hash = `learn/${target.week}/${target.day}`;
    if (window.location.hash.replace(/^#/, '') !== hash) {
      window.location.hash = hash;
    }
  }, []);

  const changeMode = (next: LearnMode) => {
    setMode(next);
    const hash = next === 'assessments' ? 'learn/assessment' : `learn/${ref.week}/${ref.day}`;
    if (window.location.hash.replace(/^#/, '') !== hash) {
      window.location.hash = hash;
    }
  };

  const summary = getSummary();
  const courseModule = CURRICULUM.find(item => item.id === ref.week) ?? CURRICULUM[0];
  const lesson = courseModule.lessons.find(item => item.number === ref.day) ?? courseModule.lessons[0];
  const percent = summary.total === 0 ? 0 : Math.round((summary.completed / summary.total) * 100);

  const selectWeek = (week: number) => {
    const target = CURRICULUM.find(item => item.id === week);
    if (!target || target.lessons.length === 0) return;
    const last = getLastLesson();
    const day = last?.week === week && target.lessons.some(item => item.number === last.day)
      ? last.day
      : target.lessons[0].number;
    navigate({ week, day });
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-200">
              <GraduationCap size={14} /> Learn
            </p>
            <h2 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">System &amp; Network Administration</h2>
            <p className="mt-1 text-xs text-indigo-100">13 weeks · {summary.total} lessons · 58 lab experiments</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-extrabold leading-none">{summary.completed}<span className="text-sm font-bold text-indigo-200">/{summary.total}</span></p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-indigo-200">lessons done</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-indigo-900/40">
          <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      </section>

      <div className="flex gap-1.5" role="tablist" aria-label="Learn sections">
        {([
          { key: 'lessons', label: 'Lessons', icon: <BookOpen size={14} /> },
          { key: 'assessments', label: 'Assessments', icon: <ClipboardList size={14} /> },
        ] as const).map(item => (
          <button
            key={item.key}
            onClick={() => changeMode(item.key)}
            role="tab"
            aria-selected={mode === item.key}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              mode === item.key
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {mode === 'assessments' ? <AssessmentBank /> : (
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-5">
        <nav
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1.5 lg:overflow-visible lg:px-0"
          aria-label="Weeks"
        >
          {CURRICULUM.map(item => {
            const weekProgress = summary.byWeek[item.id] ?? { completed: 0, total: item.lessons.length };
            const active = item.id === ref.week;
            const done = weekProgress.completed === weekProgress.total;
            return (
              <button
                key={item.id}
                onClick={() => selectWeek(item.id)}
                className={`flex w-40 shrink-0 flex-col rounded-xl border px-3 py-2 text-left transition-colors lg:w-full ${
                  active
                    ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                }`}
                aria-current={active ? 'true' : undefined}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    Week {item.id}
                  </span>
                  <span className={`flex items-center gap-0.5 text-[10px] font-bold ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {done ? <CheckCircle2 size={11} /> : null}
                    {weekProgress.completed}/{weekProgress.total}
                  </span>
                </span>
                <span className={`mt-0.5 truncate text-xs font-bold ${active ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-5 space-y-3 lg:mt-0">
          <div className="flex flex-wrap gap-1.5" aria-label="Lessons in this week">
            {courseModule.lessons.map(item => {
              const complete = isLessonComplete(courseModule.id, item.number);
              const active = item.number === lesson.number;
              return (
                <button
                  key={item.number}
                  onClick={() => navigate({ week: courseModule.id, day: item.number })}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    active
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  aria-current={active ? 'true' : undefined}
                >
                  {complete ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  Day {item.number}
                </button>
              );
            })}
          </div>

          <LessonPane
            module={courseModule}
            lesson={lesson}
            week={courseModule.id}
            day={lesson.number}
            isComplete={isLessonComplete(courseModule.id, lesson.number)}
            onToggleComplete={() => toggleLesson(courseModule.id, lesson.number)}
            previous={previousLesson(courseModule.id, lesson.number)}
            next={nextLesson(courseModule.id, lesson.number)}
            onNavigate={navigate}
          />
        </div>
      </div>
      )}
    </div>
  );
}
