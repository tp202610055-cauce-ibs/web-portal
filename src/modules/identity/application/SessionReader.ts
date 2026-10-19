import type { Session } from '@/modules/identity/domain/Session';

// Port that tells the interface whether there is a session; infrastructure provides the adapter.
export interface SessionReader {
  current(): Session;
}
