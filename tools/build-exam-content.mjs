/**
 * Turns the review copies in exam-guide-content/ into typed data for the app.
 * The markdown stays the source of truth; run `npm run exam:content` after edits.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = resolve(root, 'exam-guide-content');
const outDir = resolve(root, 'src/exam/generated');
mkdirSync(outDir, { recursive: true });

const read = (name) => readFileSync(resolve(sourceDir, name), 'utf8').replace(/\r\n/g, '\n');
const squash = (value) => value.replace(/\s+/g, ' ').trim();
const capitalizeStart = (value) => (/^[a-z]/.test(value) ? value[0].toUpperCase() + value.slice(1) : value);
const quoted = (value) => JSON.stringify(value);

function parseMeta(line) {
  const minutes = Number.parseInt(line.match(/\*\*Time:\*\*\s*(\d+)\s*min/i)?.[1] ?? '0', 10);
  const phase = line.match(/\*\*Phase:\*\*\s*([^·]+)/)?.[1]?.trim() ?? '';
  const viva = [...(line.match(/\*\*Viva:\*\*\s*(.+)$/)?.[1] ?? '').matchAll(/Q(\d+)/g)].map((m) => Number(m[1]));
  return { minutes, phase, viva };
}

function categoryFor(id) {
  if (id <= 2) return 'Hardware';
  if (id <= 5) return 'OS & drivers';
  if (id <= 8) return 'Disks & accounts';
  if (id <= 10) return 'Repair';
  return 'Network';
}

function parseDrill(id, title, body) {
  const lines = body.split('\n');
  const meta = { minutes: 0, phase: '', viva: [] };
  const steps = [];
  const noteLines = [];
  let commandsRaw = '';
  let prove = '';
  let traps = '';
  let mode = 'preamble';
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^##\s/.test(line)) break;

    if (/^\*\*Time:\*\*/.test(line)) {
      Object.assign(meta, parseMeta(line));
      continue;
    }
    if (/^\*\*Do this\*\*/.test(line)) { mode = 'steps'; continue; }
    if (/^\*\*Commands \/ paths:\*\*/.test(line)) {
      mode = 'commands';
      commandsRaw = line.replace(/^\*\*Commands \/ paths:\*\*\s*/, '');
      continue;
    }
    if (/^\*\*Prove it:\*\*/.test(line)) {
      mode = 'prove';
      prove = line.replace(/^\*\*Prove it:\*\*\s*/, '');
      continue;
    }
    if (/^\*\*Traps:\*\*/.test(line)) {
      mode = 'traps';
      traps = line.replace(/^\*\*Traps:\*\*\s*/, '');
      continue;
    }
    if (/^>/.test(line)) {
      noteLines.push(line.replace(/^>\s?/, ''));
      continue;
    }
    if (!line.trim() || /^-{3,}$/.test(line.trim())) continue;

    if (mode === 'steps') {
      const numbered = line.match(/^\d+\.\s+(.*)$/);
      const sub = line.match(/^\s{2,}-\s+(.*)$/);
      if (numbered) {
        current = { text: numbered[1].trim(), sub: [] };
        steps.push(current);
      } else if (sub && current) {
        current.sub.push(sub[1].trim());
      } else if (current) {
        current.text = squash(`${current.text} ${line.trim()}`);
      }
      continue;
    }

    if (mode === 'commands') commandsRaw = squash(`${commandsRaw} ${line.trim()}`);
    if (mode === 'prove') prove = squash(`${prove} ${line.trim()}`);
    if (mode === 'traps') traps = squash(`${traps} ${line.trim()}`);
  }

  const commands = [...commandsRaw.matchAll(/`([^`]+)`/g)].map((match) => match[1]);

  return {
    id,
    title,
    minutes: meta.minutes,
    phase: meta.phase,
    viva: meta.viva,
    category: categoryFor(id),
    steps,
    commands,
    commandsRaw,
    prove: capitalizeStart(prove),
    traps: capitalizeStart(traps),
    note: squash(noteLines.join(' ')),
  };
}

function parseDrills(markdown) {
  const chunks = markdown.split(/^## Drill (\d{2}) — (.+)$/m);
  const drills = [];
  for (let index = 1; index < chunks.length; index += 3) {
    drills.push(parseDrill(Number(chunks[index]), chunks[index + 1].trim(), chunks[index + 2]));
  }
  return drills;
}

function parseBlocks(lines) {
  const blocks = [];
  let paragraph = [];
  let list = null;
  let trap = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'p', text: squash(paragraph.join(' ')) });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list && list.items.length) blocks.push(list);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('**Trap:**')) {
      flushParagraph();
      flushList();
      trap.push(line.replace(/^\*\*Trap:\*\*\s*/, ''));
      continue;
    }
    if (!line || /^-{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = line.match(/^-\s+(.*)$/);
    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (bullet || ordered) {
      flushParagraph();
      const kind = bullet ? 'ul' : 'ol';
      if (!list || list.type !== kind) {
        flushList();
        list = { type: kind, items: [] };
      }
      list.items.push((bullet ?? ordered)[1].trim());
      continue;
    }
    if (list) {
      list.items[list.items.length - 1] = squash(`${list.items[list.items.length - 1]} ${line}`);
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return { blocks, trap: capitalizeStart(squash(trap.join(' '))) };
}

function parseViva(markdown) {
  const featured = [...(markdown.match(/\*\*Most likely ten:\*\*\s*(.+)/)?.[1] ?? '').matchAll(/Q(\d+)/g)].map((m) => Number(m[1]));
  const groups = [];
  const questions = [];

  const groupChunks = markdown.split(/^## (?![#])(.+)$/m);
  let currentGroup = '';

  for (let index = 1; index < groupChunks.length; index += 2) {
    const heading = groupChunks[index].trim();
    const body = groupChunks[index + 1] ?? '';

    if (heading === 'Quick revision table') {
      currentGroup = heading;
      continue;
    }

    const groupMatch = heading.match(/^([A-F])\.\s+(.+)$/);
    if (!groupMatch) continue;

    currentGroup = groupMatch[2].trim();
    const numbers = [];
    const questionChunks = body.split(/^### Q(\d+)\.\s+(.+)$/m);

    for (let offset = 1; offset < questionChunks.length; offset += 3) {
      const n = Number(questionChunks[offset]);
      let title = questionChunks[offset + 1].trim();
      const rest = questionChunks[offset + 2] ?? '';
      const modelPaper = /\*\(Model paper\)\*/.test(title);
      title = title.replace(/\s*\*\(Model paper\)\*\s*$/, '').trim();
      const { blocks, trap } = parseBlocks(rest.split('\n'));
      questions.push({ n, question: title, modelPaper, group: currentGroup, blocks, trap });
      numbers.push(n);
    }

    groups.push({ key: groupMatch[1], title: currentGroup, questions: numbers });
  }

  const tableChunk = markdown.split(/^## Quick revision table\s*$/m)[1] ?? '';
  const cheat = tableChunk
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'))
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
    .filter((cells) => !cells.every((cell) => /^-+$/.test(cell)))
    .slice(1);

  return { featured, groups, questions, cheat };
}

const drills = parseDrills(read('drills.md'));
const viva = parseViva(read('viva.md'));

const drillsFile = `// Generated by tools/build-exam-content.mjs from exam-guide-content/drills.md.
// Do not edit by hand; run npm run exam:content.
import type { Drill } from '../types';

