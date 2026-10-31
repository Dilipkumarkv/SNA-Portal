import { useState, useEffect, useCallback, useRef, KeyboardEvent, FormEvent } from 'react';
import { Card } from '../Card';
import { LabContext, TerminalEntry, ShellMode, executeCommand, saveLabState, clearLabState, loadLabState, getShellBanner, getTerminalColors, generateTerminalEntryId, VirtualFileSystem } from '../terminal/TerminalEngine';
import { 
  TerminalScreen, 
  ShellHeader, 
  ShellBottomBar, 
  OfflineIndicator, 
  ResetModal, 
  CLScenario,
  SCENARIOS 
} from '../terminal/TerminalComponents';
import { ChevronLeft, ChevronRight, Terminal, RotateCcw, X, Maximize2, Minimize2, HelpCircle, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Zap, Database, Download, Upload, Trash2, Settings, RefreshCw } from 'lucide-react';

const MAX_ENTRIES = 300;

function appendEntries(prev: TerminalEntry[], newEntries: TerminalEntry[]): TerminalEntry[] {
  const combined = [...prev, ...newEntries];
  if (combined.length <= MAX_ENTRIES) return combined;
  const headers = combined.filter(e => e.id.startsWith('init-header-'));
  const nonHeaders = combined.filter(e => !e.id.startsWith('init-header-'));
  return [...headers, ...nonHeaders.slice(-MAX_ENTRIES)];
}

interface CLISession {
  id: string;
  name: string;
  scenarioId?: string;
  shellMode: ShellMode;
  entries: TerminalEntry[];
  commandHistory: string[];
  historyPointer: number;
  currentPrompt: string;
  labContext: LabContext;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'sna_cli_sessions';
const ACTIVE_SESSION_KEY = 'sna_cli_active_session';

export function TabTerminal() {
  // Multi-session support
  const [sessions, setSessions] = useState<CLISession[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try { return localStorage.getItem(ACTIVE_SESSION_KEY); } catch { return null; }
  });

