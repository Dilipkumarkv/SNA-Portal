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

const COLLECTION_VERSION = 2;

interface CollectionEnvelope<T> {
  v: number;
  items: T[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

const isOptionalString = (value: unknown) => value === undefined || isString(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

export const isAnnouncement = (value: unknown): value is Announcement =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.title) &&
  isString(value.message) &&
  typeof value.urgent === 'boolean' &&
  isString(value.createdAt);

export const isCieItem = (value: unknown): value is CieItem =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.label) &&
  isString(value.badge) &&
  (typeof value.pct === 'number' || isString(value.pct)) &&
  (value.col === 'indigo' || value.col === 'slate' || value.col === 'amber') &&
  isString(value.createdAt);

export const isDynamicNote = (value: unknown): value is DynamicNote =>
  isRecord(value) &&
  isString(value.id) &&
  typeof value.week === 'number' &&
  isString(value.title) &&
  isOptionalString(value.fileId) &&
  isOptionalString(value.custom) &&
  isString(value.createdAt) &&
  isString(value.updatedAt);

export const isDynamicLab = (value: unknown): value is DynamicLab =>
  isRecord(value) &&
  isString(value._docId) &&
  typeof value.id === 'number' &&
  typeof value.week === 'number' &&
  isString(value.title) &&
  isString(value.desc) &&
  isStringArray(value.steps) &&
  isStringArray(value.links) &&
  isOptionalString(value.fileId) &&
  isString(value.createdAt);

export const isFeedbackItem = (value: unknown): value is FeedbackItem =>
  isRecord(value) &&
  isString(value.id) &&
  (value.type === 'comment' || value.type === 'issue') &&
  isString(value.message) &&
  (value.status === 'new' || value.status === 'reviewed') &&
  isString(value.createdAt);

/** Items in either the current envelope or the pre-v2 plain array. */
export function readRawItems(key: string): unknown[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (isRecord(parsed) && Array.isArray(parsed.items)) {
      return parsed.items;
    }
    return [];
  } catch {
    return [];
  }
}

export function readCollection<T>(key: string, isValid: (value: unknown) => value is T): T[] {
  return readRawItems(key).filter(isValid);
}

export function writeCollection<T>(key: string, items: T[]): void {
  const envelope: CollectionEnvelope<T> = { v: COLLECTION_VERSION, items };
  localStorage.setItem(key, JSON.stringify(envelope));
}

/** Rewrites a legacy plain array into the current envelope, dropping invalid rows. */
export function migrateCollection<T>(key: string, isValid: (value: unknown) => value is T): void {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    writeCollection(key, parsed.filter(isValid));
  } catch {
    localStorage.removeItem(key);
  }
}
