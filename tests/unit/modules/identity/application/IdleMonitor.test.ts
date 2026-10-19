import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IdleMonitor } from '@/modules/identity/application/IdleMonitor';
import type { IdlePhase } from '@/modules/identity/domain/IdlePolicy';
import { SystemClock } from '@/shared/infrastructure/SystemClock';

const MINUTE = 60 * 1000;

describe('IdleMonitor', () => {
  let phases: IdlePhase['phase'][];
  let monitor: IdleMonitor;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T15:00:00Z'));
    phases = [];
    monitor = new IdleMonitor(new SystemClock(), (phase) => phases.push(phase.phase));
  });

  afterEach(() => {
    monitor.stop();
    vi.useRealTimers();
  });

  it('start_withoutActivity_warnsAt13AndExpiresAt15', () => {
    monitor.start();

    vi.advanceTimersByTime(13 * MINUTE - 1);
    expect(phases).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(phases).toEqual(['warning']);
    vi.advanceTimersByTime(2 * MINUTE);
    expect(phases).toEqual(['warning', 'expired']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('recordActivity_beforeTheWarning_restartsTheCount', () => {
    monitor.start();
    vi.advanceTimersByTime(12 * MINUTE);

    monitor.recordActivity(Date.now());
    vi.advanceTimersByTime(12 * MINUTE);

    expect(phases).toEqual([]);
    vi.advanceTimersByTime(MINUTE);
    expect(phases).toEqual(['warning']);
  });

  it('recordActivity_duringTheWarning_returnsToActive', () => {
    monitor.start();
    vi.advanceTimersByTime(14 * MINUTE);

    monitor.recordActivity(Date.now());

    expect(phases).toEqual(['warning', 'active']);
  });

  it('recordActivity_olderThanTheLastOne_isIgnored', () => {
    monitor.start();
    vi.advanceTimersByTime(5 * MINUTE);

    monitor.recordActivity(Date.now() - 10 * MINUTE);
    vi.advanceTimersByTime(8 * MINUTE);

    expect(phases).toEqual(['warning']);
  });

  it('check_afterTheTabWasAsleep_expiresFromTimestamps', () => {
    monitor.start();
    vi.setSystemTime(Date.now() + 16 * MINUTE);

    monitor.check();

    expect(phases).toEqual(['expired']);
  });

  it('stop_clearsTheTimerAndIgnoresActivity', () => {
    monitor.start();

    monitor.stop();
    monitor.recordActivity(Date.now() + 1);
    monitor.check();

    expect(vi.getTimerCount()).toBe(0);
    expect(phases).toEqual([]);
  });
});
