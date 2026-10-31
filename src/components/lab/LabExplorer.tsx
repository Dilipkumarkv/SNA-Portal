import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Circle, ListChecks, Search } from 'lucide-react';
import { CURRICULUM, EXPERIMENTS, type Experiment } from '../../data/curriculum';
import { isExperimentComplete, subscribeProgress, toggleExperiment } from '../../lib/progress';
import { ALL_SCHEMATICS } from '../../data/schematics';
import { SchematicIntegration } from '../schematic/SchematicIntegration';

const WEEKS = CURRICULUM.map(module => ({ id: module.id, title: module.title }));

function matches(experiment: Experiment, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return (
    experiment.title.toLowerCase().includes(needle) ||
    experiment.aim.toLowerCase().includes(needle) ||
    experiment.components.some(item => item.toLowerCase().includes(needle)) ||
    experiment.procedure.some(item => item.toLowerCase().includes(needle))
  );
}

export function LabExplorer() {
  const [query, setQuery] = useState('');
  const [week, setWeek] = useState<number | 'all'>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [, setProgressVersion] = useState(0);

  useEffect(() => subscribeProgress(() => setProgressVersion(version => version + 1)), []);

  const filtered = useMemo(
    () => EXPERIMENTS.filter(item => (week === 'all' || item.week === week) && matches(item, query)),
    [query, week],
  );

  const selected = filtered.find(item => item.id === selectedId) ?? filtered[0] ?? EXPERIMENTS[0];
  const hasSelection = selectedId !== null && filtered.some(item => item.id === selectedId);
  const complete = isExperimentComplete(selected.id);

  useEffect(() => {
    setCheckedSteps(new Set());
  }, [selected.id]);

  const toggleStep = (index: number) => {
    setCheckedSteps(current => {
      const updated = new Set(current);
      if (updated.has(index)) updated.delete(index);
      else updated.add(index);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div className={`space-y-4 ${hasSelection ? 'hidden lg:block' : ''}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h4 className="font-display text-[0.9375rem] font-semibold text-ink">
            {EXPERIMENTS.length} experiments, straight from the lab manual
          </h4>
          <p className="text-xs text-ink-3">{filtered.length} shown</p>
        </div>

        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search experiments, components or steps…"
            className="w-full rounded-control border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-brand"
            aria-label="Search experiments"
          />
        </div>

        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-control bg-sunken p-1">
          <button
            onClick={() => setWeek('all')}
            className={`shrink-0 rounded-[0.5rem] px-3 py-1.5 text-xs font-semibold transition-colors ${
              week === 'all' ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'
            }`}
            aria-pressed={week === 'all'}
          >
            All weeks
          </button>
          {WEEKS.map(item => (
            <button
              key={item.id}
              onClick={() => setWeek(item.id)}
              className={`shrink-0 rounded-[0.5rem] px-3 py-1.5 text-xs font-semibold transition-colors ${
                week === item.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'
              }`}
              title={item.title}
              aria-pressed={week === item.id}
            >
              Week {item.id}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start lg:gap-5">
        <ul className={`space-y-1.5 pr-1 lg:max-h-[40rem] lg:overflow-y-auto ${hasSelection ? 'hidden lg:block' : ''}`}>
          {filtered.length === 0 && (
            <li className="rounded-control border border-dashed border-line-strong p-4 text-sm text-ink-2">
              Nothing matches that search. Try a component name, or clear the week filter.
            </li>
          )}
          {filtered.map(experiment => {
            const done = isExperimentComplete(experiment.id);
            const active = experiment.id === selected.id && hasSelection;
            return (
              <li key={experiment.id}>
                <button
                  onClick={() => setSelectedId(experiment.id)}
                  className={`flex w-full items-start gap-3 rounded-control border p-3 text-left transition-colors ${
                    active
                      ? 'border-brand/40 bg-brand-soft'
                      : 'border-line bg-surface hover:border-line-strong hover:bg-sunken'
                  }`}
                  aria-current={active ? 'true' : undefined}
                >
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold ${
                      done ? 'bg-success-soft text-success' : 'bg-sunken text-ink-3'
                    }`}
                  >
                    {done ? <Check size={12} strokeWidth={3} /> : experiment.manualNumber}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.6875rem] font-medium text-ink-3">Week {experiment.week}</span>
                    <span className="mt-0.5 block text-[0.8125rem] font-semibold leading-snug text-ink">
                      {experiment.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {filtered.length > 0 && (
          <article className={`${hasSelection ? '' : 'hidden lg:block'} lg:border-l lg:border-line lg:pl-5`}>
            <header className="border-b border-line pb-4 sm:pb-5">
              <button
                onClick={() => setSelectedId(null)}
                className="-ml-1 mb-3 inline-flex items-center gap-1.5 rounded-control py-1 pr-2 text-xs font-semibold text-ink-3 transition-colors hover:text-ink lg:hidden"
              >
                <ArrowLeft size={14} /> All experiments
              </button>

              <p className="text-xs font-medium text-ink-3">
                Experiment {selected.manualNumber} · Week {selected.week}
              </p>
              <h4 className="mt-1 font-display text-[1.0625rem] font-semibold leading-snug text-ink sm:text-lg">
                {selected.title}
              </h4>
              <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-ink-2">{selected.aim}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleExperiment(selected.id)}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-control px-3 text-xs font-semibold transition-colors ${
                    complete
                      ? 'bg-success-soft text-success hover:bg-success-soft/70'
                      : 'border border-line text-ink-2 hover:border-line-strong hover:text-ink'
                  }`}
                  aria-pressed={complete}
                >
                  {complete ? <Check size={14} strokeWidth={3} /> : <Circle size={14} />}
                  {complete ? 'Marked complete' : 'Mark complete'}
                </button>
                {ALL_SCHEMATICS.some(item => item.week === selected.week) && (
                  <SchematicIntegration week={selected.week} variant="compact" />
                )}
              </div>
            </header>

            <div className="space-y-5 pt-4 sm:pt-5">
              {selected.components.length > 0 && (
                <section>
                  <h5 className="text-xs font-semibold text-ink">Components required</h5>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {selected.components.map(item => (
                      <li
                        key={item}
                        className="rounded-full bg-sunken px-2.5 py-1 text-xs text-ink-2"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h5 className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <ListChecks size={14} className="text-ink-3" /> Procedure
                </h5>
                <ol className="mt-2 space-y-0.5">
                  {selected.procedure.map((step, index) => {
                    const ticked = checkedSteps.has(index);
                    return (
                      <li key={index}>
                        <button
                          onClick={() => toggleStep(index)}
                          className="flex w-full items-start gap-2.5 rounded-control px-1.5 py-2 text-left transition-colors hover:bg-sunken"
                          aria-pressed={ticked}
                        >
                          <span
                            className={`mt-0.5 grid h-[1.125rem] w-[1.125rem] shrink-0 place-items-center rounded-[0.3125rem] border transition-colors ${
                              ticked ? 'border-success bg-success text-white' : 'border-line-strong'
                            }`}
                          >
                            {ticked && <Check size={11} strokeWidth={3} />}
                          </span>
                          <span
                            className={`text-sm leading-relaxed ${
                              ticked ? 'text-ink-3 line-through' : 'text-ink-2'
                            }`}
                          >
                            {step}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {selected.result && (
                <section>
                  <h5 className="text-xs font-semibold text-ink">What you should observe</h5>
                  <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-ink-2">{selected.result}</p>
                </section>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
