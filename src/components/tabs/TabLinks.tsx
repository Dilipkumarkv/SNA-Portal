import { useMemo, useState } from 'react';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { Card } from '../Card';
import { FeedbackModal } from '../FeedbackModal';
import { CURRICULUM, type Reference } from '../../data/curriculum';

interface Entry extends Reference {
  week: number;
  weekTitle: string;
}

function titleFromUrl(url: string): string {
  const fallback = new URL(url).hostname.replace(/^www\./, '');
  const slug = new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
  const words = decodeURIComponent(slug)
    .replace(/\.(html?|php|aspx?)$/i, '')
    .replace(/[-_+]/g, ' ')
    .trim();
  if (!words || words.length < 5 || /^\d+$/.test(words)) return fallback;
  return words.replace(/\b\w/g, letter => letter.toUpperCase());
}

const SYLLABUS = [
  { label: 'Course code', value: '25CS34I · Sem III' },
  { label: 'Credits', value: '5 · 7 hrs/week' },
  { label: 'Scheme', value: '3 : 0 : 4' },
  { label: 'Assessment', value: 'CIE 50 · SEE 50' },
];

export function TabLinks() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const weeks = useMemo(
    () =>
      CURRICULUM.map(module => ({
        id: module.id,
        title: module.title,
        entries: module.references.map(
          (reference): Entry => ({ ...reference, week: module.id, weekTitle: module.title }),
        ),
      })).filter(week => week.entries.length > 0),
    [],
  );

  return (
    <div className="space-y-8">
      <a
        href="https://infyspringboard.onwingspan.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:items-center sm:p-5"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-brand-text">Required for CIE-5 · 20 marks</p>
          <h3 className="mt-1 font-display text-base font-semibold text-ink">Infosys Springboard course</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">
            Complete the mandatory 10-hour course before the CIE-5 deadline. Opens the external portal in a new tab.
          </p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-text transition-transform group-hover:translate-x-0.5">
          <ExternalLink size={16} />
        </span>
      </a>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-display text-[0.9375rem] font-semibold text-ink">Reading, week by week</h3>
          <p className="text-xs text-ink-3">{weeks.reduce((total, week) => total + week.entries.length, 0)} sources</p>
        </div>
        <p className="mt-1 text-sm text-ink-2">The same sources linked from each lesson, collected in one place.</p>

        <div className="mt-3 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {weeks.map(week => (
            <div key={week.id} className="p-4 sm:px-5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-ink-3">Week {week.id}</span>
                <h4 className="text-sm font-semibold text-ink">{week.title}</h4>
              </div>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {week.entries.map(entry => {
                  const title = titleFromUrl(entry.url);
                  return (
                    <li key={entry.url} className="min-w-0">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-10 min-w-0 items-center gap-2 rounded-control px-1.5 py-1.5 transition-colors hover:bg-sunken"
                      >
                        <ExternalLink size={13} className="shrink-0 text-ink-3" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-ink group-hover:text-brand-text">
                            {title}
                          </span>
                          {entry.label !== title && (
                            <span className="block truncate text-xs text-ink-3">{entry.label}</span>
                          )}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <h3 className="font-display text-[0.9375rem] font-semibold text-ink">Course at a glance</h3>
          <dl className="mt-3 space-y-2">
            {SYLLABUS.map(fact => (
              <div key={fact.label} className="flex items-baseline justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                <dt className="text-sm text-ink-2">{fact.label}</dt>
                <dd className="text-sm font-medium text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="flex flex-col justify-between p-4 sm:p-5">
          <div>
            <h3 className="font-display text-[0.9375rem] font-semibold text-ink">Something not working?</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">
              Send a note to your instructor about a broken link, an unclear step, or a bug on this page.
            </p>
          </div>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 rounded-control border border-line px-3.5 text-sm font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          >
            <MessageSquare size={15} /> Give feedback
          </button>
        </Card>
      </section>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
