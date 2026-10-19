import type { Clock, TimerHandle } from '@/shared/application/Clock';

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }

  setTimeout(callback: () => void, delayMs: number): TimerHandle {
    return globalThis.setTimeout(callback, delayMs);
  }

  clearTimeout(handle: TimerHandle): void {
    globalThis.clearTimeout(handle);
  }
}
