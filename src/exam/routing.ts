import { MACHINE_VIEW_IDS, type ExamTab, type MachineViewId } from './types';

export interface ExamRoute {
  tab: ExamTab;
  view: MachineViewId | null;
}

const TABS: ExamTab[] = ['machine', 'day', 'project', 'terminal'];

const isView = (value: string | undefined): value is MachineViewId =>
  value !== undefined && (MACHINE_VIEW_IDS as readonly string[]).includes(value);

export function parseExamHash(rawHash: string): ExamRoute {
  const [head, tail] = rawHash.replace(/^#/, '').split('/');
  const tab = (TABS as string[]).includes(head) ? (head as ExamTab) : 'machine';

  if (tab !== 'machine') return { tab, view: null };
  return { tab, view: isView(tail) ? tail : 'back' };
}

export function examHash(tab: ExamTab, view: MachineViewId | null = null): string {
  return tab === 'machine' && view ? `#${tab}/${view}` : `#${tab}`;
}
