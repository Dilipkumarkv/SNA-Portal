import React, { useState, useEffect, useRef, useCallback, KeyboardEvent, FormEvent } from 'react';
import { LabContext, TerminalEntry, ShellMode, getShellBanner, executeCommand, saveLabState, getTerminalColors, generateTerminalEntryId } from './TerminalEngine';
import { ChevronLeft, ChevronRight, Terminal, RotateCcw, X, Maximize2, Minimize2, HelpCircle, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Zap, Database } from 'lucide-react';

const MAX_ENTRIES = 300;

function appendEntries(prev: TerminalEntry[], newEntries: TerminalEntry[]): TerminalEntry[] {
  const combined = [...prev, ...newEntries];
  if (combined.length <= MAX_ENTRIES) return combined;
  const headers = combined.filter(e => e.id.startsWith('init-header-'));
  const nonHeaders = combined.filter(e => !e.id.startsWith('init-header-'));
  return [...headers, ...nonHeaders.slice(-MAX_ENTRIES)];
}

interface TerminalScreenProps {
  entries: TerminalEntry[];
  shellMode: ShellMode;
  currentPrompt: string;
  terminalColors: ReturnType<typeof getTerminalColors>;
  inputValue: string;
  onChangeInput: (v: string) => void;
  onSubmit: (e?: FormEvent) => void;
  onReuseCommand: (cmd: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  streamedIds: Set<string>;
  onMarkStreamed: (id: string) => void;
  isBooting: boolean;
  switchCount: number;
}

export function TerminalScreen({
  entries,
  shellMode,
  currentPrompt,
  terminalColors,
  inputValue,
  onChangeInput,
  onSubmit,
  onReuseCommand,
  onKeyDown,
  streamedIds,
  onMarkStreamed,
  isBooting,
  switchCount,
}: TerminalScreenProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    inputRef.current?.focus();
  }, [entries, switchCount, isBooting]);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="terminal-scroll-area"
      ref={scrollAreaRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 relative"
      style={{
        backgroundColor: terminalColors.bg,
        color: terminalColors.fg,
        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
        fontSize: '13px',
        lineHeight: '1.6',
      }}
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="relative group"
          style={{
            opacity: streamedIds.has(entry.id) ? 1 : 0,
            transform: streamedIds.has(entry.id) ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          <div className="flex gap-3" style={{ minHeight: '22px' }}>
            {(entry.type === 'input' || entry.type === 'output' || entry.type === 'error') && entry.prompt && (
              <span
                className="shrink-0 select-none whitespace-nowrap"
                style={{ color: terminalColors.prompt, userSelect: 'none' }}
              >
                {entry.prompt}
              </span>
            )}
            <div className="flex-1 min-w-0 break-words" style={{ wordBreak: 'break-word' }}>
              {entry.type === 'input' && (
                <span className="whitespace-pre-wrap" style={{ color: terminalColors.fg }}>
                  {entry.commandText}
                </span>
              )}
              {entry.type === 'output' && (
                <span className="whitespace-pre-wrap" style={{ color: terminalColors.fg }}>
                  {entry.output}
                </span>
              )}
              {entry.type === 'error' && (
                <span className="whitespace-pre-wrap" style={{ color: terminalColors.error }}>
                  {entry.output}
                </span>
              )}
              {entry.type === 'system' && (
                <span className="whitespace-pre-wrap" style={{ color: terminalColors.system }}>
                  {entry.output}
                </span>
              )}
            </div>
            {(entry.type === 'output' || entry.type === 'error') && (
              <button
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/5"
                onClick={() => handleCopy(entry.output || '', entry.id)}
                aria-label="Copy output"
                style={{ fontSize: '11px' }}
              >
                {copiedId === entry.id ? <Check size={12} style={{ color: '#00ff00' }} /> : <Copy size={12} />}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Active Input Line */}
      <div className="flex gap-3" style={{ minHeight: '22px' }}>
        <span className="shrink-0 select-none whitespace-nowrap" style={{ color: terminalColors.prompt, userSelect: 'none' }}>
          {currentPrompt}
        </span>
        <form onSubmit={onSubmit} className="flex-1">
          <input
            ref={inputRef}
            id="terminal-input"
            type="text"
            value={inputValue}
            onChange={(e) => onChangeInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent border-none outline-none font-mono"
            style={{
              color: terminalColors.fg,
              fontSize: '13px',
              lineHeight: '1.6',
              fontFamily: 'inherit',
              caretColor: terminalColors.prompt,
            }}
            autoComplete="off"
            spellCheck={false}
            disabled={isBooting}
            aria-label="Terminal command input"
          />
        </form>
        <span className="shrink-0" style={{ color: terminalColors.prompt, animation: 'blink 1s infinite' }}>
          █
        </span>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

interface ShellHeaderProps {
  shellMode: ShellMode;
  onQuickCommand: (cmd: string) => void;
  onScenarioSelect: (scenarioId: string) => void;
  scenarios: CLScenario[];
  selectedScenario: string | null;
  onOpenReset: () => void;
  toastMessage: string | null;
  onHistoryPrev: () => void;
  onHistoryNext: () => void;
  canHistoryPrev: boolean;
  canHistoryNext: boolean;
}

export interface CLScenario {
  id: string;
  title: string;
  description: string;
  week: number;
  commands: string[];
  category: 'navigation' | 'filesystem' | 'network' | 'powershell' | 'diskpart' | 'system';
}

export const SCENARIOS: CLScenario[] = [
  // Week 6 - CLI & User Management
  {
    id: 'wk6-nav',
    title: 'Week 6: Basic Navigation',
    description: 'Practice dir, cd, md on the virtual C: drive',
    week: 6,
    category: 'navigation',
    commands: ['dir C:\\', 'cd C:\\Users', 'dir', 'cd C:\\Users\\Student', 'dir', 'cd C:\\', 'md C:\\TestFolder', 'cd C:\\TestFolder', 'dir'],
  },
  {
    id: 'wk6-files',
    title: 'Week 6: File Management',
    description: 'Create, copy, read and delete files',
    week: 6,
    category: 'filesystem',
    commands: ['echo Hello > C:\\test.txt', 'type C:\\test.txt', 'copy C:\\test.txt C:\\backup.txt', 'dir C:\\', 'del C:\\backup.txt', 'dir C:\\'],
  },
  {
    id: 'wk6-users',
    title: 'Week 6: User Management',
    description: 'Practice net user commands',
    week: 6,
    category: 'system',
    commands: ['net user', 'net user Student', 'net user TestUser Password123 /add', 'net user TestUser', 'net user TestUser /delete'],
  },
  // Week 8 - File Systems
  {
    id: 'wk8-diskpart',
    title: 'Week 8: DiskPart Basics',
    description: 'List disks, select, create partition',
    week: 8,
    category: 'diskpart',
    commands: ['diskpart', 'list disk', 'select disk 0', 'list partition', 'create partition primary size=1000', 'exit'],
  },
  {
    id: 'wk8-fs',
    title: 'Week 8: File System Tools',
    description: 'format, chkdsk, defrag simulation',
    week: 8,
    category: 'system',
    commands: ['chkdsk C: /f', 'format D: /fs:ntfs /q', 'defrag C: /a'],
  },
  // Week 10 - Network Configuration
  {
    id: 'wk10-ipconfig',
    title: 'Week 10: IP Configuration',
    description: 'View and modify network settings',
    week: 10,
    category: 'network',
    commands: ['ipconfig', 'ipconfig /all', 'ipconfig /release', 'ipconfig /renew', 'ipconfig /flushdns'],
  },
  {
    id: 'wk10-ping',
    title: 'Week 10: Connectivity Testing',
    description: 'Ping, tracert, nslookup practice',
    week: 10,
    category: 'network',
    commands: ['ping 8.8.8.8', 'ping -n 10 google.com', 'tracert 8.8.8.8', 'nslookup google.com', 'netstat -an'],
  },
  {
    id: 'wk10-firewall',
    title: 'Week 10: Firewall Config',
    description: 'Windows Firewall commands',
    week: 10,
    category: 'network',
    commands: ['netsh advfirewall show allprofiles', 'netsh advfirewall set allprofiles state on', 'netsh advfirewall firewall add rule name="Allow HTTP" dir=in action=allow protocol=TCP localport=80'],
  },
  // Week 11 - Advanced Networking
  {
    id: 'wk11-vm',
    title: 'Week 11: VM Network Commands',
    description: 'Network commands in guest OS',
    week: 11,
    category: 'network',
    commands: ['ipconfig', 'ipconfig /all', 'ping 192.168.1.1', 'tracert google.com', 'netstat -an'],
  },
  {
    id: 'wk11-vpn',
    title: 'Week 11: Connection Checks',
    description: 'Inspect active connections and routes',
    week: 11,
    category: 'network',
    commands: ['ipconfig', 'netstat -an', 'ping 8.8.8.8', 'tracert google.com'],
  },
  // PowerShell Basics
  {
    id: 'ps-basics',
    title: 'PowerShell Basics',
    description: 'Cmdlets, pipeline, objects',
    week: 6,
    category: 'powershell',
    commands: ['Get-Process', 'Get-Service', 'Get-ChildItem C:\\', 'Get-Process | Where-Object {$_.CPU -gt 10} | Sort-Object CPU -Descending | Select-Object -First 5'],
  },
  {
    id: 'ps-scripting',
    title: 'PowerShell: Services & Files',
    description: 'Query services, processes and file listings',
    week: 6,
    category: 'powershell',
    commands: ['Get-Service', 'Get-Process', 'Get-ChildItem C:\\Users', 'Get-ChildItem C:\\Users\\Student'],
  },
];

export function ShellHeader({
  shellMode,
  onQuickCommand,
  onScenarioSelect,
  scenarios = SCENARIOS,
  selectedScenario,
  onOpenReset,
  toastMessage,
  onHistoryPrev,
  onHistoryNext,
  canHistoryPrev,
  canHistoryNext,
}: ShellHeaderProps) {
  const [showScenarios, setShowScenarios] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CLScenario['category'] | 'all'>('all');

  const filteredScenarios = scenarios.filter(s => 
    activeCategory === 'all' || s.category === activeCategory
  );

  const quickCommands = [
    { cmd: 'cls', label: 'Clear', shell: ['cmd', 'ps'] },
    { cmd: 'clear', label: 'Clear', shell: ['bash'] },
    { cmd: 'dir', label: 'List', shell: ['cmd', 'ps'] },
    { cmd: 'ls', label: 'List', shell: ['bash'] },
    { cmd: 'cd', label: 'Change Dir', shell: ['all'] },
    { cmd: 'mkdir', label: 'Make Dir', shell: ['all'] },
    { cmd: 'ping', label: 'Ping', shell: ['all'] },
    { cmd: 'ipconfig', label: 'IP Config', shell: ['all'] },
    { cmd: 'diskpart', label: 'DiskPart', shell: ['cmd'] },
    { cmd: 'Get-Process', label: 'Processes', shell: ['ps'] },
    { cmd: 'Get-Service', label: 'Services', shell: ['ps'] },
  ].filter(c => c.shell.includes('all') || c.shell.includes(shellMode));

  return (
    <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-20">
      {/* Scenario Selector */}
      <div className="p-3 sm:p-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <button
              onClick={() => setShowScenarios(!showScenarios)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-left text-sm font-mono text-white/80 hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>{selectedScenario ? scenarios.find(s => s.id === selectedScenario)?.title || 'Select Scenario' : '📋 Select Lab Scenario'}</span>
              <ChevronDown size={16} className={showScenarios ? 'rotate-180' : ''} />
            </button>
            {showScenarios && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="p-2 border-b border-white/10 flex gap-1 overflow-x-auto">
                  {['all', 'navigation', 'filesystem', 'network', 'powershell', 'diskpart', 'system'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat as any)}
                      className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'text-white/70 hover:bg-white/10'}`}
                    >
                      {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {filteredScenarios.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { onScenarioSelect(s.id); setShowScenarios(false); }}
                      className={`w-full px-3 py-2 text-left rounded transition-colors ${selectedScenario === s.id ? 'bg-indigo-600/50' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{s.week}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded">{s.category}</span>
                      </div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-white/50 mt-0.5">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Command Chips */}
      <div className="px-3 pb-3 sm:px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max" role="toolbar" aria-label="Quick commands">
          {quickCommands.map((qc) => (
            <button
              key={qc.cmd}
              onClick={() => onQuickCommand(qc.cmd)}
              className="shrink-0 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white/80 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
            >
              {qc.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Stepper */}
      <div className="px-3 pb-3 sm:px-4 border-b border-white/5 flex items-center gap-2">
        <button
          onClick={onHistoryPrev}
          disabled={!canHistoryPrev}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={12} /> Prev
        </button>
        <button
          onClick={onHistoryNext}
          disabled={!canHistoryNext}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          Next <ChevronRight size={12} />
        </button>
        <span className="text-xs text-white/40 ml-auto">History</span>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg animate-slide-up">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

interface ShellBottomBarProps {
  shellMode: ShellMode;
  onSwitchMode: (mode: ShellMode) => void;
}

export function ShellBottomBar({ shellMode, onSwitchMode }: ShellBottomBarProps) {
  const modes: { mode: ShellMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'cmd', label: 'CMD', icon: <Terminal size={16} /> },
    { mode: 'ps', label: 'PowerShell', icon: <Zap size={16} /> },
    { mode: 'bash', label: 'Bash', icon: <Database size={16} /> },
  ];

  return (
    <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm p-2 sm:p-3">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {modes.map(m => (
          <button
            key={m.mode}
            onClick={() => onSwitchMode(m.mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[100px] justify-center ${
              shellMode === m.mode
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface OfflineIndicatorProps {}

export function OfflineIndicator({}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => { setIsOnline(true); setShowSaved(true); setTimeout(() => setShowSaved(false), 3000); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 items-end pointer-events-none">
      {!isOnline && (
        <div className="px-3 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <AlertTriangle size={14} /> Working Offline
        </div>
      )}
      {showSaved && (
        <div className="px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <Check size={14} /> Progress Saved
        </div>
      )}
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        @keyframes slide-up {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetModal({ isOpen, onClose, onConfirm }: ResetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-white mb-2">Reset Lab Environment</h3>
        <p className="text-white/70 text-sm mb-6">
          This will wipe the virtual file system and return all drives to the clean baseline.
          Your command history will also be cleared.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Lab
          </button>
        </div>
      </div>
    </div>
  );
}

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl font-bold text-indigo-600 mb-4">SNA Terminal Lab</div>
        <div className="text-white/60 text-sm">Initializing Virtual Environment...</div>
        <div className="mt-6 h-2 w-48 bg-white/10 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}