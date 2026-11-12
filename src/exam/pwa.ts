import { Capacitor } from '@capacitor/core';

export const INSTALL_DISMISS_KEY = 'sna_install_dismissed_v1';

export interface InstallEnvironment {
  standalone: boolean;
  dismissed: boolean;
  ios: boolean;
  canPrompt: boolean;
}

export type InstallPromptMode = 'hidden' | 'ios' | 'android';

export function installPromptMode(env: InstallEnvironment): InstallPromptMode {
  if (env.standalone || env.dismissed) return 'hidden';
  if (env.canPrompt) return 'android';
  if (env.ios) return 'ios';
  return 'hidden';
}

export function themeColorFor(theme: 'light' | 'dark'): string {
  return theme === 'dark' ? '#0d0c0a' : '#f2eee3';
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export interface PwaSnapshot {
  needRefresh: boolean;
  offlineReady: boolean;
}

let snapshot: PwaSnapshot = { needRefresh: false, offlineReady: false };
const listeners = new Set<() => void>();

export function getPwaSnapshot(): PwaSnapshot {
  return snapshot;
}

export function subscribePwa(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setPwaFlag(flag: keyof PwaSnapshot, value: boolean): void {
  if (snapshot[flag] === value) return;
  snapshot = { ...snapshot, [flag]: value };
  listeners.forEach((listener) => listener());
}

type UpdateHandler = (reloadPage?: boolean) => void;
let updateHandler: UpdateHandler | null = null;

export function setPwaUpdateHandler(handler: UpdateHandler | null): void {
  updateHandler = handler;
}

export function applyPwaUpdate(): void {
  if (updateHandler) updateHandler(true);
  else if (typeof window !== 'undefined') window.location.reload();
}

export function requestPersistentStorage(): void {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return;
  void navigator.storage.persist().catch(() => {});
}
