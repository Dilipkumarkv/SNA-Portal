import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { addFeedback } from '../lib/storageService';
import { toast } from 'react-hot-toast';

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [type, setType] = useState<'comment' | 'issue'>('comment');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Send Feedback</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="flex gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setType('comment')}
                  className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${
                    type === 'comment'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare size={14} className="mr-2" />
                  Comment
                </button>
                <button
                  type="button"
                  onClick={() => setType('issue')}
                  className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${
                    type === 'issue'
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <AlertCircle size={14} className="mr-2" />
                  Report Issue
                </button>
              </div>

              <div className="mb-5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={type === 'comment' ? "What's on your mind?" : "Describe the issue..."}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all h-32 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className={`w-full flex items-center justify-center space-x-2 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm focus:outline-none ${
                  isSubmitting || !message.trim()
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Feedback</span>
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
