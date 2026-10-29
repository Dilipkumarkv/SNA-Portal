const DB_NAME = 'sna_files';
const DB_VERSION = 1;
const STORE = 'files';

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('Failed to open file database:', request.error);
      resolve(null);
    };
  });

  return dbPromise;
}

function runTransaction<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) {
          resolve(null);
          return;
        }

        const tx = db.transaction(STORE, mode);
        const request = work(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.error('File database request failed:', request.error);
          resolve(null);
        };
      })
  );
}

/**
 * Persists an uploaded document outside localStorage. Returns a stable id that
 * can be stored alongside the note/lab metadata.
 */
export async function saveFile(file: File): Promise<string> {
  const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: StoredFile = { id, name: file.name, type: file.type, size: file.size, blob: file };

  const stored = await runTransaction('readwrite', (store) => store.put(record));
  if (!stored) throw new Error('Could not store the file. Browser storage is unavailable.');

  return id;
}

export async function getFile(id: string): Promise<StoredFile | null> {
  if (!id) return null;
  return (await runTransaction<StoredFile>('readonly', (store) => store.get(id))) ?? null;
}

export async function deleteFile(id: string): Promise<void> {
  if (!id) return;
  await runTransaction('readwrite', (store) => store.delete(id));
}

/**
 * Creates a temporary object URL for a stored file. The caller owns the URL and
 * must revoke it when it is no longer needed.
 */
export async function getFileObjectUrl(id: string): Promise<string | null> {
  const record = await getFile(id);
  if (!record) return null;
  return URL.createObjectURL(record.blob);
}

export async function getFileSize(id: string): Promise<number | null> {
  const record = await getFile(id);
  return record ? record.size : null;
}

/**
 * Converts a legacy base64 data URL (produced by the previous upload flow) into
 * a stored file and returns its new id. Used to migrate existing localStorage data.
 */
export async function migrateDataUrl(dataUrl: string): Promise<string | null> {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;

  const [, mimeType, base64] = match;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

  const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: StoredFile = { id, name: 'document.pdf', type: mimeType, size: bytes.length, blob: new Blob([bytes], { type: mimeType }) };

  const stored = await runTransaction('readwrite', (store) => store.put(record));
  return stored ? id : null;
}
