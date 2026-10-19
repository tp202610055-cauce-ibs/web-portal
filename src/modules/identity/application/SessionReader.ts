import type { Session } from '@/modules/identity/domain/Session';

// Port that tells the interface whether there is a session, with change notifications.
export interface SessionReader {
  current(): Session;
  subscribe(listener: () => void): () => void;
}
