export const IDLE_WARNING_MS = 13 * 60 * 1000;
export const IDLE_LIMIT_MS = 15 * 60 * 1000;

export type IdlePhase =
  | { readonly phase: 'active'; readonly warningAt: number }
  | { readonly phase: 'warning'; readonly logoutAt: number }
  | { readonly phase: 'expired' };

// Measured from timestamps, so a throttled background tab still gets the right answer.
export function evaluateIdle(lastActivityAt: number, now: number): IdlePhase {
  const idleFor = now - lastActivityAt;
  if (idleFor >= IDLE_LIMIT_MS) {
    return { phase: 'expired' };
  }
  if (idleFor >= IDLE_WARNING_MS) {
    return { phase: 'warning', logoutAt: lastActivityAt + IDLE_LIMIT_MS };
  }
  return { phase: 'active', warningAt: lastActivityAt + IDLE_WARNING_MS };
}
