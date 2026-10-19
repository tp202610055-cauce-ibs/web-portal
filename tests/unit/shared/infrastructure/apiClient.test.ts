import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TokenProvider } from '@/shared/application/TokenProvider';
import { createApiClient, type ApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../msw/server';

const PATIENTS = '*/api/v1/nutritionists/me/patients';
const MANUAL = '*/api/v1/recommendations/manual';
const PATIENT_ID = '00000000-0000-4000-8000-0000000000a1';

describe('apiClient', () => {
  let tokens: {
    getAccessToken: ReturnType<typeof vi.fn>;
    renewAfterUnauthorized: ReturnType<typeof vi.fn>;
  };
  let client: ApiClient;

  beforeEach(() => {
    tokens = {
      getAccessToken: vi.fn().mockResolvedValue('token-1'),
      renewAfterUnauthorized: vi.fn().mockResolvedValue('token-2'),
    };
    client = createApiClient({ baseUrl: window.location.origin, tokens: tokens as TokenProvider });
  });

  it('request_withSession_sendsTheBearer', async () => {
    let authorization: string | null = null;
    server.use(
      http.get(PATIENTS, ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json([]);
      }),
    );

    await client.GET('/api/v1/nutritionists/me/patients');

    expect(authorization).toBe('Bearer token-1');
  });

  it('request_withoutSession_sendsNoBearer', async () => {
    tokens.getAccessToken.mockResolvedValue(null);
    let authorization: string | null = 'unset';
    server.use(
      http.get(PATIENTS, ({ request }) => {
        authorization = request.headers.get('Authorization');
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const { response } = await client.GET('/api/v1/nutritionists/me/patients');

    expect(authorization).toBeNull();
    expect(response.status).toBe(401);
    expect(tokens.renewAfterUnauthorized).not.toHaveBeenCalled();
  });

  it('request_with401WithoutErrorCode_renewsOnceAndRepeatsWithTheSameBody', async () => {
    const seen: { authorization: string | null; body: unknown }[] = [];
    server.use(
      http.post(MANUAL, async ({ request }) => {
        seen.push({
          authorization: request.headers.get('Authorization'),
          body: await request.json(),
        });
        return seen.length === 1
          ? new HttpResponse(null, { status: 401 })
          : HttpResponse.json(
              { recommendationId: PATIENT_ID, status: 'ManualApproved' },
              { status: 201 },
            );
      }),
    );
    const body = {
      patientId: PATIENT_ID,
      title: 'Plan de prueba',
      description: 'Descripción sintética',
      steps: [],
      clinicalNote: 'Nota clínica sintética',
      validUntil: null,
    };

    const { response } = await client.POST('/api/v1/recommendations/manual', { body });

    expect(response.status).toBe(201);
    expect(tokens.renewAfterUnauthorized).toHaveBeenCalledTimes(1);
    expect(tokens.renewAfterUnauthorized).toHaveBeenCalledWith('token-1');
    expect(seen).toEqual([
      { authorization: 'Bearer token-1', body },
      { authorization: 'Bearer token-2', body },
    ]);
  });

  it('request_repeatedAndStill401_doesNotRetryAgain', async () => {
    let calls = 0;
    server.use(
      http.get(PATIENTS, () => {
        calls += 1;
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const { response } = await client.GET('/api/v1/nutritionists/me/patients');

    expect(response.status).toBe(401);
    expect(calls).toBe(2);
    expect(tokens.renewAfterUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('request_with401WithErrorCode_isNotRetried', async () => {
    server.use(
      http.get(PATIENTS, () =>
        HttpResponse.json({ status: 401, errorCode: 'invalid_refresh_token' }, { status: 401 }),
      ),
    );

    await client.GET('/api/v1/nutritionists/me/patients');

    expect(tokens.renewAfterUnauthorized).not.toHaveBeenCalled();
  });

  it('request_whenTheSessionCannotContinue_returnsTheOriginal401', async () => {
    tokens.renewAfterUnauthorized.mockResolvedValue(null);
    let calls = 0;
    server.use(
      http.get(PATIENTS, () => {
        calls += 1;
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const { response } = await client.GET('/api/v1/nutritionists/me/patients');

    expect(response.status).toBe(401);
    expect(calls).toBe(1);
  });

  it('portalSessionRoutes_getNoBearerAndNoRetry', async () => {
    let authorization: string | null = 'unset';
    server.use(
      http.post('*/api/v1/auth/portal/refresh', ({ request }) => {
        authorization = request.headers.get('Authorization');
        return new HttpResponse(null, { status: 401 });
      }),
    );

    await client.POST('/api/v1/auth/portal/refresh');

    expect(authorization).toBeNull();
    expect(tokens.getAccessToken).not.toHaveBeenCalled();
    expect(tokens.renewAfterUnauthorized).not.toHaveBeenCalled();
  });
});
