import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

import type { SessionController } from '@/modules/identity/application/SessionController';
import type { Session } from '@/modules/identity/domain/Session';

const SessionControllerContext = createContext<SessionController | null>(null);

interface SessionProviderProps {
  readonly controller: SessionController;
  readonly children: ReactNode;
}

export function SessionProvider({ controller, children }: SessionProviderProps) {
  return (
    <SessionControllerContext.Provider value={controller}>
      {children}
    </SessionControllerContext.Provider>
  );
}

export function useSessionController(): SessionController {
  const controller = useContext(SessionControllerContext);
  if (controller === null) {
    throw new Error('useSession must be used inside SessionProvider.');
  }
  return controller;
}

// Re-renders whenever the session changes, in this tab or because of another one.
export function useSession(): Session {
  const controller = useSessionController();
  return useSyncExternalStore(controller.subscribe, controller.current);
}
