import { LAB_IDS, MACHINE_VIEW_IDS, type ExamTab, type LabId, type LabWeek, type MachineViewId } from './types';
import { labsForWeek } from './labs';

export interface ExamRoute {
  tab: ExamTab;
  view: MachineViewId | null;
  lab: LabId | null;
  week: LabWeek | null;
}

const TABS: ExamTab[] = ['machine', 'day', 'labs', 'project', 'terminal'];

const isView = (value: string | undefined): value is MachineViewId =>
  value !== undefined && (MACHINE_VIEW_IDS as readonly string[]).includes(value);

const isLab = (value: string | undefined): value is LabId =>
  value !== undefined && (LAB_IDS as readonly string[]).includes(value);

export function parseExamHash(rawHash: string): ExamRoute {
  const hash = rawHash.replace(/^#/, '');
  const queryAt = hash.indexOf('?');
  const path = queryAt < 0 ? hash : hash.slice(0, queryAt);
  const query = new URLSearchParams(queryAt < 0 ? '' : hash.slice(queryAt + 1));
  const [head, tail] = path.split('/');
  const tab = (TABS as string[]).includes(head) ? (head as ExamTab) : 'machine';

  if (tab === 'machine') return { tab, view: isView(tail) ? tail : 'back', lab: null, week: null };
  if (tab === 'labs') {
    const lab = isLab(tail) ? tail : null;
    const rawWeek = query.get('week') ?? '';
    const requestedWeek = /^(?:[5-9]|1[0-2])$/.test(rawWeek) ? Number(rawWeek) as LabWeek : null;
    const week = requestedWeek !== null && (!lab || labsForWeek(requestedWeek).some(item => item.id === lab))
      ? requestedWeek : null;
    return { tab, view: null, lab, week };
  }
  return { tab, view: null, lab: null, week: null };
}

export function examHash(tab: ExamTab, view: MachineViewId | null = null): string {
  return tab === 'machine' && view ? `#${tab}/${view}` : `#${tab}`;
}

export function labHash(lab: LabId | null = null, week: LabWeek | null = null): string {
  return `${lab ? `#labs/${lab}` : '#labs'}${week === null ? '' : `?week=${week}`}`;
}
