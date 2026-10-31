import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LABS, LAB_WEEKS, labBySlug, labsForWeek } from '../src/exam/labs.ts';
import { LAB_IDS, type LabId } from '../src/exam/types.ts';

test('the seven labs match the routed ids in order', () => {
  assert.equal(LABS.length, 7);
  assert.deepEqual(
    LABS.map((lab) => lab.id),
    [...LAB_IDS],
  );
});

test('weeks group the labs 4 / 1 / 2 and every lab belongs to a listed week', () => {
  assert.deepEqual(
    LAB_WEEKS.map((meta) => meta.week),
    [5, 6, 7],
  );
  assert.deepEqual(
    LAB_WEEKS.map((meta) => labsForWeek(meta.week).length),
    [4, 1, 2],
  );
  for (const lab of LABS) {
    assert.ok(
      LAB_WEEKS.some((meta) => meta.week === lab.week),
      `${lab.id} has week ${lab.week}`,
    );
  }
});

test('every lab carries the content a card needs', () => {
  for (const lab of LABS) {
    assert.match(lab.number, /^0\d\.\d$/, `${lab.id} number`);
    for (const field of [
      'eyebrow',
      'title',
      'aim',
      'tool',
      'thumbLabel',
      'screenNote',
      'caution',
      'wrong',
      'examLabel',
    ] as const) {
      assert.ok(lab[field].trim().length > 0, `${lab.id} ${field}`);
    }
    assert.ok(lab.minutes > 0, `${lab.id} minutes`);
    assert.ok(lab.steps.length >= 5, `${lab.id} steps`);
    assert.ok(lab.record.length > 0, `${lab.id} record`);
    assert.ok(lab.check.q.length > 0 && lab.check.a.length > 0, `${lab.id} self-check`);
    assert.ok(lab.ask.q.length > 0 && lab.ask.a.length > 0, `${lab.id} examiner question`);
  }
});

test('every screen guide numbers its points from one without gaps', () => {
  for (const lab of LABS) {
    assert.ok(lab.points.length >= 3, `${lab.id} has points`);
    assert.deepEqual(
      lab.points.map((point) => point.n),
      lab.points.map((_, index) => index + 1),
      lab.id,
    );
    for (const point of lab.points) {
      assert.ok(point.name.trim().length > 0, `${lab.id} point ${point.n} name`);
      assert.ok(point.detail.trim().length > 0, `${lab.id} point ${point.n} detail`);
    }
  }
});

test('lookup helpers resolve every id and filter by week', () => {
  for (const id of LAB_IDS) {
    assert.equal(labBySlug(id)?.id, id);
  }
  assert.equal(labBySlug('ports' as LabId), undefined);
  assert.deepEqual(
    labsForWeek(6).map((lab) => lab.id),
    ['diskpart'],
  );
});
