import { test } from 'node:test';
import assert from 'node:assert/strict';
import { examHash, parseExamHash } from '../src/exam/routing.ts';

test('an empty hash opens the machine at the back panel', () => {
  assert.deepEqual(parseExamHash(''), { tab: 'machine', view: 'back' });
  assert.deepEqual(parseExamHash('#'), { tab: 'machine', view: 'back' });
  assert.deepEqual(parseExamHash('#machine'), { tab: 'machine', view: 'back' });
});

test('every machine view parses', () => {
  for (const view of ['back', 'front', 'cables', 'board', 'parts'] as const) {
    assert.deepEqual(parseExamHash(`#machine/${view}`), { tab: 'machine', view });
  }
});

test('an unknown machine view falls back to the back panel', () => {
  assert.deepEqual(parseExamHash('#machine/ports'), { tab: 'machine', view: 'back' });
  assert.deepEqual(parseExamHash('#machine/back/extra'), { tab: 'machine', view: 'back' });
});

test('the other tabs carry no view', () => {
  assert.deepEqual(parseExamHash('#day'), { tab: 'day', view: null });
  assert.deepEqual(parseExamHash('#project'), { tab: 'project', view: null });
  assert.deepEqual(parseExamHash('#terminal'), { tab: 'terminal', view: null });
});

test('retired and unknown hashes open the machine guide', () => {
  assert.deepEqual(parseExamHash('#plan'), { tab: 'machine', view: 'back' });
  assert.deepEqual(parseExamHash('#drills/3'), { tab: 'machine', view: 'back' });
  assert.deepEqual(parseExamHash('#nonsense'), { tab: 'machine', view: 'back' });
});

test('hash building round-trips through the parser', () => {
  assert.equal(examHash('machine', 'cables'), '#machine/cables');
  assert.equal(examHash('machine'), '#machine');
  assert.equal(examHash('day'), '#day');

  assert.deepEqual(parseExamHash(examHash('machine', 'board')), { tab: 'machine', view: 'board' });
  assert.deepEqual(parseExamHash(examHash('terminal')), { tab: 'terminal', view: null });
});
