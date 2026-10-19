import { describe, expect, it } from 'vitest';

import { toAssignedPatients } from '@/modules/patients/infrastructure/assignedPatientMapper';
import { ContractViolationError } from '@/shared/domain/errors';

import { assignedPatientBody, patientWithoutData } from '../../../../support/patients';

describe('toAssignedPatients', () => {
  it('toAssignedPatients_withCompleteRow_mapsDatesAndFields', () => {
    const [row] = toAssignedPatients([assignedPatientBody()]);

    expect(row).toEqual({
      patientUserId: '00000000-0000-4000-8000-0000000000a1',
      fullName: 'Paciente Prueba A',
      assignedAt: new Date('2026-10-01T15:00:00Z'),
      profileCompleted: true,
      ibsSubtype: 'IbsD',
      latestIbsSssScore: 340,
      lastActivityAt: new Date('2026-10-20T15:15:00Z'),
      pendingReviewOver24hCount: 0,
      priorityLevel: 'High',
    });
  });

  it('toAssignedPatients_withNullableFields_keepsThemNull', () => {
    const [row] = toAssignedPatients([patientWithoutData]);

    expect(row).toMatchObject({
      fullName: null,
      ibsSubtype: null,
      latestIbsSssScore: null,
      lastActivityAt: null,
    });
  });

  it('toAssignedPatients_withEmptyList_returnsEmpty', () => {
    expect(toAssignedPatients([])).toEqual([]);
  });

  it.each([
    ['not a list', { items: [] }],
    ['unknown priority', [assignedPatientBody({ priorityLevel: 'Urgent' as never })]],
    ['date without zone', [assignedPatientBody({ assignedAt: '2026-10-01T15:00:00' })]],
    ['negative overdue count', [assignedPatientBody({ pendingReviewOver24hCount: -1 })]],
  ])('toAssignedPatients_with%s_failsExplicitly', (_name, payload) => {
    expect(() => toAssignedPatients(payload)).toThrow(ContractViolationError);
  });
});
