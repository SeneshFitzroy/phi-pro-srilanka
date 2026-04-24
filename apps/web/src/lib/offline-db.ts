// ============================================================================
// PHI-PRO Offline-First Database — IndexedDB via idb
// Implements: Background Sync API + SyncStatus state machine
// ============================================================================

import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { SyncStatus } from '@phi-pro/shared';

// ---------------------------------------------------------------------------
// IndexedDB schema (typed)
// ---------------------------------------------------------------------------

export interface OfflineRecord {
  localId: string;          // UUID, primary key
  collection: string;       // Firestore collection name
  firestoreId?: string;     // populated after successful sync
  payload: Record<string, unknown>;
  syncStatus: SyncStatus;
  createdAt: string;        // ISO 8601
  updatedAt: string;
  retryCount: number;
  lastError?: string;
  deviceId: string;
}

export interface SyncQueueItem {
  id?: number;              // auto-increment IDB key
  localId: string;
  collection: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  queuedAt: string;
  retryCount: number;
}

interface PhiProDB extends DBSchema {
  offlineForms: {
    key: string;            // localId
    value: OfflineRecord;
    indexes: {
      'by-collection': string;
      'by-sync-status': SyncStatus;
      'by-created': string;
    };
  };
  syncQueue: {
    key: number;
    value: SyncQueueItem;
    indexes: {
      'by-local-id': string;
      'by-queued-at': string;
    };
  };
  userPreferences: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = 'phi-pro-offline';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<PhiProDB>> | null = null;

function getDB(): Promise<IDBPDatabase<PhiProDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PhiProDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // offlineForms store
        if (oldVersion < 1) {
          const formStore = db.createObjectStore('offlineForms', { keyPath: 'localId' });
          formStore.createIndex('by-collection', 'collection');
          formStore.createIndex('by-sync-status', 'syncStatus');
          formStore.createIndex('by-created', 'createdAt');

          const queueStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true,
          });
          queueStore.createIndex('by-local-id', 'localId');
          queueStore.createIndex('by-queued-at', 'queuedAt');

          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }
        // future migrations go here with oldVersion < 2 etc.
      },
    });
  }
  return dbPromise;
}

// ---------------------------------------------------------------------------
// Device ID (stable per browser)
// ---------------------------------------------------------------------------

export async function getDeviceId(): Promise<string> {
  const db = await getDB();
  const stored = await db.get('userPreferences', 'deviceId');
  if (stored) return stored.value as string;
  const newId = `device-${crypto.randomUUID()}`;
  await db.put('userPreferences', { key: 'deviceId', value: newId });
  return newId;
}

// ---------------------------------------------------------------------------
// Offline form CRUD
// ---------------------------------------------------------------------------

export async function saveFormOffline(
  collection: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const db = await getDB();
  const deviceId = await getDeviceId();
  const localId = `local-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const record: OfflineRecord = {
    localId,
    collection,
    payload: { ...payload, localId, deviceId },
    syncStatus: SyncStatus.PENDING,
    createdAt: now,
    updatedAt: now,
    retryCount: 0,
    deviceId,
  };

  await db.put('offlineForms', record);

  // Enqueue for background sync
  await db.add('syncQueue', {
    localId,
    collection,
    operation: 'CREATE',
    payload: record.payload,
    queuedAt: now,
    retryCount: 0,
  });

  // Register background sync with Service Worker (if supported)
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('phi-pro-sync');
    } catch {
      // Sync registration failed — will retry on next page load
    }
  }

  return localId;
}

export async function getOfflineForms(collectionName: string): Promise<OfflineRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('offlineForms', 'by-collection', collectionName);
}

export async function getPendingForms(): Promise<OfflineRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('offlineForms', 'by-sync-status', SyncStatus.PENDING);
}

export async function getFailedForms(): Promise<OfflineRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('offlineForms', 'by-sync-status', SyncStatus.FAILED);
}

export async function markFormSynced(localId: string, firestoreId: string): Promise<void> {
  const db = await getDB();
  const record = await db.get('offlineForms', localId);
  if (!record) return;
  await db.put('offlineForms', {
    ...record,
    firestoreId,
    syncStatus: SyncStatus.SYNCED,
    updatedAt: new Date().toISOString(),
  });
}

export async function markFormFailed(localId: string, error: string): Promise<void> {
  const db = await getDB();
  const record = await db.get('offlineForms', localId);
  if (!record) return;
  await db.put('offlineForms', {
    ...record,
    syncStatus: SyncStatus.FAILED,
    lastError: error,
    retryCount: record.retryCount + 1,
    updatedAt: new Date().toISOString(),
  });
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count('syncQueue');
}

export async function clearSyncQueueItem(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function getAllSyncQueueItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll('syncQueue');
}

// ---------------------------------------------------------------------------
// User preferences (language, theme, etc.)
// ---------------------------------------------------------------------------

export async function setPreference(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('userPreferences', { key, value });
}

export async function getPreference<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const record = await db.get('userPreferences', key);
  return record?.value as T | undefined;
}
