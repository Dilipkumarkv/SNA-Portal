import { useState, useEffect } from 'react';
import { Code, CheckCircle2, Megaphone, Bell, GraduationCap, Play } from 'lucide-react';
import { Card } from '../Card';
import { subscribeAnnouncements, subscribeCieSchedule } from '../../lib/storageService';
import { CURRICULUM } from '../../data/curriculum';
import { getLastLesson, getSummary, subscribeProgress } from '../../lib/progress';
import { motion, AnimatePresence } from 'motion/react';

export function TabHome() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [cieSchedule, setCieSchedule] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState(getSummary);

  useEffect(() => subscribeProgress(() => setCourseProgress(getSummary())), []);

  useEffect(() => {
    const unsubAnn = subscribeAnnouncements((items) => {
      setAnnouncements(items.slice(0, 3));
    });

    const unsubCie = subscribeCieSchedule((items) => {
      setCieSchedule(items);
    });

    return () => {
      unsubAnn();
      unsubCie();
    };
  }, []);

  const defaultCieSchedule = [
    { label: 'CIE-1: Theory (Wk 1-4)', badge: 'Wk 4 | 50M', pct: '100', col: 'indigo' },
    { label: 'CIE-2: Practice (Wk 5-7)', badge: 'Wk 7 | 50M', pct: '25', col: 'slate' },
    { label: 'CIE-3: Theory (Wk 8-10)', badge: 'Wk 10 | 50M', pct: '0', col: 'slate' },
    { label: 'CIE-4: Practice (Wk 11-13)', badge: 'Wk 13 | 50M', pct: '0', col: 'slate' },
    { label: 'CIE-5: Portfolio + Project', badge: 'Wk 1-13 | 50M', pct: '45', col: 'amber' },
  ];
  
  const displayCieSchedule = cieSchedule.length > 0 ? cieSchedule : defaultCieSchedule;

  const lastLesson = getLastLesson();
  const target = lastLesson ?? { week: 1, day: 1 };
  const targetModule = CURRICULUM.find(module => module.id === target.week);
  const targetLesson = targetModule?.lessons.find(lesson => lesson.number === target.day);
  const progressPct = courseProgress.total === 0
    ? 0
    : Math.round((courseProgress.completed / courseProgress.total) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <h2 className="text-3xl font-extrabold leading-none tracking-tight mb-3 relative z-10">SNA Portal</h2>
        <p className="text-indigo-100 text-sm leading-relaxed mb-6 relative z-10 max-w-sm">
          Your Academic Companion for System & Network Administration
        </p>
        <div className="bg-indigo-500/50 backdrop-blur rounded-xl px-4 py-2 inline-flex items-center space-x-2 text-xs font-bold relative z-10 text-white">
          <Code className="text-indigo-200" size={16} />
          <span>Developed by Dilip Kumar</span>
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
              <GraduationCap size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                {lastLesson ? 'Continue learning' : 'Start the course'}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                Week {target.week} · Day {target.day}
                {targetLesson ? ` — ${targetLesson.title}` : ''}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-32 sm:w-40 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  {courseProgress.completed}/{courseProgress.total} lessons
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { window.location.hash = `learn/${target.week}/${target.day}`; }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shrink-0"
          >
            <Play size={14} fill="currentColor" />
            {lastLesson ? 'Resume' : 'Begin'}
          </button>
        </div>
      </Card>

      <AnimatePresence>
        {announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-5 border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center">
                <Bell size={14} className="mr-2 text-amber-600 dark:text-amber-400" /> Live Announcements
              </h3>
              <div className="space-y-4 relative z-10">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-white/70 dark:bg-slate-900/80 p-4 rounded-xl border border-amber-100 dark:border-amber-900/40 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-bold ${announcement.isUrgent ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {announcement.isUrgent && <span className="inline-flex items-center justify-center bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded mr-2">Urgent</span>}
                        {announcement.title}
                      </h4>
                      {announcement.createdAt && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {new Date(typeof announcement.createdAt === 'string' ? announcement.createdAt : announcement.createdAt.seconds * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{announcement.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span> About This Course
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              <strong className="text-slate-900 dark:text-slate-100">System and Network Administration (25CS34I)</strong> is designed to equip learners with the skills and knowledge required to manage, maintain, and troubleshoot computer systems and networks. This course integrates theoretical knowledge with hands-on practice, preparing learners for vital roles in IT infrastructure management.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              As technology forms the backbone of modern organizations, proficient administrators are critical to ensuring systems remain secure, reliable, and efficient. This 5-credit course spans 13 weeks with 7 contact hours per week (91 total hours).
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span> Career Opportunities
            </h3>
            
            <div className="mb-4">
              <h4 className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> Tier 1 (Entry Level)
              </h4>
              <div className="space-y-1.5">
                {[
                  { title: 'IT Support Technician', desc: 'Hardware troubleshooting, OS config' },
                  { title: 'Help Desk Analyst', desc: 'User support, ticket management' },
                  { title: 'Desktop Support Specialist', desc: 'Workstation maintenance, software config' },
                  { title: 'Junior System Administrator', desc: 'Server monitoring, backup management' },
                ].map((role, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{role.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{role.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span> Tier 2 (Advanced)
              </h4>
              <div className="space-y-1.5">
                {[
                  { title: 'Network Administrator', desc: 'Network design, firewall, VPN' },
                  { title: 'System Administrator', desc: 'Server management, virtualization' },
                  { title: 'IT Infrastructure Specialist', desc: 'Data center ops, cloud integration' },
                  { title: 'Security Operations Analyst', desc: 'Threat monitoring, incident response' },
                ].map((role, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{role.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{role.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span> Tier 3 (Expert)
              </h4>
              <div className="space-y-1.5">
                {[
                  { title: 'Network Architect', desc: 'Enterprise infrastructure design' },
                  { title: 'Cloud Solutions Engineer', desc: 'Cloud migration, automation' },
                  { title: 'IT Director / Manager', desc: 'Strategic planning, team leadership' },
                ].map((role, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{role.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{role.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span> Course Outcomes
            </h3>
            <div className="space-y-2">
              {[
                { id: 'CO1', text: 'Analyze hardware specs & assemble a computer.' },
                { id: 'CO2', text: 'Install OS, configure settings, troubleshoot & monitor.' },
                { id: 'CO3', text: 'Manage file systems, partitioning, backup & recovery.' },
                { id: 'CO4', text: 'Configure network, security & sharing activities.' },
                { id: 'CO5', text: 'Design lab layout & implement e-waste disposal.' },
              ].map((co) => (
                <div key={co.id} className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2.5 flex items-start space-x-3">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider mt-0.5">{co.id}</span>
                  <span className="text-[11px] leading-tight text-slate-600 dark:text-slate-300">{co.text}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span> Industry Requirements
            </h3>
            <div className="space-y-2.5">
              {[
                'Hardware assembly & troubleshooting skills',
                'Operating system installation & configuration',
                'Network setup & security implementation',
                'System performance monitoring & optimization',
                'E-waste management & environmental compliance',
                'Documentation & technical communication'
              ].map((req, i) => (
                <div key={i} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="text-indigo-500 dark:text-indigo-400 mt-0.5" size={14} />
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{req}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span> CIE Schedule
            </h3>
            <div className="space-y-4">
              {displayCieSchedule.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{item.label}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/60">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`h-2 w-20 sm:w-24 rounded-full overflow-hidden ${item.col === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-950/60' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${item.col === 'indigo' ? 'bg-indigo-600 dark:bg-indigo-500' : item.col === 'amber' ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-500'}`} 
                        style={{ width: `${item.pct}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300 w-9 text-right shrink-0">
                      {item.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
