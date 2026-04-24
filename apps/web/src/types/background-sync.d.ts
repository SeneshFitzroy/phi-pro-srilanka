// Type declarations for Background Sync API (not in standard TypeScript dom lib)

interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
  readonly sync: SyncManager;
}

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
  readonly lastChance: boolean;
}

declare global {
  interface Window {
    SyncManager: typeof SyncManager;
  }
}
