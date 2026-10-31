import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ImageOff, ExternalLink } from 'lucide-react';
import { ALL_SCHEMATICS } from '../../data/schematics';

interface SchematicPaneProps {
  week: number;
}

const ZOOM_CONTROL =
  'grid h-9 w-9 place-items-center rounded-control border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink';

export function SchematicPane({ week }: SchematicPaneProps) {
  const schematic = ALL_SCHEMATICS.find(item => item.week === week);
  const [scale, setScale] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);

  if (!schematic) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-strong px-6 py-12 text-center">
        <ImageOff size={28} className="text-ink-3" />
        <p className="text-sm font-semibold text-ink">No diagram for this week</p>
        <p className="max-w-[42ch] text-sm text-ink-2">
          The work this week is procedural. Use the practical tasks on the Overview tab instead.
        </p>
      </div>
    );
  }

  const hotspot = selected === null ? null : schematic.hotspots[selected];

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-ink">{schematic.title}</h4>
          <p className="mt-0.5 text-xs text-ink-3">Tap a marker to identify the part</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => setScale(value => Math.min(value + 0.25, 2.5))} className={ZOOM_CONTROL} aria-label="Zoom in">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setScale(value => Math.max(value - 0.25, 0.75))} className={ZOOM_CONTROL} aria-label="Zoom out">
            <ZoomOut size={16} />
          </button>
          <button onClick={() => { setScale(1); setSelected(null); }} className={ZOOM_CONTROL} aria-label="Reset view">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[26rem] overflow-auto rounded-control bg-neutral-950 p-2">
        <div className="relative origin-top-left transition-transform duration-150" style={{ transform: `scale(${scale})` }}>
          {schematic.imageUrl ? (
            <img
              src={schematic.imageUrl}
              alt={schematic.imageAlt ?? schematic.title}
              className="block w-full select-none"
              draggable={false}
            />
          ) : (
            <div className="pointer-events-none" dangerouslySetInnerHTML={{ __html: schematic.svgPath ?? '' }} />
          )}
          {schematic.hotspots.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              onClick={() => setSelected(index)}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              aria-label={item.label}
              aria-pressed={selected === index}
            >
              <span
                className={`block h-6 w-6 rounded-full border-2 transition-transform ${
                  selected === index
                    ? 'scale-110 border-white bg-brand'
                    : 'border-white/80 bg-brand/40 hover:bg-brand/70'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {hotspot && (
        <div className="rounded-control border border-brand/30 bg-brand-soft p-4">
          <h5 className="text-sm font-semibold text-ink">{hotspot.label}</h5>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">{hotspot.description}</p>

          {hotspot.specs && hotspot.specs.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink-2 marker:text-ink-3">
              {hotspot.specs.map(spec => <li key={spec}>{spec}</li>)}
            </ul>
          )}

          {hotspot.commonIssues && hotspot.commonIssues.length > 0 && (
            <p className="mt-2 text-xs text-ink-2">
              <span className="font-semibold text-ink">Watch for:</span> {hotspot.commonIssues.join(' · ')}
            </p>
          )}

          {hotspot.wikiUrl && hotspot.wikiUrl !== '#' && (
            <a
              href={hotspot.wikiUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-text hover:underline"
            >
              Read more <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
