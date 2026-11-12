import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  INSTALL_DISMISS_KEY,
  applyPwaUpdate,
  getPwaSnapshot,
  installPromptMode,
  setPwaFlag,
  setPwaUpdateHandler,
  subscribePwa,
  themeColorFor,
} from '../src/exam/pwa';
import { manifest } from '../src/pwa/manifest';
import { parseExamHash } from '../src/exam/routing';

test('the install suggestion stays hidden once installed or dismissed', () => {
  assert.equal(installPromptMode({ standalone: true, dismissed: false, ios: true, canPrompt: true }), 'hidden');
  assert.equal(installPromptMode({ standalone: false, dismissed: true, ios: true, canPrompt: true }), 'hidden');
});

test('a captured install prompt wins over the iOS instructions', () => {
  assert.equal(installPromptMode({ standalone: false, dismissed: false, ios: false, canPrompt: true }), 'android');
  assert.equal(installPromptMode({ standalone: false, dismissed: false, ios: true, canPrompt: true }), 'android');
});

test('iOS without a native prompt gets the share-sheet instructions', () => {
  assert.equal(installPromptMode({ standalone: false, dismissed: false, ios: true, canPrompt: false }), 'ios');
});

test('desktop browsers without an install prompt see nothing', () => {
  assert.equal(installPromptMode({ standalone: false, dismissed: false, ios: false, canPrompt: false }), 'hidden');
});

test('the dismiss key is versioned so copy changes can re-offer once', () => {
  assert.match(INSTALL_DISMISS_KEY, /^sna_install_dismissed_v\d+$/);
});

test('theme colours match the canvas tokens used by the shell', () => {
  assert.equal(themeColorFor('light'), '#f2eee3');
  assert.equal(themeColorFor('dark'), '#0d0c0a');
});

test('pwa flags start clear and notify subscribers only on change', () => {
  assert.deepEqual(getPwaSnapshot(), { needRefresh: false, offlineReady: false });
  let calls = 0;
  const unsubscribe = subscribePwa(() => {
    calls += 1;
  });
  setPwaFlag('needRefresh', true);
  assert.equal(getPwaSnapshot().needRefresh, true);
  assert.equal(calls, 1);
  setPwaFlag('needRefresh', true);
  assert.equal(calls, 1);
  setPwaFlag('offlineReady', true);
  assert.equal(calls, 2);
  unsubscribe();
  setPwaFlag('needRefresh', false);
  assert.equal(calls, 2);
  assert.equal(getPwaSnapshot().needRefresh, false);
  setPwaFlag('offlineReady', false);
});

test('refreshing uses the registered update handler when one exists', () => {
  let asked = 0;
  setPwaUpdateHandler((reload) => {
    asked += 1;
    assert.equal(reload, true);
  });
  applyPwaUpdate();
  assert.equal(asked, 1);
  setPwaUpdateHandler(null);
});

test('the manifest installs as a standalone app rooted at the portal', () => {
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.id, '/');
});

test('every app-icon shortcut opens a real exam route', () => {
  assert.ok(manifest.shortcuts.length >= 3);
  const tabs = manifest.shortcuts.map((shortcut) => {
    assert.ok(shortcut.name.length > 0);
    const hash = shortcut.url.split('#')[1];
    assert.ok(hash, `${shortcut.url} carries a hash route`);
    return parseExamHash(`#${hash}`).tab;
  });
  assert.deepEqual(tabs, ['terminal', 'labs', 'day']);
});

test('manifest screenshots cover phone and desktop and exist on disk', () => {
  const forms = manifest.screenshots.map((shot) => shot.form_factor);
  assert.ok(forms.includes('narrow'));
  assert.ok(forms.includes('wide'));
  for (const shot of manifest.screenshots) {
    assert.match(shot.sizes, /^\d+x\d+$/);
    assert.equal(shot.type, 'image/png');
    const file = path.join(process.cwd(), 'public', shot.src.replace(/^\//, ''));
    assert.ok(existsSync(file), `${shot.src} exists in public/`);
  }
});
