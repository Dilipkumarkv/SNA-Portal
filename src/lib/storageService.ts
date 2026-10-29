import { deleteFile, migrateDataUrl } from './fileStore';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  urgent: boolean;
  createdAt: string;
}

export interface CieItem {
  id: string;
  label: string;
  badge: string;
  pct: number | string;
  col: 'indigo' | 'slate' | 'amber';
  createdAt: string;
}

export interface DynamicNote {
  id: string;
  week: number;
  title: string;
  fileId?: string;
  custom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicLab {
  _docId: string;
  id: number;
  week: number;
  title: string;
  desc: string;
  steps: string[];
  links: string[];
  fileId?: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  type: 'comment' | 'issue';
  message: string;
  status: 'new' | 'reviewed';
  createdAt: string;
}

// Local Storage Keys
const KEYS = {
  ANNOUNCEMENTS: 'sna_announcements_v1',
  CIE_SCHEDULE: 'sna_cie_schedule_v1',
  NOTES: 'sna_notes_v1',
  LABS: 'sna_labs_v1',
  FEEDBACK: 'sna_feedback_v1',
};

// Event dispatch for reactivity across components
const dispatchUpdate = (key: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sna_store_update', { detail: { key } }));
  }
};

// Initialize default seed data if first time running
export async function initStorage() {
  if (typeof window === 'undefined') return;

  // Initialize Default Announcements
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    const defaultAnnouncements: Announcement[] = [
      {
        id: 'ann_1',
        title: 'Welcome to Even Semester 2025-26',
        message: 'System and Network Administration classes commenced. Complete your Week 1 Hardware and Safety lab manual verification.',
        urgent: false,
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(defaultAnnouncements));
  }

  // Initialize Default CIE Schedule
  if (!localStorage.getItem(KEYS.CIE_SCHEDULE)) {
    const defaultCie: CieItem[] = [
      { id: 'cie_1', label: 'CIE-1: Theory (Wk 1-4)', badge: 'Wk 4 | 50M', pct: '100', col: 'indigo', createdAt: new Date().toISOString() },
      { id: 'cie_2', label: 'CIE-2: Practice (Wk 5-7)', badge: 'Wk 7 | 50M', pct: '25', col: 'slate', createdAt: new Date().toISOString() },
      { id: 'cie_3', label: 'CIE-3: Theory (Wk 8-10)', badge: 'Wk 10 | 50M', pct: '0', col: 'slate', createdAt: new Date().toISOString() },
      { id: 'cie_4', label: 'CIE-4: Practice (Wk 11-13)', badge: 'Wk 13 | 50M', pct: '0', col: 'slate', createdAt: new Date().toISOString() },
      { id: 'cie_5', label: 'CIE-5: Portfolio + Project', badge: 'Wk 1-13 | 50M', pct: '45', col: 'amber', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(KEYS.CIE_SCHEDULE, JSON.stringify(defaultCie));
  }
  await migrateLegacyAttachments();
}

// Auto-run init once
if (typeof window !== 'undefined') {
  initStorage();
}

// ----------------- Student Management -----------------

/**
 * Older builds stored uploaded PDFs as base64 data URLs inside localStorage.
 * Move any that are still present into the file database so they stop
 * consuming the (much smaller) localStorage quota.
 */
async function migrateLegacyAttachments() {
  const legacyKey = 'sna_legacy_files_migrated';
  if (localStorage.getItem(legacyKey)) return;

  const migrate = async (storageKey: string) => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    let items: any[];
    try {
      items = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(items)) return;

    let changed = false;
    for (const item of items) {
      const value = item?.fileUrl;
      if (typeof value === 'string' && value.startsWith('data:')) {
        const fileId = await migrateDataUrl(value);
        if (fileId) {
          item.fileId = fileId;
          delete item.fileUrl;
          changed = true;
        }
      }
    }

    if (changed) localStorage.setItem(storageKey, JSON.stringify(items));
  };

  await migrate(KEYS.NOTES);
  await migrate(KEYS.LABS);
  localStorage.setItem(legacyKey, '1');
}

// ----------------- Announcements -----------------
export function getAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(KEYS.ANNOUNCEMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addAnnouncement(data: { title: string; message: string; urgent?: boolean }): Announcement {
  const items = getAnnouncements();
  const newItem: Announcement = {
    id: `ann_${Date.now()}`,
    title: data.title.trim(),
    message: data.message.trim(),
    urgent: !!data.urgent,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(items));
  dispatchUpdate(KEYS.ANNOUNCEMENTS);
  return newItem;
}

export function deleteAnnouncement(id: string): void {
  const items = getAnnouncements().filter(i => i.id !== id);
  localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(items));
  dispatchUpdate(KEYS.ANNOUNCEMENTS);
}

export function subscribeAnnouncements(callback: (items: Announcement[]) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (!custom.detail || custom.detail.key === KEYS.ANNOUNCEMENTS) {
      callback(getAnnouncements());
    }
  };

  callback(getAnnouncements());
  window.addEventListener('sna_store_update', handler);
  return () => window.removeEventListener('sna_store_update', handler);
}

