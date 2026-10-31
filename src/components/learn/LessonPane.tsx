import { useEffect, useState } from 'react';
import {
  CheckCircle2, Circle, ChevronLeft, ChevronRight, ExternalLink,
  ChevronDown, ArrowRight,
} from 'lucide-react';
import type { Lesson, Module } from '../../data/curriculum';
import type { LessonRef } from '../../lib/progress';
import { SchematicPane } from './SchematicPane';
import { TryItTab } from './TryItTab';
import { WeekNotes } from './WeekNotes';

type TabKey = 'basics' | 'overview' | 'notes' | 'schematic' | 'tryit' | 'qa';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basics', label: 'Lesson' },
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
    <article className="overflow-hidden rounded-card border border-line bg-surface">
      <header className="border-b border-line px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          <span className="font-semibold text-brand-text">Day {day} of {courseModule.lessons.length}</span>
          <span aria-hidden="true">·</span>
          <span>{courseModule.title}</span>
        </div>
        <h2 className="mt-1.5 font-display text-[1.4rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[1.6rem]">
          {lesson.title}
        </h2>
        {lesson.overview && (
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-2">{lesson.overview}</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={onToggleComplete}
            aria-pressed={isComplete}
            className={`inline-flex min-h-10 items-center gap-2 rounded-control px-3.5 text-sm font-semibold transition-colors ${
              isComplete
                ? 'bg-success-soft text-success'
                : 'border border-line text-ink-2 hover:bg-sunken hover:text-ink'
            }`}
          >
            {isComplete ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            {isComplete ? 'Completed' : 'Mark complete'}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => previous && onNavigate(previous)}
              disabled={!previous}
              aria-label="Previous lesson"
              className="grid h-10 w-10 place-items-center rounded-control border border-line text-ink-2 transition-colors hover:bg-sunken hover:text-ink disabled:opacity-35"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => next && onNavigate(next)}
              disabled={!next}
              aria-label="Next lesson"
              className="grid h-10 w-10 place-items-center rounded-control bg-brand text-white transition-colors hover:bg-brand-hover disabled:opacity-35"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      <nav
        className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 sm:px-5"
        aria-label="Lesson sections"
      >
        {TABS.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            aria-current={tab === item.key ? 'page' : undefined}
            className={`relative shrink-0 px-3 py-3 text-sm font-medium transition-colors ${
              tab === item.key ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            {item.label}
            <span
              className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-opacity ${
                tab === item.key ? 'bg-brand opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        ))}
      </nav>

      <div className="px-4 py-6 sm:px-6">
        {tab === 'basics' && (
          lesson.sections.length === 0 ? (
            <EmptyNote text="No lesson notes were written for this day. Use the Overview tab for the lab work." />
          ) : (
            <div className="max-w-[68ch] space-y-7">
              {lesson.sections.map((section, index) => (
                <section key={`${section.heading}-${index}`}>
                  <h3 className="border-t border-line pt-4 font-sans text-[0.9375rem] font-semibold text-ink">
                    {section.heading}
                  </h3>
                  <div className="mt-2 space-y-3">
                    {section.body.map((paragraph, bodyIndex) => (
                      <p key={bodyIndex} className="text-[0.9375rem] leading-7 text-ink-2">
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
          <div className="max-w-[68ch] space-y-7">
            {courseModule.previousSummary && (
              <section>
                <h3 className="font-sans text-[0.9375rem] font-semibold text-ink">Before this week</h3>
                <p className="mt-2 text-[0.9375rem] leading-7 text-ink-2">{courseModule.previousSummary}</p>
              </section>
            )}

            {courseModule.connection && (
              <section>
                <h3 className="font-sans text-[0.9375rem] font-semibold text-ink">Why it matters</h3>
                <p className="mt-2 text-[0.9375rem] leading-7 text-ink-2">{courseModule.connection}</p>
              </section>
            )}

            {courseModule.syllabusCoverage.length > 0 && (
              <section>
                <h3 className="font-sans text-[0.9375rem] font-semibold text-ink">Syllabus covered</h3>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {courseModule.syllabusCoverage.map(item => (
                    <li key={item} className="rounded-full bg-sunken px-3 py-1 text-xs font-medium text-ink-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {courseModule.practicalTasks.length > 0 && (
              <section>
                <h3 className="font-sans text-[0.9375rem] font-semibold text-ink">
                  Lab · {courseModule.labTitle}
                </h3>
                <ol className="mt-3 space-y-3">
                  {courseModule.practicalTasks.map((task, index) => (
                    <li key={`${task.topic}-${index}`} className="flex gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sunken text-xs font-semibold tabular-nums text-ink-2">
                        {index + 1}
                      </span>
                      <span className="text-[0.9375rem] leading-7 text-ink-2">
                        <span className="font-semibold text-ink">{task.topic}. </span>
                        {task.detail}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {courseModule.references.length > 0 && (
              <section>
                <h3 className="font-sans text-[0.9375rem] font-semibold text-ink">Reference links</h3>
                <ul className="mt-2 divide-y divide-line rounded-control border border-line">
                  {courseModule.references.map(reference => (
                    <li key={reference.url}>
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 px-3.5 py-3 text-sm font-medium text-ink transition-colors hover:bg-sunken"
                      >
                        <span className="min-w-0 break-words">{reference.label}</span>
                        <ExternalLink size={14} className="shrink-0 text-ink-3" aria-hidden="true" />
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
          <div className="max-w-[68ch] space-y-7">
            <section>
              <h3 className="font-sans text-[0.9375rem] font-semibold text-ink">Exam-style questions</h3>
              {lesson.questions.length === 0 ? (
                <p className="mt-2 text-sm text-ink-3">No questions were set for this lesson.</p>
              ) : (
                <ol className="mt-2.5 list-decimal space-y-2 pl-5 text-[0.9375rem] leading-7 text-ink-2">
                  {lesson.questions.map((question, index) => <li key={index}>{question}</li>)}
                </ol>
              )}
            </section>

            <section>
              <h3 className="font-sans text-[0.9375rem] font-semibold text-ink">Viva questions</h3>
              <p className="mt-1 text-xs text-ink-3">{courseModule.labTitle}</p>
              {courseModule.viva.length === 0 ? (
                <p className="mt-2 text-sm text-ink-3">No viva questions for this week.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line rounded-control border border-line">
                  {courseModule.viva.map(item => {
                    const open = openViva.has(item.number);
                    return (
                      <li key={item.number}>
                        <button
                          onClick={() => toggleViva(item.number)}
                          aria-expanded={open}
                          className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-sunken"
                        >
                          <span className="mt-0.5 text-xs font-semibold tabular-nums text-ink-3">Q{item.number}</span>
                          <span className="flex-1 text-sm font-medium text-ink">{item.question}</span>
                          <ChevronDown
                            size={16}
                            className={`mt-0.5 shrink-0 text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                        {open && (
                          <p className="px-3.5 pb-4 pl-10 text-sm leading-7 text-ink-2">{item.answer}</p>
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

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-4 sm:px-6">
        <button
          onClick={onToggleComplete}
          className={`inline-flex min-h-10 items-center gap-2 rounded-control px-3.5 text-sm font-semibold transition-colors ${
            isComplete
              ? 'bg-success-soft text-success'
              : 'border border-line text-ink-2 hover:bg-sunken hover:text-ink'
          }`}
        >
          {isComplete ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          {isComplete ? 'Completed' : 'Mark complete'}
        </button>
        {next ? (
          <button
            onClick={() => onNavigate(next)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-control bg-ink px-4 text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
          >
            Next lesson <ArrowRight size={15} aria-hidden="true" />
          </button>
        ) : (
          <span className="text-sm text-ink-3">Last lesson of the course</span>
        )}
      </footer>
    </article>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="rounded-control border border-dashed border-line-strong bg-sunken p-4 text-sm text-ink-2">
      {text}
    </p>
  );
}
