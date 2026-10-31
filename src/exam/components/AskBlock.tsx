import type { Ask } from '../guide';
import { RichText } from './RichText';

export function AskBlock({
  ask,
  label = 'The examiner may ask',
}: {
  ask: Ask;
  label?: string;
}) {
  return (
    <div className="border-l-2 border-brand pl-4">
      <p className="text-xs text-ink-3">{label}</p>
      <p className="mt-1.5 text-[0.9375rem] font-medium leading-snug text-ink">
        <RichText text={ask.q} />
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
        <RichText text={ask.a} />
      </p>
    </div>
  );
}
