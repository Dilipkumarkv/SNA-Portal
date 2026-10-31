import { ArrowUpRight, ChevronDown, TriangleAlert } from 'lucide-react';
import { EXAM_TOTAL_MINUTES, PHASES, type Phase } from '../guide';
import type { MachineViewId } from '../types';
import { PageHead, SectionHead } from './PageHead';
import { BlockList } from './RichText';
import { AskBlock } from './AskBlock';
import { BTN_QUIET } from './ui';

const SCHEDULE: { phase: Phase; start: number }[] = [];
let cursor = 0;
for (const phase of PHASES) {
  SCHEDULE.push({ phase, start: cursor });
  cursor += phase.minutes;
}

function clock(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

export function ExamDayScreen({ onOpenMachine }: { onOpenMachine: (view: MachineViewId) => void }) {
  return (
    <div>
      <PageHead
        title="Exam day, step by step."
        lede="Seven blocks in the order the paper runs. Open a block to see what to do, what to show the examiner, and the question most likely to come."
      >
        <p className="text-sm text-ink-3">
          <span className="font-semibold text-ink tnum">{EXAM_TOTAL_MINUTES}</span> minutes ·{' '}
          <span className="font-semibold text-ink tnum">50</span> marks · pass at{' '}
          <span className="font-semibold text-ink tnum">20</span>
        </p>
      </PageHead>

      <ol className="border-t border-line">
        {SCHEDULE.map(({ phase, start }) => (
          <li key={phase.id} className="border-b border-line">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-start gap-3 py-4 [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 font-mono text-xs font-semibold text-ink-3 tnum">
                  {String(phase.n).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9375rem] font-medium leading-snug text-ink">{phase.title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-3">
                    {phase.area} · starts at {clock(start)}
                  </span>
                </span>
                <span className="mt-0.5 shrink-0 font-mono text-sm text-ink-2 tnum">{phase.minutes} min</span>
                <ChevronDown
                  size={17}
                  className="mt-1 shrink-0 text-ink-3 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>

              <div className="pb-6 pl-8 pr-1 sm:pl-10">
                <BlockList items={phase.steps} ordered />

                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-ink">Show the examiner</h3>
                  <div className="mt-1.5">
                    <BlockList items={phase.show} />
                  </div>
                </div>

                <div className="mt-5">
                  <AskBlock ask={phase.ask} />
                </div>

                {phase.warning ? (
                  <p className="mt-5 flex gap-2.5 rounded-control bg-danger-soft px-3.5 py-3 text-sm leading-relaxed text-ink-2">
                    <TriangleAlert size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
                    <span>{phase.warning}</span>
                  </p>
                ) : null}

                {phase.links?.length ? (
                  <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1">
                    <span className="flex min-h-9 items-center text-xs text-ink-3">Revise on the machine:</span>
                    {phase.links.map((link) => (
                      <button
                        key={link.view}
                        type="button"
                        onClick={() => onOpenMachine(link.view)}
                        className={BTN_QUIET}
                      >
                        {link.label}
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </details>
          </li>
        ))}
      </ol>

      <section aria-labelledby="answer-heading" className="mt-12">
        <SectionHead id="answer-heading" title="The answer shape" note="Three sentences, then stop" />
        <ol className="border-t border-line">
          {[
            ['Name it.', 'Use the exact term: HDMI, DDR3, GPT, SATA, SMPS.'],
            ['Say what it does.', 'One sentence on its job in this machine.'],
            ['Give the lab example.', 'Point to the part or the command you ran here.'],
          ].map(([lead, text], index) => (
            <li key={lead} className="flex gap-4 border-b border-line py-3.5">
              <span className="mt-0.5 font-mono text-xs font-semibold text-brand-text tnum">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed text-ink-2">
                <span className="font-medium text-ink">{lead}</span> {text}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          If you do not know, say what you would check first and why. A method beats a guess.
        </p>
      </section>

      <section aria-labelledby="paper-heading" className="mt-12">
        <SectionHead id="paper-heading" title="If the paper says something different" />
        <p className="border-t border-line pt-4 text-sm leading-relaxed text-ink-2">
          The paper decides. If it names another account, IP address or disk letter, use the paper's value and say
          which value you used. This page gives the order and the method, not the exact values.
        </p>
      </section>
    </div>
  );
}
