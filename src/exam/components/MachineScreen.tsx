import { useEffect, useState } from 'react';
import { ChevronRight, Lightbulb, TriangleAlert } from 'lucide-react';
import type { MachineViewId } from '../types';
import { GUIDE_VIEWS, MACHINE_FACTS, PARTS, SAFETY, type GuidePoint, type Part } from '../guide';
import { PageHead, SectionHead } from './PageHead';
import { Sheet } from './Sheet';
import { HotspotImage } from './HotspotImage';
import { AskBlock } from './AskBlock';
import { RichText } from './RichText';

function cropStyle(point: GuidePoint, src: string, portrait: boolean) {
  const zoom = portrait ? 1.7 : 3;
  const boxAspect = 16 / 10;
  const imageAspect = portrait ? 1024 / 1536 : 1400 / 934;
  const vertical = (zoom * boxAspect) / imageAspect;
  const clamp = (value: number) => Math.min(100, Math.max(0, value));
  const x = clamp((zoom * point.x - 50) / (zoom - 1));
  const y = clamp((vertical * point.y - 50) / (vertical - 1));
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: `${zoom * 100}% auto`,
    backgroundPosition: `${x}% ${y}%`,
  };
}

function PointSheet({
  point,
  view,
  src,
  portrait,
  onClose,
}: {
  point: GuidePoint | null;
  view: string;
  src: string;
  portrait: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet
      open={point !== null}
      onClose={onClose}
      title={point?.name ?? ''}
      meta={point ? `${view} · point ${point.n}` : undefined}
    >
      {point ? (
        <>
          <div
            role="img"
            aria-label={`Close-up of ${point.name}`}
            className="aspect-[16/10] w-full rounded-control border border-line bg-sunken bg-no-repeat"
            style={cropStyle(point, src, portrait)}
          />
          <div className="mt-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-ink">What it is</h3>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
                <RichText text={point.what} />
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">What you do with it</h3>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
                <RichText text={point.use} />
              </p>
            </div>
            {point.ask ? <AskBlock ask={point.ask} /> : null}
            {point.tip ? (
              <p className="flex gap-2.5 rounded-control bg-sunken px-3.5 py-3 text-sm leading-relaxed text-ink-2">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                <span>{point.tip}</span>
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </Sheet>
  );
}

function PartSheet({ part, onClose }: { part: Part | null; onClose: () => void }) {
  return (
    <Sheet open={part !== null} onClose={onClose} title={part?.name ?? ''} meta={part?.tag}>
      {part ? (
        <>
          <img
            src={part.image}
            alt={part.name}
            width={1400}
            height={934}
            decoding="async"
            className="aspect-[3/2] w-full rounded-control border border-line bg-sunken object-cover"
          />
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">{part.short}</p>
          <dl className="mt-5 border-t border-line">
            {part.specs.map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                <dt className="text-sm text-ink-3">{spec.label}</dt>
                <dd className="text-right text-sm font-medium text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink">How it fits</h3>
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">{part.fit}</p>
          </div>
          <div className="mt-5">
            <AskBlock ask={part.ask} />
          </div>
          {part.warning ? (
            <p className="mt-5 flex gap-2.5 rounded-control bg-danger-soft px-3.5 py-3 text-sm leading-relaxed text-ink-2">
              <TriangleAlert size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
              <span>{part.warning}</span>
            </p>
          ) : null}
        </>
      ) : null}
    </Sheet>
  );
}

function Legend({
  points,
  onSelect,
}: {
  points: GuidePoint[];
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="mt-6 grid gap-x-8 sm:grid-cols-2">
      {points.map((point) => (
        <li key={point.id} className="border-b border-line">
          <button
            type="button"
            onClick={() => onSelect(point.id)}
            aria-haspopup="dialog"
            className="group flex min-h-14 w-full items-start gap-3 py-3 text-left"
          >
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sunken font-mono text-[0.6875rem] font-semibold text-ink-2 tnum">
              {point.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink group-hover:text-brand-text">{point.name}</span>
              <span className="mt-0.5 block text-sm leading-snug text-ink-3">{point.short}</span>
            </span>
            <ChevronRight
              size={16}
              className="mt-1 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </li>
      ))}
    </ol>
  );
}

export function MachineScreen({
  view,
  onViewChange,
}: {
  view: MachineViewId;
  onViewChange: (view: MachineViewId) => void;
}) {
  const active = GUIDE_VIEWS.find((item) => item.id === view) ?? GUIDE_VIEWS[0];
  const [pointId, setPointId] = useState<string | null>(null);
  const [partId, setPartId] = useState<string | null>(null);
  const point = active.points.find((item) => item.id === pointId) ?? null;
  const part = PARTS.find((item) => item.id === partId) ?? null;

  useEffect(() => {
    setPointId(null);
    setPartId(null);
  }, [view]);

  return (
    <div>
      <PageHead
        title="The machine."
        lede="The lab PC is a ThinkCentre M73 tower with a 4th-generation i5, 8 GB DDR3, a 240 GB SSD, a 500 GB HDD, a generic H81 board and a 450 W ATX supply. Tap a numbered point, or open a part, to see what it is and what you do with it."
      />

      <nav aria-label="Machine views" className="border-b border-line">
        <div className="grid grid-cols-5">
          {GUIDE_VIEWS.map((item) => {
            const selected = item.id === active.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                aria-current={selected ? 'page' : undefined}
                className={`-mb-px min-h-11 border-b-2 px-1 text-[0.8125rem] font-medium transition-colors ${
                  selected
                    ? 'border-brand text-ink'
                    : 'border-transparent text-ink-3 hover:text-ink-2'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <section aria-labelledby="view-heading" className="mt-7">
        <SectionHead
          id="view-heading"
          title={active.title}
          note={
            active.id === 'parts'
              ? `${PARTS.length} parts · tap one`
              : `${active.points.length} points · tap a number`
          }
        />

        {active.id === 'parts' ? (
          <ul className="border-t border-line">
            {PARTS.map((item) => (
              <li key={item.id} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setPartId(item.id)}
                  aria-haspopup="dialog"
                  className="group flex w-full items-center gap-4 py-3.5 text-left"
                >
                  <img
                    src={item.image}
                    alt=""
                    width={1400}
                    height={934}
                    loading="lazy"
                    decoding="async"
                    className="h-[4.25rem] w-[5.5rem] shrink-0 rounded-[7px] border border-line bg-sunken object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.6875rem] font-medium text-ink-3">{item.tag}</span>
                    <span className="mt-0.5 block text-[0.9375rem] font-medium text-ink group-hover:text-brand-text">
                      {item.name}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-ink-3">{item.short}</span>
                  </span>
                  <ChevronRight
                    size={17}
                    className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <figure className="mx-auto max-w-full">
              <div className={`rounded-card bg-sunken p-2 sm:p-3 ${active.portrait ? 'mx-auto max-w-[340px]' : ''}`}>
                <HotspotImage
                  src={active.image}
                  alt={active.imageAlt}
                  points={active.points}
                  portrait={active.portrait}
                  onSelect={setPointId}
                />
              </div>
              <figcaption className="mt-2 px-1 text-xs leading-snug text-ink-3">
                Reference photo. Small differences in colour or port order do not change the job.
              </figcaption>
            </figure>
            <Legend points={active.points} onSelect={setPointId} />
          </>
        )}
      </section>

      {active.id === 'parts' ? (
        <section aria-labelledby="facts-heading" className="mt-12">
          <SectionHead id="facts-heading" title="At a glance" note="The lab configuration" />
          <dl className="grid gap-x-10 border-t border-line sm:grid-cols-2">
            {MACHINE_FACTS.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                <dt className="text-sm text-ink-3">{fact.label}</dt>
                <dd className="text-right text-sm font-medium text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section aria-labelledby="safety-heading" className="mt-12">
        <SectionHead id="safety-heading" title="Before you open the case" note="Five rules" />
        <ul className="border-t border-line">
          {SAFETY.map((rule, index) => (
            <li key={rule.title} className="flex gap-3 border-b border-line py-3.5">
              <span className="mt-0.5 font-mono text-xs font-semibold text-ink-3 tnum">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed text-ink-2">
                <span className="font-medium text-ink">{rule.title}.</span> {rule.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <PointSheet
        point={point}
        view={active.label}
        src={active.image}
        portrait={Boolean(active.portrait)}
        onClose={() => setPointId(null)}
      />
      <PartSheet part={part} onClose={() => setPartId(null)} />
    </div>
  );
}
