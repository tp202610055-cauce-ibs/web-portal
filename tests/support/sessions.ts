import type { Session, SessionReader } from '@/modules/identity';

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

export function fakeSessionReader(session: Session): SessionReader {
  return { current: () => session, subscribe: () => () => undefined };
}
