import { describe, expect, it } from 'vitest';

import { evaluateIdle, IDLE_LIMIT_MS, IDLE_WARNING_MS } from '@/modules/identity/domain/IdlePolicy';

const MINUTE = 60 * 1000;
const START = Date.UTC(2026, 9, 20, 15, 0, 0);

describe('evaluateIdle', () => {
  it('durations_matchThePortalPolicy', () => {
    expect(IDLE_WARNING_MS).toBe(13 * MINUTE);
    expect(IDLE_LIMIT_MS).toBe(15 * MINUTE);
  });

  it('evaluateIdle_before13Minutes_isActiveUntilTheWarning', () => {
    expect(evaluateIdle(START, START + 12 * MINUTE)).toEqual({
      phase: 'active',
      warningAt: START + 13 * MINUTE,
    });
  });

  it('evaluateIdle_at13Minutes_warnsWithTheLogoutTime', () => {
    expect(evaluateIdle(START, START + 13 * MINUTE)).toEqual({
      phase: 'warning',
      logoutAt: START + 15 * MINUTE,
    });
  });

  it('evaluateIdle_at15Minutes_isExpired', () => {
    expect(evaluateIdle(START, START + 15 * MINUTE)).toEqual({ phase: 'expired' });
  });
});
