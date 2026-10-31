import './setup.ts';
import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM } from '../src/data/curriculum.ts';
import {
  TOTAL_LESSONS,
  getLastLesson,
  getProgress,
  getSummary,
  isExperimentComplete,
  isLessonComplete,
  nextLesson,
  previousLesson,
  resetProgress,
  setLastLesson,
  subscribeProgress,
  toggleExperiment,
  toggleLesson,
} from '../src/lib/progress.ts';

const firstModule = CURRICULUM[0];
const lastModule = CURRICULUM[CURRICULUM.length - 1];

beforeEach(() => {
  localStorage.clear();
});

test('starts with an empty course', () => {
  const summary = getSummary();
  assert.equal(summary.completed, 0);
  assert.equal(summary.total, TOTAL_LESSONS);
  assert.equal(summary.experimentsCompleted, 0);
  assert.equal(getLastLesson(), null);
  assert.deepEqual(getProgress().lessons, {});
});

test('a lesson toggles on and off', () => {
  assert.equal(toggleLesson(1, 1), true);
  assert.equal(isLessonComplete(1, 1), true);
  assert.match(getProgress().lessons['1.1'], /^\d{4}-\d{2}-\d{2}T/);

  assert.equal(toggleLesson(1, 1), false);
  assert.equal(isLessonComplete(1, 1), false);
  assert.equal('1.1' in getProgress().lessons, false);
});

test('summary counts completed lessons per week', () => {
  toggleLesson(1, 1);
  toggleLesson(1, 2);
  toggleLesson(2, 1);

  const summary = getSummary();
  assert.equal(summary.completed, 3);
  assert.equal(summary.byWeek[1].completed, 2);
  assert.equal(summary.byWeek[1].total, firstModule.lessons.length);
  assert.equal(summary.byWeek[2].completed, 1);
});

test('experiments track independently of lessons', () => {
  assert.equal(toggleExperiment(3), true);
  assert.equal(isExperimentComplete(3), true);
  assert.equal(getSummary().experimentsCompleted, 1);

  toggleExperiment(4);
  assert.equal(getSummary().experimentsCompleted, 2);

  assert.equal(toggleExperiment(3), false);
  assert.equal(isExperimentComplete(3), false);
  assert.equal(getSummary().experimentsCompleted, 1);
});

test('last lesson is remembered and only rewritten on change', () => {
  setLastLesson(2, 3);
  assert.deepEqual(getLastLesson(), { week: 2, day: 3 });

  const before = getProgress().lastLesson;
  setLastLesson(2, 3);
  assert.deepEqual(getProgress().lastLesson, before);

  setLastLesson(4, 1);
  assert.deepEqual(getLastLesson(), { week: 4, day: 1 });
});

test('next and previous stop at the course edges', () => {
  const first = { week: firstModule.id, day: firstModule.lessons[0].number };
  const second = { week: firstModule.id, day: firstModule.lessons[1].number };

  assert.deepEqual(nextLesson(first.week, first.day), second);
  assert.equal(previousLesson(first.week, first.day), null);

  const last = { week: lastModule.id, day: lastModule.lessons[lastModule.lessons.length - 1].number };
  assert.equal(nextLesson(last.week, last.day), null);
  assert.notEqual(previousLesson(last.week, last.day), null);
});

test('corrupt storage falls back to a blank course', () => {
  localStorage.setItem('sna_progress_v1', '{not json');
  assert.equal(getSummary().completed, 0);
  assert.deepEqual(getProgress(), {
    version: 1,
    lessons: {},
    experiments: {},
    lastLesson: null,
  });
});

test('reset clears lessons, experiments and the last position', () => {
  toggleLesson(1, 1);
  toggleExperiment(1);
  setLastLesson(1, 1);
  resetProgress();

  assert.equal(getSummary().completed, 0);
  assert.equal(getSummary().experimentsCompleted, 0);
  assert.equal(getLastLesson(), null);
});

test('subscribers hear updates until they unsubscribe', () => {
  let calls = 0;
  const unsubscribe = subscribeProgress(() => {
    calls += 1;
  });

  toggleLesson(3, 1);
  assert.equal(calls, 1);

  unsubscribe();
  toggleLesson(3, 2);
  assert.equal(calls, 1);
});
