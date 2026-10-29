import { useEffect, useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { getFile, getFileObjectUrl } from '../lib/fileStore';

interface FileAttachmentProps {
  fileId?: string;
  label?: string;
  className?: string;
}

/**
 * Renders a link to a document that was uploaded through the admin panel.
 * The file itself lives in IndexedDB; only its id is kept in localStorage.
 */
export function FileAttachment({ fileId, label = 'Download attachment', className = '' }: FileAttachmentProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(Boolean(fileId));

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    (async () => {
      const record = await getFile(fileId);
      if (cancelled) return;

      if (!record) {
        setMissing(true);
        setLoading(false);
        return;
      }

      objectUrl = await getFileObjectUrl(fileId);
      if (cancelled) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }

      setName(record.name);
      setUrl(objectUrl);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (!fileId) return null;

  if (missing) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 ${className}`}>
        <FileText size={12} /> Attachment unavailable
      </span>
    );
  }

  if (loading || !url) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 ${className}`}>
        <Loader2 size={12} className="animate-spin" /> Loading attachment
      </span>
    );
  }

  return (
    <a
      href={url}
      download={name || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900/50 ${className}`}
      title={name ? `Open ${name}` : label}
    >
      {name.toLowerCase().endsWith('.pdf') ? <FileText size={12} /> : <Download size={12} />}
      <span className="truncate max-w-[180px]">{name || label}</span>
    </a>
  );
}
