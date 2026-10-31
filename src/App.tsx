import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TabHome } from './components/tabs/TabHome';
import { LearnWorkspace } from './components/learn/LearnWorkspace';
import { TabLabs } from './components/tabs/TabLabs';
import { TabTerminal } from './components/tabs/TabTerminal';
import { TabLinks } from './components/tabs/TabLinks';
import { TabAdmin } from './components/tabs/TabAdmin';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { TabId } from './types';
import { isAdminAuthenticated, subscribeAdminAuth, initAllowedAdminEmails } from './lib/googleAuth';

const PRIMARY_TABS: TabId[] = ['home', 'learn', 'labs', 'terminal', 'links'];

function tabFromHash(): TabId | 'admin' {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'admin' || hash.startsWith('admin-')) return 'admin';
  if (hash === 'learn' || hash.startsWith('learn/')) return 'learn';
  if (PRIMARY_TABS.includes(hash as TabId)) return hash as TabId;
  // #notes, #qps and #tracker predate this navigation; fold them into the app.
  if (hash === 'notes' || hash === 'qps') return 'learn';
  return 'home';
}

export default function App() {
  const [activeTab, setActiveTabState] = useState<TabId | 'admin'>(() => tabFromHash());
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminAuthenticated());
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    initAllowedAdminEmails?.();
    return subscribeAdminAuth(setIsAdmin);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      try {
        setActiveTabState(tabFromHash());
      } catch {
        // Ignore hash restrictions in sandboxed iframes.
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    // Keep the URL honest for legacy routes without adding a history entry.
    const hash = window.location.hash.replace('#', '');
    if (hash === 'notes' || hash === 'qps') {
      window.history.replaceState(null, '', '#learn');
    } else if (hash === 'tracker') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const setActiveTab = (tab: TabId | 'admin') => {
    try {
      if (tab === 'home') {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      } else {
        window.location.hash = tab;
      }
      setActiveTabState(tab);
    } catch {
      setActiveTabState(tab);
    }
  };

  const screen = activeTab === 'admin' ? 'home' : activeTab;

  return (
    <div className="relative min-h-[100dvh] bg-canvas text-ink">
      <PwaInstallPrompt />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--surface-raised)',
            color: 'var(--ink)',
            border: '1px solid var(--line)',
            borderRadius: '14px',
            fontSize: '14px',
            boxShadow: 'var(--shadow-raise)',
            marginBottom: '5.5rem',
          },
        }}
      />
      <Header activeTab={activeTab} />
      <main className="safe-x nav-offset mx-auto w-full max-w-5xl pt-[calc(3.5rem+env(safe-area-inset-top))]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="pb-6 pt-4"
          >
            <ErrorBoundary>
              {activeTab === 'admin' ? (
                <TabAdmin isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
              ) : (
                <>
                  {screen === 'home' && <TabHome onNavigate={setActiveTab} />}
                  {screen === 'learn' && <LearnWorkspace />}
                  {screen === 'labs' && <TabLabs />}
                  {screen === 'terminal' && <TabTerminal />}
                  {screen === 'links' && <TabLinks />}
                </>
              )}
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav activeTab={screen} onChange={(id) => setActiveTab(id)} />
    </div>
  );
}
