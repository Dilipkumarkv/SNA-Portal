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
        <p className="rounded-control border border-line bg-sunken p-3 text-sm leading-relaxed text-ink-2">
          {spec.note}
        </p>
      )}

      {spec.commands.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-ink-3">Run these in order</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {spec.commands.map(({ cmd, label }) => (
              <button
                key={cmd}
                onClick={() => run(cmd)}
                className="group flex items-start gap-2.5 rounded-control border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong hover:bg-sunken"
              >
                <span className="mt-0.5 shrink-0 rounded-[0.4rem] bg-brand-soft p-1.5 text-brand-text">
                  <Play size={12} />
                </span>
                <span className="min-w-0">
                  <code className="block truncate font-mono text-xs font-semibold text-ink">{cmd}</code>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-3">{label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-control border border-line bg-[#0b0d16]">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <TerminalSquare size={13} /> {spec.shell === 'ps' ? 'PowerShell' : 'Command Prompt'}
          </span>
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-[0.4rem] px-2 py-1 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        <div className="h-64 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed">
          {lines.length === 0 && (
            <p className="text-slate-400">Pick a command above, or type one below. Nothing here touches your real computer.</p>
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
