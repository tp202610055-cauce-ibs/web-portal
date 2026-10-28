import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { TermRequestRefusedError } from '@/modules/clinical-registry/domain/Glossary';
import { HistoryAccessDeniedError } from '@/modules/clinical-registry/domain/PatientDiary';
import { HttpClinicalRegistryGateway } from '@/modules/clinical-registry/infrastructure/HttpClinicalRegistryGateway';
import { HttpFoodCatalogGateway } from '@/modules/clinical-registry/infrastructure/HttpFoodCatalogGateway';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';
import { CAUSA_ID, cp034History, MEAL_ID, NOTE_MEAL } from '../../../../support/history';

const BASE = 'http://portal.test';
const PATIENT = '00000000-0000-4000-8000-0000000000a1';
const tokens = {
  getAccessToken: async () => 'token',
  renewAfterUnauthorized: async () => null,
};
const api = createApiClient({ baseUrl: BASE, tokens });
const gateway = new HttpClinicalRegistryGateway(api);
const from = new Date('2026-09-26T15:00:00Z');
const to = new Date('2026-10-26T15:00:00Z');
const HISTORY = `${BASE}/api/v1/nutritionists/me/patients/${PATIENT}/history`;

describe('HttpClinicalRegistryGateway', () => {
  it('getPatientHistory_sendsTheRangeWithZone_andMapsEveryEventType', async () => {
    const seen: { query?: URLSearchParams } = {};
    server.use(
      http.get(HISTORY, ({ request }) => {
        seen.query = new URL(request.url).searchParams;
        return HttpResponse.json(cp034History);
      }),
    );

    const events = await gateway.getPatientHistory(PATIENT, from, to);

    expect(seen.query?.get('from')).toBe('2026-09-26T15:00:00.000Z');
    expect(seen.query?.get('to')).toBe('2026-10-26T15:00:00.000Z');
    expect(events.map((event) => event.kind)).toEqual(['note', 'note', 'symptom', 'meal']);
    const meal = events[3];
    expect(meal?.kind === 'meal' && meal.items[0]?.foodId).toBe(CAUSA_ID);
    const note = events[1];
    expect(note?.kind === 'note' && note.note).toMatchObject({
      mealId: MEAL_ID,
      content: NOTE_MEAL,
    });
  });

  it('getPatientHistory_dropsAnUnknownEventType', async () => {
    server.use(
      http.get(HISTORY, () => HttpResponse.json([{ eventType: 'weight', occurredAt: null }])),
    );

    expect(await gateway.getPatientHistory(PATIENT, from, to)).toEqual([]);
  });

  it.each([
    [403, HistoryAccessDeniedError],
    [500, ServiceUnavailableError],
  ])('getPatientHistory_with%i_throws', async (status, error) => {
    server.use(http.get(HISTORY, () => new HttpResponse(null, { status })));

    await expect(gateway.getPatientHistory(PATIENT, from, to)).rejects.toBeInstanceOf(error);
  });

  it('getPatientHistory_onNetworkFailure_isUnavailable', async () => {
    server.use(http.get(HISTORY, () => HttpResponse.error()));

    await expect(gateway.getPatientHistory(PATIENT, from, to)).rejects.toBeInstanceOf(
      ServiceUnavailableError,
    );
  });

  it('getPatientHistory_withAForeignPayload_isAContractViolation', async () => {
    server.use(http.get(HISTORY, () => HttpResponse.json({ items: [] })));

    await expect(gateway.getPatientHistory(PATIENT, from, to)).rejects.toBeInstanceOf(
      ContractViolationError,
    );
  });

  it('getGlossary_mapsTermsAndDraftStatus', async () => {
    server.use(
      http.get(`${BASE}/api/v1/glossary`, () =>
        HttpResponse.json({
          terms: [
            { term: 'FODMAP', definition: 'Azúcares fermentables.', category: 'Nutritional' },
          ],
          contentStatus: 'draft-pending-clinical-review',
        }),
      ),
    );

    const glossary = await gateway.getGlossary();

    expect(glossary.isDraft).toBe(true);
    expect(glossary.terms[0]).toMatchObject({ term: 'FODMAP', category: 'Nutritional' });
  });

  it('getGlossary_withAnError_isUnavailable', async () => {
    server.use(http.get(`${BASE}/api/v1/glossary`, () => new HttpResponse(null, { status: 503 })));

    await expect(gateway.getGlossary()).rejects.toBeInstanceOf(ServiceUnavailableError);
  });
});

describe('HttpFoodCatalogGateway.getFood', () => {
  const foods = new HttpFoodCatalogGateway(api);

  it('readsTheCatalogFoodName', async () => {
    server.use(
      http.get(`${BASE}/api/v1/foods/${CAUSA_ID}`, () =>
        HttpResponse.json({ foodId: CAUSA_ID, name: 'Causa rellena', fodmapLevel: 'Moderate' }),
      ),
    );

    expect(await foods.getFood(CAUSA_ID)).toEqual({
      foodId: CAUSA_ID,
      name: 'Causa rellena',
      fodmapLevel: 'Moderate',
    });
  });

  it('withA404_isUnavailable', async () => {
    server.use(
      http.get(`${BASE}/api/v1/foods/${CAUSA_ID}`, () => new HttpResponse(null, { status: 404 })),
    );

    await expect(foods.getFood(CAUSA_ID)).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  // CP089: 201 is a new request; 200 means the same nutritionist already has it pending.
  it.each([
    [201, 'created'],
    [200, 'already-pending'],
  ] as const)('requestTerm_with%i_is %s', async (status, outcome) => {
    let body: unknown = null;
    server.use(
      http.post(`${BASE}/api/v1/glossary/term-requests`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(
          {
            id: 'r1',
            term: 'disacaridasas',
            status: 'Pending',
            requestedAt: '2026-10-27T15:00:00Z',
          },
          { status },
        );
      }),
    );

    expect(await gateway.requestTerm(' disacaridasas ')).toBe(outcome);
    expect(body).toEqual({ term: 'disacaridasas' });
  });

  it.each([
    [409, 'glossary_term_already_exists', 'already-exists'],
    [400, 'validation_error', 'invalid'],
  ] as const)('requestTerm_with%i_isRefused', async (status, errorCode, reason) => {
    server.use(
      http.post(`${BASE}/api/v1/glossary/term-requests`, () =>
        HttpResponse.json({ errorCode }, { status }),
      ),
    );

    const error = await gateway.requestTerm('x').catch((e) => e);

    expect(error).toBeInstanceOf(TermRequestRefusedError);
    expect((error as TermRequestRefusedError).reason).toBe(reason);
  });

  it('requestTerm_onA500_isUnavailable', async () => {
    server.use(
      http.post(
        `${BASE}/api/v1/glossary/term-requests`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(gateway.requestTerm('x')).rejects.toBeInstanceOf(ServiceUnavailableError);
  });
});
