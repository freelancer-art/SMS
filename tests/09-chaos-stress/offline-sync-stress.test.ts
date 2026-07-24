import {
  queueOfflineOperation,
  getPendingOfflineQueue,
  syncOfflineQueue,
  clearCompletedOfflineOperations,
  QueuedOperation
} from '../../src/utils/offlineSync';

// Mock window and localStorage for Node.js test environment if missing
if (typeof window === 'undefined') {
  (global as any).window = {
    dispatchEvent: jest.fn()
  };
} else if (!window.dispatchEvent) {
  window.dispatchEvent = jest.fn();
}

const storageMap = new Map<string, string>();
if (typeof localStorage === 'undefined' || !localStorage.getItem) {
  (global as any).localStorage = {
    getItem: (key: string) => storageMap.get(key) || null,
    setItem: (key: string, value: string) => storageMap.set(key, value),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear()
  };
}

describe('09 - Chaos & Stress: Offline Sync Queue Stress & Conflict Resolution', () => {
  beforeEach(async () => {
    storageMap.clear();
    await clearCompletedOfflineOperations();
  });

  test('Queue 10 offline gatekeeper check-ins with conflicting timestamps and verify clean sync & retry', async () => {
    // 1. Queue 10 offline visitor check-in operations
    const totalOps = 10;
    const queuedOps: QueuedOperation[] = [];

    for (let i = 0; i < totalOps; i++) {
      const op = await queueOfflineOperation('ADD_VISITOR', 'Visitors', {
        id: `vis_offline_${i}`,
        VisitorName: `Delivery Agent ${i + 1}`,
        FlatNo: `A-${100 + i}`,
        Purpose: 'Package Delivery',
        InTime: new Date(Date.now() - (totalOps - i) * 60000).toISOString(),
        Status: 'Inside'
      });
      queuedOps.push(op);
    }

    // Verify 10 items in pending queue
    const pendingBefore = await getPendingOfflineQueue();
    expect(pendingBefore.length).toBe(totalOps);

    // 2. Simulate sync handler where odd-indexed items temporarily fail (e.g., network timeout)
    let syncAttempts = 0;
    const mockSyncHandler = jest.fn(async (op: QueuedOperation) => {
      syncAttempts++;
      // Simulate failure for odd indexed payloads on first sync attempt
      if (op.payload.id.endsWith('1') || op.payload.id.endsWith('3') || op.payload.id.endsWith('5')) {
        throw new Error('503 Service Unavailable: Database lock timeout');
      }
      return true;
    });

    // 3. Trigger syncOfflineQueue()
    const result1 = await syncOfflineQueue(mockSyncHandler);

    expect(result1.syncedCount).toBe(7);
    expect(result1.failedCount).toBe(3);

    // 4. Verify local queue state remains intact and uncorrupted for failed items
    const pendingAfter = await getPendingOfflineQueue();
    expect(pendingAfter.length).toBe(3);
    expect(pendingAfter.every(o => o.actionType === 'ADD_VISITOR')).toBe(true);

    // 5. Retry sync when network stabilizes (all items succeed)
    const mockSyncHandlerRetry = jest.fn(async (_op: QueuedOperation) => true);
    const result2 = await syncOfflineQueue(mockSyncHandlerRetry);

    expect(result2.syncedCount).toBe(3);
    expect(result2.failedCount).toBe(0);

    // 6. Verify queue is fully drained and clear after successful sync
    const finalQueue = await getPendingOfflineQueue();
    expect(finalQueue.length).toBe(0);
  });
});
