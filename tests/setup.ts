// Minimal browser shim for the localStorage-backed stores. Node has Event and
// CustomEvent, but no Storage or window, so the app modules would throw on import.

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
}

const storage = new MemoryStorage();
const windowShim = Object.assign(new EventTarget(), { localStorage: storage });

Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
Object.defineProperty(globalThis, 'window', { value: windowShim, configurable: true });

export { storage };
