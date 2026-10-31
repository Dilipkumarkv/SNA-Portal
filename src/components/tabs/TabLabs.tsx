import { useState, useEffect } from 'react';
import { Card } from '../Card';
import { Download, BookOpen, Paperclip } from 'lucide-react';
import { subscribeLabs } from '../../lib/storageService';
import { generateAndDownloadPdf } from '../../lib/downloadPdf';
import DOMPurify from 'dompurify';
import { GuidedLab } from '../lab/GuidedLab';
import { SchematicIntegration } from '../schematic/SchematicIntegration';
import { FileAttachment } from '../FileAttachment';
import { LabExplorer } from '../lab/LabExplorer';

export function TabLabs() {
  const [dynamicLabs, setDynamicLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLabs((items) => {
      setDynamicLabs(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const downloadPdf = async (id: number, title: string) => {
    await generateAndDownloadPdf(
      `lab-card-${id}`,
      `Experiment-${id}-${title.replace(/\s+/g, '-')}.pdf`,
      'Lab Manual downloaded successfully'
    );
  };

  return (
    <div className="space-y-8">
      <Card className="p-4 sm:p-6">
        <LabExplorer />
      </Card>

      {loading && (
        <p className="text-sm text-ink-3">Checking for manuals uploaded by your instructor…</p>
      )}

      {!loading && dynamicLabs.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-display text-[0.9375rem] font-semibold text-ink">Uploaded by your instructor</h3>
            <p className="text-xs text-ink-3">{dynamicLabs.length} manual{dynamicLabs.length === 1 ? '' : 's'}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...dynamicLabs].sort((a, b) => a.id - b.id).map((lab) => (
              <Card
                key={lab._docId || lab.id}
                id={`lab-card-${lab.id}`}
                className="flex h-full flex-col p-4 sm:p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-xs font-semibold text-brand-text">
                      E{lab.id}
                    </span>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold leading-tight text-ink">{lab.title}</h4>
                      <p className="mt-0.5 text-xs text-ink-3">Lab experiment</p>
                    </div>
                  </div>
                  <button
                    data-html2canvas-ignore
                    onClick={() => downloadPdf(lab.id, lab.title)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-control text-ink-3 transition-colors hover:bg-sunken hover:text-brand-text"
                    title="Download as PDF"
                    aria-label={`Download lab ${lab.id} manual as PDF`}
                  >
                    <Download size={15} />
                  </button>
                </div>

                {lab.desc && (
                  <p className="mb-3 border-b border-line pb-3 text-xs leading-relaxed text-ink-2">{lab.desc}</p>
                )}

                {lab.steps.length > 0 && (
                  <ol className="ml-4 flex-1 list-decimal space-y-2 text-sm leading-relaxed text-ink-2">
                    {lab.steps.map((step: string, i: number) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(step) }} />
                    ))}
                  </ol>
                )}

                {lab.fileId && (
                  <div className="mt-4 border-t border-line pt-3" data-html2canvas-ignore>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                      <Paperclip size={13} className="text-ink-3" /> Attached manual
                    </p>
                    <FileAttachment fileId={lab.fileId} />
                  </div>
                )}

                <div className="mt-auto border-t border-line pt-3" data-html2canvas-ignore>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <BookOpen size={13} className="text-ink-3" /> Guided practice
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lab.steps.length > 0 && (
                      <GuidedLab
                        labId={lab.id}
                        labSteps={lab.steps.map((s: string) => typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : String(s).trim())}
                        onLaunchTerminal={(scenarioId) => console.log('Launch terminal with scenario:', scenarioId)}
                      />
                    )}
                    <SchematicIntegration week={lab.id} category={lab.id === 2 ? 'smps' : lab.id >= 10 ? 'network' : 'motherboard'} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
