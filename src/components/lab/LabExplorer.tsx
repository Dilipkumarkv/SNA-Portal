import { useEffect, useMemo, useState } from 'react';
import { Search, FlaskConical, CheckCircle2, Circle, ListChecks } from 'lucide-react';
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
  const [selectedId, setSelectedId] = useState<number>(EXPERIMENTS[0]?.id ?? 0);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [, setProgressVersion] = useState(0);

  useEffect(() => subscribeProgress(() => setProgressVersion(version => version + 1)), []);

  const filtered = useMemo(
    () => EXPERIMENTS.filter(item => (week === 'all' || item.week === week) && matches(item, query)),
    [query, week],
  );

  const selected = filtered.find(item => item.id === selectedId) ?? filtered[0] ?? EXPERIMENTS[0];
  const courseModule = CURRICULUM.find(item => item.id === selected.week);
  const complete = isExperimentComplete(selected.id);

  useEffect(() => {
    setCheckedSteps(new Set());
  }, [selected.id]);

  const selectExperiment = (id: number) => {
    setSelectedId(id);
  };

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Course experiments</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{EXPERIMENTS.length} experiments from the laboratory manual, grouped by week</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {filtered.length} shown
        </span>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search experiments, components or steps…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label="Search experiments"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setWeek('all')}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
            week === 'all' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          All weeks
        </button>
        {WEEKS.map(item => (
          <button
            key={item.id}
            onClick={() => setWeek(item.id)}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
              week === item.id ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
            title={item.title}
          >
            Wk {item.id}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start lg:gap-4">
        <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Nothing matches that search.
            </li>
          )}
          {filtered.map(experiment => {
            const done = isExperimentComplete(experiment.id);
            const active = experiment.id === selected.id;
            return (
              <li key={experiment.id}>
                <button
                  onClick={() => selectExperiment(experiment.id)}
                  className={`flex w-full items-start gap-2 rounded-xl border p-2.5 text-left transition-colors ${
                    active
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                  }`}
                  aria-current={active ? 'true' : undefined}
                >
                  <span className={`mt-0.5 shrink-0 rounded-md p-1.5 ${done ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {done ? <CheckCircle2 size={13} /> : <FlaskConical size={13} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Experiment {experiment.manualNumber} · Week {experiment.week}
                    </span>
                    <span className="mt-0.5 block text-xs font-bold leading-snug text-slate-800 dark:text-slate-200">
                      {experiment.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {filtered.length > 0 && (
        <article className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:mt-0">
          <header className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                Experiment {selected.manualNumber}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Week {selected.week}
              </span>
            </div>
            <h4 className="mt-2 text-base font-extrabold leading-snug text-slate-900 dark:text-slate-100">{selected.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{selected.aim}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleExperiment(selected.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  complete
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                aria-pressed={complete}
              >
                {complete ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                {complete ? 'Experiment completed' : 'Mark experiment complete'}
              </button>
              {ALL_SCHEMATICS.some(item => item.week === selected.week) && (
                <SchematicIntegration week={selected.week} variant="compact" />
              )}
            </div>
          </header>

          <div className="space-y-4 p-4">
            {selected.components.length > 0 && (
              <section>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Components required</h5>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {selected.components.map(item => (
                    <li key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h5 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <ListChecks size={13} /> Procedure — tick as you go
              </h5>
              <ol className="mt-2 space-y-1.5">
                {selected.procedure.map((step, index) => {
                  const ticked = checkedSteps.has(index);
                  return (
                    <li key={index}>
                      <button
                        onClick={() => toggleStep(index)}
                        className="flex w-full items-start gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        aria-pressed={ticked}
                      >
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          ticked
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 text-transparent dark:border-slate-600'
                        }`}>
                          <CheckCircle2 size={11} />
                        </span>
                        <span className={`text-xs leading-relaxed ${ticked ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
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
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Expected result</h5>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{selected.result}</p>
              </section>
            )}

            {courseModule && courseModule.practicalTasks.length > 0 && (
              <section>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Week {courseModule.id} lab tasks — {courseModule.labTitle}
                </h5>
                <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {courseModule.practicalTasks.map((task, index) => (
                    <li key={`${task.topic}-${index}`}>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{task.topic}:</span> {task.detail}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
        )}
      </div>
    </div>
  );
}
