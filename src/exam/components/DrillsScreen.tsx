import { useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Copy, AlertTriangle } from 'lucide-react';
import { DRILL_GROUPS, DRILL_MINUTES, DOCUMENTATION_MINUTES } from '../content';
import { DRILLS } from '../generated/drills';
import { VIVA_QUESTIONS } from '../generated/viva';
import { examActions, useExamState } from '../store';
import type { Drill } from '../types';
import { PageHead, SectionHead } from './PageHead';
import { RichText } from './RichText';
import { Sheet } from './Sheet';
import { BTN_PRIMARY, BTN_SECONDARY } from './ui';

function vivaRange(numbers: number[]): string {
  if (numbers.length === 0) return '';
  const sorted = [...numbers].sort((a, b) => a - b);
  const consecutive = sorted.every((value, index) => index === 0 || value === sorted[index - 1] + 1);
  if (consecutive && sorted.length > 2) return `Q${sorted[0]}–${sorted[sorted.length - 1]}`;
  return `Q${sorted.join(', ')}`;
}

export function DrillsScreen({
  openId,
  onOpen,
  onClose,
  onOpenViva,
}: {
  openId: number | null;
  onOpen: (id: number) => void;
  onClose: () => void;
  onOpenViva: (n: number) => void;
}) {
  const state = useExamState();
  const openDrill = openId ? DRILLS.find((drill) => drill.id === openId) ?? null : null;

  return (
    <div>
      <PageHead
        title="Twelve drills."
        lede="Short, timed runs of the tasks in the paper. Work in order and finish each one with something you can show the examiner."
      >
        <p className="text-sm text-ink-3">
          <span className="font-semibold text-ink tnum">{DRILLS.length}</span> drills ·{' '}
          <span className="font-semibold text-ink tnum">{DRILL_MINUTES}</span> minutes ·{' '}
          <span className="font-semibold text-ink tnum">{DOCUMENTATION_MINUTES}</span> for documentation
        </p>
      </PageHead>

      <div className="space-y-10 sm:space-y-12">
        {DRILL_GROUPS.map((group) => {
          if (group.drills.length === 0) return null;
          const minutes = group.drills.reduce((total, drill) => total + drill.minutes, 0);
          return (
            <section key={group.category} aria-labelledby={`drills-${group.category.replace(/\W+/g, '-')}`}>
              <SectionHead
                id={`drills-${group.category.replace(/\W+/g, '-')}`}
                title={group.category}
                note={`${group.drills.length} drills · ${minutes} min`}
              />
              <ul className="border-t border-line">
                {group.drills.map((drill) => {
                  const done = state.completedDrills.includes(drill.id);
                  const stepsDone = state.completedSteps[String(drill.id)]?.length ?? 0;
                  return (
                    <li key={drill.id} className="border-b border-line">
                      <button
                        type="button"
                        onClick={() => onOpen(drill.id)}
                        className="group flex w-full items-start gap-3 py-4 text-left sm:gap-4"
                      >
                        <span
                          className={`mt-0.5 w-7 shrink-0 font-mono text-sm font-semibold tnum ${
                            done ? 'text-success' : 'text-ink-3'
                          }`}
                        >
                          {String(drill.id).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[1rem] font-medium leading-snug ${
                              done ? 'text-ink-2' : 'text-ink group-hover:text-brand-text'
                            }`}
                          >
                            {drill.title}
                          </span>
                          <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-3">
                            <span className="tnum">{drill.minutes} min</span>
                            <span>{drill.phase}</span>
                            {drill.viva.length > 0 ? <span>{vivaRange(drill.viva)}</span> : null}
                            {stepsDone > 0 ? (
                              <span className="tnum">
                                {stepsDone}/{drill.steps.length} steps
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <span className="mt-1 shrink-0 text-ink-3">
                          {done ? (
                            <CheckCircle2 size={18} className="text-success" aria-label="Done" />
                          ) : (
                            <ChevronRight
                              size={18}
                              className="transition-transform group-hover:translate-x-0.5 group-hover:text-brand-text"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-10 border-t border-line pt-5 text-sm leading-relaxed text-ink-2">
        Finish with the documentation drill: one page listing the machine, the work done, the evidence and two
        problems you solved.
      </p>

      {openDrill ? <DrillSheet drill={openDrill} onClose={onClose} onOpenViva={onOpenViva} /> : null}
    </div>
  );
}

function DrillSheet({
  drill,
  onClose,
  onOpenViva,
}: {
  drill: Drill;
  onClose: () => void;
  onOpenViva: (n: number) => void;
}) {
  const state = useExamState();
  const [copied, setCopied] = useState(false);
  const stepsDone = state.completedSteps[String(drill.id)] ?? [];
  const done = state.completedDrills.includes(drill.id);
  const vivaQuestions = drill.viva
    .map((n) => VIVA_QUESTIONS.find((question) => question.n === n))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));

  const copyCommands = async () => {
    try {
      await navigator.clipboard.writeText(drill.commands.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be blocked; the commands stay selectable.
    }
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Drill ${String(drill.id).padStart(2, '0')} — ${drill.title}`}
      meta={
        <>
          <span className="tnum">{drill.minutes} min</span>
          <span aria-hidden="true">·</span>
          <span>{drill.category}</span>
          <span aria-hidden="true">·</span>
          <span className="tnum">
            {stepsDone.length}/{drill.steps.length} steps
          </span>
        </>
      }
      footer={
        <button
          type="button"
          onClick={() => examActions.toggleDrill(drill.id)}
          className={`${done ? BTN_SECONDARY : BTN_PRIMARY} w-full`}
        >
          <Check size={16} aria-hidden="true" />
          {done ? 'Marked done — tap to undo' : 'Mark this drill done'}
        </button>
      }
    >
      <div className="space-y-7">
        <section>
          <h3 className="mb-3 font-display text-[1.05rem] font-semibold text-ink">Do this</h3>
          <ol className="border-t border-line">
            {drill.steps.map((step, index) => {
              const checked = stepsDone.includes(index);
              return (
                <li key={index} className="border-b border-line py-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => examActions.toggleStep(drill.id, index)}
                      className="mt-1 h-[18px] w-[18px] shrink-0 accent-[var(--brand)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[0.9375rem] leading-relaxed ${
                          checked ? 'text-ink-3 line-through decoration-line-strong' : 'text-ink-2'
                        }`}
                      >
                        <span className="mr-1.5 font-mono text-xs font-semibold text-ink-3 tnum">
                          {index + 1}.
                        </span>
                        <RichText text={step.text} />
                      </span>
                      {step.sub.length > 0 ? (
                        <span className="mt-2 block">
                          <span className="block text-sm leading-relaxed text-ink-2">
                            {step.sub.map((item, itemIndex) => (
                              <span key={itemIndex} className="mb-1.5 flex gap-2 last:mb-0">
                                <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
                                <RichText text={item} />
                              </span>
                            ))}
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        </section>

        {drill.commands.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-display text-[1.05rem] font-semibold text-ink">Commands and paths</h3>
              <button
                type="button"
                onClick={copyCommands}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-control px-2 text-xs font-medium text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
              >
                {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy all'}
              </button>
            </div>
            <div className="rounded-card border border-line bg-sunken p-4">
              <div className="flex flex-wrap gap-1.5">
                {drill.commands.map((command) => (
                  <code
                    key={command}
                    className="rounded-[5px] border border-line bg-raised px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink"
                  >
                    {command}
                  </code>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-3">
                <RichText text={drill.commandsRaw} />
              </p>
            </div>
          </section>
        ) : null}

        <section>
          <h3 className="mb-2 font-display text-[1.05rem] font-semibold text-ink">What the examiner sees</h3>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">
            <RichText text={drill.prove} />
          </p>
        </section>

        <section className="rounded-card bg-danger-soft p-4">
          <h3 className="mb-1.5 flex items-center gap-2 font-display text-[1.05rem] font-semibold text-danger">
            <AlertTriangle size={16} aria-hidden="true" />
            Marks lost here
          </h3>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">
            <RichText text={drill.traps} />
          </p>
        </section>

        {drill.note ? (
          <section className="rounded-card bg-sunken p-4">
            <h3 className="mb-1.5 font-display text-[1.05rem] font-semibold text-signal">Before you run it</h3>
            <p className="text-[0.9375rem] leading-relaxed text-ink-2">
              <RichText text={drill.note} />
            </p>
          </section>
        ) : null}

        {vivaQuestions.length > 0 ? (
          <section>
            <h3 className="mb-2 font-display text-[1.05rem] font-semibold text-ink">Viva for this drill</h3>
            <div className="border-t border-line">
              {vivaQuestions.map((question) => (
                <button
                  key={question.n}
                  type="button"
                  onClick={() => onOpenViva(question.n)}
                  className="group flex w-full items-start gap-3 border-b border-line py-3 text-left"
                >
                  <span className="mt-0.5 w-8 shrink-0 font-mono text-xs font-semibold text-ink-3 tnum">
                    Q{question.n}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.9375rem] leading-snug text-ink-2 group-hover:text-brand-text">
                    {question.question}
                  </span>
                  <ChevronRight size={16} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </Sheet>
  );
}
