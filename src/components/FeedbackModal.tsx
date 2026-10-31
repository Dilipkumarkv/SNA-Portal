import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { addFeedback } from '../lib/storageService';
import { toast } from 'react-hot-toast';

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [type, setType] = useState<'comment' | 'issue'>('comment');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Sending feedback...');

    try {
      addFeedback({
        type,
        message: message.trim(),
      });

      toast.success('Feedback sent successfully. Thank you!', { id: toastId });
      setMessage('');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to send feedback. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Send feedback"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="safe-bottom relative w-full max-w-md overflow-hidden rounded-t-card border border-line bg-surface shadow-raise sm:rounded-card"
          >
            <div className="flex items-center justify-between border-b border-line p-4">
              <h3 className="font-display text-base font-semibold text-ink">Send feedback</h3>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-control text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4 flex gap-2 rounded-control bg-sunken p-1">
                <button
                  type="button"
                  onClick={() => setType('comment')}
                  className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-[0.5rem] text-sm font-semibold transition-colors ${
                    type === 'comment' ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'
                  }`}
                  aria-pressed={type === 'comment'}
                >
                  <MessageSquare size={15} /> Comment
                </button>
                <button
                  type="button"
                  onClick={() => setType('issue')}
                  className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-[0.5rem] text-sm font-semibold transition-colors ${
                    type === 'issue' ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'
                  }`}
                  aria-pressed={type === 'issue'}
                >
                  <AlertCircle size={15} /> Report issue
                </button>
              </div>

              <label htmlFor="feedback-message" className="mb-1.5 block text-xs font-semibold text-ink">
                Your message
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={type === 'comment' ? "What's on your mind?" : 'Describe the issue…'}
                className="h-32 w-full resize-none rounded-control border border-line bg-canvas p-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-brand"
                required
              />

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-control text-sm font-semibold text-white transition-colors ${
                  isSubmitting || !message.trim()
                    ? 'cursor-not-allowed bg-brand/40'
                    : 'bg-brand hover:bg-brand-hover'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send feedback
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
