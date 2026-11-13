import type { ReactNode } from 'react';
import type { Lab, LabPoint } from '../../labs';

export interface ScreenProps {
  lab: Lab;
  active: number | null;
  onSelect: (n: number) => void;
  points: LabPoint[];
}

export interface Example {
  title: string;
  kind?: 'terminal' | 'worksheet' | 'settings' | 'topology';
  intro?: ReactNode;
  rows: readonly ReactNode[];
  note?: string;
}

/** Each row is authored evidence, not a copy of the explanatory point list. */
export function ExampleStage({ example, ...props }: ScreenProps & { example: Example }) {
  const terminal = example.kind === 'terminal';
  return (
    <section aria-label={example.title} data-lab-example={props.lab.id}
      className={`min-w-0 overflow-hidden rounded-[10px] border border-line-strong ${terminal ? 'bg-[#171b1a] text-[#f1f0e9]' : 'bg-surface text-ink'}`}>
      <h3 className={`border-b px-3 py-2 text-sm font-semibold ${terminal ? 'border-white/20' : 'border-line bg-sunken'}`}>
        {example.title}
        <span className="mt-0.5 block text-xs font-normal">Read-only {example.kind ?? 'settings'} example</span>
      </h3>
      {example.intro ? <div className="border-b border-current/15 p-3 text-sm leading-relaxed">{example.intro}</div> : null}
      <dl className="divide-y divide-current/15">
        {props.points.map((point, index) => (
          <div key={point.n} className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)] gap-x-2 px-3 py-3">
            <dt className="contents">
              <button type="button" aria-label={`Point ${point.n}: ${point.name}`} aria-pressed={props.active === point.n}
                onClick={() => props.onSelect(point.n)}
                className={`row-span-2 grid h-11 w-11 shrink-0 place-items-center self-start rounded-full border font-mono text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${props.active === point.n ? 'border-brand bg-brand text-on-brand' : terminal ? 'border-white/40 bg-white/10 text-white hover:bg-white/20' : 'border-line-strong bg-sunken text-ink hover:border-brand'}`}>
                {point.n}
              </button>
              <span className="min-w-0 text-sm font-semibold leading-snug">{point.name}</span>
            </dt>
            <dd className="col-start-2 mt-1 min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">
              {example.rows[index]}
            </dd>
          </div>
        ))}
      </dl>
      {example.note ? <p className="border-t border-current/15 px-3 py-2 text-xs leading-relaxed">{example.note}</p> : null}
    </section>
  );
}

export function stage(example: Example) {
  return function AuthoredStage(props: ScreenProps) { return <ExampleStage {...props} example={example} />; };
}

export function Transcript({ children }: { children: ReactNode }) {
  return <code className="block whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed [overflow-wrap:anywhere]">{children}</code>;
}

export function DiskMap({ parts }: { parts: readonly string[] }) {
  return <div role="img" className="my-2 flex flex-wrap gap-1" aria-label="Disk regions, left to right">{parts.map((part) =>
    <span key={part} className="min-w-0 flex-1 basis-20 rounded border border-line-strong bg-sunken px-2 py-2 text-xs text-ink">{part}</span>)}</div>;
}

export function Flow({ nodes }: { nodes: readonly string[] }) {
  return <ol className="space-y-1">{nodes.map((node, i) => <li key={node} className="min-w-0">{i > 0 ? <span aria-hidden="true" className="block pl-3 text-brand">↓</span> : null}<span className="block rounded border border-current/20 px-2 py-1">{node}</span></li>)}</ol>;
}
