import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TabHome } from './components/tabs/TabHome';
import { LearnWorkspace } from './components/learn/LearnWorkspace';
import { TabLabs } from './components/tabs/TabLabs';
import { TabTerminal } from './components/tabs/TabTerminal';
import { TabTracker } from './components/tabs/TabTracker';
import { TabLinks } from './components/tabs/TabLinks';
import { TabAdmin } from './components/tabs/TabAdmin';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { TabId } from './types';
import {
  isAdminAuthenticated,
  subscribeAdminAuth,
  signOutAdmin,
  initAllowedAdminEmails,
} from './lib/googleAuth';

export default function App() {
  const [activeTab, setActiveTabState] = useState<TabId | 'admin'>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminAuthenticated());
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Initialise allowed admin emails from env (VITE_ADMIN_EMAILS).
    initAllowedAdminEmails?.();

    const unsubscribe = subscribeAdminAuth((admin) => {
      setIsAdmin(admin);
    });

    setAuthLoading(false);

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync state with URL hash to support browser/Android back button
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.replace('#', '');

        if (['labs', 'terminal', 'tracker', 'links', 'admin'].includes(hash)) {
          setActiveTabState(hash as any);
        } else if (hash === 'learn' || hash.startsWith('learn/') || hash === 'notes' || hash === 'qps') {
          // #notes and #qps are old routes; LearnWorkspace folds them into lessons / assessments.
          setActiveTabState('learn');
        } else {
          setActiveTabState('home');
        }
      } catch {
        // Ignore iframe hash restrictions
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [authLoading]);

  const setActiveTab = (tab: TabId | 'admin') => {
    try {
      if (tab === 'home') {
        try {
          window.history.pushState(null, '', window.location.pathname + window.location.search);
        } catch {
          window.location.hash = '';
        }
      } else {
        window.location.hash = tab;
      }
      setActiveTabState(tab);
    } catch {
      setActiveTabState(tab);
    }
  };

  const handleLogout = () => {
    try {
      signOutAdmin();
      setIsAdmin(false);
      setActiveTab('home');
      toast.success('Signed out successfully');
    } catch (err) {
      toast.error('Failed to sign out');
    }
  };

  if (authLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 animate-pulse">Loading...</div>;
  }

  // Student portal is open to everyone — no login required.
  const isActuallyAuthenticated = true;

  if (!isActuallyAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] relative font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <PwaInstallPrompt />
      <Toaster position="bottom-center" toastOptions={{ style: { fontSize: '14px', borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      <Header isAdmin={isAdmin} onAdminClick={() => setActiveTab('admin')} onLogout={handleLogout} />
      <main className="pt-24 px-5 sm:px-8 max-w-4xl mx-auto min-h-[60vh] relative pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ErrorBoundary>
              {activeTab === 'home' && <TabHome />}
              {activeTab === 'learn' && <LearnWorkspace />}
              {activeTab === 'labs' && <TabLabs />}
              {activeTab === 'terminal' && <TabTerminal />}
              {activeTab === 'tracker' && <TabTracker />}
              {activeTab === 'links' && <TabLinks onLogout={handleLogout} />}
              {activeTab === 'admin' && <TabAdmin isAdmin={isAdmin} setIsAdmin={setIsAdmin} />}
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav activeTab={activeTab === 'admin' ? 'home' : activeTab} onChange={(id) => setActiveTab(id)} />
    </div>
  );
}
