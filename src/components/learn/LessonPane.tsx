import { useEffect, useState } from 'react';
import {
  BookOpen, CheckCircle2, Circle, ChevronLeft, ChevronRight, ExternalLink,
  FlaskConical, ListChecks, ClipboardList, HelpCircle,
} from 'lucide-react';
import type { Lesson, Module } from '../../data/curriculum';
import type { LessonRef } from '../../lib/progress';
import { SchematicPane } from './SchematicPane';
import { TryItTab } from './TryItTab';
import { WeekNotes } from './WeekNotes';

type TabKey = 'basics' | 'overview' | 'notes' | 'schematic' | 'tryit' | 'qa';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basics', label: 'Basics' },
  { key: 'overview', label: 'Overview' },
  { key: 'notes', label: 'Notes' },
  { key: 'schematic', label: 'Schematic' },
  { key: 'tryit', label: 'Try it' },
  { key: 'qa', label: 'Q&A' },
];

interface LessonPaneProps {
  module: Module;
  lesson: Lesson;
  week: number;
  day: number;
  isComplete: boolean;
  onToggleComplete: () => void;
  previous: LessonRef | null;
  next: LessonRef | null;
  onNavigate: (ref: LessonRef) => void;
}

export function LessonPane({
  module: courseModule,
  lesson,
  week,
  day,
  isComplete,
  onToggleComplete,
  previous,
  next,
  onNavigate,
}: LessonPaneProps) {
  const [tab, setTab] = useState<TabKey>('basics');
  const [openViva, setOpenViva] = useState<Set<number>>(new Set());

  useEffect(() => {
    setTab('basics');
    setOpenViva(new Set());
  }, [week, day]);

  const toggleViva = (number: number) => {
    setOpenViva(current => {
      const updated = new Set(current);
      if (updated.has(number)) updated.delete(number);
      else updated.add(number);
      return updated;
    });
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
            Week {week}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Day {day} of {courseModule.lessons.length}
          </span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{courseModule.title}</span>
        </div>
        <h3 className="mt-2 text-xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
          {lesson.title}
        </h3>
        {lesson.overview && (
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{lesson.overview}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onToggleComplete}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              isComplete
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            aria-pressed={isComplete}
          >
            {isComplete ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            {isComplete ? 'Completed' : 'Mark complete'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => previous && onNavigate(previous)}
              disabled={!previous}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => next && onNavigate(next)}
              disabled={!next}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2 dark:border-slate-800" aria-label="Lesson sections">
        {TABS.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              tab === item.key
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            aria-current={tab === item.key ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-5">
        {tab === 'basics' && (
          lesson.sections.length === 0 ? (
            <EmptyNote text="No lesson notes were written for this day. Use the Overview tab for the lab work." />
          ) : (
            <div className="space-y-5">
              {lesson.sections.map((section, index) => (
                <section key={`${section.heading}-${index}`}>
                  <h5 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    <BookOpen size={13} /> {section.heading}
                  </h5>
                  <div className="mt-2 space-y-2">
                    {section.body.map((paragraph, bodyIndex) => (
                      <p key={bodyIndex} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        )}

        {tab === 'overview' && (
          <div className="space-y-5">
            {courseModule.previousSummary && (
              <section>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Before this week</h5>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{courseModule.previousSummary}</p>
              </section>
            )}

            {courseModule.connection && (
              <section>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Why it matters</h5>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{courseModule.connection}</p>
              </section>
            )}

            {courseModule.syllabusCoverage.length > 0 && (
              <section>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Syllabus covered</h5>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {courseModule.syllabusCoverage.map(item => (
                    <li key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {courseModule.practicalTasks.length > 0 && (
              <section>
                <h5 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <FlaskConical size={13} /> Lab: {courseModule.labTitle}
                </h5>
                <ol className="mt-2 space-y-2">
                  {courseModule.practicalTasks.map((task, index) => (
                    <li key={`${task.topic}-${index}`} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {index + 1}
                      </span>
                      <span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{task.topic}:</span> {task.detail}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {courseModule.references.length > 0 && (
              <section>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Reference links</h5>
                <ul className="mt-2 space-y-1.5">
                  {courseModule.references.map(reference => (
                    <li key={reference.url}>
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 break-all text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {reference.label} <ExternalLink size={11} className="shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {tab === 'notes' && <WeekNotes week={week} />}

        {tab === 'schematic' && <SchematicPane week={week} />}

        {tab === 'tryit' && <TryItTab week={week} />}

        {tab === 'qa' && (
          <div className="space-y-6">
            <section>
              <h5 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <ClipboardList size={13} /> Exam-style questions
              </h5>
              {lesson.questions.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No questions were set for this lesson.</p>
              ) : (
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {lesson.questions.map((question, index) => <li key={index}>{question}</li>)}
                </ol>
              )}
            </section>

            <section>
              <h5 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <HelpCircle size={13} /> Viva questions for {courseModule.labTitle}
              </h5>
              {courseModule.viva.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No viva questions for this week.</p>
              ) : (
                <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                  {courseModule.viva.map(item => {
                    const open = openViva.has(item.number);
                    return (
                      <li key={item.number}>
                        <button
                          onClick={() => toggleViva(item.number)}
                          className="flex w-full items-start gap-2 py-2 text-left"
                          aria-expanded={open}
                        >
                          <ListChecks size={14} className="mt-0.5 shrink-0 text-indigo-500" />
                          <span className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                            Q{item.number}. {item.question}
                          </span>
                          <ChevronRight size={14} className={`mt-1 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
                        </button>
                        {open && (
                          <p className="ml-6 pb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.answer}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </article>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
      {text}
    </p>
  );
}
