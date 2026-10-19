import type { SessionReader } from '@/modules/identity/application/SessionReader';

// What the interface may ask of the session; SessionService implements it.
export interface SessionController extends SessionReader {
  start(): Promise<void>;
  login(email: string, password: string): Promise<void>;
  logout(reason?: 'signed-out' | 'idle'): Promise<void>;
  recordActivity(): void;
  checkIdle(): void;
}
