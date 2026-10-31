import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import {
  addAnnouncement,
  addCieItem,
  addDynamicNote,
  addDynamicLab,
} from '../../lib/storageService';
import { saveFile } from '../../lib/fileStore';
import { Card } from '../Card';
import {
  FileText,
  FlaskConical,
  LogOut,
  KeyRound,
  AlertCircle,
  Megaphone,
  CalendarDays,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { processGoogleCredential, setSignedInAdmin, signOutAdmin } from '../../lib/googleAuth';

type AdminView = 'notes' | 'labs' | 'announcements' | 'cieschedule';

const VIEWS: AdminView[] = ['notes', 'labs', 'announcements', 'cieschedule'];

const VIEW_META: Record<AdminView, { label: string; title: string; hint: string; icon: typeof FileText }> = {
  notes: {
    label: 'Notes',
    title: 'Upload notes',
    hint: 'Attach a PDF to a week. It shows up in that week’s Notes tab and Resources.',
    icon: FileText,
  },
  labs: {
    label: 'Labs',
    title: 'Upload a lab manual',
    hint: 'Publish the experiment manual for a week. Students open it from the Labs tab.',
    icon: FlaskConical,
  },
  announcements: {
    label: 'Notices',
    title: 'Post a notice',
    hint: 'A short message for the whole class. Urgent notices are pinned on the home screen.',
    icon: Megaphone,
  },
  cieschedule: {
    label: 'Schedule',
    title: 'Add a CIE checkpoint',
    hint: 'Name the assessment, give it a week badge, and set how far the class should be.',
    icon: CalendarDays,
  },
};

const FIELD =
  'w-full rounded-control border border-line bg-canvas px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-3 focus:border-brand focus:outline-none';
const LABEL = 'mb-1.5 block text-xs font-medium text-ink-2';

interface TabAdminProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export function TabAdmin({ isAdmin, setIsAdmin }: TabAdminProps) {
  const [view, setViewState] = useState<AdminView>('notes');

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin' || hash === '') {
        setViewState('notes');
        return;
      }
      if (hash === 'admin-dashboard') {
        window.history.replaceState(null, '', '#admin');
        setViewState('notes');
        return;
      }
      if (hash.startsWith('admin-')) {
        const candidate = hash.slice('admin-'.length);
        if (VIEWS.includes(candidate as AdminView)) setViewState(candidate as AdminView);
      }
    };

    window.addEventListener('hashchange', syncFromHash);
    syncFromHash();

    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const setView = (next: AdminView) => {
    window.location.hash = `admin-${next}`;
  };

  const [week, setWeek] = useState(1);
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [cieLabel, setCieLabel] = useState('');
  const [cieBadge, setCieBadge] = useState('');
  const [ciePct, setCiePct] = useState('0');
  const [cieCol, setCieCol] = useState<'indigo' | 'slate' | 'amber'>('slate');
  const [isUrgent, setIsUrgent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [messageText, setMessageText] = useState('');

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        toast.error('No ID token received from Google.');
        return;
      }
      const user = processGoogleCredential(idToken);
      if (user) {
        setSignedInAdmin(user);
        setIsAdmin(true);
        toast.success(`Welcome back, ${user.name}`);
      } else {
        toast.error('Failed to read Google profile.');
      }
    } catch (err) {
      toast.error('Google sign-in failed.');
      console.error(err);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.');
  };

  const handleLogout = async () => {
    try {
      signOutAdmin();
      setIsAdmin(false);
      window.location.hash = '';
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to sign out');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (view === 'cieschedule') {
      if (!cieLabel.trim() || !cieBadge.trim()) {
        toast.error('Please enter Label and Badge');
        return;
      }
      setUploading(true);
      const toastId = toast.loading('Adding CIE Schedule item...');
      try {
        addCieItem({
          label: cieLabel.trim(),
          badge: cieBadge.trim(),
          pct: Number(ciePct) || 0,
          col: cieCol,
        });
        toast.success('CIE Schedule item added!', { id: toastId });
        setCieLabel('');
        setCieBadge('');
        setCiePct('0');
        setCieCol('slate');
      } catch (err: any) {
        toast.error('Failed to add schedule: ' + (err instanceof Error ? err.message : String(err)), { id: toastId });
      } finally {
        setUploading(false);
      }
      return;
    }

    if (view === 'announcements') {
      if (!title.trim() || !messageText.trim()) {
        toast.error('Please provide title and message content');
        return;
      }
      setUploading(true);
      const toastId = toast.loading('Posting announcement...');
      try {
        addAnnouncement({
          title: title.trim(),
          message: messageText.trim(),
          urgent: isUrgent,
        });
        toast.success('Announcement broadcasted successfully!', { id: toastId });
        setTitle('');
        setMessageText('');
        setIsUrgent(false);
      } catch (err: any) {
        toast.error('Failed to post announcement: ' + (err instanceof Error ? err.message : String(err)), { id: toastId });
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!file) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading ${view === 'notes' ? 'Notes' : 'Lab Manual'} for Week ${week}...`);

    try {
      const fileId = await saveFile(file);

      if (view === 'notes') {
        addDynamicNote({
          week: Number(week),
          title: title.trim() || `Week ${week} Notes`,
          fileId,
          custom: title.trim() ? `Uploaded notes for: ${title.trim()}` : `Week ${week} Lecture Notes and Study Reference Materials.`,
        });
      } else {
        addDynamicLab({
          week: Number(week),
          title: title.trim() || `Experiment ${week}`,
          objective: objective.trim(),
          tasks: [],
          fileId,
        });
      }
      toast.success(`Successfully uploaded ${view === 'notes' ? 'Notes' : 'Lab Manual'} for Week ${week}!`, { id: toastId });

      setTitle('');
      setObjective('');
      setFile(null);
    } catch (error: any) {
      console.error(error);
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : String(error)), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-sm space-y-5">
        <Card className="p-6 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand-text">
            <KeyRound size={20} />
          </div>
          <h2 className="font-display text-title font-semibold text-ink">Staff sign-in</h2>
          <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-6 text-ink-2">
            Sign in with your college Google account to publish notes, lab manuals, notices and the
            CIE schedule.
          </p>

          <div className="mt-5 flex justify-center">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                text="signin_with"
                shape="rectangular"
                logo_alignment="center"
                width={260}
              />
            ) : (
              <button
                className="w-full rounded-control border border-line bg-sunken px-4 py-2.5 text-xs font-medium text-ink-3"
                disabled
              >
                Admin sign-in is not configured
              </button>
            )}
          </div>

          <p className="mt-5 flex items-start gap-1.5 text-left text-xs leading-5 text-ink-3">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span>
              <span className="font-medium text-ink-2">Local demo.</span> Everything you publish is
              saved in this browser only, so students on other devices will not see it.
            </span>
          </p>
        </Card>
      </div>
    );
  }

  const meta = VIEW_META[view];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-title font-semibold text-ink">{meta.title}</h2>
          <p className="mt-1 max-w-[52ch] text-sm leading-6 text-ink-2">{meta.hint}</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-control px-2.5 text-xs font-medium text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <nav
        aria-label="Admin sections"
        className="no-scrollbar flex gap-1 overflow-x-auto rounded-control bg-sunken p-1"
      >
        {VIEWS.map((item) => {
          const Icon = VIEW_META[item].icon;
          const active = item === view;
          return (
            <button
              key={item}
              onClick={() => setView(item)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius-control)-4px)] px-3 text-xs font-medium transition-colors ${
                active ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
              }`}
            >
              <Icon size={14} className={active ? 'text-brand-text' : 'text-ink-3'} />
              {VIEW_META[item].label}
            </button>
          );
        })}
      </nav>

      <p className="flex items-start gap-1.5 text-xs leading-5 text-ink-3">
        <AlertCircle size={13} className="mt-0.5 shrink-0" />
        <span>
          <span className="font-medium text-ink-2">Local demo.</span> Saved in this browser only —
          nothing published here reaches students on other devices.
        </span>
      </p>

      <Card as="section" className="max-w-2xl p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {view === 'cieschedule' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="cie-label" className={LABEL}>Label</label>
                <input
                  id="cie-label"
                  type="text"
                  value={cieLabel}
                  onChange={(e) => setCieLabel(e.target.value)}
                  placeholder="CIE-1: Theory (Wk 1–4)"
                  className={FIELD}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cie-badge" className={LABEL}>Badge text</label>
                  <input
                    id="cie-badge"
                    type="text"
                    value={cieBadge}
                    onChange={(e) => setCieBadge(e.target.value)}
                    placeholder="Wk 4 · 50M"
                    className={FIELD}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cie-pct" className={LABEL}>Progress covered (%)</label>
                  <input
                    id="cie-pct"
                    type="number"
                    min="0"
                    max="100"
                    value={ciePct}
                    onChange={(e) => setCiePct(e.target.value)}
                    className={FIELD}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cie-color" className={LABEL}>Status</label>
                <select
                  id="cie-color"
                  value={cieCol}
                  onChange={(e) => setCieCol(e.target.value as 'indigo' | 'slate' | 'amber')}
                  className={FIELD}
                >
                  <option value="slate">Pending</option>
                  <option value="amber">In progress</option>
                  <option value="indigo">Completed</option>
                </select>
              </div>
            </div>
          ) : view === 'announcements' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="notice-title" className={LABEL}>Title</label>
                <input
                  id="notice-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Guest lecture on Thursday"
                  className={FIELD}
                  required
                />
              </div>
              <div>
                <label htmlFor="notice-body" className={LABEL}>Message</label>
                <textarea
                  id="notice-body"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Room, time, and what to bring."
                  className={`${FIELD} h-32 resize-none`}
                  required
                />
              </div>
              <label htmlFor="urgent-checkbox" className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink-2">
                <input
                  id="urgent-checkbox"
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-[var(--brand)]"
                />
                Mark as urgent
              </label>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="sm:w-1/3">
                  <label htmlFor="upload-week" className={LABEL}>Week</label>
                  <select
                    id="upload-week"
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className={FIELD}
                  >
                    {Array.from({ length: 13 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="upload-title" className={LABEL}>Title</label>
                  <input
                    id="upload-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={view === 'notes' ? 'e.g. Motherboard components' : 'e.g. SMPS voltage test'}
                    className={FIELD}
                    required
                  />
                </div>
              </div>

              {view === 'labs' && (
                <div>
                  <label htmlFor="upload-objective" className={LABEL}>Objective <span className="text-ink-3">(optional)</span></label>
                  <textarea
                    id="upload-objective"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="What students should be able to do after this experiment."
                    className={`${FIELD} h-20 resize-none`}
                  />
                </div>
              )}

              <div>
                <label htmlFor="upload-file" className={LABEL}>PDF file</label>
                <input
                  id="upload-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full cursor-pointer rounded-control border border-dashed border-line bg-canvas px-3 py-4 text-sm text-ink-2 file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-text hover:border-line-strong"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {uploading
              ? view === 'announcements' ? 'Posting…' : view === 'cieschedule' ? 'Adding…' : 'Uploading…'
              : view === 'announcements' ? 'Post notice' : view === 'cieschedule' ? 'Add checkpoint' : `Publish ${view === 'notes' ? 'notes' : 'manual'}`}
          </button>
        </form>
      </Card>
    </div>
  );
}
