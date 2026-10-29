/**
 * Course progress, stored on this device only.
 *
 * Same storage model as the rest of the app: no backend, so a student's ticks
 * do not follow them to another phone.
 */

import { CURRICULUM, EXPERIMENTS } from '../data/curriculum';

const KEY = 'sna_progress_v1';
const UPDATE_EVENT = 'sna_store_update';

export interface LessonRef {
  week: number;
  day: number;
}

interface CourseProgress {
  version: 1;
  lessons: Record<string, string>;
  experiments: Record<string, string>;
  lastLesson: LessonRef | null;
}

function blank(): CourseProgress {
  return { version: 1, lessons: {}, experiments: {}, lastLesson: null };
}

function read(): CourseProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw) as Partial<CourseProgress>;
    return {
      version: 1,
      lessons: parsed.lessons ?? {},
      experiments: parsed.experiments ?? {},
      lastLesson: parsed.lastLesson ?? null,
    };
  } catch {
    return blank();
  }
}

function write(progress: CourseProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { key: KEY } }));
  } catch {
    // Quota or private-mode failures are not worth interrupting the lesson for.
  }
}

const lessonKey = (week: number, day: number) => `${week}.${day}`;

export const TOTAL_LESSONS = CURRICULUM.reduce((sum, module) => sum + module.lessons.length, 0);
export const TOTAL_EXPERIMENTS = EXPERIMENTS.length;

export function getProgress(): CourseProgress {
  return read();
}

export function isLessonComplete(week: number, day: number): boolean {
  return Boolean(read().lessons[lessonKey(week, day)]);
}

export function setLessonComplete(week: number, day: number, complete: boolean) {
  const progress = read();
  const key = lessonKey(week, day);
  if (complete) {
    progress.lessons[key] = new Date().toISOString();
  } else {
    delete progress.lessons[key];
  }
  write(progress);
}

export function toggleLesson(week: number, day: number): boolean {
  const nowComplete = !isLessonComplete(week, day);
  setLessonComplete(week, day, nowComplete);
  return nowComplete;
}

export function isExperimentComplete(id: number): boolean {
  return Boolean(read().experiments[String(id)]);
}

export function toggleExperiment(id: number): boolean {
  const progress = read();
  const key = String(id);
  const nowComplete = !progress.experiments[key];
  if (nowComplete) {
    progress.experiments[key] = new Date().toISOString();
  } else {
    delete progress.experiments[key];
  }
  write(progress);
  return nowComplete;
}

export function getLastLesson(): LessonRef | null {
  return read().lastLesson;
}

export function setLastLesson(week: number, day: number) {
  const progress = read();
  if (progress.lastLesson?.week === week && progress.lastLesson?.day === day) return;
  progress.lastLesson = { week, day };
  write(progress);
}

export function resetProgress() {
  write(blank());
}

export function subscribeProgress(callback: () => void): () => void {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ key?: string }>).detail;
    if (!detail || detail.key === KEY) callback();
  };
  window.addEventListener(UPDATE_EVENT, handler);
  return () => window.removeEventListener(UPDATE_EVENT, handler);
}

export interface ProgressSummary {
  completed: number;
  total: number;
  experimentsCompleted: number;
  experimentsTotal: number;
  byWeek: Record<number, { completed: number; total: number }>;
}

export function getSummary(): ProgressSummary {
  const progress = read();
  const byWeek: ProgressSummary['byWeek'] = {};

  let completed = 0;
  for (const module of CURRICULUM) {
    let weekCompleted = 0;
    for (const lesson of module.lessons) {
      if (progress.lessons[lessonKey(module.id, lesson.number)]) {
        completed += 1;
        weekCompleted += 1;
      }
    }
    byWeek[module.id] = { completed: weekCompleted, total: module.lessons.length };
  }

  return {
    completed,
    total: TOTAL_LESSONS,
    experimentsCompleted: Object.keys(progress.experiments).length,
    experimentsTotal: TOTAL_EXPERIMENTS,
    byWeek,
  };
}

/** The next lesson after the given one, or null at the end of the course. */
export function nextLesson(week: number, day: number): LessonRef | null {
  const flat: LessonRef[] = [];
  for (const module of CURRICULUM) {
    for (const lesson of module.lessons) {
      flat.push({ week: module.id, day: lesson.number });
    }
  }
  const index = flat.findIndex(item => item.week === week && item.day === day);
  if (index === -1 || index === flat.length - 1) return null;
  return flat[index + 1];
}

export function previousLesson(week: number, day: number): LessonRef | null {
  const flat: LessonRef[] = [];
  for (const module of CURRICULUM) {
    for (const lesson of module.lessons) {
      flat.push({ week: module.id, day: lesson.number });
    }
  }
  const index = flat.findIndex(item => item.week === week && item.day === day);
  if (index <= 0) return null;
  return flat[index - 1];
}