  const [showSessionManager, setShowSessionManager] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showScenarios, setShowScenarios] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CLScenario['category'] | 'all'>('all');

  // Active session derived state
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || null;
  const [shellMode, setShellMode] = useState<ShellMode>(activeSession?.shellMode || 'cmd');
  const [currentPrompt, setCurrentPrompt] = useState<string>(activeSession?.currentPrompt || '');
  const [cmdInput, setCmdInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>(activeSession?.commandHistory || []);
  const [historyPointer, setHistoryPointer] = useState<number>(activeSession?.historyPointer || -1);
  const [entries, setEntries] = useState<TerminalEntry[]>(activeSession?.entries || []);
  const [labContext] = useState<LabContext>(() => activeSession?.labContext || loadLabState() || createDefaultLabContext());

  const terminalColors = getTerminalColors(labContext.terminalColor, shellMode === 'ps');

  // Initialize on mount
  useEffect(() => {
    if (activeSession) {
      setShellMode(activeSession.shellMode);
      setCurrentPrompt(activeSession.currentPrompt);
      setCommandHistory(activeSession.commandHistory);
      setHistoryPointer(activeSession.historyPointer);
      setEntries(activeSession.entries);
    } else if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  // Viewport tracking for mobile keyboard
  useEffect(() => {
    const updateViewport = () => {
      if (window.visualViewport) {
        setViewportHeight(Math.round(window.visualViewport.height));
        if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0);
      } else {
        setViewportHeight(window.innerHeight);
      }
      const scrollArea = document.getElementById('terminal-scroll-area');
      scrollArea?.scrollTo({ top: scrollArea.scrollHeight, behavior: 'smooth' });
    };
    updateViewport();
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  // Persist session changes
  const persistSession = useCallback(() => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? {
        ...s,
        shellMode,
        entries,
        commandHistory,
        historyPointer,
        currentPrompt,
        labContext,
        updatedAt: Date.now()
      } : s
    ));
  }, [activeSessionId, shellMode, entries, commandHistory, historyPointer, currentPrompt, labContext]);

  useEffect(() => { if (activeSessionId) persistSession(); }, [persistSession]);

  // Scenario handling
  const handleScenarioSelect = useCallback((scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;
    setSelectedScenario(scenarioId);
    setShowScenarios(false);
    setToastMessage(`Loaded: ${scenario.title}`);
    
    // Pre-populate first command
    if (scenario.commands.length > 0) {
      setCmdInput(scenario.commands[0]);
    }
  }, []);

  // Command execution
  const runCommand = useCallback((rawCmd: string, explicitShell?: ShellMode) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    const termInput = document.getElementById('terminal-input') as HTMLInputElement | null;
    termInput?.blur();
    document.activeElement instanceof HTMLElement && document.activeElement.blur();

    const activeShell = explicitShell || shellMode;
    labContext.activeShell = activeShell;
    const promptStr = getPromptString(labContext, activeShell);

    setCommandHistory(prev => {
      if (prev.length > 0 && prev[prev.length - 1] === trimmed) return prev;
      return [...prev, trimmed];
    });
    setHistoryPointer(-1);

    // Shell switching
    const lower = trimmed.toLowerCase();
    if ((lower === 'powershell' || lower === 'pwsh' || lower === 'ps') && activeShell !== 'ps') {
      setShellMode('ps'); setCurrentPrompt(getPromptString(labContext, 'ps')); setToastMessage('Switched to PowerShell');
      appendEntry('input', activeShell, promptStr, trimmed); setCmdInput(''); return;
    }
    if (lower === 'cmd' && activeShell !== 'cmd') {
      setShellMode('cmd'); setCurrentPrompt(getPromptString(labContext, 'cmd')); setToastMessage('Switched to CMD');
      appendEntry('input', activeShell, promptStr, trimmed); setCmdInput(''); return;
    }
    if ((lower === 'bash' || lower === 'sh' || lower === 'wsl') && activeShell !== 'bash') {
      setShellMode('bash'); setCurrentPrompt(getPromptString(labContext, 'bash')); setToastMessage('Switched to Bash');
      appendEntry('input', activeShell, promptStr, trimmed); setCmdInput(''); return;
    }
    if (lower === 'exit' && activeShell !== 'cmd') {
      setShellMode('cmd'); setCurrentPrompt(getPromptString(labContext, 'cmd')); setToastMessage('Switched to CMD');
      appendEntry('input', activeShell, promptStr, trimmed); setCmdInput(''); return;
    }

    // Diskpart handling
    if (labContext.inDiskPart === activeShell && lower !== 'exit') {
      const result = executeCommand(trimmed, labContext);
      appendEntry('input', activeShell, promptStr, trimmed);
      if (result.text) appendEntry(result.error ? 'error' : 'output', activeShell, undefined, result.text);
      if (result.clearScreen) setEntries(prev => prev.filter(e => e.shell !== activeShell));
      setCurrentPrompt(getPromptString(labContext, shellMode));
      setCmdInput('');
      saveLabState(labContext);
      return;
    }

    try {
      const result = executeCommand(trimmed, labContext);
      appendEntry('input', activeShell, promptStr, trimmed);
      if (result.text) {
        appendEntry(result.error ? 'error' : 'output', activeShell, undefined, result.text);
      }
      if (result.clearScreen) {
        setEntries(prev => prev.filter(e => e.shell !== activeShell));
      }
    } catch (err: any) {
      appendEntry('input', activeShell, promptStr, trimmed);
      appendEntry('error', activeShell, undefined, `Command error: ${err?.message || 'Unexpected simulator exception'}`);
    }

    setCurrentPrompt(getPromptString(labContext, shellMode));
    setCmdInput('');
    saveLabState(labContext);
  }, [shellMode, labContext]);

  const appendEntry = (type: TerminalEntry['type'], shell: ShellMode, prompt?: string, text?: string) => {
    const entry: TerminalEntry = {
      id: generateTerminalEntryId(type === 'input' ? 'in' : type === 'error' ? 'err' : 'out'),
      type,
      shell,
      prompt,
      commandText: type === 'input' ? text : undefined,
      output: type !== 'input' ? text : undefined,
      timestamp: Date.now(),
    };
    setEntries(prev => appendEntries(prev, [entry]));
  };

  const handleSubmit = (e?: FormEvent) => { e?.preventDefault(); runCommand(cmdInput); };

  const handleQuickCommand = (cmd: string) => {
    const argCommands = ['mkdir', 'cd', 'cat', 'rm', 'touch', 'echo', 'grep', 'ping', 'tracert', 'nslookup', 'net', 'format'];
    if (argCommands.includes(cmd.toLowerCase())) {
      setCmdInput(`${cmd} `);
      setTimeout(() => { const el = document.getElementById('terminal-input') as HTMLInputElement | null; if (el) { el.focus(); el.setSelectionRange(cmd.length + 1, cmd.length + 1); } }, 50);
      return;
    }
    runCommand(cmd);
  };

  const handleHistoryPrev = () => {
    if (commandHistory.length === 0) return;
    const newPointer = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
    setHistoryPointer(newPointer);
    setCmdInput(commandHistory[newPointer]);
    document.getElementById('terminal-input')?.focus();
  };

  const handleHistoryNext = () => {
    if (historyPointer === -1) return;
    if (historyPointer >= commandHistory.length - 1) { setHistoryPointer(-1); setCmdInput(''); }
    else { setHistoryPointer(historyPointer + 1); setCmdInput(commandHistory[historyPointer + 1]); }
    document.getElementById('terminal-input')?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); handleHistoryPrev(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); handleHistoryNext(); }
  };

  // Session management
  const createNewSession = () => {
    const newContext = loadLabState() || createDefaultLabContext();
    const session: CLISession = {
      id: `session-${Date.now()}`,
      name: `Session ${sessions.length + 1}`,
      shellMode: 'cmd',
      entries: [
        { id: 'init-header-cmd', type: 'output', shell: 'cmd', output: getShellBanner('cmd'), timestamp: Date.now() },
        { id: 'init-header-ps', type: 'output', shell: 'ps', output: getShellBanner('ps'), timestamp: Date.now() },
        { id: 'init-header-bash', type: 'output', shell: 'bash', output: getShellBanner('bash'), timestamp: Date.now() },
      ],
      commandHistory: [],
      historyPointer: -1,
      currentPrompt: getPromptString(newContext, 'cmd'),
      labContext: newContext,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...sessions, session];
    setSessions(updated);
    setActiveSessionId(session.id);
    localStorage.setItem(ACTIVE_SESSION_KEY, session.id);
    setShellMode(session.shellMode);
    setCurrentPrompt(session.currentPrompt);
    setCommandHistory([]);
    setHistoryPointer(-1);
    setEntries(session.entries);
  };

  const switchSession = (id: string) => {
    setActiveSessionId(id);
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      setShellMode(session.shellMode);
      setCurrentPrompt(session.currentPrompt);
      setCommandHistory(session.commandHistory);
      setHistoryPointer(session.historyPointer);
      setEntries(session.entries);
    }
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      const next = updated[0] || null;
      setActiveSessionId(next?.id || null);
      localStorage.setItem(ACTIVE_SESSION_KEY, next?.id || '');
    }
  };

  const duplicateSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const newContext = createDefaultLabContext();
    newContext.vfs = VirtualFileSystem.fromJSON(session.labContext.vfs.toJSON());
    const newSession: CLISession = {
      ...session,
      id: `session-${Date.now()}`,
      name: `${session.name} (Copy)`,
      labContext: newContext,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([...sessions, newSession]);
    setActiveSessionId(newSession.id);
    localStorage.setItem(ACTIVE_SESSION_KEY, newSession.id);
  };

  const handleResetLab = () => {
    setIsResetModalOpen(false);
    clearLabState();
    const newContext = createDefaultLabContext();
    labContext.vfs = newContext.vfs;
    labContext.currentUser = newContext.currentUser;
    labContext.computerName = newContext.computerName;
    labContext.terminalColor = newContext.terminalColor;
    labContext.activeShell = newContext.activeShell;
    labContext.inDiskPart = newContext.inDiskPart;
    setShellMode('cmd');
    setCurrentPrompt(getPromptString(newContext, 'cmd'));
    setCommandHistory([]);
    setHistoryPointer(-1);
    setCmdInput('');
    setEntries([
      { id: generateTerminalEntryId('init'), type: 'output', shell: 'cmd', output: getShellBanner('cmd'), timestamp: Date.now() },
      { id: generateTerminalEntryId('init'), type: 'output', shell: 'ps', output: getShellBanner('ps'), timestamp: Date.now() },
      { id: generateTerminalEntryId('init'), type: 'output', shell: 'bash', output: getShellBanner('bash'), timestamp: Date.now() },
      { id: generateTerminalEntryId('reset'), type: 'system', shell: 'cmd', output: '[System]: Virtual Machine & File System have been reset to clean default baseline.', timestamp: Date.now() },
    ]);
    setToastMessage('Lab reset complete');
  };

  const exportSession = () => {
    if (!activeSession) return;
    const data = JSON.stringify(activeSession, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage('Session exported');
  };

  const importSession = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const session = JSON.parse(e.target?.result as string);
        const newSession: CLISession = {
          ...session,
          id: `session-${Date.now()}`,
          name: `${session.name} (Imported)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions([...sessions, newSession]);
        setActiveSessionId(newSession.id);
        localStorage.setItem(ACTIVE_SESSION_KEY, newSession.id);
        setToastMessage('Session imported');
      } catch { setToastMessage('Invalid session file'); }
    };
    reader.readAsText(file);
  };

  // Active entries for current shell
  const activeEntries = entries.filter(e => e.shell === shellMode);
  const hasBanner = activeEntries.some(e => 
    e.output === getShellBanner(shellMode) || 
    (e.output && e.output.includes('Developed by Dilip')) ||
    e.id.startsWith(`init-header-${shellMode}`)
  );

  const displayEntries = hasBanner 
    ? activeEntries 
    : [{ id: `init-header-${shellMode}`, type: 'output' as const, shell: shellMode, output: getShellBanner(shellMode), timestamp: Date.now() }, ...activeEntries];

  // Scenario category filter
  const filteredScenarios = SCENARIOS.filter(s => activeCategory === 'all' || s.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-2">
          A simulated shell for the command-line weeks. Nothing runs on your real computer.
        </p>
        <button
          onClick={() => setShowSessionManager(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          title="Session manager"
          aria-label="Open session manager"
        >
          <Database size={17} />
        </button>
      </div>

      {/* Terminal Container */}
      <div
        className="relative"
        style={{
          height: viewportHeight ? Math.max(320, viewportHeight - 260) : 'calc(100dvh - 16.25rem)',
          minHeight: '320px',
        }}
      >
        <div
          id="terminal-app-root"
          style={{ height: '100%', maxHeight: '100%' }}
          className="w-full flex flex-col overflow-hidden font-mono select-text bg-[#000000] text-[#cccccc] rounded-xl border border-white/10 shadow-2xl"
        >
          <ShellHeader
            shellMode={shellMode}
            onQuickCommand={handleQuickCommand}
            onScenarioSelect={handleScenarioSelect}
            scenarios={SCENARIOS}
            selectedScenario={selectedScenario}
            onOpenReset={() => setIsResetModalOpen(true)}
            toastMessage={toastMessage}
            onHistoryPrev={handleHistoryPrev}
            onHistoryNext={handleHistoryNext}
            canHistoryPrev={commandHistory.length > 0 && historyPointer !== 0}
            canHistoryNext={historyPointer !== -1}
          />

          <TerminalScreen
            entries={displayEntries}
            shellMode={shellMode}
            currentPrompt={currentPrompt}
            terminalColors={terminalColors}
            inputValue={cmdInput}
            onChangeInput={setCmdInput}
            onSubmit={handleSubmit}
            onReuseCommand={(cmd) => setCmdInput(cmd)}
            onKeyDown={handleKeyDown}
            switchCount={0}
          />

          <ShellBottomBar
            shellMode={shellMode}
            onSwitchMode={(mode) => { setShellMode(mode); setCurrentPrompt(getPromptString(labContext, mode)); setToastMessage(`Switched to ${mode.toUpperCase()}`); }}
          />
        </div>
      </div>

      {/* Session Manager Modal */}
      {showSessionManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="max-h-[80vh] w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-4">
              <h3 className="font-display text-base font-semibold text-ink">Sessions</h3>
              <button
                onClick={() => setShowSessionManager(false)}
                className="grid h-9 w-9 place-items-center rounded-control text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
                aria-label="Close session manager"
              >
                <X size={19} />
              </button>
            </div>
            <div className="p-4">
              <button
                onClick={createNewSession}
                className="mb-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                <Database size={17} /> New session
              </button>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between gap-3 rounded-control border p-3 ${
                      activeSessionId === s.id ? 'border-brand/40 bg-brand-soft' : 'border-line hover:bg-sunken'
                    }`}
                  >
                    <div className="min-w-0 flex-1" onClick={() => switchSession(s.id)}>
                      <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                        <span className="rounded bg-sunken px-1.5 py-0.5 font-semibold text-ink-2">{s.shellMode.toUpperCase()}</span>
                        <span>{new Date(s.updatedAt).toLocaleString()}</span>
                        {s.scenarioId && <span className="rounded bg-success-soft px-1.5 py-0.5 font-semibold text-success">{s.scenarioId}</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => duplicateSession(s.id)} className="grid h-8 w-8 place-items-center rounded-control text-ink-3 hover:bg-surface hover:text-ink" title="Duplicate" aria-label={`Duplicate ${s.name}`}><Copy size={14} /></button>
                      <button onClick={() => exportSession()} className="grid h-8 w-8 place-items-center rounded-control text-ink-3 hover:bg-surface hover:text-ink" title="Export" aria-label={`Export ${s.name}`}><Download size={14} /></button>
                      <button onClick={() => deleteSession(s.id)} className="grid h-8 w-8 place-items-center rounded-control text-ink-3 hover:bg-danger-soft hover:text-danger" title="Delete" aria-label={`Delete ${s.name}`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && <p className="py-8 text-center text-sm text-ink-3">No sessions yet. Create one to start.</p>}
              </div>
              <div className="mt-4 border-t border-line pt-4">
                <label className="mb-2 block text-sm font-medium text-ink">Import a session file</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && importSession(e.target.files[0])}
                  className="w-full rounded-control border border-line bg-canvas p-2 text-sm text-ink-2"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      <ResetModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirm={handleResetLab} />
      <OfflineIndicator />
    </div>
  );
}