// ----------------- CIE Schedule -----------------
export function getCieSchedule(): CieItem[] {
  try {
    const raw = localStorage.getItem(KEYS.CIE_SCHEDULE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCieItem(data: { label: string; badge: string; pct: number | string; col: 'indigo' | 'slate' | 'amber' }): CieItem {
  const items = getCieSchedule();
  const newItem: CieItem = {
    id: `cie_${Date.now()}`,
    label: data.label.trim(),
    badge: data.badge.trim(),
    pct: data.pct,
    col: data.col,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  localStorage.setItem(KEYS.CIE_SCHEDULE, JSON.stringify(items));
  dispatchUpdate(KEYS.CIE_SCHEDULE);
  return newItem;
}

export function deleteCieItem(id: string): void {
  const items = getCieSchedule().filter(i => i.id !== id);
  localStorage.setItem(KEYS.CIE_SCHEDULE, JSON.stringify(items));
  dispatchUpdate(KEYS.CIE_SCHEDULE);
}

export function subscribeCieSchedule(callback: (items: CieItem[]) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (!custom.detail || custom.detail.key === KEYS.CIE_SCHEDULE) {
      callback(getCieSchedule());
    }
  };

  callback(getCieSchedule());
  window.addEventListener('sna_store_update', handler);
  return () => window.removeEventListener('sna_store_update', handler);
}

// ----------------- Dynamic Notes -----------------
export function getDynamicNotes(): DynamicNote[] {
  try {
    const raw = localStorage.getItem(KEYS.NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDynamicNote(data: { week: number; title: string; fileId?: string; custom?: string }): DynamicNote {
  const items = getDynamicNotes();
  const newItem: DynamicNote = {
    id: `note_${Date.now()}`,
    week: data.week,
    title: data.title,
    fileId: data.fileId,
    custom: data.custom,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  localStorage.setItem(KEYS.NOTES, JSON.stringify(items));
  dispatchUpdate(KEYS.NOTES);
  return newItem;
}

export function deleteDynamicNote(id: string): void {
  const target = getDynamicNotes().find(i => i.id === id);
  if (target?.fileId) deleteFile(target.fileId);
  const items = getDynamicNotes().filter(i => i.id !== id);
  localStorage.setItem(KEYS.NOTES, JSON.stringify(items));
  dispatchUpdate(KEYS.NOTES);
}

export function subscribeNotes(callback: (items: DynamicNote[]) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (!custom.detail || custom.detail.key === KEYS.NOTES) {
      callback(getDynamicNotes());
    }
  };

  callback(getDynamicNotes());
  window.addEventListener('sna_store_update', handler);
  return () => window.removeEventListener('sna_store_update', handler);
}

// ----------------- Dynamic Labs -----------------
export function getDynamicLabs(): DynamicLab[] {
  try {
    const raw = localStorage.getItem(KEYS.LABS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDynamicLab(data: {
  week: number;
  title: string;
  objective: string;
  tasks?: string[];
  links?: string[];
  fileId?: string;
}): DynamicLab {
  const items = getDynamicLabs();
  const newItem: DynamicLab = {
    _docId: `lab_${Date.now()}`,
    id: data.week,
    week: data.week,
    title: data.title,
    desc: data.objective,
    steps: data.tasks || [],
    links: data.links || [],
    fileId: data.fileId,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  localStorage.setItem(KEYS.LABS, JSON.stringify(items));
  dispatchUpdate(KEYS.LABS);
  return newItem;
}

export function deleteDynamicLab(docId: string): void {
  const target = getDynamicLabs().find(i => i._docId === docId);
  if (target?.fileId) deleteFile(target.fileId);
  const items = getDynamicLabs().filter(i => i._docId !== docId);
  localStorage.setItem(KEYS.LABS, JSON.stringify(items));
  dispatchUpdate(KEYS.LABS);
}

export function subscribeLabs(callback: (items: DynamicLab[]) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (!custom.detail || custom.detail.key === KEYS.LABS) {
      callback(getDynamicLabs());
    }
  };

  callback(getDynamicLabs());
  window.addEventListener('sna_store_update', handler);
  return () => window.removeEventListener('sna_store_update', handler);
}

// ----------------- Feedback -----------------
export function addFeedback(data: { type: 'comment' | 'issue'; message: string }): FeedbackItem {
  const raw = localStorage.getItem(KEYS.FEEDBACK);
  const items: FeedbackItem[] = raw ? JSON.parse(raw) : [];
  const newItem: FeedbackItem = {
    id: `fb_${Date.now()}`,
    type: data.type,
    message: data.message.trim(),
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(items));
  return newItem;
}

export function getFeedbacks(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(KEYS.FEEDBACK);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
