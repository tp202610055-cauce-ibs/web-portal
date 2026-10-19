import { describe, expect, it } from 'vitest';

import {
  getPatientDetail,
  getPatientEvolution,
  isPatientId,
} from '@/modules/patients/application/getPatientRecord';
import type { PatientDetail, PatientEvolution } from '@/modules/patients/domain/PatientRecord';

import { fakePatientsGateway } from '../../../../support/patients';

describe('getPatientRecord', () => {
  it.each([
    ['00000000-0000-4000-8000-0000000000a1', true],
    ['00000000-0000-4000-8000-0000000000A1', true],
    ['paciente-prueba', false],
    ['00000000-0000-4000-8000-0000000000a1x', false],
    [undefined, false],
  ])('isPatientId_%s_is%s', (value, expected) => {
    expect(isPatientId(value)).toBe(expected);
  });

  it('getPatientDetailAndEvolution_askTheGatewayForThatPatient', async () => {
    const detail = { patientUserId: 'p' } as PatientDetail;
    const evolution = { timeline: [] } as unknown as PatientEvolution;
    const gateway = fakePatientsGateway({
      getDetail: async (id) => ({ ...detail, patientUserId: id }),
      getEvolution: async () => evolution,
    });

    expect((await getPatientDetail(gateway, 'abc')).patientUserId).toBe('abc');
    expect(await getPatientEvolution(gateway, 'abc')).toBe(evolution);
  });
});
