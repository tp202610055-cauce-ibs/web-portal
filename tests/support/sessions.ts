import type { Session, SessionReader } from '@/modules/identity';

// Synthetic sessions only; never real people or accounts.
export const anonymousSession: Session = { status: 'anonymous' };

export const nutritionistSession: Session = {
  status: 'authenticated',
  user: { fullName: 'Nutricionista Prueba', role: 'nutritionist' },
};

export const patientSession: Session = {
  status: 'authenticated',
  user: { fullName: 'Paciente Prueba', role: 'patient' },
};

export function fakeSessionReader(session: Session): SessionReader {
  return { current: () => session };
}
