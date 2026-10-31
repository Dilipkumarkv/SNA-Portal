import { useState } from 'react';
import { ArrowRight, Check, Play, Square, TimerReset } from 'lucide-react';
import type { ExamTab } from '../types';
import { CIE5_PARTS, DRILL_GROUPS, DRILL_MINUTES, DOCUMENTATION_MINUTES, EXAM_FACTS, LAST_48 } from '../content';
import { DRILLS } from '../generated/drills';
import { FEATURED_VIVA, VIVA_QUESTIONS } from '../generated/viva';
import {
  daysUntilExam,
  examActions,
  formatClock,
  formatExamDate,
  useExamState,
} from '../store';
import { useNow } from '../useNow';
import { PageHead, SectionHead } from './PageHead';
import { BTN_PRIMARY, BTN_QUIET, BTN_SECONDARY } from './ui';

function countdownLabel(days: number | null): string {
  if (days === null) return 'No exam date set';
  if (days > 1) return `T−${days} days`;
  if (days === 1) return 'Tomorrow';
  if (days === 0) return 'Exam today';
  return 'The date has passed — update it';
}

export function PlanScreen({
  onNavigate,
  onOpenDrill,
  onOpenViva,
}: {
  onNavigate: (tab: ExamTab) => void;
  onOpenDrill: (id: number) => void;
  onOpenViva: (n: number) => void;
}) {
  const state = useExamState();
  const now = useNow(state.mock ? 1000 : 60_000);
  const days = daysUntilExam(state.examDate, now);
  const remaining = state.mock ? state.mock.endAt - now : null;
  const [confirmReset, setConfirmReset] = useState(false);

  const doneDrills = DRILLS.filter((drill) => state.completedDrills.includes(drill.id));
  const nextDrill = DRILLS.find((drill) => !state.completedDrills.includes(drill.id));
  const gotAnswers = Object.values(state.vivaMarks).filter((mark) => mark === 'got').length;
  const againAnswers = Object.values(state.vivaMarks).filter((mark) => mark === 'again').length;
  const nextViva = VIVA_QUESTIONS.find(
    (question) => FEATURED_VIVA.includes(question.n) && state.vivaMarks[String(question.n)] !== 'got'
  );
  const totalMinutes = DRILL_MINUTES + DOCUMENTATION_MINUTES;

  return (
    <div>
      <PageHead
        title="The exam, in one page."
        lede="Everything that earns marks in the practical: twelve timed drills, thirty viva answers and the mini project. Set the date, rehearse once, then stop adding new material."
      />

      <div className="space-y-12 sm:space-y-16">
        <section aria-labelledby="paper-facts">
          <SectionHead id="paper-facts" title="The paper" note="SEE · 25CS34I" />
          <dl className="border-t border-line">
            {EXAM_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="grid gap-0.5 border-b border-line py-3 sm:grid-cols-[8.5rem_1fr] sm:gap-6"
              >
                <dt className="text-sm text-ink-3">{fact.label}</dt>
                <dd className="text-[0.9375rem] leading-relaxed text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-ink-3">
            CIE-5 is separate: {CIE5_PARTS.map((part) => `${part.label.toLowerCase()} ${part.marks}`).join(' · ')}.
            {' '}
            <button
              type="button"
              onClick={() => onNavigate('project')}
              className="font-medium text-brand-text underline decoration-brand-ring underline-offset-2 hover:text-brand-hover"
            >
              Open the project guide
            </button>
            .
          </p>
        </section>

        <section className="grid gap-8 sm:grid-cols-2" aria-labelledby="date-heading">
          <div>
            <SectionHead id="date-heading" title="Exam date" />
            <label htmlFor="exam-date" className="mb-1.5 block text-sm text-ink-2">
              Set the confirmed date
            </label>
            <input
              id="exam-date"
              type="date"
              value={state.examDate ?? ''}
              onChange={(event) => examActions.setExamDate(event.target.value || null)}
              className="min-h-11 w-full rounded-control border border-line bg-raised px-3 text-sm text-ink [color-scheme:light] dark:[color-scheme:dark]"
            />
            <p className="mt-3 text-sm text-ink-2">
              <span className="font-semibold text-ink tnum">{countdownLabel(days)}</span>
              {state.examDate ? (
                <span className="text-ink-3"> · {formatExamDate(state.examDate)}</span>
              ) : (
                <span className="text-ink-3"> · the plan stays usable without it</span>
              )}
            </p>
          </div>

          <div>
            <SectionHead id="mock-heading" title="Mock exam" />
            {state.mock ? (
              <>
                <p className="font-mono text-[2rem] font-semibold leading-none tracking-[-0.02em] text-ink tnum">
                  {remaining && remaining > 0 ? formatClock(remaining) : 'Time up'}
                </p>
                <p className="mt-2 text-sm text-ink-2">
                  {remaining && remaining > 0
                    ? '180 minutes, no notes. Work the paper in order.'
                    : 'Stop. Close the notes and review what you finished.'}
                </p>
                <button type="button" onClick={() => examActions.endMock()} className={`${BTN_SECONDARY} mt-4 w-full`}>
                  <Square size={15} aria-hidden="true" />
                  End mock
                </button>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-ink-2">
                  Run the full paper once under the clock. The timer keeps counting if you close the tab.
                </p>
                <button type="button" onClick={() => examActions.startMock()} className={`${BTN_PRIMARY} mt-4 w-full`}>
                  <Play size={15} aria-hidden="true" />
                  Start 180-minute mock
                </button>
              </>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-3">
              <TimerReset size={13} aria-hidden="true" />
              {DRILLS.length} drills · {DRILL_MINUTES} minutes · {DOCUMENTATION_MINUTES} for documentation
            </p>
          </div>
        </section>

        <section aria-labelledby="progress-heading">
          <SectionHead
            id="progress-heading"
            title="Where you are"
            note={`${doneDrills.length} of ${DRILLS.length} drills · ${gotAnswers} known · ${againAnswers} to revisit`}
          />
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12" aria-label="Drill completion">
            {DRILLS.map((drill) => {
              const done = state.completedDrills.includes(drill.id);
              return (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => onOpenDrill(drill.id)}
                  aria-label={`Drill ${drill.id}: ${drill.title}${done ? ', done' : ''}`}
                  title={drill.title}
                  className={`grid h-10 place-items-center rounded-control border text-sm font-semibold tnum transition-colors ${
                    done
                      ? 'border-success/40 bg-success-soft text-success'
                      : 'border-line bg-raised text-ink-3 hover:border-line-strong hover:text-ink'
                  }`}
                >
                  {done ? <Check size={15} aria-hidden="true" /> : String(drill.id).padStart(2, '0')}
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-line">
            {nextDrill ? (
              <button
                type="button"
                onClick={() => onOpenDrill(nextDrill.id)}
                className="group flex w-full items-center justify-between gap-4 border-b border-line py-3.5 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-ink-3">Next drill · {nextDrill.minutes} min</span>
                  <span className="mt-0.5 block text-[0.9375rem] font-medium text-ink group-hover:text-brand-text">
                    {String(nextDrill.id).padStart(2, '0')} — {nextDrill.title}
                  </span>
                </span>
                <ArrowRight size={17} className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-text" aria-hidden="true" />
              </button>
            ) : (
              <p className="border-b border-line py-4 text-sm text-ink-2">
                All twelve drills are marked done. Run one backwards from the paper instead.
              </p>
            )}
            {nextViva ? (
              <button
                type="button"
                onClick={() => onOpenViva(nextViva.n)}
                className="group flex w-full items-center justify-between gap-4 py-3.5 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-ink-3">Next featured answer · Q{nextViva.n}</span>
                  <span className="mt-0.5 block max-w-[52ch] truncate text-[0.9375rem] font-medium text-ink group-hover:text-brand-text">
                    {nextViva.question}
                  </span>
                </span>
                <ArrowRight size={17} className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-text" aria-hidden="true" />
              </button>
            ) : (
              <p className="py-4 text-sm text-ink-2">
                Every featured answer is marked known. Quiz yourself on the rest before you stop.
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            <button type="button" onClick={() => onNavigate('drills')} className={BTN_QUIET}>
              All drills <ArrowRight size={14} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onNavigate('viva')} className={BTN_QUIET}>
              All answers <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </section>

        <section aria-labelledby="last48-heading">
          <SectionHead
            id="last48-heading"
            title="The last 48 hours"
            note={`${state.last48.length} of ${LAST_48.length} done`}
          />
          <ul className="border-t border-line">
            {LAST_48.map((item) => {
              const checked = state.last48.includes(item.id);
              return (
                <li key={item.id} className="border-b border-line">
                  <label className="flex cursor-pointer items-start gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => examActions.toggleLast48(item.id)}
                      className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--brand)]"
                    />
                    <span
                      className={`text-[0.9375rem] leading-relaxed ${
                        checked ? 'text-ink-3 line-through decoration-line-strong' : 'text-ink-2'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-ink-3">
            {DRILL_GROUPS.length} drill groups · {totalMinutes} total minutes including documentation. After the
            mock, only review what is already marked.
          </p>
        </section>

        <section aria-labelledby="reset-heading" className="border-t border-line pt-6">
          <h2 id="reset-heading" className="sr-only">
            Reset progress
          </h2>
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-ink-2">Clear the exam date, ticks, marks and mock?</p>
              <button
                type="button"
                onClick={() => {
                  examActions.reset();
                  setConfirmReset(false);
                }}
                className="min-h-9 rounded-control bg-danger px-3 text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
              >
                Reset
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} className={BTN_QUIET}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="text-sm font-medium text-ink-3 underline decoration-line-strong underline-offset-2 transition-colors hover:text-danger"
            >
              Reset all exam progress
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
