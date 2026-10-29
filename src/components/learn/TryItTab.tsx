import { useRef, useState } from 'react';
import { Play, RotateCcw, TerminalSquare } from 'lucide-react';
import { LabContextImpl, executeCommand, type CommandResult } from '../terminal/TerminalEngine';
import { getCommandsForWeek } from '../../data/lessonCommands';

interface ConsoleLine {
  id: number;
  kind: 'input' | 'output' | 'error';
  prompt?: string;
  text: string;
}

interface TryItTabProps {
  week: number;
}

function promptFor(context: LabContextImpl, shell: 'cmd' | 'ps'): string {
  if (context.inDiskPart) return 'DISKPART>';
  const cwd = context.vfs.getCwd();
  return shell === 'ps' ? `PS ${cwd}>` : `${cwd}>`;
}

export function TryItTab({ week }: TryItTabProps) {
  const spec = getCommandsForWeek(week);
  const contextRef = useRef<LabContextImpl | null>(null);
  const idRef = useRef(1);
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [input, setInput] = useState('');

  const getContext = () => {
    if (!contextRef.current) {
      contextRef.current = new LabContextImpl();
    }
    contextRef.current.activeShell = spec.shell;
    return contextRef.current;
  };

  const run = (raw: string) => {
    const command = raw.trim();
    if (!command) return;

    const context = getContext();
    const prompt = promptFor(context, spec.shell);

    let result: CommandResult;
    try {
      result = executeCommand(command, context);
    } catch (error) {
      result = { text: `Command error: ${(error as Error).message}`, error: true };
    }

    const baseId = idRef.current;
    idRef.current += 2;

    const inputLine: ConsoleLine = { id: baseId, kind: 'input', prompt, text: command };
    const outputLine: ConsoleLine | null = result.text
      ? { id: baseId + 1, kind: result.error ? 'error' : 'output', text: result.text }
      : null;

    if (result.clearScreen) {
      setLines([inputLine]);
    } else {
      setLines(previous => [...previous, inputLine, ...(outputLine ? [outputLine] : [])]);
    }
    setInput('');
  };

  const reset = () => {
    contextRef.current = null;
    idRef.current = 1;
    setLines([]);
    setInput('');
  };

  return (
    <div className="space-y-4">
      {spec.note && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
          {spec.note}
        </p>
      )}

      {spec.commands.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Run these in order
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {spec.commands.map(({ cmd, label }) => (
              <button
                key={cmd}
                onClick={() => run(cmd)}
                className="group flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
              >
                <span className="mt-0.5 shrink-0 rounded-md bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Play size={12} />
                </span>
                <span className="min-w-0">
                  <code className="block truncate font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{cmd}</code>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">{label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1020] shadow-inner">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <TerminalSquare size={13} /> {spec.shell === 'ps' ? 'PowerShell' : 'Command Prompt'}
          </span>
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        <div className="h-64 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed">
          {lines.length === 0 && (
            <p className="text-slate-500">Pick a command above, or type one below. Nothing here touches your real computer.</p>
          )}
          {lines.map(line => (
            <div key={line.id} className="whitespace-pre-wrap break-words">
              {line.prompt && <span className="mr-2 text-emerald-400">{line.prompt}</span>}
              <span className={line.kind === 'error' ? 'text-red-400' : line.kind === 'input' ? 'text-slate-100' : 'text-slate-300'}>
                {line.text}
              </span>
            </div>
          ))}
        </div>

        <form
          onSubmit={event => { event.preventDefault(); run(input); }}
          className="flex items-center gap-2 border-t border-white/10 bg-white/5 px-3 py-2"
        >
          <span className="shrink-0 font-mono text-xs text-emerald-400">
            {contextRef.current ? promptFor(contextRef.current, spec.shell) : (spec.shell === 'ps' ? 'PS C:\\>' : 'C:\\>')}
          </span>
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="type a command…"
            className="min-w-0 flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-slate-600"
            autoComplete="off"
            spellCheck={false}
            aria-label="Command input"
          />
        </form>
      </div>
    </div>
  );
}
