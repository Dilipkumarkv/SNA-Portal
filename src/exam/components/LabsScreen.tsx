import { useEffect, useId, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, TriangleAlert } from 'lucide-react';
import type { LabId, LabWeek } from '../types';
import { LABS, LAB_WEEKS, labBySlug, labsForWeek, type Lab } from '../labs';
import { examActions, useExamState } from '../store';
import { labHash } from '../routing';
import { PageHead, SectionHead } from './PageHead';
import { RichText } from './RichText';
import { AskBlock } from './AskBlock';
import { LabStage, LabThumb } from './LabStage';
import { BTN_QUIET, BTN_PRIMARY, BTN_SECONDARY } from './ui';

function FilterChip({
  active,
  week,
  label,
  count,
}: {
  active: boolean;
  week: LabWeek | null;
  label: string;
  count: number;
}) {
  return (
    <a
      href={labHash(null, week)}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-brand-ring bg-brand-soft text-brand-text'
          : 'border-line text-ink-2 hover:bg-sunken hover:text-ink'
      }`}
    >
      {label}
      <span className="font-mono text-[0.65rem] opacity-70 tnum">{count}</span>
    </a>
  );
}

function labNumber(lab: Lab, week: LabWeek | null) {
  if (week === null) return lab.number;
  return `${String(week).padStart(2, '0')}.${labsForWeek(week).findIndex((item) => item.id === lab.id) + 1}`;
}

function MembershipNote({ lab, week }: { lab: Lab; week: LabWeek }) {
  const otherWeeks = [lab.week, ...(lab.alsoInWeeks ?? [])].filter((item) => item !== week);
  if (!otherWeeks.length) return null;
  return (
    <span className="mt-1 block text-xs leading-relaxed text-ink-2">
      Also covered in {otherWeeks.map((item) => `Week ${item}`).join(', ')} · same reviewed mark
    </span>
  );
}

function LabIndexCard({
  lab,
  week,
  groupWeek,
  reviewed,
}: {
  lab: Lab;
  week: LabWeek | null;
  groupWeek: LabWeek;
  reviewed: boolean;
}) {
  return (
    <a
      href={labHash(lab.id, week)}
      className="group grid w-full grid-cols-[minmax(0,1fr)_74px_14px] items-center gap-3 rounded-card border border-line bg-surface p-3.5 text-left transition-colors hover:border-line-strong hover:bg-raised"
    >
      <span className="min-w-0">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <span className="font-mono text-brand-text">{labNumber(lab, week)}</span> · {lab.eyebrow}
        </span>
        <span className="mt-0.5 block font-display text-[1.0625rem] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {lab.title}
        </span>
        <span className="mt-1 block text-[0.8rem] leading-snug text-ink-2">{lab.aim}</span>
        <span className="mt-1 block text-[0.7rem] text-ink-3">
          {lab.tool} · {lab.steps.length} steps · {lab.minutes} min read
        </span>
        <MembershipNote lab={lab} week={groupWeek} />
        {reviewed ? (
          <span className="mt-1 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-success">
            <Check size={12} aria-hidden="true" /> Reviewed
          </span>
        ) : null}
      </span>
      <LabThumb label={lab.thumbLabel} />
      <ChevronRight
        size={15}
        className="text-ink-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

function LabsIndex({ week }: { week: LabWeek | null }) {
  const state = useExamState();
  const visibleWeeks = LAB_WEEKS.filter((meta) => week === null || meta.week === week);
  const selectedWeek = LAB_WEEKS.find((meta) => meta.week === week);
  const weekLabs = week === null ? null : labsForWeek(week);
  const resume = state.lastLab ? labBySlug(state.lastLab) : null;
  const reviewed = new Set<LabId>(state.labsReviewed);
  const reviewedHere = weekLabs ? weekLabs.filter((lab) => reviewed.has(lab.id)).length : reviewed.size;

  return (
    <div>
      <PageHead
        title={selectedWeek ? `Week ${selectedWeek.week}.` : 'Labs.'}
        lede={selectedWeek
          ? `Guides for ${selectedWeek.topic}. Read the example, follow the procedure, then check the evidence.`
          : 'Revision guides across weeks 5–12. Study the examples and procedures on your phone — no computer needed at home.'}
      >
        <p className="text-sm text-ink-3">
          <span className="font-semibold text-ink tnum">{weekLabs ? weekLabs.length : LABS.length}</span>{' '}
          {weekLabs ? 'guides' : 'unique guides'} ·{' '}
          <span className="font-semibold text-ink tnum">{reviewedHere}</span> reviewed
        </p>
        {week === null ? (
          <p className="basis-full text-sm leading-relaxed text-ink-2">
            Shared guides appear in more than one week but count once. Reviewed means revised, not successfully performed.
          </p>
        ) : null}
      </PageHead>

      {resume ? (
        <section
          aria-labelledby="resume-heading"
          className="mb-6 rounded-card border border-brand-ring bg-brand-soft p-4"
        >
          <p
            id="resume-heading"
            className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-brand-text"
          >
            {reviewed.has(resume.id) ? 'Reviewed · revisit' : 'Pick up where you left off'}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-[1.05rem] font-semibold text-ink">
                {resume.number} · {resume.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-2">
                {reviewed.size} of {LABS.length} labs reviewed overall
              </p>
            </div>
            <a
              href={labHash(resume.id)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-control bg-brand px-3.5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover"
            >
              {reviewed.has(resume.id) ? 'Revisit' : 'Resume'}
              <ChevronRight size={15} aria-hidden="true" />
            </a>
          </div>
        </section>
      ) : null}

      <nav className="flex flex-wrap gap-2" aria-label="Filter by week">
        <FilterChip active={week === null} week={null} label="All" count={LABS.length} />
        {LAB_WEEKS.map((meta) => (
          <FilterChip
            key={meta.week}
            active={week === meta.week}
            week={meta.week}
            label={`Week ${meta.week}`}
            count={labsForWeek(meta.week).length}
          />
        ))}
      </nav>

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
                  <LabIndexCard
                    lab={lab}
                    week={week}
                    groupWeek={meta.week}
                    reviewed={reviewed.has(lab.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="mt-8 border-t border-line pt-4 text-sm leading-relaxed text-ink-3">
        Your place and reviewed marks stay on this device. No account, no scores. The screens are drawn guides to the
        dialogs you will meet — your lab machine may show a newer version.
      </p>
    </div>
  );
}

function LabCard({
  lab,
  week,
  onOpenDay,
}: {
  lab: Lab;
  week: LabWeek | null;
  onOpenDay: () => void;
}) {
  const state = useExamState();
  const reviewed = state.labsReviewed.includes(lab.id);
  const group = week === null ? LABS : labsForWeek(week);
  const next = group[group.findIndex((item) => item.id === lab.id) + 1] ?? null;
  const backHref = labHash(null, week);
  const [active, setActive] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const answerId = useId();
  const togglePoint = (n: number) => setActive((current) => (current === n ? null : n));

  useEffect(() => {
    examActions.markLabOpened(lab.id);
  }, [lab.id]);

  return (
    <article>
      <div className="mb-5 flex items-center justify-between gap-3">
        <a href={backHref} className={`${BTN_QUIET} -ml-2.5`}>
          <ArrowLeft size={16} aria-hidden="true" />
          {week === null ? 'All labs' : `Week ${week} labs`}
        </a>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 font-mono text-[0.65rem] text-brand-text">
          Week {week ?? lab.week}
        </span>
      </div>

      <header>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <span className="font-mono text-brand-text">{labNumber(lab, week)}</span> · {lab.eyebrow}
        </p>
        <h1
          tabIndex={-1}
          className="mt-1.5 max-w-[20ch] font-display text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink outline-none sm:text-[2.35rem]"
        >
          {lab.title}.
        </h1>
        <p className="mt-2.5 max-w-[55ch] text-[0.98rem] leading-relaxed text-ink-2">{lab.aim}</p>
        <p className="mt-2 text-xs text-ink-3">
          {lab.tool} · {lab.steps.length} steps · {lab.minutes} min read
        </p>
        <MembershipNote lab={lab} week={week ?? lab.week} />
      </header>

      <section className="mt-6" aria-labelledby="lab-before">
        <SectionHead id="lab-before" title="Before you begin" />
        <ul className="space-y-2 border-t border-line pt-3">
          {lab.prerequisites.map((item, index) => (
            <li key={index} className="flex gap-2.5 text-[0.9rem] leading-relaxed text-ink-2">
              <Check size={15} className="mt-1 shrink-0 text-ink-3" aria-hidden="true" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-5 flex gap-2.5 rounded-control bg-danger-soft px-3.5 py-3 text-sm leading-relaxed text-ink-2">
        <TriangleAlert size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
        <span className="min-w-0 [overflow-wrap:anywhere]">{lab.caution}</span>
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
      </section>

      <section className="mt-9" aria-labelledby="lab-evidence">
        <SectionHead
          id="lab-evidence"
          title="Expected verification"
          note="What to check, not a promise of success"
        />
        <ul className="space-y-2 border-t border-line pt-3">
          {lab.expected.map((item, index) => (
            <li key={index} className="flex gap-2.5 text-[0.9rem] leading-relaxed text-ink-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-9">
        <div className="rounded-card border border-line-strong bg-surface p-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-3">Check yourself</p>
          <p className="mt-1.5 text-[0.95rem] font-medium leading-snug text-ink">{lab.check.q}</p>
          <button
            type="button"
            onClick={() => setRevealed((open) => !open)}
            aria-expanded={revealed}
            aria-controls={answerId}
            className={`${BTN_SECONDARY} mt-3 px-3.5 text-xs`}
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
      </section>

      <section className="mt-9" aria-labelledby="lab-sources">
        <SectionHead id="lab-sources" title="Sources" note="Laboratory manual" />
        <ul className="space-y-2 border-t border-line pt-3">
          {lab.sources.map((source) => (
            <li key={`${source.experiment}-${source.page}`} className="text-[0.9rem] leading-relaxed text-ink-2">
              <span className="font-mono text-xs text-brand-text">
                Ex. {source.experiment} · p. {source.page}
              </span>
              <span className="mt-0.5 block text-ink">{source.title}</span>
            </li>
          ))}
        </ul>

        {lab.concepts.length ? (
          <div className="mt-5 rounded-card border border-line bg-sunken p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-2">Study notes</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-3">
              Supplements and corrections for understanding — not extra manual procedures.
            </p>
            <ul className="mt-3 space-y-2.5">
              {lab.concepts.map((item, index) => (
                <li key={index} className="text-sm leading-relaxed text-ink-2">{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {lab.related.length ? (
          <div className="mt-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-3">Related guides</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {lab.related.map((id) => {
                const related = labBySlug(id);
                if (!related) return null;
                const inWeek = week !== null && labsForWeek(week).some((item) => item.id === id);
                return (
                  <li key={id}>
                    <a
                      href={labHash(id, inWeek ? week : null)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-3.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
                    >
                      <span className="font-mono text-[0.65rem] text-brand-text">{related.number}</span>
                      {related.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-9">
        <div className="rounded-card border border-line bg-surface p-4">
          <button
            type="button"
            onClick={() => examActions.toggleLabReviewed(lab.id)}
            aria-pressed={reviewed}
            className={`w-full ${reviewed ? BTN_SECONDARY : BTN_PRIMARY}`}
          >
            {reviewed ? (
              <>
                <Check size={16} aria-hidden="true" /> Reviewed — tap to undo
              </>
            ) : (
              'Mark as reviewed'
            )}
          </button>
          <p className="mt-2 text-center text-xs text-ink-3">Saved on this device. No account needed.</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          {lab.week <= 7 ? (
            <button
              type="button"
              onClick={onOpenDay}
              className="group flex min-h-11 items-center gap-1.5 text-sm text-ink-2"
            >
              Used on exam day:
              <span className="font-medium text-brand-text group-hover:underline">{lab.examLabel}</span>
              <ArrowUpRight size={14} className="text-brand-text" aria-hidden="true" />
            </button>
          ) : (
            <p className="max-w-[26ch] text-xs leading-relaxed text-ink-3">Revision topic: {lab.examLabel}</p>
          )}
          {next ? (
            <a href={labHash(next.id, week)} className={`${BTN_SECONDARY} max-w-full`}>
              <span className="truncate">Next: {next.title}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          ) : (
            <a href={backHref} className={BTN_SECONDARY}>
              {week === null ? 'Back to the lab index' : `Back to Week ${week}`}
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </section>
    </article>
  );
}

export function LabsScreen({
  lab,
  week,
  onOpenDay,
}: {
  lab: LabId | null;
  week: LabWeek | null;
  onOpenDay: () => void;
}) {
  const current = lab ? labBySlug(lab) : null;

  if (current) {
    return <LabCard key={`${current.id}-${week ?? 'all'}`} lab={current} week={week} onOpenDay={onOpenDay} />;
  }

  return <LabsIndex week={week} />;
}
