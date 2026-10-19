import { afterEach, describe, expect, it, vi } from 'vitest';

import { WebLocksRefreshLock } from '@/modules/identity/infrastructure/WebLocksRefreshLock';

function deferred() {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('WebLocksRefreshLock', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('runExclusive_withWebLocks_requestsTheSharedLock', async () => {
    const request = vi.fn((_name: string, task: () => Promise<string>) => task());
    Object.defineProperty(navigator, 'locks', { value: { request }, configurable: true });

    const result = await new WebLocksRefreshLock().runExclusive(async () => 'renewed');

    expect(result).toBe('renewed');
    expect(request).toHaveBeenCalledWith('cauce-portal-refresh', expect.any(Function));
  });

  it('runExclusive_withoutWebLocks_runsOneTaskAtATime', async () => {
    const lock = new WebLocksRefreshLock();
    const gate = deferred();
    const order: string[] = [];

    const first = lock.runExclusive(async () => {
      order.push('first:start');
      await gate.promise;
      order.push('first:end');
    });
    const second = lock.runExclusive(async () => {
      order.push('second:start');
    });
    await Promise.resolve();
    gate.resolve();
    await Promise.all([first, second]);

    expect(order).toEqual(['first:start', 'first:end', 'second:start']);
  });

  it('runExclusive_afterAFailure_keepsServingTheQueue', async () => {
    const lock = new WebLocksRefreshLock();

    await expect(
      lock.runExclusive(() => Promise.reject(new Error('refresh failed'))),
    ).rejects.toThrow('refresh failed');

    expect(await lock.runExclusive(async () => 'next')).toBe('next');
  });
});
