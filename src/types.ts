export type TabId = 'home' | 'learn' | 'labs' | 'terminal' | 'tracker' | 'links' | 'admin';

declare global {
  interface Window {
    deferredPrompt?: unknown;
  }
}
