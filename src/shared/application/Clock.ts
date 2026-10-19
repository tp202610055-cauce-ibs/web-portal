export type TimerHandle = ReturnType<typeof globalThis.setTimeout>;

// Time source for every timer, so tests can drive it with a fake clock.
export interface Clock {
  now(): number;
  setTimeout(callback: () => void, delayMs: number): TimerHandle;
  clearTimeout(handle: TimerHandle): void;
}
