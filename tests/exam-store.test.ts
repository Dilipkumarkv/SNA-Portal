import { test } from 'node:test';
import assert from 'node:assert/strict';

const memory = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key),
  },
  addEventListener: () => {},
};

const { examActions, getSnapshot } = await import('../src/exam/store.ts');

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
