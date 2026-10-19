import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SystemClock } from '@/shared/infrastructure/SystemClock';

describe('SystemClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T15:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('now_readsTheSystemTime', () => {
    expect(new SystemClock().now()).toBe(Date.parse('2026-10-20T15:00:00Z'));
  });

  it('setTimeout_firesAfterTheDelay', () => {
    const callback = vi.fn();

    new SystemClock().setTimeout(callback, 1000);
    vi.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('clearTimeout_cancelsThePendingCallback', () => {
    const clock = new SystemClock();
    const callback = vi.fn();

    clock.clearTimeout(clock.setTimeout(callback, 1000));
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
  });
});
