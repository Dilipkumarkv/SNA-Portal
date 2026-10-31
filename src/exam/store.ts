import { useSyncExternalStore } from 'react';
import type { ExamState, VivaMark } from './types';

const KEY = 'sna_exam_state_v1';

const EMPTY: ExamState = {
  v: 1,
  examDate: null,
  completedDrills: [],
  completedSteps: {},
  vivaMarks: {},
  last48: [],
  project: [],
  mock: null,
  quizSeen: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number');

function sanitize(raw: unknown): ExamState {
  if (!isRecord(raw)) return { ...EMPTY };
  const steps = isRecord(raw.completedSteps) ? raw.completedSteps : {};
  const marks = isRecord(raw.vivaMarks) ? raw.vivaMarks : {};
  const vivaMarks: Record<string, VivaMark> = {};
  for (const [key, value] of Object.entries(marks)) {
    if (value === 'got' || value === 'again') vivaMarks[key] = value;
  }
  const mock = isRecord(raw.mock) &&
    typeof raw.mock.startedAt === 'number' &&
    typeof raw.mock.endAt === 'number'
    ? { startedAt: raw.mock.startedAt, endAt: raw.mock.endAt }
    : null;

  return {
    v: 1,
    examDate: typeof raw.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.examDate) ? raw.examDate : null,
    completedDrills: isNumberArray(raw.completedDrills) ? [...new Set(raw.completedDrills)] : [],
    completedSteps: Object.fromEntries(
      Object.entries(steps)
        .filter(([, value]) => isNumberArray(value))
        .map(([key, value]) => [key, value as number[]])
    ),
    vivaMarks,
    last48: isStringArray(raw.last48) ? raw.last48 : [],
    project: isStringArray(raw.project) ? raw.project : [],
    mock,
    quizSeen: isNumberArray(raw.quizSeen) ? [...new Set(raw.quizSeen)] : [],
  };
}

function load(): ExamState {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitize(JSON.parse(raw)) : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

let state: ExamState = load();
const listeners = new Set<() => void>();

function commit(next: ExamState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // A full quota should not break the session.
  }
  listeners.forEach((listener) => listener());
}

function update(patch: Partial<ExamState>) {
  commit({ ...state, ...patch, v: 1 });
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return state;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY) return;
    state = load();
    listeners.forEach((listener) => listener());
  });
}

export function useExamState(): ExamState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const examActions = {
  setExamDate(date: string | null) {
    update({ examDate: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null });
  },
  toggleDrill(id: number) {
    const completed = state.completedDrills.includes(id)
      ? state.completedDrills.filter((item) => item !== id)
      : [...state.completedDrills, id];
    update({ completedDrills: completed.sort((a, b) => a - b) });
  },
  toggleStep(drillId: number, step: number) {
    const key = String(drillId);
    const current = state.completedSteps[key] ?? [];
    update({
      completedSteps: {
        ...state.completedSteps,
        [key]: current.includes(step)
          ? current.filter((item) => item !== step)
          : [...current, step].sort((a, b) => a - b),
      },
    });
  },
  setVivaMark(n: number, mark: VivaMark, toggle = true) {
    const marks = { ...state.vivaMarks };
    if (toggle && marks[String(n)] === mark) delete marks[String(n)];
    else marks[String(n)] = mark;
    update({ vivaMarks: marks });
  },
  toggleLast48(id: string) {
    update({ last48: toggle(state.last48, id) });
  },
  toggleProject(id: string) {
    update({ project: toggle(state.project, id) });
  },
  startMock(now = Date.now()) {
    update({ mock: { startedAt: now, endAt: now + 180 * 60 * 1000 } });
  },
  endMock() {
    update({ mock: null });
  },
  markQuizSeen(n: number) {
    if (state.quizSeen.includes(n)) return;
    update({ quizSeen: [...state.quizSeen, n] });
  },
  reset() {
    commit({ ...EMPTY });
  },
};

function startOfExam(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

/** Whole days from now until the exam date; 0 means today, negative means past. */
export function daysUntilExam(isoDate: string | null, now = Date.now()): number | null {
  if (!isoDate) return null;
  const target = startOfExam(isoDate).getTime();
  return Math.ceil((target - now) / 86_400_000);
}

export function formatExamDate(isoDate: string | null): string {
  if (!isoDate) return '';
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(startOfExam(isoDate));
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}
