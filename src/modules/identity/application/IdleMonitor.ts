import { evaluateIdle, type IdlePhase } from '@/modules/identity/domain/IdlePolicy';
import type { Clock, TimerHandle } from '@/shared/application/Clock';

// Owns the inactivity timer: one pending timeout at a time, aimed at the next phase boundary.
export class IdleMonitor {
  private readonly clock: Clock;
  private readonly onPhaseChange: (phase: IdlePhase) => void;
  private lastActivityAt = 0;
  private phase: IdlePhase['phase'] = 'active';
  private timer: TimerHandle | null = null;
  private running = false;

  constructor(clock: Clock, onPhaseChange: (phase: IdlePhase) => void) {
    this.clock = clock;
    this.onPhaseChange = onPhaseChange;
  }

  start(): void {
    this.running = true;
    this.lastActivityAt = this.clock.now();
    this.phase = 'active';
    this.check();
  }

  recordActivity(at: number): void {
    if (!this.running || at <= this.lastActivityAt) {
      return;
    }
    this.lastActivityAt = Math.min(at, this.clock.now());
    this.check();
  }

  // Recomputes from timestamps; also called when the tab becomes visible or the route changes.
  check(): void {
    if (!this.running) {
      return;
    }
    this.clearTimer();
    const now = this.clock.now();
    const next = evaluateIdle(this.lastActivityAt, now);
    const changed = next.phase !== this.phase;
    this.phase = next.phase;
    if (next.phase === 'expired') {
      this.stop();
    } else {
      const boundary = next.phase === 'active' ? next.warningAt : next.logoutAt;
      this.timer = this.clock.setTimeout(() => this.check(), boundary - now);
    }
    if (changed) {
      this.onPhaseChange(next);
    }
  }

  stop(): void {
    this.running = false;
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      this.clock.clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
