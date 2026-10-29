import React, { useState, useEffect } from 'react';
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
  Users,
  BarChart2,
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  Award,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { processGoogleCredential, setSignedInAdmin, signOutAdmin } from '../../lib/googleAuth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface WeekStat {
  week: string;
  fullWeek: string;
  topic: string;
  cie: string;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

const CURRICULUM_STATS: WeekStat[] = [
  { week: 'Wk 1', fullWeek: 'Week 1', topic: 'Hardware Categories & Safety', cie: 'CIE 1', completed: 48, inProgress: 2, pending: 0, completionRate: 96 },
  { week: 'Wk 2', fullWeek: 'Week 2', topic: 'SMPS Power Supply & Testing', cie: 'CIE 1', completed: 46, inProgress: 3, pending: 1, completionRate: 92 },
  { week: 'Wk 3', fullWeek: 'Week 3', topic: 'Motherboard & Form Factors', cie: 'CIE 1', completed: 44, inProgress: 4, pending: 2, completionRate: 88 },
  { week: 'Wk 4', fullWeek: 'Week 4', topic: 'Chipset, Boot Sequence & BIOS', cie: 'CIE 1', completed: 42, inProgress: 6, pending: 2, completionRate: 84 },
  { week: 'Wk 5', fullWeek: 'Week 5', topic: 'OS Installation & Partitioning', cie: 'CIE 2', completed: 40, inProgress: 7, pending: 3, completionRate: 80 },
  { week: 'Wk 6', fullWeek: 'Week 6', topic: 'Command Line & User Mgmt', cie: 'CIE 2', completed: 37, inProgress: 9, pending: 4, completionRate: 74 },
  { week: 'Wk 7', fullWeek: 'Week 7', topic: 'OS Admin & Service Control', cie: 'CIE 2', completed: 35, inProgress: 10, pending: 5, completionRate: 70 },
  { week: 'Wk 8', fullWeek: 'Week 8', topic: 'File Systems & Storage Mgt', cie: 'CIE 2', completed: 32, inProgress: 12, pending: 6, completionRate: 64 },
  { week: 'Wk 9', fullWeek: 'Week 9', topic: 'Hardware Drivers & Tuning', cie: 'CIE 3', completed: 28, inProgress: 14, pending: 8, completionRate: 56 },
  { week: 'Wk 10', fullWeek: 'Week 10', topic: 'Network Config & TCP/IP', cie: 'CIE 3', completed: 24, inProgress: 16, pending: 10, completionRate: 48 },
  { week: 'Wk 11', fullWeek: 'Week 11', topic: 'Advanced Network Utilities', cie: 'CIE 3', completed: 19, inProgress: 18, pending: 13, completionRate: 38 },
  { week: 'Wk 12', fullWeek: 'Week 12', topic: 'E-Waste & Safe Disposal', cie: 'CIE 3', completed: 14, inProgress: 20, pending: 16, completionRate: 28 },
  { week: 'Wk 13', fullWeek: 'Week 13', topic: 'Capstone Mini Project', cie: 'CIE 3', completed: 9, inProgress: 25, pending: 16, completionRate: 18 },
];

interface TabAdminProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export function TabAdmin({ isAdmin, setIsAdmin }: TabAdminProps) {
  const [loading, setLoading] = useState(false);
  const [type, setTypeState] = useState<'dashboard' | 'notes' | 'labs' | 'announcements' | 'cieschedule'>('dashboard');

  // Summary Statistics interactive state
  const [statsFilter, setStatsFilter] = useState<'all' | 'cie1' | 'cie2' | 'cie3'>('all');
  const [chartMetric, setChartMetric] = useState<'breakdown' | 'rate'>('breakdown');

  useEffect(() => {
    const handleAdminHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('admin-')) {
        const t = hash.replace('admin-', '');
        if (['dashboard', 'notes', 'labs', 'announcements', 'cieschedule'].includes(t)) {
          setTypeState(t as any);
        }
      } else if (hash === 'admin' || hash === '') {
        window.history.replaceState(null, '', '#admin-dashboard');
        setTypeState('dashboard');
      }
    };

    window.addEventListener('hashchange', handleAdminHash);
    handleAdminHash();

