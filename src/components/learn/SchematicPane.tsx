import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ImageOff, ExternalLink } from 'lucide-react';
import { ALL_SCHEMATICS } from '../../data/schematics';

interface SchematicPaneProps {
  week: number;
}

export function SchematicPane({ week }: SchematicPaneProps) {
  const schematic = ALL_SCHEMATICS.find(item => item.week === week);
  const [scale, setScale] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);

  if (!schematic) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-12 text-center">
        <ImageOff size={28} className="text-slate-400" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No diagram for this week</p>
        <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
          The work this week is procedural. Use the practical tasks in the Overview tab and the
          reference links there instead.
        </p>
      </div>
    );
  }

  const hotspot = selected === null ? null : schematic.hotspots[selected];

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{schematic.title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tap a marker to identify the part</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setScale(value => Math.min(value + 0.25, 2.5))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setScale(value => Math.max(value - 0.25, 0.75))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => { setScale(1); setSelected(null); }}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Reset view"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-2 dark:border-slate-700">
        <div
          className="relative origin-top-left transition-transform duration-150"
          style={{ transform: `scale(${scale})` }}
        >
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
                className={`block h-6 w-6 rounded-full border-2 transition-colors ${
                  selected === index
                    ? 'border-indigo-400 bg-indigo-500/60'
                    : 'border-emerald-400 bg-emerald-500/30 hover:bg-emerald-500/50'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {hotspot && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{hotspot.label}</h5>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{hotspot.description}</p>

          {hotspot.specs && hotspot.specs.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300">
              {hotspot.specs.map(spec => <li key={spec}>{spec}</li>)}
            </ul>
          )}

          {hotspot.commonIssues && hotspot.commonIssues.length > 0 && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              <span className="font-bold">Watch for:</span> {hotspot.commonIssues.join(' · ')}
            </p>
          )}

          {hotspot.wikiUrl && hotspot.wikiUrl !== '#' && (
            <a
              href={hotspot.wikiUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Read more <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
