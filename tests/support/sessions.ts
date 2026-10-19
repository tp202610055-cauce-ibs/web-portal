import { vi } from 'vitest';

import type { Session, SessionController } from '@/modules/identity';

// Synthetic sessions only; never real people or accounts.
export const anonymousSession: Session = { status: 'anonymous', reason: null };

export const nutritionistSession: Session = {
  status: 'authenticated',
  user: {
    userId: '00000000-0000-4000-8000-000000000001',
    fullName: 'Nutricionista Prueba',
    role: 'nutritionist',
  },
  idleWarning: null,
};

export const patientSession: Session = {
  status: 'authenticated',
  user: {
    userId: '00000000-0000-4000-8000-000000000002',
    fullName: 'Paciente Prueba',
    role: 'patient',
  },
  idleWarning: null,
};

export type FakeSessionController = SessionController & {
  readonly start: ReturnType<typeof vi.fn<SessionController['start']>>;
  readonly login: ReturnType<typeof vi.fn<SessionController['login']>>;
  readonly logout: ReturnType<typeof vi.fn<SessionController['logout']>>;
  readonly recordActivity: ReturnType<typeof vi.fn<SessionController['recordActivity']>>;
  readonly checkIdle: ReturnType<typeof vi.fn<SessionController['checkIdle']>>;
  set(session: Session): void;
};

// A controller whose state the test drives; every action is a spy that does nothing by default.
export function fakeSessionController(initial: Session): FakeSessionController {
  let session = initial;
  const listeners = new Set<() => void>();
  return {
    current: () => session,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start: vi.fn<SessionController['start']>().mockResolvedValue(undefined),
    login: vi.fn<SessionController['login']>().mockResolvedValue(undefined),
    logout: vi.fn<SessionController['logout']>().mockResolvedValue(undefined),
    recordActivity: vi.fn<SessionController['recordActivity']>(),
    checkIdle: vi.fn<SessionController['checkIdle']>(),
    set(next) {
      session = next;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}
