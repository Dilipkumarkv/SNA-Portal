import React, { useState, useEffect, useRef, KeyboardEvent, FormEvent } from 'react';
import { TerminalEntry, ShellMode, getTerminalColors } from './TerminalEngine';
import { ChevronLeft, ChevronRight, Terminal, ChevronDown, Copy, Check, AlertTriangle, Zap, Database } from 'lucide-react';

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
  switchCount,
}: TerminalScreenProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typed = useRef(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    scrollAreaRef.current?.scrollTo({
      top: scrollAreaRef.current.scrollHeight,
      behavior: reduce ? 'auto' : 'smooth',
    });
    // On phones, focusing on mount would open the keyboard before the student picks a scenario.
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
    if (!coarsePointer || typed.current) inputRef.current?.focus();
  }, [entries, switchCount]);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const lastEntry = entries[entries.length - 1];
  const announcement = lastEntry
    ? lastEntry.type === 'input'
      ? `Ran ${lastEntry.commandText ?? ''}`
      : lastEntry.output ?? ''
    : '';

  return (
    <div
      id="terminal-scroll-area"
      ref={scrollAreaRef}
      className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 text-[0.875rem] leading-[1.5rem] sm:p-6 sm:text-[0.9375rem]"
      style={{
        backgroundColor: terminalColors.bg,
        color: terminalColors.fg,
        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
      }}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      {entries.map((entry) => (
        <div key={entry.id} className="group relative">
          <div className="flex gap-2.5 sm:gap-3" style={{ minHeight: '1.5rem' }}>
            {(entry.type === 'input' || entry.type === 'output' || entry.type === 'error') && entry.prompt && (
              <span
                className="shrink-0 select-none whitespace-nowrap"
                style={{ color: terminalColors.prompt, userSelect: 'none' }}
              >
                {entry.prompt}
              </span>
            )}
            <div className="min-w-0 flex-1 break-words" style={{ wordBreak: 'break-word' }}>
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
                type="button"
                className="-my-1 grid h-8 w-8 shrink-0 place-items-center rounded text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:text-white"
                onClick={() => handleCopy(entry.output || '', entry.id)}
                aria-label={entry.type === 'error' ? 'Copy error output' : 'Copy output'}
              >
                {copiedId === entry.id ? <Check size={13} style={{ color: '#4ade80' }} /> : <Copy size={13} />}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Active Input Line */}
      <div className="flex gap-2.5 sm:gap-3" style={{ minHeight: '1.5rem' }}>
        <span className="shrink-0 select-none whitespace-nowrap" style={{ color: terminalColors.prompt, userSelect: 'none' }}>
          {currentPrompt}
        </span>
        <form onSubmit={onSubmit} className="min-w-0 flex-1">
          <input
            ref={inputRef}
            id="terminal-input"
            type="text"
            value={inputValue}
            onChange={(e) => {
              typed.current = true;
              onChangeInput(e.target.value);
            }}
            onKeyDown={onKeyDown}
            className="w-full border-none bg-transparent font-mono text-[1rem] leading-[1.5rem] outline-none lg:text-[0.9375rem]"
            style={{
              color: terminalColors.fg,
              fontFamily: 'inherit',
              caretColor: terminalColors.prompt,
            }}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            aria-label="Terminal command input"
          />
        </form>
        <span className="terminal-cursor shrink-0" style={{ color: terminalColors.prompt }}>
          █
        </span>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .terminal-cursor { animation: blink 1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .terminal-cursor { animation: none; }
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
  onHistoryPrev,
  onHistoryNext,
  canHistoryPrev,
  canHistoryNext,
}: ShellHeaderProps) {
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

  const weekGroups = [...new Set(scenarios.map((s) => s.week))]
    .sort((a, b) => a - b)
    .map((week) => ({ week, items: scenarios.filter((s) => s.week === week) }));

  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-white/5 p-3 sm:p-4">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Lab scenario</span>
          <select
            value={selectedScenario ?? ''}
            onChange={(event) => {
              if (event.target.value) onScenarioSelect(event.target.value);
            }}
            className="h-11 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-2.5 text-sm text-white/90 outline-none transition-colors focus-visible:border-[#ec7a45]"
          >
            <option value="">Lab scenario</option>
            {weekGroups.map((group) => (
              <optgroup key={group.week} label={`Week ${group.week}`}>
                {group.items.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="Command history">
          <button
            type="button"
            onClick={onHistoryPrev}
            disabled={!canHistoryPrev}
            className="inline-flex h-11 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous command"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <button
            type="button"
            onClick={onHistoryNext}
            disabled={!canHistoryNext}
            className="inline-flex h-11 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next command"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <details className="group/quick border-b border-white/5">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 text-xs font-medium text-white/65 transition-colors hover:text-white sm:px-4 [&::-webkit-details-marker]:hidden">
          <ChevronDown
            size={15}
            className="transition-transform group-open/quick:rotate-180"
            aria-hidden="true"
          />
          Quick commands
          <span className="text-white/35">· {quickCommands.length} ready to run</span>
        </summary>
        <div className="flex flex-wrap gap-2 px-3 pb-3 sm:px-4">
          {quickCommands.map((qc) => (
            <button
              key={qc.cmd}
              type="button"
              onClick={(event) => {
                event.currentTarget.closest('details')?.removeAttribute('open');
                onQuickCommand(qc.cmd);
              }}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/5 px-3.5 font-mono text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {qc.label}
            </button>
          ))}
        </div>
      </details>

    </div>
  );
}

interface ShellBottomBarProps {
  shellMode: ShellMode;
  onSwitchMode: (mode: ShellMode) => void;
}

export function ShellBottomBar({ shellMode, onSwitchMode }: ShellBottomBarProps) {
  const modes: { mode: ShellMode; label: React.ReactNode; icon: React.ReactNode }[] = [
    { mode: 'cmd', label: 'CMD', icon: <Terminal size={16} /> },
    {
      mode: 'ps',
      label: (
        <>
          <span className="sm:hidden">PS</span>
          <span className="hidden sm:inline">PowerShell</span>
        </>
      ),
      icon: <Zap size={16} />,
    },
    { mode: 'bash', label: 'Bash', icon: <Database size={16} /> },
  ];

  return (
    <div className="border-t border-white/10 bg-white/5 p-2 backdrop-blur-sm sm:p-3">
      <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="Shell mode">
        {modes.map(m => (
          <button
            key={m.mode}
            type="button"
            onClick={() => onSwitchMode(m.mode)}
            aria-pressed={shellMode === m.mode}
            className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors sm:max-w-[180px] sm:gap-2 sm:px-4 sm:text-sm ${
              shellMode === m.mode
                ? 'bg-[#b03a17] text-white shadow-lg shadow-black/30'
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
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}
