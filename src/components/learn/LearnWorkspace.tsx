import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardList } from 'lucide-react';
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
  const [, setVersion] = useState(0);

  useEffect(() => subscribeProgress(() => setVersion(version => version + 1)), []);

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
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="font-display text-title font-semibold text-ink">System &amp; Network Administration</h2>
          <p className="mt-1 text-sm text-ink-2">
            {summary.completed} of {summary.total} lessons complete
          </p>
        </div>
        <div className="min-w-[9rem] flex-1 sm:max-w-[16rem]">
          <div className="flex items-center justify-between text-xs font-medium text-ink-3">
            <span>Course progress</span>
            <span className="tabular-nums">{percent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
            <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-control bg-sunken p-1" role="tablist" aria-label="Learn sections">
        {([
          { key: 'lessons', label: 'Lessons', icon: <BookOpen size={16} /> },
          { key: 'assessments', label: 'Assessments', icon: <ClipboardList size={16} /> },
        ] as const).map(item => (
          <button
            key={item.key}
            onClick={() => changeMode(item.key)}
            role="tab"
            aria-selected={mode === item.key}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] text-sm font-semibold transition-colors ${
              mode === item.key
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {mode === 'assessments' ? <AssessmentBank /> : (
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <nav className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0" aria-label="Weeks">
            <div className="flex gap-1.5 lg:flex-col lg:gap-1">
              {CURRICULUM.map(item => {
                const weekProgress = summary.byWeek[item.id] ?? { completed: 0, total: item.lessons.length };
                const active = item.id === ref.week;
                const done = weekProgress.completed === weekProgress.total;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectWeek(item.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`group flex shrink-0 flex-col items-center gap-0.5 rounded-control px-3 py-2 transition-colors lg:w-full lg:flex-row lg:items-center lg:gap-2.5 lg:px-3 ${
                      active
                        ? 'bg-brand-soft text-brand-text'
                        : 'text-ink-2 hover:bg-sunken'
                    }`}
                  >
                    <span className="text-sm font-semibold tabular-nums lg:w-7 lg:text-left">{item.id}</span>
                    <span className="hidden flex-1 truncate text-sm font-medium lg:block">{item.title}</span>
                    <span className="flex items-center gap-1 text-[0.625rem] font-semibold tabular-nums lg:text-xs">
                      {done ? <CheckCircle2 size={12} className="text-success" aria-hidden="true" /> : null}
                      <span className="lg:hidden">{weekProgress.completed}/{weekProgress.total}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="mt-5 min-w-0 space-y-3 lg:mt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-semibold text-ink">
                Week {courseModule.id} · {courseModule.title}
              </h3>
              <span className="text-xs tabular-nums text-ink-3">
                {summary.byWeek[courseModule.id]?.completed ?? 0}/{courseModule.lessons.length} done
              </span>
            </div>

            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1" aria-label="Days in this week">
              {courseModule.lessons.map(item => {
                const complete = isLessonComplete(courseModule.id, item.number);
                const active = item.number === lesson.number;
                return (
                  <button
                    key={item.number}
                    onClick={() => navigate({ week: courseModule.id, day: item.number })}
                    aria-current={active ? 'true' : undefined}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-ink text-canvas'
                        : 'border border-line bg-surface text-ink-2 hover:text-ink'
                    }`}
                  >
                    {complete && <CheckCircle2 size={13} className={active ? 'text-signal' : 'text-success'} aria-hidden="true" />}
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
