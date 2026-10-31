import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExamTab, LabId, MachineViewId } from './types';
import { examHash, labHash, parseExamHash, type ExamRoute } from './routing';
import { ExamShell } from './components/ExamShell';
import { MachineScreen } from './components/MachineScreen';
import { ExamDayScreen } from './components/ExamDayScreen';
import { ProjectScreen } from './components/ProjectScreen';
import { TerminalScreen } from './components/TerminalScreen';
import { LabsScreen } from './components/LabsScreen';

export function ExamPortal() {
  const [route, setRoute] = useState<ExamRoute>(() => parseExamHash(window.location.hash));
  const lastTab = useRef(route.tab);
  const lastLab = useRef(route.lab);

  useEffect(() => {
    const sync = () => setRoute(parseExamHash(window.location.hash));
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    if (lastTab.current !== route.tab) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      lastTab.current = route.tab;
    }
  }, [route.tab]);

  useEffect(() => {
    if (lastLab.current !== route.lab) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      lastLab.current = route.lab;
    }
  }, [route.lab]);

  const navigate = useCallback((tab: ExamTab, view: MachineViewId | null = null, replace = false) => {
    const hash = examHash(tab, view);
    try {
      if (replace) window.history.replaceState(null, '', hash);
      else window.history.pushState(null, '', hash);
    } catch {
      window.location.hash = hash;
    }
    setRoute(parseExamHash(hash));
  }, []);

  const openLab = useCallback((lab: LabId | null) => {
    const hash = labHash(lab);
    try {
      window.history.pushState(null, '', hash);
    } catch {
      window.location.hash = hash;
    }
    setRoute(parseExamHash(hash));
  }, []);

  const goToTab = useCallback((tab: ExamTab) => navigate(tab), [navigate]);

  return (
    <ExamShell tab={route.tab} wide={route.tab === 'terminal'} onNavigate={goToTab}>
      <div key={route.tab} className="screen-enter">
        {route.tab === 'machine' ? (
          <MachineScreen
            view={route.view ?? 'back'}
            onViewChange={(view) => navigate('machine', view, true)}
          />
        ) : null}
        {route.tab === 'day' ? (
          <ExamDayScreen onOpenMachine={(view) => navigate('machine', view)} />
        ) : null}
        {route.tab === 'labs' ? (
          <LabsScreen
            lab={route.lab}
            onOpenLab={openLab}
            onOpenDay={() => navigate('day')}
          />
        ) : null}
        {route.tab === 'project' ? <ProjectScreen /> : null}
        {route.tab === 'terminal' ? <TerminalScreen /> : null}
      </div>
    </ExamShell>
  );
}
