import { useEffect, useState } from 'react';
import { Download, FileText, Paperclip } from 'lucide-react';
import DOMPurify from 'dompurify';
import { FileAttachment } from '../FileAttachment';
import { generateAndDownloadPdf } from '../../lib/downloadPdf';
import { subscribeNotes } from '../../lib/storageService';
import { STATIC_NOTES_DATA } from '../../data/staticNotes';

interface WeekNotesProps {
  week: number;
}

export function WeekNotes({ week }: WeekNotesProps) {
  const [uploaded, setUploaded] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeNotes(items => setUploaded(items));
    return () => unsubscribe();
  }, []);

  const notes = [
    ...STATIC_NOTES_DATA.filter(note => Number(note.week) === week),
    ...uploaded.filter(note => Number(note.week) === week),
  ];

  if (notes.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line-strong p-4 text-sm text-ink-2">
        No long-form note has been written for week {week} yet. The Lesson tab carries the day's material, and the Overview tab has the lab work.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note, index) => {
        const elementId = index === 0 ? `note-card-${week}` : `note-card-${week}-${index}`;
        return (
          <section
            key={note.id ?? `${week}-${index}`}
            id={elementId}
            className="rounded-card border border-line bg-surface p-4 sm:p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-line pb-3">
              <h5 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <FileText size={15} className="shrink-0 text-ink-3" />
                {note.title}
              </h5>
              <button
                onClick={() => generateAndDownloadPdf(
                  elementId,
                  `Week-${week}-${String(note.title).replace(/\s+/g, '-')}.pdf`,
                  'Notes downloaded successfully',
                )}
                data-html2canvas-ignore
                className="grid h-9 w-9 shrink-0 place-items-center rounded-control text-ink-3 transition-colors hover:bg-sunken hover:text-brand-text"
                title="Download as PDF"
                aria-label={`Download week ${week} note as PDF`}
              >
                <Download size={15} />
              </button>
            </div>

            <div className="max-w-[68ch] space-y-2 text-sm leading-7 text-ink-2">
              {note.custom ? (
                note.custom
              ) : note.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.contentHtml) }} />
              ) : note.list ? (
                <ul className="space-y-1.5">
                  {note.list.map((item: string, itemIndex: number) => {
                    const content = item.startsWith('\u2022 ') ? item.slice(2) : item;
                    return (
                      <li key={itemIndex} className="relative pl-4 before:absolute before:left-0 before:text-ink-3 before:content-['·']">
                        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            {note.fileId && (
              <div className="mt-4 border-t border-line pt-3" data-html2canvas-ignore>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <Paperclip size={13} className="text-ink-3" /> Attached document
                </p>
                <FileAttachment fileId={note.fileId} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
