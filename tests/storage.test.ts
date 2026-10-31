import './setup.ts';
import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addAnnouncement,
  addCieItem,
  addDynamicLab,
  addDynamicNote,
  addFeedback,
  deleteAnnouncement,
  deleteCieItem,
  deleteDynamicLab,
  deleteDynamicNote,
  getAnnouncements,
  getCieSchedule,
  getDynamicLabs,
  getDynamicNotes,
  getFeedbacks,
  initStorage,
  subscribeAnnouncements,
} from '../src/lib/storageService.ts';

beforeEach(() => {
  localStorage.clear();
});

test('announcements are trimmed, prepended and removable', () => {
  const first = addAnnouncement({ title: '  Lab moved  ', message: '  Room 12  ' });
  const second = addAnnouncement({ title: 'Test on Friday', message: 'CIE-2', urgent: true });

  assert.equal(first.title, 'Lab moved');
  assert.equal(first.message, 'Room 12');
  assert.equal(first.urgent, false);
  assert.equal(second.urgent, true);

  const items = getAnnouncements();
  assert.deepEqual(items.map(item => item.title), ['Test on Friday', 'Lab moved']);

  deleteAnnouncement(first.id);
  assert.deepEqual(getAnnouncements().map(item => item.title), ['Test on Friday']);
});

test('announcement subscribers receive the current list and later changes', () => {
  let latest = -1;
  const unsubscribe = subscribeAnnouncements(items => {
    latest = items.length;
  });

  assert.equal(latest, 0);
  addAnnouncement({ title: 'One', message: 'First' });
  assert.equal(latest, 1);
  addAnnouncement({ title: 'Two', message: 'Second' });
  assert.equal(latest, 2);

  unsubscribe();
  addAnnouncement({ title: 'Three', message: 'Third' });
  assert.equal(latest, 2);
});

test('CIE items keep their insertion order and trim labels', () => {
  const first = addCieItem({ label: ' CIE-1 ', badge: ' Wk 4 ', pct: 100, col: 'indigo' });
  addCieItem({ label: 'CIE-2', badge: 'Wk 7', pct: '25', col: 'slate' });

  assert.equal(first.label, 'CIE-1');
  assert.equal(first.badge, 'Wk 4');
  assert.deepEqual(getCieSchedule().map(item => item.label), ['CIE-1', 'CIE-2']);

  deleteCieItem(first.id);
  assert.deepEqual(getCieSchedule().map(item => item.label), ['CIE-2']);
});

test('uploaded labs default to empty task and link lists', () => {
  const lab = addDynamicLab({ week: 3, title: 'Wiring practice', objective: 'Terminate a cable' });

  assert.equal(lab.id, 3);
  assert.equal(lab.week, 3);
  assert.equal(lab.desc, 'Terminate a cable');
  assert.deepEqual(lab.steps, []);
  assert.deepEqual(lab.links, []);
  assert.equal(getDynamicLabs().length, 1);

  deleteDynamicLab(lab._docId);
  assert.deepEqual(getDynamicLabs(), []);
});

test('notes keep the week and optional body', () => {
  const note = addDynamicNote({ week: 2, title: 'Handout', custom: 'Read section 2.1' });
  assert.equal(note.week, 2);
  assert.equal(note.custom, 'Read section 2.1');
  assert.equal(getDynamicNotes().length, 1);

  deleteDynamicNote(note.id);
  assert.deepEqual(getDynamicNotes(), []);
});

test('feedback is stored newest first and starts unreviewed', () => {
  addFeedback({ type: 'comment', message: '  Nice lessons  ' });
  addFeedback({ type: 'issue', message: 'Download failed' });

  const items = getFeedbacks();
  assert.deepEqual(items.map(item => item.message), ['Download failed', 'Nice lessons']);
  assert.equal(items[0].type, 'issue');
  assert.equal(items[0].status, 'new');
});

test('corrupt collections read as empty rather than throwing', () => {
  localStorage.setItem('sna_notes_v1', 'not json');
  localStorage.setItem('sna_feedback_v1', '[] broken');
  assert.deepEqual(getDynamicNotes(), []);
  assert.deepEqual(getFeedbacks(), []);
});

test('collections are written with their schema version', () => {
  addAnnouncement({ title: 'Versioned', message: 'Body' });
  const stored = JSON.parse(localStorage.getItem('sna_announcements_v1') ?? '{}');
  assert.equal(stored.v, 2);
  assert.equal(stored.items.length, 1);
  assert.equal(stored.items[0].title, 'Versioned');
});

test('legacy plain arrays are still readable', () => {
  const legacyNote = {
    id: 'note_legacy',
    week: 3,
    title: 'Old handout',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  localStorage.setItem('sna_notes_v1', JSON.stringify([legacyNote]));

  assert.deepEqual(getDynamicNotes(), [legacyNote]);
});

test('rows that no longer match the schema are dropped', () => {
  localStorage.setItem(
    'sna_announcements_v1',
    JSON.stringify([
      { id: 'ann_ok', title: 'Kept', message: 'Valid row', urgent: false, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 7, title: 'Broken' },
    ])
  );

  assert.deepEqual(getAnnouncements().map(item => item.id), ['ann_ok']);
});

test('init migrates legacy arrays into the versioned envelope', async () => {
  const legacyNote = {
    id: 'note_legacy',
    week: 2,
    title: 'Before upgrade',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  localStorage.setItem('sna_notes_v1', JSON.stringify([legacyNote]));

  await initStorage();

  const stored = JSON.parse(localStorage.getItem('sna_notes_v1') ?? '{}');
  assert.equal(stored.v, 2);
  assert.deepEqual(stored.items, [legacyNote]);
});
