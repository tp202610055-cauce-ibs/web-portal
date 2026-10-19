import type { PatientsGateway } from '@/modules/patients';
import type { components } from '@/shared/infrastructure/api/generated/schema';

type AssignedPatientSummary = components['schemas']['AssignedPatientSummary'];

// Synthetic patients only ("Paciente Prueba A" to "F"); never real people.
export function assignedPatientBody(
  overrides: Partial<AssignedPatientSummary> = {},
): AssignedPatientSummary {
  return {
    patientUserId: '00000000-0000-4000-8000-0000000000a1',
    patientFullName: 'Paciente Prueba A',
    assignmentId: '00000000-0000-4000-8000-0000000000b1',
    assignedAt: '2026-10-01T15:00:00Z',
    profileCompleted: true,
    ibsSubtype: 'IbsD',
    latestIbsSssScore: 340,
    lastActivityAt: '2026-10-20T15:15:00Z',
    pendingReviewOver24hCount: 0,
    priorityLevel: 'High',
    ...overrides,
  };
}

function patient(letter: string, index: number, overrides: Partial<AssignedPatientSummary>) {
  return assignedPatientBody({
    patientUserId: `00000000-0000-4000-8000-0000000000${(160 + index).toString(16)}`,
    patientFullName: `Paciente Prueba ${letter}`,
    ...overrides,
  });
}

// CP049 (P1 to P6) in the order the server sends once D1 is in place: high, then medium, then the rest.
export const cp049Panel: AssignedPatientSummary[] = [
  patient('A', 1, { latestIbsSssScore: 340, priorityLevel: 'High' }),
  patient('B', 2, { latestIbsSssScore: 180, pendingReviewOver24hCount: 1, priorityLevel: 'High' }),
  patient('E', 5, {
    latestIbsSssScore: 200,
    lastActivityAt: '2026-10-16T15:00:00Z',
    priorityLevel: 'Medium',
  }),
  patient('C', 3, { latestIbsSssScore: 300, priorityLevel: 'Low' }),
  patient('D', 4, { latestIbsSssScore: 200, priorityLevel: 'Low' }),
  patient('F', 6, { latestIbsSssScore: 150, priorityLevel: 'None' }),
];

// A patient linked before creating a profile: no name, subtype, score or activity yet.
export const patientWithoutData = assignedPatientBody({
  patientUserId: '00000000-0000-4000-8000-0000000000c1',
  patientFullName: null,
  profileCompleted: false,
  // The snapshot does not mark this enum as nullable, but the backend sends null without a profile.
  ibsSubtype: null as unknown as AssignedPatientSummary['ibsSubtype'],
  latestIbsSssScore: null,
  lastActivityAt: null,
  priorityLevel: 'None',
});

// A gateway for screen tests: unanswered requests by default, so a test only fakes what it reads.
export function fakePatientsGateway(overrides: Partial<PatientsGateway> = {}): PatientsGateway {
  return {
    listAssigned: () => Promise.resolve([]),
    getDetail: () => new Promise(() => undefined),
    getEvolution: () => new Promise(() => undefined),
    ...overrides,
  };
}