// Helper functions
function getPromptString(context: LabContext, shell: ShellMode): string {
  if (context.inDiskPart === shell) return 'DISKPART>';
  const cwd = context.vfs.getCwd();
  if (shell === 'bash') {
    let bashCwd = cwd.replace(/\\/g, '/');
    if (bashCwd.startsWith('C:')) bashCwd = bashCwd.substring(2);
    if (bashCwd.toLowerCase() === '/users/student' || bashCwd.toLowerCase() === '/home/student') bashCwd = '~';
    else if (bashCwd.toLowerCase().startsWith('/users/student/')) bashCwd = '~' + bashCwd.substring('/users/student'.length);
    else if (bashCwd.toLowerCase().startsWith('/home/student/')) bashCwd = '~' + bashCwd.substring('/home/student'.length);
    if (!bashCwd) bashCwd = '/';
    const host = context.computerName.toLowerCase().replace('desktop-', '');
    const user = context.currentUser.toLowerCase();
    return `${user}@${host}:${bashCwd}$ `;
  }
  return shell === 'ps' ? `PS ${cwd}>` : `${cwd}>`;
}

function createDefaultLabContext(): LabContext {
  return {
    vfs: new VirtualFileSystem(),
    currentUser: 'Student',
    computerName: 'DESKTOP-STUDENT',
    terminalColor: 'green' as const,
    activeShell: 'cmd' as ShellMode,
    inDiskPart: null,
  };
}