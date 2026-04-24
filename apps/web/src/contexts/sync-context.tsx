'use client';

// ============================================================================
// SyncContext — manages online/offline state and IndexedDB sync queue
// Exposes: isOnline, syncStatus, pendingCount, triggerSync
// ============================================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { SyncStatus } from '@phi-pro/shared';
import {
  getPendingForms,
  getFailedForms,
  markFormSynced,
  markFormFailed,
  getSyncQueueCount,
} from '@/lib/offline-db';
import { createDocument } from '@/lib/firestore';

interface SyncContextValue {
  isOnline: boolean;
  syncStatus: 'SYNCED' | 'SYNCING' | 'PENDING' | 'FAILED' | 'OFFLINE';
  pendingCount: number;
  failedCount: number;
  triggerSync: () => Promise<void>;
  lastSyncedAt: string | null;
}

const SyncContext = createContext<SyncContextValue>({
  isOnline: true,
  syncStatus: 'SYNCED',
  pendingCount: 0,
  failedCount: 0,
  triggerSync: async () => {},
  lastSyncedAt: null,
});

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [syncStatus, setSyncStatus] = useState<SyncContextValue['syncStatus']>('SYNCED');
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncInProgress = useRef(false);

  const refreshCounts = useCallback(async () => {
    const [pending, failed] = await Promise.all([getPendingForms(), getFailedForms()]);
    setPendingCount(pending.length);
    setFailedCount(failed.length);
    if (pending.length > 0) setSyncStatus(isOnline ? 'PENDING' : 'OFFLINE');
    else if (failed.length > 0) setSyncStatus('FAILED');
    else setSyncStatus(isOnline ? 'SYNCED' : 'OFFLINE');
  }, [isOnline]);

  const triggerSync = useCallback(async () => {
    if (syncInProgress.current || !isOnline) return;
    syncInProgress.current = true;
    setSyncStatus('SYNCING');

    try {
      const pending = await getPendingForms();
      for (const record of pending) {
        try {
          const firestoreId = await createDocument(record.collection, record.payload);
          await markFormSynced(record.localId, firestoreId);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown sync error';
          await markFormFailed(record.localId, msg);
        }
      }
      setLastSyncedAt(new Date().toISOString());
    } finally {
      syncInProgress.current = false;
      await refreshCounts();
    }
  }, [isOnline, refreshCounts]);

  useEffect(() => {
    // Online/offline listeners
    const goOnline = () => {
      setIsOnline(true);
      setSyncStatus('PENDING');
      // Attempt sync when back online
      setTimeout(triggerSync, 500);
    };
    const goOffline = () => {
      setIsOnline(false);
      setSyncStatus('OFFLINE');
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [triggerSync]);

  useEffect(() => {
    // Service Worker sync trigger message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PHI_PRO_SYNC_TRIGGER') {
        triggerSync();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
  }, [triggerSync]);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => { /* SW registration failure is non-fatal */ });
    }

    // Initial count
    refreshCounts();

    // Periodic sync attempt every 30 seconds when online
    const interval = setInterval(() => {
      if (navigator.onLine) triggerSync();
    }, 30_000);

    return () => clearInterval(interval);
  }, [refreshCounts, triggerSync]);

  return (
    <SyncContext.Provider
      value={{ isOnline, syncStatus, pendingCount, failedCount, triggerSync, lastSyncedAt }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}