    return () => window.removeEventListener('hashchange', handleAdminHash);
  }, []);

  const setType = (newType: typeof type) => {
    window.location.hash = `admin-${newType}`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'cieschedule') {
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

    if (type === 'announcements') {
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
    const toastId = toast.loading(`Uploading ${type === 'notes' ? 'Notes' : 'Lab Manual'} for Week ${week}...`);

    try {
      let fileId: string | undefined;
      if (file) {
        fileId = await saveFile(file);
      }

      if (type === 'notes') {
        addDynamicNote({
          week: Number(week),
          title: title.trim() || `Week ${week} Notes`,
          fileId,
          custom: title.trim() ? `Uploaded notes for: ${title.trim()}` : `Week ${week} Lecture Notes and Study Reference Materials.`,
        });
      } else if (type === 'labs') {
        addDynamicLab({
          week: Number(week),
          title: title.trim() || `Experiment ${week}`,
          objective: objective.trim() || 'Laboratory Experiment Procedures and Verification.',
          tasks: [
            'Follow safety protocols and anti-static precautions',
            'Verify equipment status and test points',
            'Perform experimental steps and log outputs in observation sheet',
            'Document results and instructor sign-off'
          ],
          links: fileId ? [
            'Download Lab Manual PDF'
          ] : [
            'Lab Experiment Guide'
          ],
          fileId,
        });
      }
      toast.success(`Successfully uploaded ${type === 'notes' ? 'Notes' : 'Lab Manual'} for Week ${week}!`, { id: toastId });

      setTitle('');
      setObjective('');
      setMessageText('');
      setIsUrgent(false);
      setFile(null);
    } catch (error: any) {
      console.error(error);
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : String(error)), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // Filter stats data
  const filteredStats = CURRICULUM_STATS.filter(item => {
    if (statsFilter === 'cie1') return item.cie === 'CIE 1';
    if (statsFilter === 'cie2') return item.cie === 'CIE 2';
    if (statsFilter === 'cie3') return item.cie === 'CIE 3';
    return true;
  });

  const totalPossible = CURRICULUM_STATS.length * 50;
  const totalCompleted = CURRICULUM_STATS.reduce((acc, curr) => acc + curr.completed, 0);
  const avgCompletionRate = Math.round((totalCompleted / totalPossible) * 100);

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Admin Portal</h2>
        <Card className="p-8 text-center border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center bg-white dark:bg-slate-900 max-w-sm mx-auto">
          <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-950/70 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-4">
            <KeyRound size={26} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Staff & Admin Access</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Sign in with your Google account to unlock curriculum stats, announcements, and course materials.
          </p>

          <div className="w-full rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-3 mb-5 text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
              Local Demo — Not a Shared Server
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-200/80">
              Everything you publish here is saved only in this browser. It is not sent to a shared
              database, so students on other devices will not see it.
            </p>
          </div>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              type="icon"
              theme="outline"
              text="signin_with"
              logo_alignment="center"
              width={220}
              containerProps={{
                className: 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2 gap-2',
              }}
            />
          ) : (
            <button
              className="flex items-center justify-center space-x-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
              disabled
            >
              Configure VITE_GOOGLE_CLIENT_ID to enable admin sign-in
            </button>
          )}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
            Admin access is restricted to authorized Google accounts.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {type !== 'dashboard' && (
            <button
              onClick={() => setType('dashboard')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Return to Admin Dashboard"
              aria-label="Back to Admin Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Admin Portal · Local Demo</h2>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {type === 'dashboard' ? 'Overview & Summary Statistics' :
               type === 'notes' ? 'Upload Notes' :
               type === 'labs' ? 'Upload Lab Manual' :
               type === 'announcements' ? 'Post Announcements' :
               'Manage CIE Schedule'}
            </h3>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-[10px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800/60"
        >
          <LogOut size={12} className="mr-1.5" /> Sign Out
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5">
        <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-200/80">
          <span className="font-bold">Local demo.</span> Content is stored in this browser only — there is no
          shared database, so nothing published here reaches other students. Analytics below are sample data.
        </p>
      </div>

      {/* Admin Sub-nav / Category Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => setType('dashboard')}
          className={`p-3.5 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-all border ${
            type === 'dashboard'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <BarChart2 size={20} className="mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Dashboard</span>
        </button>
        <button
          onClick={() => setType('notes')}
          className={`p-3.5 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-all border ${
            type === 'notes'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <FileText size={20} className="mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Notes</span>
        </button>
        <button
          onClick={() => setType('labs')}
          className={`p-3.5 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-all border ${
            type === 'labs'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <FlaskConical size={20} className="mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Labs</span>
        </button>
        <button
          onClick={() => setType('announcements')}
          className={`p-3.5 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-all border ${
            type === 'announcements'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Notice</span>
        </button>
        <button
          onClick={() => setType('cieschedule')}
          className={`p-3.5 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-all border ${
            type === 'cieschedule'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Schedule</span>
        </button>
      </div>

      {/* Main Content Area */}
      {type === 'dashboard' ? (
        <div className="space-y-6">
          {/* Summary Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Cohort Completion</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <TrendingUp size={14} />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{avgCompletionRate}%</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+6.4%</span> this week
              </p>
            </Card>

            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Top Performing</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Award size={14} />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">Week 1</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">96% verified submissions</p>
            </Card>

            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">CIE-1 Readiness</span>
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <CheckCircle2 size={14} />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">90%</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Weeks 1 through 4</p>
            </Card>

            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Active Learners</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Users size={14} />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                50
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Enrolled student batch</p>
            </Card>
          </div>

          {/* Interactive Recharts Chart Card */}
          <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <BarChart2 size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Summary Statistics: Student Progress across Weeks
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visualized tracking of curriculum topic completion and student checkpoint submissions
                </p>
              </div>

              {/* View Filters & Metric Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <button
                    onClick={() => setStatsFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      statsFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    All Weeks
                  </button>
                  <button
                    onClick={() => setStatsFilter('cie1')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      statsFilter === 'cie1'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    CIE 1
                  </button>
                  <button
                    onClick={() => setStatsFilter('cie2')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      statsFilter === 'cie2'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    CIE 2
                  </button>
                  <button
                    onClick={() => setStatsFilter('cie3')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      statsFilter === 'cie3'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    CIE 3
                  </button>
                </div>

                <button
                  onClick={() => setChartMetric(m => m === 'breakdown' ? 'rate' : 'breakdown')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Toggle metric view"
                >
                  {chartMetric === 'breakdown' ? 'Show % Rate' : 'Show Counts'}
                </button>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'breakdown' ? (
                  <BarChart
                    data={filteredStats}
                    margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload as WeekStat;
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                            <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">{data.fullWeek}: {data.topic}</p>
                            <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-2">{data.cie}</p>
                            <div className="space-y-1">
                              <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Completed</span>
                                <span className="font-bold tabular-nums">{data.completed}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> In Progress</span>
                                <span className="font-bold tabular-nums">{data.inProgress}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> Pending</span>
                                <span className="font-bold tabular-nums">{data.pending}</span>
                              </div>
                              <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-700/60 flex justify-between font-bold text-indigo-600 dark:text-indigo-400">
                                <span>Completion Rate</span>
                                <span className="tabular-nums">{data.completionRate}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 600 }}
                    />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="pending" name="Pending" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart
                    data={filteredStats}
                    margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                      dy={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload as WeekStat;
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                            <p className="font-bold text-slate-900 dark:text-slate-100">{data.fullWeek}: {data.topic}</p>
                            <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1 text-sm">{data.completionRate}% Completed</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{data.completed} of 50 students finished</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="completionRate" name="Completion Rate (%)" radius={[6, 6, 0, 0]}>
                      {filteredStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.completionRate >= 80 ? '#10b981' : entry.completionRate >= 50 ? '#6366f1' : '#f59e0b'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Weekly Performance Breakdown List */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center justify-between">
                <span>Curriculum Progression Breakdown</span>
                <span className="text-[10px] lowercase text-slate-400 font-normal">showing {filteredStats.length} academic weeks</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredStats.map((item) => (
                  <div key={item.week} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50">
                        {item.week.replace('Wk ', '')}
                      </span>
                      <div className="min-w-0 flex-1 truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.topic}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.cie} • {item.completed} completed, {item.inProgress} ongoing</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-16 sm:w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.completionRate >= 80 ? 'bg-emerald-500' : item.completionRate >= 50 ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.completionRate}%` }}
                        />
                      </div>
                      <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300 w-10 text-right">
                        {item.completionRate}%
                      </span>
                      <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.completionRate >= 80
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                          : item.completionRate >= 50
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50'
                      }`}>
                        {item.completionRate >= 80 ? 'On Track' : item.completionRate >= 50 ? 'In Progress' : 'Review'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {type === 'cieschedule' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Label (e.g., CIE-1: Theory)
                  </label>
                  <input
                    type="text"
                    value={cieLabel}
                    onChange={(e) => setCieLabel(e.target.value)}
                    placeholder="CIE-1: Theory (Wk 1-4)"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={cieBadge}
                      onChange={(e) => setCieBadge(e.target.value)}
                      placeholder="Wk 4 | 50M"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Progress Percentage (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={ciePct}
                      onChange={(e) => setCiePct(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Color</label>
                  <select
                    value={cieCol}
                    onChange={(e) => setCieCol(e.target.value as 'indigo' | 'slate' | 'amber')}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  >
                    <option value="slate">Pending (Slate)</option>
                    <option value="indigo">Completed (Indigo)</option>
                    <option value="amber">In Progress (Amber)</option>
                  </select>
                </div>
              </div>
            ) : type === 'announcements' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Guest Lecture Tomorrow"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Message Content
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type the announcement details here..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all h-32 resize-none"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="urgent-checkbox"
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="urgent-checkbox" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mark as Urgent
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Academic Week</label>
                    <select
                      value={week}
                      onChange={(e) => setWeek(Number(e.target.value))}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    >
                      {[...Array(15)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Title / Topic Description</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Motherboard Components"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      required
                    />
                  </div>
                </div>

                {type === 'labs' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Lab Objective (Optional)</label>
                    <textarea
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="What will students accomplish in this lab?"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all h-20 resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Upload PDF File</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:bg-indigo-50 dark:file:bg-indigo-950/70 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60 transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={uploading}
              className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-sm focus:outline-none flex justify-center items-center ${
                uploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {type === 'announcements' ? 'Posting...' : 'Uploading...'}
                </span>
              ) : (
                type === 'announcements' ? 'Post Announcement' : type === 'cieschedule' ? 'Add Schedule' : `Push ${type === 'notes' ? 'Notes' : 'Lab Manual'}`
              )}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
