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
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 ${className}`}>
        <FileText size={13} /> Attachment unavailable
      </span>
    );
  }

  if (loading || !url) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 ${className}`}>
        <Loader2 size={13} className="animate-spin" /> Loading attachment
      </span>
    );
  }

  return (
    <a
      href={url}
      download={name || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-control border border-line px-2.5 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink ${className}`}
      title={name ? `Open ${name}` : label}
    >
      {name.toLowerCase().endsWith('.pdf') ? <FileText size={13} /> : <Download size={13} />}
      <span className="truncate max-w-[11rem]">{name || label}</span>
    </a>
  );
}
