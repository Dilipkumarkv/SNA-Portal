import { test } from 'node:test';
import assert from 'node:assert/strict';
import { examHash, labHash, parseExamHash } from '../src/exam/routing.ts';
import { LAB_IDS } from '../src/exam/types.ts';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LabsScreen } from '../src/exam/components/LabsScreen.tsx';
import { examActions } from '../src/exam/store.ts';

function renderLabs(hash: string) {
  const route = parseExamHash(hash);
  return renderToStaticMarkup(createElement(LabsScreen, {
    lab: route.lab,
    week: route.week,
    onOpenDay: () => {},
  }));
}

function labLinks(html: string) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => ({
    href: match[1],
    text: match[2].replace(/<[^>]*>/g, ''),
  }));
}

test('a week deep link selects its filter and excludes other week cards', () => {
  const html = renderLabs('#labs?week=6');
  assert.match(html, /<h1[^>]*>Week 6\.<\/h1>/);
  assert.match(html, /href="#labs\?week=6"[^>]*aria-current="true"/);
  const links = labLinks(html);
  assert.ok(links.some((link) => link.href === '#labs/diskpart?week=6'));
  assert.ok(!links.some((link) => link.href.startsWith('#labs/rufus')));
});

test('card back and next links retain first, middle and last week positions', () => {
  for (const [hash, back, next] of [
    ['#labs/rufus?week=5', '#labs?week=5', '#labs/partition?week=5'],
    ['#labs/partition?week=5', '#labs?week=5', '#labs/windows?week=5'],
    ['#labs/ubuntu?week=5', '#labs?week=5', null],
    ['#labs/diskpart?week=6', '#labs?week=6', null],
    ['#labs/restore?week=7', '#labs?week=7', '#labs/startup?week=7'],
    ['#labs/partition?week=8', '#labs?week=8', '#labs/partition-style?week=8'],
    ['#labs/restore?week=8', '#labs?week=8', '#labs/app-reinstall?week=8'],
    ['#labs/windows-update?week=8', '#labs?week=8', null],
    ['#labs/startup?week=9', '#labs?week=9', '#labs/services?week=9'],
    ['#labs/system-integrity?week=9', '#labs?week=9', null],
    ['#labs/remote-desktop?week=10', '#labs?week=10', null],
    ['#labs/vpn-compare?week=11', '#labs?week=11', null],
    ['#labs/ewaste-policy?week=12', '#labs?week=12', '#labs/ewaste-classify?week=12'],
    ['#labs/lab-energy?week=12', '#labs?week=12', null],
    ['#labs/ubuntu', '#labs', '#labs/diskpart'],
    ['#labs/lab-energy', '#labs', null],
  ] as const) {
    const links = labLinks(renderLabs(hash));
    assert.ok(links.some((link) => link.href === back), `${hash}: back link`);
    const nextLink = links.find((link) => link.text.startsWith('Next:'));
    assert.equal(nextLink?.href ?? null, next, `${hash}: next link`);
    if (next === null) assert.equal(links.filter((link) => link.href === back).length, 2);
  }
});

test('shared cards use contextual numbering and next order without changing All numbering', () => {
  const scoped = renderLabs('#labs/partition?week=8');
  assert.match(scoped, />08\.1<\/span>/);
  assert.ok(labLinks(scoped).some((link) => link.href === '#labs/partition-style?week=8'));
  assert.match(renderLabs('#labs/partition'), />05\.2<\/span>/);
  const all = labLinks(renderLabs('#labs')).filter((link) => link.href === '#labs/partition');
  assert.equal(all.length, 2);
  assert.ok(all.every((link) => link.text.includes('05.2')));
});

test('Resume discards the filter and shared listings count one reviewed card', (context) => {
  examActions.reset();
  context.after(() => examActions.reset());
  examActions.markLabOpened('partition');
  examActions.toggleLabReviewed('partition');
  const scoped = labLinks(renderLabs('#labs?week=8'));
  assert.ok(scoped.some((link) => link.href === '#labs/partition' && link.text === 'Revisit'));
  const all = renderLabs('#labs');
  assert.match(all, />1<\/span> reviewed/);
  const listings = labLinks(all).filter((link) => link.href === '#labs/partition' && link.text.includes('05.2'));
  assert.equal(listings.length, 2);
  assert.ok(listings.every((link) => link.text.includes('Reviewed')));
});

test('card metadata renders prerequisites, verification and distinct source evidence as text', () => {
  const html = renderLabs('#labs/partition');
  for (const heading of ['Before you begin', 'Expected verification', 'Sources']) {
    assert.ok(new RegExp(`<h2[^>]*>${heading}</h2>`).test(html), heading);
  }
  assert.match(html, /Ex\. 20 · p\. 20/);
  assert.doesNotMatch(html, /<(iframe|embed|object)\b/);
});

