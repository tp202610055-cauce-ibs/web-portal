import type { SessionReader } from '@/modules/identity/application/SessionReader';
import type { Session } from '@/modules/identity/domain/Session';

const ANONYMOUS: Session = { status: 'anonymous' };

// Placeholder adapter until the portal session exists: nobody is signed in.
export class AnonymousSessionReader implements SessionReader {
  current(): Session {
    return ANONYMOUS;
  }
}
