import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DecisionRefusedError,
  RecommendationAccessDeniedError,
  RecommendationNotFoundError,
} from '@/modules/recommendations/domain/Recommendation';
import { HttpRecommendationsGateway } from '@/modules/recommendations/infrastructure/HttpRecommendationsGateway';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';
import {
  detailBody,
  NOTE_CP045,
  NOTE_CP046,
  PENDING_ID,
  pendingPageBody,
} from '../../../../support/recommendations';

const PENDING = '*/api/v1/recommendations/pending-review';
const DETAIL = `*/api/v1/recommendations/${PENDING_ID}`;
const APPROVE = `${DETAIL}/approve`;
const REJECT = `${DETAIL}/reject`;

async function refusal(promise: Promise<unknown>): Promise<DecisionRefusedError> {
  const error: unknown = await promise.catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(DecisionRefusedError);
  return error as DecisionRefusedError;
}

describe('HttpRecommendationsGateway', () => {
  let renew: ReturnType<typeof vi.fn>;
  let gateway: HttpRecommendationsGateway;

  beforeEach(() => {
    renew = vi.fn().mockResolvedValue(null);
    gateway = new HttpRecommendationsGateway(
      createApiClient({
        baseUrl: window.location.origin,
        tokens: { getAccessToken: async () => 'token-1', renewAfterUnauthorized: renew },
      }),
    );
  });

  it('listPendingReview_sendsThePageAndKeepsTheServerOrder', async () => {
    let query = new URLSearchParams();
    server.use(
      http.get(PENDING, ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json(pendingPageBody());
      }),
    );

    const page = await gateway.listPendingReview(2, 20);

    expect(query.get('page')).toBe('2');
    expect(query.get('pageSize')).toBe('20');
    expect(page.items.map((item) => item.patientFullName)).toEqual([
      'Paciente Prueba B',
      'Paciente Prueba A',
    ]);
  });

  it.each([
    ['server error', () => new HttpResponse(null, { status: 500 })],
    ['network failure', () => HttpResponse.error()],
    ['rate limit', () => new HttpResponse(null, { status: 429 })],
  ])('listPendingReview_with%s_isUnavailable', async (_name, resolver) => {
    server.use(http.get(PENDING, resolver));

    await expect(gateway.listPendingReview(1, 20)).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it('listPendingReview_withPayloadOutsideTheContract_isContractViolation', async () => {
    server.use(http.get(PENDING, () => HttpResponse.json({ items: [{ recommendationId: '' }] })));

    await expect(gateway.listPendingReview(1, 20)).rejects.toBeInstanceOf(ContractViolationError);
  });

  it('getDetail_returnsTheStateTheServerSends', async () => {
    server.use(
      http.get(DETAIL, () =>
        HttpResponse.json(detailBody({ status: 'Expired', allowedActions: [] })),
      ),
    );

    const detail = await gateway.getDetail(PENDING_ID);

    expect(detail.status).toBe('Expired');
    expect(detail.allowedActions).toEqual([]);
  });

  it.each([
    [403, RecommendationAccessDeniedError],
    [404, RecommendationNotFoundError],
    [500, ServiceUnavailableError],
  ])('getDetail_with%s_throwsItsError', async (status, errorType) => {
    server.use(http.get(DETAIL, () => new HttpResponse(null, { status })));

    await expect(gateway.getDetail(PENDING_ID)).rejects.toBeInstanceOf(errorType);
  });

  it('getDetail_withNetworkFailure_isUnavailable', async () => {
    server.use(http.get(DETAIL, () => HttpResponse.error()));

    await expect(gateway.getDetail(PENDING_ID)).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it('approve_sendsTheNoteAndTheIdempotencyKey', async () => {
    let received: { key: string | null; body: unknown } | null = null;
    server.use(
      http.post(APPROVE, async ({ request }) => {
        received = { key: request.headers.get('Idempotency-Key'), body: await request.json() };
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await gateway.approve(PENDING_ID, NOTE_CP045, 'key-approve');

    expect(received).toEqual({ key: 'key-approve', body: { note: NOTE_CP045 } });
  });

  it('reject_sendsTheReasonAndTheIdempotencyKey', async () => {
    let received: { key: string | null; body: unknown } | null = null;
    server.use(
      http.post(REJECT, async ({ request }) => {
        received = { key: request.headers.get('Idempotency-Key'), body: await request.json() };
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await gateway.reject(PENDING_ID, NOTE_CP046, 'key-reject');

    expect(received).toEqual({ key: 'key-reject', body: { reason: NOTE_CP046 } });
  });

  it('approve_after401_repeatsWithTheSameKey', async () => {
    renew.mockResolvedValue('token-2');
    const keys: (string | null)[] = [];
    server.use(
      http.post(APPROVE, ({ request }) => {
        keys.push(request.headers.get('Idempotency-Key'));
        return keys.length === 1
          ? new HttpResponse(null, { status: 401 })
          : new HttpResponse(null, { status: 204 });
      }),
    );

    await gateway.approve(PENDING_ID, NOTE_CP045, 'key-approve');

    expect(keys).toEqual(['key-approve', 'key-approve']);
  });

  it.each([
    ['conflict_state', 'state-conflict'],
    ['recommendation_expired', 'expired'],
    ['idempotency_mismatch', 'idempotency-mismatch'],
    ['something_new', 'state-conflict'],
  ])('approve_with409%s_isRefusedAs%s', async (errorCode, kind) => {
    server.use(http.post(APPROVE, () => HttpResponse.json({ errorCode }, { status: 409 })));

    const error = await refusal(gateway.approve(PENDING_ID, NOTE_CP045, 'key-1'));

    expect(error.failure).toEqual({ kind });
  });

  it.each([
    [403, 'access-denied'],
    [404, 'not-found'],
  ])('reject_with%s_isRefusedAs%s', async (status, kind) => {
    server.use(http.post(REJECT, () => new HttpResponse(null, { status })));

    const error = await refusal(gateway.reject(PENDING_ID, NOTE_CP046, 'key-1'));

    expect(error.failure).toEqual({ kind });
  });

  it('reject_with400_carriesTheServerMessages', async () => {
    server.use(
      http.post(REJECT, () =>
        HttpResponse.json(
          { errorCode: 'validation_error', errors: { reason: ['Falta el motivo de rechazo.'] } },
          { status: 400 },
        ),
      ),
    );

    const error = await refusal(gateway.reject(PENDING_ID, '', 'key-1'));

    expect(error.failure).toEqual({
      kind: 'invalid-note',
      messages: ['Falta el motivo de rechazo.'],
    });
  });

  it('approve_with400WithoutErrors_hasNoMessages', async () => {
    server.use(http.post(APPROVE, () => new HttpResponse(null, { status: 400 })));

    const error = await refusal(gateway.approve(PENDING_ID, '', 'key-1'));

    expect(error.failure).toEqual({ kind: 'invalid-note', messages: [] });
  });

  it.each([
    ['server error', () => new HttpResponse(null, { status: 500 })],
    ['network failure', () => HttpResponse.error()],
  ])('approve_with%s_isUnavailable', async (_name, resolver) => {
    server.use(http.post(APPROVE, resolver));

    await expect(gateway.approve(PENDING_ID, NOTE_CP045, 'key-1')).rejects.toBeInstanceOf(
      ServiceUnavailableError,
    );
  });
});