test('week context survives index and member-card links', () => {
  assert.deepEqual(parseExamHash('#labs?week=8'), { tab: 'labs', view: null, lab: null, week: 8 });
  assert.deepEqual(parseExamHash('#labs/partition?week=8'), { tab: 'labs', view: null, lab: 'partition', week: 8 });
  assert.equal(labHash(null, 8), '#labs?week=8');
  assert.equal(labHash('partition', 8), '#labs/partition?week=8');
});

test('invalid weeks and nonmember contexts fall back without losing the card', () => {
  for (const week of ['4', '13', '8.5', '08', '8x', '', '-8']) {
    assert.deepEqual(parseExamHash(`#labs/partition?week=${week}`), { tab: 'labs', view: null, lab: 'partition', week: null });
  }
  assert.deepEqual(parseExamHash('#labs/rufus?week=8'), { tab: 'labs', view: null, lab: 'rufus', week: null });
  assert.deepEqual(parseExamHash('#labs/missing?week=8'), { tab: 'labs', view: null, lab: null, week: 8 });
  assert.deepEqual(parseExamHash('#terminal?week=8'), { tab: 'terminal', view: null, lab: null, week: null });
});

test('an empty hash opens the machine at the back panel', () => {
  assert.deepEqual(parseExamHash(''), { tab: 'machine', view: 'back', lab: null, week: null });
  assert.deepEqual(parseExamHash('#'), { tab: 'machine', view: 'back', lab: null, week: null });
  assert.deepEqual(parseExamHash('#machine'), { tab: 'machine', view: 'back', lab: null, week: null });
});

test('every machine view parses', () => {
  for (const view of ['back', 'front', 'cables', 'board', 'parts'] as const) {
    assert.deepEqual(parseExamHash(`#machine/${view}`), { tab: 'machine', view, lab: null, week: null });
  }
});

test('an unknown machine view falls back to the back panel', () => {
  assert.deepEqual(parseExamHash('#machine/ports'), { tab: 'machine', view: 'back', lab: null, week: null });
  assert.deepEqual(parseExamHash('#machine/back/extra'), { tab: 'machine', view: 'back', lab: null, week: null });
});

test('the other tabs carry no view or lab', () => {
  assert.deepEqual(parseExamHash('#day'), { tab: 'day', view: null, lab: null, week: null });
  assert.deepEqual(parseExamHash('#project'), { tab: 'project', view: null, lab: null, week: null });
  assert.deepEqual(parseExamHash('#terminal'), { tab: 'terminal', view: null, lab: null, week: null });
});

test('the labs tab opens its index and every lab card', () => {
  assert.deepEqual(parseExamHash('#labs'), { tab: 'labs', view: null, lab: null, week: null });
  for (const lab of LAB_IDS) {
    assert.deepEqual(parseExamHash(`#labs/${lab}`), { tab: 'labs', view: null, lab, week: null });
  }
});

test('an unknown lab falls back to the labs index', () => {
  assert.deepEqual(parseExamHash('#labs/ports'), { tab: 'labs', view: null, lab: null, week: null });
  assert.deepEqual(parseExamHash('#labs/ports/extra'), { tab: 'labs', view: null, lab: null, week: null });
  assert.deepEqual(parseExamHash('#labs/rufus/extra'), { tab: 'labs', view: null, lab: 'rufus', week: null });
});

test('retired and unknown hashes open the machine guide', () => {
  assert.deepEqual(parseExamHash('#plan'), { tab: 'machine', view: 'back', lab: null, week: null });
  assert.deepEqual(parseExamHash('#drills/3'), { tab: 'machine', view: 'back', lab: null, week: null });
  assert.deepEqual(parseExamHash('#nonsense'), { tab: 'machine', view: 'back', lab: null, week: null });
});

test('hash building round-trips through the parser', () => {
  assert.equal(examHash('machine', 'cables'), '#machine/cables');
  assert.equal(examHash('machine'), '#machine');
  assert.equal(examHash('day'), '#day');
  assert.equal(labHash(), '#labs');
  assert.equal(labHash('diskpart'), '#labs/diskpart');

  assert.deepEqual(parseExamHash(examHash('machine', 'board')), { tab: 'machine', view: 'board', lab: null, week: null });
  assert.deepEqual(parseExamHash(examHash('terminal')), { tab: 'terminal', view: null, lab: null, week: null });
  assert.deepEqual(parseExamHash(labHash('restore')), { tab: 'labs', view: null, lab: 'restore', week: null });
});

test('the resume panel labels its all-weeks count so it cannot be read as the week count', () => {
  examActions.reset();
  try {
    examActions.markLabOpened('partition');
    const html = renderLabs('#labs?week=8');
    assert.match(html, /of 44 labs reviewed overall/, 'the global count must say it is overall, not week-scoped');
  } finally {
    examActions.reset();
  }
});