export const DRILLS: Drill[] = ${JSON.stringify(drills, null, 2)};
`;

const vivaFile = `// Generated by tools/build-exam-content.mjs from exam-guide-content/viva.md.
// Do not edit by hand; run npm run exam:content.
import type { CheatRow, VivaGroup, VivaQuestion } from '../types';

export const VIVA_GROUPS: VivaGroup[] = ${JSON.stringify(viva.groups, null, 2)};

export const VIVA_QUESTIONS: VivaQuestion[] = ${JSON.stringify(viva.questions, null, 2)};

export const CHEAT_SHEET: CheatRow[] = ${JSON.stringify(
  viva.cheat.map((cells) => ({ cells })),
  null,
  2
)};

export const FEATURED_VIVA: number[] = ${quoted(viva.featured)};
`;

writeFileSync(resolve(outDir, 'drills.ts'), drillsFile);
writeFileSync(resolve(outDir, 'viva.ts'), vivaFile);

const scaffolded = drills.filter((drill) => !drill.steps.length || !drill.prove || !drill.traps);
if (drills.length !== 12) throw new Error(`Expected 12 drills, found ${drills.length}`);
if (viva.questions.length !== 30) throw new Error(`Expected 30 viva questions, found ${viva.questions.length}`);
if (scaffolded.length) throw new Error(`Incomplete drill parse: ${scaffolded.map((d) => d.id).join(', ')}`);

console.log(`drills: ${drills.length} cards, ${drills.reduce((sum, drill) => sum + drill.minutes, 0)} min`);
console.log(`viva: ${viva.questions.length} answers in ${viva.groups.length} groups, ${viva.cheat.length} cheat-sheet rows`);
