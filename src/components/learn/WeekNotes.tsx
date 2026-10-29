import { useEffect, useState } from 'react';
import { Download, ExternalLink, FileText, Paperclip } from 'lucide-react';
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
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
        No long-form note has been written for Week {week} yet. The Basics tab carries the day's
        lesson material, and the Overview tab has the lab work.
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
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500/70" />
            <div className="mb-3 flex items-start justify-between gap-3">
              <h5 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <FileText size={14} className="shrink-0 text-indigo-500" />
                {note.title}
              </h5>
              <button
                onClick={() => generateAndDownloadPdf(
                  elementId,
                  `Week-${week}-${String(note.title).replace(/\s+/g, '-')}.pdf`,
                  'Notes downloaded successfully',
                )}
                data-html2canvas-ignore
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent bg-slate-50 text-slate-400 transition-colors hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:border-indigo-800/60 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400"
                title="Download as PDF"
                aria-label={`Download week ${week} note as PDF`}
              >
                <Download size={14} />
              </button>
            </div>

            {note.custom ? (
              <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{note.custom}</div>
            ) : note.contentHtml ? (
              <div
                className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.contentHtml) }}
              />
            ) : note.list ? (
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {note.list.map((item: string, itemIndex: number) => {
                  const bullet = item.startsWith('\u2022 ');
                  const content = bullet ? item.slice(2) : item;
                  return (
                    <li key={itemIndex} className={`relative ${bullet ? 'pl-4' : ''}`}>
                      {bullet && <span className="absolute left-0 font-bold text-indigo-400">•</span>}
                      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {note.fileId && (
              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800" data-html2canvas-ignore>
                <p className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <Paperclip size={11} className="mr-1.5" /> Attached document
                </p>
                <FileAttachment fileId={note.fileId} />
              </div>
            )}

            {note.links?.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <ExternalLink size={11} className="mr-1.5" /> References
                </p>
                <div className="grid gap-2">
                  {note.links.map((link: { label: string; url: string }, linkIndex: number) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 transition-colors hover:border-indigo-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-indigo-600 dark:hover:bg-slate-800"
                    >
                      <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">{link.label}</span>
                      <ExternalLink size={13} className="shrink-0 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
