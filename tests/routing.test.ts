import './setup.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tabFromHash } from '../src/lib/routing.ts';

test('empty and home hashes resolve to home', () => {
  assert.equal(tabFromHash(''), 'home');
  assert.equal(tabFromHash('#home'), 'home');
  assert.equal(tabFromHash('#unknown'), 'home');
});

test('primary tabs resolve to themselves', () => {
  for (const tab of ['learn', 'labs', 'terminal', 'links'] as const) {
    assert.equal(tabFromHash(`#${tab}`), tab);
  }
});

test('nested learn routes stay in learn', () => {
  assert.equal(tabFromHash('#learn/1'), 'learn');
  assert.equal(tabFromHash('#learn/13/2'), 'learn');
  assert.equal(tabFromHash('#learn/assessment'), 'learn');
});

test('admin and its sub-views all resolve to admin', () => {
  assert.equal(tabFromHash('#admin'), 'admin');
  assert.equal(tabFromHash('#admin-notes'), 'admin');
  assert.equal(tabFromHash('#admin-labs'), 'admin');
  assert.equal(tabFromHash('#admin-cieschedule'), 'admin');
  assert.equal(tabFromHash('#admin-dashboard'), 'admin');
});

test('legacy routes fold into the current navigation', () => {
  assert.equal(tabFromHash('#notes'), 'learn');
  assert.equal(tabFromHash('#qps'), 'learn');
  assert.equal(tabFromHash('#tracker'), 'home');
});
