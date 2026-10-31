import { useId, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronRight, TriangleAlert } from 'lucide-react';
import type { LabId, LabWeek } from '../types';
import { LABS, LAB_WEEKS, labBySlug, labsForWeek, type Lab } from '../labs';
import { PageHead, SectionHead } from './PageHead';
import { RichText } from './RichText';
import { AskBlock } from './AskBlock';
import { LabStage, LabThumb } from './LabStage';
import { BTN_QUIET, BTN_SECONDARY } from './ui';

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
        active
          ? 'border-brand-ring bg-brand-soft text-brand-text'
          : 'border-line text-ink-2 hover:bg-sunken hover:text-ink'
      }`}
    >
      {label}
      <span className="font-mono text-[0.65rem] opacity-70 tnum">{count}</span>
    </button>
  );
}

function LabIndexCard({ lab, onOpen }: { lab: Lab; onOpen: (lab: LabId) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(lab.id)}
      className="group grid w-full grid-cols-[minmax(0,1fr)_74px_14px] items-center gap-3 rounded-card border border-line bg-surface p-3.5 text-left transition-colors hover:border-line-strong hover:bg-raised"
    >
      <span className="min-w-0">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <span className="font-mono text-brand-text">{lab.number}</span> · {lab.eyebrow}
        </span>
        <span className="mt-0.5 block font-display text-[1.0625rem] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {lab.title}
        </span>
        <span className="mt-1 block text-[0.8rem] leading-snug text-ink-2">{lab.aim}</span>
        <span className="mt-1 block text-[0.7rem] text-ink-3">
          {lab.tool} · {lab.steps.length} steps · {lab.minutes} min read
        </span>
      </span>
      <LabThumb label={lab.thumbLabel} />
      <ChevronRight
        size={15}
        className="text-ink-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}

function LabsIndex({ onOpenLab }: { onOpenLab: (lab: LabId) => void }) {
  const [week, setWeek] = useState<LabWeek | 'all'>('all');
  const visibleWeeks = LAB_WEEKS.filter((meta) => week === 'all' || meta.week === week);

  return (
    <div>
      <PageHead
        title="Labs."
        lede="Seven experiments from weeks 5–7. Every card shows the screen you will meet — you do not need a computer at home."
      >
        <p className="text-sm text-ink-3">
          <span className="font-semibold text-ink tnum">7</span> experiments · read-only revision
        </p>
      </PageHead>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by week">
        <FilterChip active={week === 'all'} onClick={() => setWeek('all')} label="All" count={LABS.length} />
        {LAB_WEEKS.map((meta) => (
          <FilterChip
            key={meta.week}
            active={week === meta.week}
            onClick={() => setWeek(meta.week)}
            label={`Week ${meta.week}`}
            count={labsForWeek(meta.week).length}
          />
        ))}
      </div>

      {visibleWeeks.map((meta) => {
        const labs = labsForWeek(meta.week);
        return (
          <section key={meta.week} className="mt-7" aria-labelledby={`week-${meta.week}`}>
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
              <h2
                id={`week-${meta.week}`}
                className="font-sans text-xs font-bold uppercase tracking-[0.07em] text-ink"
              >
                Week {meta.week} · {meta.topic}
              </h2>
              <span className="text-xs text-ink-3">
                {labs.length} {labs.length === 1 ? 'experiment' : 'experiments'}
              </span>
            </div>
            <ul className="mt-2.5 space-y-2.5">
              {labs.map((lab) => (
                <li key={lab.id}>
                  <LabIndexCard lab={lab} onOpen={onOpenLab} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="mt-8 border-t border-line pt-4 text-sm leading-relaxed text-ink-3">
        Read-only revision: no scores and no progress to track. The screens are drawn guides to the dialogs you will
        meet — your lab machine may show a newer version.
      </p>
    </div>
  );
}

function LabCard({ lab, onBack, onOpenDay }: { lab: Lab; onBack: () => void; onOpenDay: () => void }) {
  const [active, setActive] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const answerId = useId();
  const togglePoint = (n: number) => setActive((current) => (current === n ? null : n));

  return (
    <article>
      <div className="mb-5 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={`${BTN_QUIET} -ml-2.5`}>
          <ArrowLeft size={16} aria-hidden="true" />
          All labs
        </button>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 font-mono text-[0.65rem] text-brand-text">
          Week {lab.week}
        </span>
      </div>

      <header>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <span className="font-mono text-brand-text">{lab.number}</span> · {lab.eyebrow}
        </p>
        <h1 className="mt-1.5 max-w-[20ch] font-display text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[2.35rem]">
          {lab.title}.
        </h1>
        <p className="mt-2.5 max-w-[55ch] text-[0.98rem] leading-relaxed text-ink-2">{lab.aim}</p>
        <p className="mt-2 text-xs text-ink-3">
          {lab.tool} · {lab.steps.length} steps · {lab.minutes} min read
        </p>
      </header>

      <p className="mt-4 flex gap-2.5 rounded-control bg-danger-soft px-3.5 py-3 text-sm leading-relaxed text-ink-2">
        <TriangleAlert size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
        <span>{lab.caution}</span>
      </p>

      <div className="mt-5">
        <LabStage lab={lab} active={active} onSelect={togglePoint} />
      </div>

      <section className="mt-9">
        <SectionHead id="lab-steps" title="Do it in this order" note={`${lab.steps.length} steps`} />
        <ol className="border-t border-line">
          {lab.steps.map((step, index) => (
            <li key={index} className="flex gap-3 border-b border-line py-3">
              <span className="mt-0.5 font-mono text-[0.7rem] font-semibold text-brand-text tnum">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="text-[0.9rem] leading-relaxed text-ink-2">
                  <RichText text={step.text} />
                </p>
                {step.stop ? (
                  <p className="mt-1 text-[0.7rem] font-bold uppercase leading-snug tracking-[0.05em] text-danger">
                    Stop and check — {step.stop}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-control bg-sunken px-3.5 py-3">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-2">Record</span>
          <p className="text-sm leading-snug text-ink">{lab.record.join(' · ')}</p>
        </div>

        <p className="mt-3 border-l-[3px] border-danger bg-danger-soft px-3.5 py-3 text-sm leading-relaxed text-ink-2">
          <span className="font-semibold text-ink">If it goes wrong: </span>
          {lab.wrong}
        </p>

        <div className="mt-5 rounded-card border border-line-strong bg-surface p-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-3">Check yourself</p>
          <p className="mt-1.5 text-[0.95rem] font-medium leading-snug text-ink">{lab.check.q}</p>
          <button
            type="button"
            onClick={() => setRevealed((open) => !open)}
            aria-expanded={revealed}
            aria-controls={answerId}
            className={`${BTN_SECONDARY} mt-3 min-h-9 px-3 text-xs`}
          >
            {revealed ? 'Hide answer' : 'Show answer'}
            <ChevronDown
              size={14}
              className={`transition-transform ${revealed ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          <p
            id={answerId}
            hidden={!revealed}
            className="mt-3 border-l-2 border-brand pl-3 text-sm leading-relaxed text-ink-2"
          >
            {lab.check.a}
          </p>
        </div>

        <div className="mt-6">
          <AskBlock ask={lab.ask} />
        </div>

        <div className="mt-8 border-t border-line pt-4">
          <button
            type="button"
            onClick={onOpenDay}
            className="group flex min-h-9 items-center gap-1.5 text-sm text-ink-2"
          >
            Used on exam day:
            <span className="font-medium text-brand-text group-hover:underline">{lab.examLabel}</span>
            <ArrowUpRight size={14} className="text-brand-text" aria-hidden="true" />
          </button>
        </div>
      </section>
    </article>
  );
}

export function LabsScreen({
  lab,
  onOpenLab,
  onOpenDay,
}: {
  lab: LabId | null;
  onOpenLab: (lab: LabId | null) => void;
  onOpenDay: () => void;
}) {
  const current = lab ? labBySlug(lab) : null;

  if (current) {
    return <LabCard key={current.id} lab={current} onBack={() => onOpenLab(null)} onOpenDay={onOpenDay} />;
  }

  return <LabsIndex onOpenLab={onOpenLab} />;
}
