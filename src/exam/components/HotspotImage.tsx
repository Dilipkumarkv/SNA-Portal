import type { GuidePoint } from '../guide';

export function HotspotImage({
  src,
  alt,
  points,
  portrait = false,
  onSelect,
}: {
  src: string;
  alt: string;
  points: GuidePoint[];
  portrait?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        width={portrait ? 1024 : 1400}
        height={portrait ? 1536 : 934}
        decoding="async"
        className="block h-auto w-full rounded-[10px] border border-line bg-sunken"
      />
      {points.map((point) => (
        <button
          key={point.id}
          type="button"
          onClick={() => onSelect(point.id)}
          aria-label={`Point ${point.n}: ${point.name}`}
          className="group absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand font-mono text-[0.6875rem] font-semibold text-on-brand shadow-[0_1px_6px_rgba(0,0,0,0.45)] ring-2 ring-white/90 transition-transform group-hover:scale-110 group-focus-visible:scale-110">
            {point.n}
          </span>
        </button>
      ))}
    </div>
  );
}
