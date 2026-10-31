import type { TabId } from '../types';

const PRIMARY_TABS: TabId[] = ['home', 'learn', 'labs', 'terminal', 'links'];

export function tabFromHash(rawHash: string): TabId | 'admin' {
  const hash = rawHash.replace('#', '');
  if (hash === 'admin' || hash.startsWith('admin-')) return 'admin';
  if (hash === 'learn' || hash.startsWith('learn/')) return 'learn';
  if (PRIMARY_TABS.includes(hash as TabId)) return hash as TabId;
  // #notes, #qps and #tracker predate this navigation; fold them into the app.
  if (hash === 'notes' || hash === 'qps') return 'learn';
  return 'home';
}
