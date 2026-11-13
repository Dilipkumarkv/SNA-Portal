import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LAB_IDS } from '../src/exam/types.ts';
import { labsForWeek } from '../src/exam/labs.ts';

const key = 'sna_exam_state_v1';
const legacy = {
  v: 1, examDate: '2026-11-20', completedDrills: [1, 3], completedSteps: { '1': [0, 2] },
  vivaMarks: { '4': 'got' }, last48: ['tools'], project: ['report'],
  mock: { startedAt: 100, endAt: 200 }, quizSeen: [2], lastLab: 'partition',
  labsReviewed: ['rufus', 'partition', 'diskpart', 'startup'],
};
const memory = new Map<string, string>([[key, JSON.stringify(legacy)]]);
const storageListeners: ((event: { key: string | null }) => void)[] = [];
const reloadFromStorage = () => storageListeners.forEach((listener) => listener({ key }));
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key),
  },
  addEventListener: (type: string, listener: (event: { key: string | null }) => void) => {
    if (type === 'storage') storageListeners.push(listener);
  },
};

const { examActions, getSnapshot, subscribe } = await import('../src/exam/store.ts');

test('loading old v1 storage preserves all seven-era progress without migration', () => {
  assert.deepEqual(getSnapshot(), legacy);
  assert.equal(memory.get(key), JSON.stringify(legacy));
});

test('new IDs survive storage sanitation while unknown IDs and duplicates are discarded', () => {
  memory.set(key, JSON.stringify({ ...legacy, lastLab: 'vpn-compare', labsReviewed: ['partition', 'vpn-compare', 'unknown', 'ewaste-policy', 'vpn-compare'] }));
  reloadFromStorage();
  assert.equal(getSnapshot().lastLab, 'vpn-compare');
  assert.deepEqual(getSnapshot().labsReviewed, ['partition', 'vpn-compare', 'ewaste-policy']);
  assert.deepEqual(getSnapshot().completedSteps, legacy.completedSteps);
  memory.set(key, JSON.stringify({ ...legacy, lastLab: 'unknown', labsReviewed: ['unknown', 'diskpart'] }));
  reloadFromStorage();
  assert.equal(getSnapshot().lastLab, null);
  assert.deepEqual(getSnapshot().labsReviewed, ['diskpart']);
});

test('storage events preserve new and old progress and notify subscribers only for this key', () => {
  examActions.reset();
  examActions.markLabOpened('lab-energy');
  examActions.toggleLabReviewed('partition');
  examActions.toggleLabReviewed('lab-energy');
  const saved = memory.get(key)!;
  examActions.reset();
  memory.set(key, saved);
  let notifications = 0;
  const unsubscribe = subscribe(() => { notifications += 1; });
  try {
    storageListeners.forEach((listener) => listener({ key: 'unrelated' }));
    assert.equal(notifications, 0);
    assert.equal(getSnapshot().lastLab, null);
    reloadFromStorage();
    assert.equal(notifications, 1);
    assert.equal(getSnapshot().lastLab, 'lab-energy');
    assert.deepEqual(getSnapshot().labsReviewed, ['partition', 'lab-energy']);
    assert.equal(JSON.parse(memory.get(key)!).v, 1);
  } finally {
    unsubscribe();
  }
});

test('44 unique reviewed targets persist rather than counting 48 week memberships', () => {
  examActions.reset();
  for (const id of LAB_IDS) examActions.toggleLabReviewed(id);
  reloadFromStorage();
  assert.equal(getSnapshot().labsReviewed.length, 44);
  assert.deepEqual(getSnapshot().labsReviewed, [...LAB_IDS]);
  assert.ok(labsForWeek(5).some((lab) => lab.id === 'partition' && getSnapshot().labsReviewed.includes(lab.id)));
  assert.ok(labsForWeek(8).some((lab) => lab.id === 'partition' && getSnapshot().labsReviewed.includes(lab.id)));
  examActions.toggleLabReviewed('partition');
  assert.equal(getSnapshot().labsReviewed.length, 43);
  assert.ok(!getSnapshot().labsReviewed.includes('partition'));
  reloadFromStorage();
  assert.equal(getSnapshot().labsReviewed.length, 43);
});

test('opening a lab remembers where to resume', () => {
  examActions.reset();
  examActions.markLabOpened('rufus');
  assert.equal(getSnapshot().lastLab, 'rufus');
  examActions.markLabOpened('diskpart');
  assert.equal(getSnapshot().lastLab, 'diskpart');
});

test('a lab review toggles on and off without duplicates', () => {
  examActions.reset();
  examActions.toggleLabReviewed('windows');
  assert.deepEqual(getSnapshot().labsReviewed, ['windows']);
  examActions.toggleLabReviewed('windows');
  assert.deepEqual(getSnapshot().labsReviewed, []);
});

test('reset clears the resume point and reviewed labs', () => {
  examActions.markLabOpened('startup');
  examActions.toggleLabReviewed('startup');
  examActions.reset();
  assert.equal(getSnapshot().lastLab, null);
  assert.deepEqual(getSnapshot().labsReviewed, []);
});

test('lab state is written to local storage', () => {
  examActions.reset();
  examActions.markLabOpened('ubuntu');
  examActions.toggleLabReviewed('ubuntu');
  const saved = JSON.parse(memory.get('sna_exam_state_v1') ?? '{}');
  assert.equal(saved.lastLab, 'ubuntu');
  assert.deepEqual(saved.labsReviewed, ['ubuntu']);
});
