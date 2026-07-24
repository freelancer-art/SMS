/**
 * Offline Sync Manager
 * Queues updates to IndexedDB (with localStorage fallback) when internet connectivity is offline,
 * and automatically synchronizes queued operations when connection returns.
 */

export interface QueuedOperation {
  id: string;
  actionType: string;
  entity: string;
  payload: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  errorMessage?: string;
}

const DB_NAME = 'SocietyOfflineSyncDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_queue';

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback localStorage key
const LOCAL_STORAGE_KEY = 'society_offline_sync_queue';

function getLocalStorageQueue(): QueuedOperation[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageQueue(queue: QueuedOperation[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline queue to localStorage:', err);
  }
}

/**
 * Queue an operation for background sync when offline or on network failure
 */
export async function queueOfflineOperation(actionType: string, entity: string, payload: any): Promise<QueuedOperation> {
  const op: QueuedOperation = {
    id: `OFFLINE-OP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actionType,
    entity,
    payload,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(op);
    await new Promise((res) => (tx.oncomplete = res));
  } catch {
    // Fallback to localStorage
    const queue = getLocalStorageQueue();
    queue.push(op);
    saveLocalStorageQueue(queue);
  }

  // Dispatch custom window event so UI reacts instantly
  window.dispatchEvent(new CustomEvent('society_offline_queue_updated'));

  return op;
}

/**
 * Get all currently pending offline operations
 */
export async function getPendingOfflineQueue(): Promise<QueuedOperation[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const ops = (request.result || []) as QueuedOperation[];
        resolve(ops.filter(o => o.status === 'pending' || o.status === 'failed'));
      };
      request.onerror = () => {
        resolve(getLocalStorageQueue().filter(o => o.status === 'pending' || o.status === 'failed'));
      };
    });
  } catch {
    return getLocalStorageQueue().filter(o => o.status === 'pending' || o.status === 'failed');
  }
}

/**
 * Clear or mark completed offline queue operations
 */
export async function clearCompletedOfflineOperations(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch {
    saveLocalStorageQueue([]);
  }
  window.dispatchEvent(new CustomEvent('society_offline_queue_updated'));
}

/**
 * Flush and sync all pending queued operations
 */
export async function syncOfflineQueue(
  syncHandler: (op: QueuedOperation) => Promise<boolean>
): Promise<{ syncedCount: number; failedCount: number }> {
  const pending = await getPendingOfflineQueue();
  if (pending.length === 0) return { syncedCount: 0, failedCount: 0 };

  let syncedCount = 0;
  let failedCount = 0;

  for (const op of pending) {
    try {
      const success = await syncHandler(op);
      if (success) {
        syncedCount++;
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  if (syncedCount > 0 && failedCount === 0) {
    await clearCompletedOfflineOperations();
  }

  window.dispatchEvent(new CustomEvent('society_offline_queue_updated'));
  return { syncedCount, failedCount };
}
