import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  PatientAccessDeniedError,
  PatientNotFoundError,
} from '@/modules/patients/domain/PatientRecord';
import { HttpPatientsGateway } from '@/modules/patients/infrastructure/HttpPatientsGateway';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';
import { detailBody, evolutionCp056A, RECORD_PATIENT_ID } from '../../../../support/patientRecord';

const DETAIL = `*/api/v1/nutritionists/me/patients/${RECORD_PATIENT_ID}`;
const EVOLUTION = `${DETAIL}/evolution`;

describe('HttpPatientsGateway patient record', () => {
  let gateway: HttpPatientsGateway;

  beforeEach(() => {
    gateway = new HttpPatientsGateway(
      createApiClient({
        baseUrl: window.location.origin,
        tokens: { getAccessToken: async () => 'token-1', renewAfterUnauthorized: async () => null },
      }),
    );
  });

  it('getDetail_requestsThePatientByIdAndMapsIt', async () => {
    server.use(http.get(DETAIL, () => HttpResponse.json(detailBody())));

    expect((await gateway.getDetail(RECORD_PATIENT_ID)).fullName).toBe('Paciente Prueba A');
  });

  it('getEvolution_requestsTheEvolutionAndMapsIt', async () => {
    server.use(http.get(EVOLUTION, () => HttpResponse.json(evolutionCp056A)));

    expect((await gateway.getEvolution(RECORD_PATIENT_ID)).timeline).toHaveLength(3);
  });

  it.each([
    [
      '403',
      () => HttpResponse.json({ errorCode: 'unauthorized_patient_access' }, { status: 403 }),
      PatientAccessDeniedError,
    ],
    ['404', () => new HttpResponse(null, { status: 404 }), PatientNotFoundError],
    ['500', () => new HttpResponse(null, { status: 500 }), ServiceUnavailableError],
    ['network failure', () => HttpResponse.error(), ServiceUnavailableError],
  ])('getDetail_with%s_throwsItsError', async (_name, resolver, expected) => {
    server.use(http.get(DETAIL, resolver));

    await expect(gateway.getDetail(RECORD_PATIENT_ID)).rejects.toBeInstanceOf(expected);
  });

  it.each([
    [
      '403',
      () => HttpResponse.json({ errorCode: 'unauthorized_patient_access' }, { status: 403 }),
      PatientAccessDeniedError,
    ],
    ['503', () => new HttpResponse(null, { status: 503 }), ServiceUnavailableError],
  ])('getEvolution_with%s_throwsItsError', async (_name, resolver, expected) => {
    server.use(http.get(EVOLUTION, resolver));

    await expect(gateway.getEvolution(RECORD_PATIENT_ID)).rejects.toBeInstanceOf(expected);
  });
});
