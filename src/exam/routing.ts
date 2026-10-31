import { LAB_IDS, MACHINE_VIEW_IDS, type ExamTab, type LabId, type MachineViewId } from './types';

export interface ExamRoute {
  tab: ExamTab;
  view: MachineViewId | null;
  lab: LabId | null;
}

const TABS: ExamTab[] = ['machine', 'day', 'labs', 'project', 'terminal'];

const isView = (value: string | undefined): value is MachineViewId =>
  value !== undefined && (MACHINE_VIEW_IDS as readonly string[]).includes(value);

const isLab = (value: string | undefined): value is LabId =>
  value !== undefined && (LAB_IDS as readonly string[]).includes(value);

export function parseExamHash(rawHash: string): ExamRoute {
  const [head, tail] = rawHash.replace(/^#/, '').split('/');
  const tab = (TABS as string[]).includes(head) ? (head as ExamTab) : 'machine';

  if (tab === 'machine') return { tab, view: isView(tail) ? tail : 'back', lab: null };
  if (tab === 'labs') return { tab, view: null, lab: isLab(tail) ? tail : null };
  return { tab, view: null, lab: null };
}

export function examHash(tab: ExamTab, view: MachineViewId | null = null): string {
  return tab === 'machine' && view ? `#${tab}/${view}` : `#${tab}`;
}

export function labHash(lab: LabId | null = null): string {
  return lab ? `#labs/${lab}` : '#labs';
}
