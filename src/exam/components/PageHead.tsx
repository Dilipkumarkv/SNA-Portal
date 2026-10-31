import type { ReactNode } from 'react';

export function PageHead({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-9 sm:mb-11">
      <h1 className="max-w-[17ch] font-display text-display font-semibold text-ink">{title}</h1>
      <p className="mt-4 max-w-[64ch] text-[1.0625rem] leading-relaxed text-ink-2">{lede}</p>
      {children ? <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div> : null}
    </header>
  );
}

export function SectionHead({
  id,
  title,
  note,
}: {
  id?: string;
  title: string;
  note?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 id={id} className="font-display text-[1.3rem] font-semibold tracking-[-0.025em] text-ink">
        {title}
      </h2>
      {note ? <p className="text-xs leading-snug text-ink-3">{note}</p> : null}
    </div>
  );
}
