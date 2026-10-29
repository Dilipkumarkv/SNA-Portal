import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '../Card';
import { Download, ExternalLink, BookOpen, Terminal, Paperclip } from 'lucide-react';
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
    <div className="space-y-6">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Laboratory Manual</h2>

      <Card className="p-5 sm:p-6 shadow-sm">
        <LabExplorer />
      </Card>

      {loading ? (
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 py-8 text-center animate-pulse">Loading uploads...</div>
      ) : dynamicLabs.length > 0 && (
        <>
          <h2 className="mb-2 pt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Uploaded Manuals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...dynamicLabs].sort((a, b) => a.id - b.id).map((lab) => (
            <div key={lab._docId || lab.id}>
              <Card id={`lab-card-${lab.id}`} className="p-5 sm:p-6 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all h-full">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-100/60 dark:border-indigo-800/50">
                      E{lab.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {lab.title}
                      </h3>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                        Lab Experiment
                      </p>
                    </div>
                  </div>
                  <button 
                    data-html2canvas-ignore
                    onClick={() => downloadPdf(lab.id, lab.title)}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800/60"
                    title="Download as PDF"
                    aria-label={`Download lab ${lab.id} manual as PDF`}
                  >
                    <Download size={14} />
                  </button>
                </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">{lab.desc}</p>
              <ol className="list-decimal ml-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 flex-1 font-medium">
                {lab.steps.map((step: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(step) }}></li>
                ))}
              </ol>
              
              {lab.fileId && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800" data-html2canvas-ignore>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center"><Paperclip size={11} className="mr-1.5" /> Attached Manual</p>
                  <FileAttachment fileId={lab.fileId} />
                </div>
              )}

              {lab.links && lab.links.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800" data-html2canvas-ignore>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center"><ExternalLink size={10} className="mr-1.5" /> Reference Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {lab.links.map((link: any, i: number) => (
                      <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-100 dark:border-slate-800"
                      >
                        <span className="truncate max-w-[150px]">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Guided Lab Mode + Schematic */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800" data-html2canvas-ignore>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Guided Practice</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <GuidedLab 
                    labId={lab.id} 
                    labTitle={lab.title} 
                    labSteps={lab.steps.map((s: string) => typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : String(s).trim())}
                    onLaunchTerminal={(scenarioId) => console.log('Launch terminal with scenario:', scenarioId)}
                  />
                  <SchematicIntegration week={lab.id} category={lab.id === 2 ? 'smps' : lab.id >= 10 ? 'network' : 'motherboard'} />
                </div>
              </div>
            </Card>
           </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
