import type { RefreshLock } from '@/modules/identity/application/RefreshLock';

const LOCK_NAME = 'cauce-portal-refresh';

// Web Locks serialize across tabs; without them, a local queue serializes at least this tab.
export class WebLocksRefreshLock implements RefreshLock {
  private queue: Promise<unknown> = Promise.resolve();

  runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const locks: LockManager | undefined = globalThis.navigator?.locks;
    if (locks !== undefined) {
      // The DOM typings nest the callback's promise; at runtime the request resolves to T.
      return locks.request(LOCK_NAME, task) as unknown as Promise<T>;
    }
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }
}
