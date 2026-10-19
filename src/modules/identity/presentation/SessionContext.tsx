import { createContext, useContext, type ReactNode } from 'react';

import type { SessionReader } from '@/modules/identity/application/SessionReader';
import type { Session } from '@/modules/identity/domain/Session';

const SessionReaderContext = createContext<SessionReader | null>(null);

interface SessionProviderProps {
  readonly reader: SessionReader;
  readonly children: ReactNode;
}

export function SessionProvider({ reader, children }: SessionProviderProps) {
  return <SessionReaderContext.Provider value={reader}>{children}</SessionReaderContext.Provider>;
}

export function useSession(): Session {
  const reader = useContext(SessionReaderContext);
  if (reader === null) {
    throw new Error('useSession must be used inside SessionProvider.');
  }
  return reader.current();
}
