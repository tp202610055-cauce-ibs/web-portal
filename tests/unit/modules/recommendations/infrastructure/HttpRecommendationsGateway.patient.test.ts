import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import {
  DecisionRefusedError,
  ManualRefusedError,
} from '@/modules/recommendations/domain/Recommendation';
import { HttpRecommendationsGateway } from '@/modules/recommendations/infrastructure/HttpRecommendationsGateway';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';
import {
  detailBody,
  PENDING_ID,
  patientRecommendationsAfterArchive,
} from '../../../../support/recommendations';

const BASE = 'http://portal.test';
const PATIENT = '00000000-0000-4000-8000-0000000000a1';
const gateway = new HttpRecommendationsGateway(
  createApiClient({
    baseUrl: BASE,
    tokens: { getAccessToken: async () => 'token', renewAfterUnauthorized: async () => null },
  }),
);
const LIST = `${BASE}/api/v1/nutritionists/me/patients/${PATIENT}/recommendations`;
const ARCHIVE = `${BASE}/api/v1/recommendations/${PENDING_ID}/archive`;
const MANUAL = `${BASE}/api/v1/recommendations/manual`;

describe('HttpRecommendationsGateway for a patient', () => {
  it('listForPatient_sendsThePage_andMapsActiveAndArchived', async () => {
    const seen: { query?: URLSearchParams } = {};
    server.use(
      http.get(LIST, ({ request }) => {
        seen.query = new URL(request.url).searchParams;
        return HttpResponse.json(patientRecommendationsAfterArchive);
      }),
    );

    const page = await gateway.listForPatient(PATIENT, 1, 100);

    expect(seen.query?.get('pageSize')).toBe('100');
    expect(page.totalCount).toBe(3);
    expect(page.items[1]).toMatchObject({
      isActive: false,
      archiveReason: 'ObjectiveMet',
      archivedAt: new Date('2026-10-26T15:00:00Z'),
    });
    expect(page.items[0]?.archiveReason).toBeNull();
    expect(page.items[0]?.foods).toEqual([]);
  });

  it('listForPatient_with403_isUnavailableForThisNutritionist', async () => {
    server.use(http.get(LIST, () => new HttpResponse(null, { status: 403 })));

    await expect(gateway.listForPatient(PATIENT, 1, 100)).rejects.toBeInstanceOf(
      ServiceUnavailableError,
    );
  });

  it('getDetail_readsTheArchiveFields', async () => {
    server.use(
      http.get(`${BASE}/api/v1/recommendations/${PENDING_ID}`, () =>
        HttpResponse.json(
          detailBody({
            isActive: false,
            archivedAt: '2026-10-26T15:00:00Z',
            archiveReason: 'PlanChange',
          }),
        ),
      ),
    );

    expect(await gateway.getDetail(PENDING_ID)).toMatchObject({
      isActive: false,
      archiveReason: 'PlanChange',
    });
  });

  it('archive_sendsTheReason', async () => {
    let body: unknown = null;
    server.use(
      http.post(ARCHIVE, async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await gateway.archive(PENDING_ID, 'ObjectiveMet');

    expect(body).toEqual({ reason: 'ObjectiveMet' });
  });

  it.each([
    [409, 'recommendation_not_archivable', 'not-archivable'],
    [403, 'recommendation_access_denied', 'access-denied'],
    [404, 'recommendation_not_found', 'not-found'],
  ] as const)('archive_with%i_isRefusedAs %s', async (status, errorCode, kind) => {
    server.use(http.post(ARCHIVE, () => HttpResponse.json({ errorCode }, { status })));

    const error = await gateway.archive(PENDING_ID, 'PlanChange').catch((e) => e);

    expect(error).toBeInstanceOf(DecisionRefusedError);
    expect((error as DecisionRefusedError).failure.kind).toBe(kind);
  });

  it('createManual_sendsTheRequest_andReturnsTheNewId', async () => {
    let body: unknown = null;
    server.use(
      http.post(MANUAL, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(
          { recommendationId: PENDING_ID, status: 'ManualApproved' },
          { status: 201 },
        );
      }),
    );
    const request = {
      patientId: PATIENT,
      title: 'Hidratación entre comidas',
      description: 'Tomar agua entre comidas y no durante ellas para facilitar la digestión',
      steps: [],
      clinicalNote: 'Mejorar la hidratación y la digestión entre comidas',
    };

    expect(await gateway.createManual(request)).toBe(PENDING_ID);
    expect(body).toEqual({ ...request, validUntil: null });
  });

  it('createManual_with400_keepsTheServerMessagesPerField', async () => {
    server.use(
      http.post(MANUAL, () =>
        HttpResponse.json(
          {
            errorCode: 'validation_error',
            errors: { Title: ['El título es obligatorio.'], clinicalNote: ['Muy corta.'] },
          },
          { status: 400 },
        ),
      ),
    );

    const error = await gateway
      .createManual({
        patientId: PATIENT,
        title: '',
        description: 'd',
        steps: [],
        clinicalNote: 'n',
      })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ManualRefusedError);
    expect((error as ManualRefusedError).failure).toEqual({
      kind: 'invalid',
      fields: { title: ['El título es obligatorio.'], note: ['Muy corta.'] },
      other: [],
    });
  });

  it('createManual_with403_isAccessDenied', async () => {
    server.use(http.post(MANUAL, () => HttpResponse.json({}, { status: 403 })));

    const error = await gateway
      .createManual({
        patientId: PATIENT,
        title: 't',
        description: 'd',
        steps: [],
        clinicalNote: 'n',
      })
      .catch((e) => e);

    expect((error as ManualRefusedError).failure).toEqual({ kind: 'access-denied' });
  });

  it('createManual_onA500_isUnavailable', async () => {
    server.use(http.post(MANUAL, () => new HttpResponse(null, { status: 500 })));

    await expect(
      gateway.createManual({
        patientId: PATIENT,
        title: 't',
        description: 'd',
        steps: [],
        clinicalNote: 'n',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableError);
  });
});
