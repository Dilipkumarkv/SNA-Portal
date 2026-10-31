export type DrillCategory = 'Hardware' | 'OS & drivers' | 'Disks & accounts' | 'Repair' | 'Network';

export interface DrillStep {
  text: string;
  sub: string[];
}

export interface Drill {
  id: number;
  title: string;
  minutes: number;
  phase: string;
  viva: number[];
  category: DrillCategory;
  steps: DrillStep[];
  commands: string[];
  commandsRaw: string;
  prove: string;
  traps: string;
  note: string;
}

export type VivaBlock =
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] };

export interface VivaQuestion {
  n: number;
  question: string;
  modelPaper: boolean;
  group: string;
  blocks: VivaBlock[];
  trap: string;
}

export interface VivaGroup {
  key: string;
  title: string;
  questions: number[];
}

export interface CheatRow {
  cells: string[];
}

export type VivaMark = 'got' | 'again';

export interface ExamState {
  v: 1;
  examDate: string | null;
  completedDrills: number[];
  completedSteps: Record<string, number[]>;
  vivaMarks: Record<string, VivaMark>;
  last48: string[];
  project: string[];
  mock: { startedAt: number; endAt: number } | null;
  quizSeen: number[];
}

export const MACHINE_VIEW_IDS = ['back', 'front', 'cables', 'board', 'parts'] as const;

export type MachineViewId = (typeof MACHINE_VIEW_IDS)[number];

export const LAB_IDS = ['rufus', 'partition', 'windows', 'ubuntu', 'diskpart', 'restore', 'startup'] as const;

export type LabId = (typeof LAB_IDS)[number];

export type LabWeek = 5 | 6 | 7;

/** plan, drills and viva are parked while the guide is validated; keep them typed for the archived screens. */
export type ExamTab = 'machine' | 'day' | 'labs' | 'project' | 'terminal' | 'plan' | 'drills' | 'viva';
