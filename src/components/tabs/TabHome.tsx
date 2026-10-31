import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BookOpen, FlaskConical, LayoutTemplate, Bell, ExternalLink,
  CheckCircle2, ChevronDown, Play,
} from 'lucide-react';
import { CURRICULUM, EXPERIMENTS } from '../../data/curriculum';
import { ALL_SCHEMATICS } from '../../data/schematics';
import {
  getLastLesson, getSummary, subscribeProgress, TOTAL_EXPERIMENTS,
} from '../../lib/progress';
import { subscribeAnnouncements, subscribeCieSchedule } from '../../lib/storageService';
import type { TabId } from '../../types';

type PhaseProgress = Record<number, number>;
const PHASE_KEY = 'sna_progress';

const PHASES = [
  { phase: 1, title: 'Hardware & layout' },
  { phase: 2, title: 'Installation & safety' },
  { phase: 3, title: 'Security & documentation' },
];

function readPhases(): PhaseProgress {
  try {
    const raw = localStorage.getItem(PHASE_KEY);
    return raw ? (JSON.parse(raw) as PhaseProgress) : {};
  } catch {
    return {};
  }
}

export function TabHome({ onNavigate }: { onNavigate: (tab: TabId | 'admin') => void }) {
  const [summary, setSummary] = useState(getSummary);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [cieSchedule, setCieSchedule] = useState<any[]>([]);
  const [phases, setPhases] = useState<PhaseProgress>(readPhases);

  useEffect(() => subscribeProgress(() => setSummary(getSummary())), []);
  useEffect(() => {
    const offAnnouncements = subscribeAnnouncements((items) => setAnnouncements(items.slice(0, 3)));
    const offSchedule = subscribeCieSchedule(setCieSchedule);
    return () => {
      offAnnouncements();
      offSchedule();
    };
  }, []);

  const last = getLastLesson();
  const target = last ?? { week: CURRICULUM[0].id, day: CURRICULUM[0].lessons[0].number };
  const currentModule = CURRICULUM.find((module) => module.id === target.week) ?? CURRICULUM[0];
  const currentLesson = currentModule.lessons.find((lesson) => lesson.number === target.day) ?? currentModule.lessons[0];
  const coursePercent = summary.total === 0 ? 0 : Math.round((summary.completed / summary.total) * 100);
  const hasSchematic = useMemo(
    () => ALL_SCHEMATICS.some((item) => item.week === currentModule.id),
    [currentModule.id],
  );
  const weekExperiments = EXPERIMENTS.filter((experiment) => experiment.week === currentModule.id).length;

  const phaseOverall = Math.round(
    PHASES.reduce((sum, item) => sum + (phases[item.phase] ?? 0), 0) / (PHASES.length * 100) * 100,
  );

  const openLesson = (week: number, day: number) => {
    window.location.hash = `learn/${week}/${day}`;
  };

  const setPhase = (phase: number, value: number) => {
    const next = { ...phases, [phase]: value };
    setPhases(next);
    try {
      localStorage.setItem(PHASE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable in private mode; the UI still reflects the choice.
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-9 pb-2">
      <section aria-labelledby="continue-heading">
        <div className="relative overflow-hidden rounded-card bg-brand p-5 text-white sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span id="continue-heading" className="text-sm font-medium text-white/75">
              {last ? 'Continue learning' : 'Start the course'}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold tabular-nums">
              Week {currentModule.id} · Day {currentLesson.number}
            </span>
          </div>
          <h2 className="mt-2.5 font-display text-[1.55rem] font-semibold leading-tight tracking-[-0.02em]">
            {currentLesson.title}
          </h2>
          <p className="mt-1 text-sm text-white/75">{currentModule.title}</p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-500"
                style={{ width: `${coursePercent}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums text-white/80">
              {summary.completed}/{summary.total}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openLesson(currentModule.id, currentLesson.number)}
              className="inline-flex items-center gap-2 rounded-control bg-white px-4 py-2.5 text-sm font-semibold text-brand transition-transform active:scale-[0.98]"
            >
              <Play size={15} fill="currentColor" aria-hidden="true" />
              {last ? 'Resume lesson' : 'Begin lesson'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('labs')}
              className="inline-flex items-center gap-2 rounded-control border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.98]"
            >
              Open labs
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <WeekAction
            icon={<BookOpen size={16} />}
            label="Notes"
            meta={`Week ${currentModule.id}`}
            onClick={() => openLesson(currentModule.id, currentLesson.number)}
          />
          <WeekAction
            icon={<FlaskConical size={16} />}
            label="Experiments"
            meta={`${weekExperiments} this week`}
            onClick={() => onNavigate('labs')}
          />
          <WeekAction
            icon={<LayoutTemplate size={16} />}
            label="Schematic"
            meta={hasSchematic ? 'Available' : 'Not drawn'}
            onClick={() => openLesson(currentModule.id, currentLesson.number)}
          />
          <WeekAction
            icon={<ArrowRight size={16} />}
            label="Resources"
            meta="Reading"
            onClick={() => onNavigate('links')}
          />
        </div>
      </section>

      {announcements.length > 0 && (
        <section aria-labelledby="announcements-heading">
          <div className="mb-3 flex items-center gap-2">
            <Bell size={16} className="text-ink-3" aria-hidden="true" />
            <h3 id="announcements-heading" className="text-base font-semibold">Announcements</h3>
          </div>
          <div className="space-y-2">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-card border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-semibold ${announcement.isUrgent ? 'text-danger' : 'text-ink'}`}>
                    {announcement.isUrgent && (
                      <span className="mr-2 rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">Urgent</span>
                    )}
                    {announcement.title}
                  </p>
                  {announcement.createdAt && (
                    <span className="shrink-0 text-xs text-ink-3">
                      {new Date(typeof announcement.createdAt === 'string' ? announcement.createdAt : announcement.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{announcement.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="progress-heading">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h3 id="progress-heading" className="text-base font-semibold">Course progress</h3>
          <button
            type="button"
            onClick={() => onNavigate('learn')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-text"
          >
            Open Learn <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-ink-2">
          {summary.completed} of {summary.total} lessons · {summary.experimentsCompleted} of {TOTAL_EXPERIMENTS} experiments
        </p>

        <div className="mt-4 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1">
          {CURRICULUM.map((module) => {
            const week = summary.byWeek[module.id] ?? { completed: 0, total: module.lessons.length };
            const pct = week.total === 0 ? 0 : week.completed / week.total;
            const state = pct === 1 ? 'done' : pct > 0 ? 'partial' : 'empty';
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => openLesson(module.id, 1)}
                title={`Week ${module.id}: ${module.title} (${week.completed}/${week.total})`}
                aria-label={`Week ${module.id}, ${week.completed} of ${week.total} lessons complete`}
                className={`h-9 rounded-md transition-transform active:scale-95 ${
                  state === 'done'
                    ? 'bg-brand'
                    : state === 'partial'
                      ? 'bg-brand/40'
                      : 'border border-line bg-sunken'
                }`}
              >
                <span className={`text-[0.6875rem] font-semibold tabular-nums ${state === 'done' ? 'text-white' : 'text-ink-2'}`}>
                  {module.id}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-3">
          <span>Week 1</span>
          <span>Week 13</span>
        </div>
      </section>

      <section aria-labelledby="cie-heading">
        <h3 id="cie-heading" className="text-base font-semibold">Continuous assessment</h3>
        <p className="text-sm text-ink-2">CIE 50 marks · SEE 50 marks. Dates are set by the department.</p>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {(cieSchedule.length > 0
            ? cieSchedule.map((item) => ({ label: item.label, badge: item.badge }))
            : [
                { label: 'CIE-1 · Theory', badge: 'Week 4 · 50 marks' },
                { label: 'CIE-2 · Practice', badge: 'Week 7 · 50 marks' },
                { label: 'CIE-3 · Theory', badge: 'Week 10 · 50 marks' },
                { label: 'CIE-4 · Practice', badge: 'Week 13 · 50 marks' },
                { label: 'CIE-5 · Portfolio and project', badge: 'Weeks 1–13 · 50 marks' },
              ]
          ).map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm font-medium text-ink">{item.label}</span>
              <span className="shrink-0 text-xs tabular-nums text-ink-3">{item.badge}</span>
            </li>
          ))}
        </ul>
      </section>

      <details className="group overflow-hidden rounded-card border border-line bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
          <span>
            <span className="block text-sm font-semibold text-ink">Mini project</span>
            <span className="block text-xs text-ink-3">Week 13 · hardware procurement to documentation</span>
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold tabular-nums text-ink-2">
            {phaseOverall}%
            <ChevronDown size={16} className="text-ink-3 transition-transform group-open:rotate-180" aria-hidden="true" />
          </span>
        </summary>
        <div className="space-y-4 border-t border-line px-4 py-4">
          {PHASES.map((item) => {
            const value = phases[item.phase] ?? 0;
            return (
              <div key={item.phase}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs tabular-nums text-ink-3">{value}%</p>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {[25, 50, 75, 100].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setPhase(item.phase, step)}
                      aria-pressed={value === step}
                      className={`flex-1 rounded-lg py-2 text-xs font-semibold tabular-nums transition-colors ${
                        value >= step
                          ? 'bg-brand text-white'
                          : 'border border-line bg-sunken text-ink-2'
                      }`}
                    >
                      {step}%
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </details>

      <details className="group overflow-hidden rounded-card border border-line bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
          <span>
            <span className="block text-sm font-semibold text-ink">What this course covers</span>
            <span className="block text-xs text-ink-3">5 outcomes · 5 credits · 91 contact hours</span>
          </span>
          <ChevronDown size={16} className="text-ink-3 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-line px-4 py-4">
          <p className="text-sm leading-relaxed text-ink-2">
            System and Network Administration equips you to manage, maintain and troubleshoot computer
            systems and networks — combining theory with hands-on lab practice on the lab workstations.
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              'Analyse hardware specifications and assemble a computer',
              'Install an operating system, configure it and troubleshoot faults',
              'Manage file systems, partitioning, backup and recovery',
              'Configure network, security and sharing',
              'Design a lab layout and implement e-waste disposal',
            ].map((outcome) => (
              <li key={outcome} className="flex gap-2.5 text-sm text-ink-2">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                {outcome}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <a
              href="https://infyspringboard.onwingspan.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text"
            >
              Infosys Springboard <ExternalLink size={13} aria-hidden="true" />
            </a>
            <span className="text-sm text-ink-3">·</span>
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="text-sm font-medium text-ink-3 hover:text-ink-2"
            >
              Admin portal
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}

function WeekAction({
  icon,
  label,
  meta,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-control border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:bg-sunken active:scale-[0.99]"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-text" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{label}</span>
        <span className="block truncate text-xs text-ink-3">{meta}</span>
      </span>
    </button>
  );
}
