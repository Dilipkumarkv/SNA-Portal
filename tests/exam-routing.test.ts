import { test } from 'node:test';
import assert from 'node:assert/strict';
import { examHash, labHash, parseExamHash } from '../src/exam/routing.ts';
import { LAB_IDS } from '../src/exam/types.ts';

test('an empty hash opens the machine at the back panel', () => {
  assert.deepEqual(parseExamHash(''), { tab: 'machine', view: 'back', lab: null });
  assert.deepEqual(parseExamHash('#'), { tab: 'machine', view: 'back', lab: null });
  assert.deepEqual(parseExamHash('#machine'), { tab: 'machine', view: 'back', lab: null });
});

test('every machine view parses', () => {
  for (const view of ['back', 'front', 'cables', 'board', 'parts'] as const) {
    assert.deepEqual(parseExamHash(`#machine/${view}`), { tab: 'machine', view, lab: null });
  }
});

test('an unknown machine view falls back to the back panel', () => {
  assert.deepEqual(parseExamHash('#machine/ports'), { tab: 'machine', view: 'back', lab: null });
  assert.deepEqual(parseExamHash('#machine/back/extra'), { tab: 'machine', view: 'back', lab: null });
});

test('the other tabs carry no view or lab', () => {
  assert.deepEqual(parseExamHash('#day'), { tab: 'day', view: null, lab: null });
  assert.deepEqual(parseExamHash('#project'), { tab: 'project', view: null, lab: null });
  assert.deepEqual(parseExamHash('#terminal'), { tab: 'terminal', view: null, lab: null });
});

test('the labs tab opens its index and every lab card', () => {
  assert.deepEqual(parseExamHash('#labs'), { tab: 'labs', view: null, lab: null });
  for (const lab of LAB_IDS) {
    assert.deepEqual(parseExamHash(`#labs/${lab}`), { tab: 'labs', view: null, lab });
  }
});

test('an unknown lab falls back to the labs index', () => {
  assert.deepEqual(parseExamHash('#labs/ports'), { tab: 'labs', view: null, lab: null });
  assert.deepEqual(parseExamHash('#labs/ports/extra'), { tab: 'labs', view: null, lab: null });
  assert.deepEqual(parseExamHash('#labs/rufus/extra'), { tab: 'labs', view: null, lab: 'rufus' });
});

test('retired and unknown hashes open the machine guide', () => {
  assert.deepEqual(parseExamHash('#plan'), { tab: 'machine', view: 'back', lab: null });
  assert.deepEqual(parseExamHash('#drills/3'), { tab: 'machine', view: 'back', lab: null });
  assert.deepEqual(parseExamHash('#nonsense'), { tab: 'machine', view: 'back', lab: null });
});

test('hash building round-trips through the parser', () => {
  assert.equal(examHash('machine', 'cables'), '#machine/cables');
  assert.equal(examHash('machine'), '#machine');
  assert.equal(examHash('day'), '#day');
  assert.equal(labHash(), '#labs');
  assert.equal(labHash('diskpart'), '#labs/diskpart');

  assert.deepEqual(parseExamHash(examHash('machine', 'board')), { tab: 'machine', view: 'board', lab: null });
  assert.deepEqual(parseExamHash(examHash('terminal')), { tab: 'terminal', view: null, lab: null });
  assert.deepEqual(parseExamHash(labHash('restore')), { tab: 'labs', view: null, lab: 'restore' });
});
