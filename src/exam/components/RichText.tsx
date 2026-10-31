import type { ReactNode } from 'react';

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(TOKEN);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={index}
              className="rounded-[5px] border border-line bg-sunken px-1 py-px font-mono text-[0.86em] text-ink"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

export function BlockList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-ink-2 ${ordered ? 'list-decimal' : 'list-disc'}`}>
      {items.map((item, index) => (
        <li key={index} className="pl-0.5 marker:text-ink-3">
          <RichText text={item} />
        </li>
      ))}
    </Tag>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-sunken px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-3">
      {children}
    </span>
  );
}
