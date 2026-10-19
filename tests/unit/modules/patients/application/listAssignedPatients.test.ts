import { describe, expect, it } from 'vitest';

import { listAssignedPatients } from '@/modules/patients/application/listAssignedPatients';
import type { AssignedPatient } from '@/modules/patients/domain/AssignedPatient';

import { fakePatientsGateway } from '../../../../support/patients';

describe('listAssignedPatients', () => {
  it('listAssignedPatients_returnsTheGatewayRowsUnchanged', async () => {
    const rows = [{ patientUserId: 'b' }, { patientUserId: 'a' }] as AssignedPatient[];

    expect(
      await listAssignedPatients(fakePatientsGateway({ listAssigned: async () => rows })),
    ).toBe(rows);
  });
});
