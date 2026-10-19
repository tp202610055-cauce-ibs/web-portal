// Runs one session renewal at a time across tabs: the server rotates the refresh token and rejects reuse.
export interface RefreshLock {
  runExclusive<T>(task: () => Promise<T>): Promise<T>;
}
