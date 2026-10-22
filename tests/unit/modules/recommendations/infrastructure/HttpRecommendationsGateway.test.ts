import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ModificationRequest } from '@/modules/recommendations/application/modifyRecommendation';
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
  GARLIC_ID,
  NOTE_CP045,
  NOTE_CP046,
  NOTE_CP086,
  ONION_ID,
  PENDING_ID,
  pendingPageBody,
  STEP_CP086,
} from '../../../../support/recommendations';

const PENDING = '*/api/v1/recommendations/pending-review';
const DETAIL = `*/api/v1/recommendations/${PENDING_ID}`;
const APPROVE = `${DETAIL}/approve`;
const REJECT = `${DETAIL}/reject`;
const MODIFY = `${DETAIL}/modify`;

const modification: ModificationRequest = {
  clinicalNote: NOTE_CP086,
  title: null,
  description: null,
  steps: [STEP_CP086],
  items: [
    { foodId: ONION_ID, actionType: 'Reduce', reasoning: null, substituteFoodId: null },
    { foodId: GARLIC_ID, actionType: 'Avoid', reasoning: 'Fructanos.', substituteFoodId: null },
  ],
};

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

  // The note travels as clinicalNote, next to the edited fields; null keeps what the server has.
  it('modify_sendsTheModificationAndTheIdempotencyKey', async () => {
    let received: { key: string | null; body: unknown } | null = null;
    server.use(
      http.post(MODIFY, async ({ request }) => {
        received = { key: request.headers.get('Idempotency-Key'), body: await request.json() };
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await gateway.modify(PENDING_ID, modification, 'key-modify');

    expect(received).toEqual({ key: 'key-modify', body: modification });
  });

  it('modify_with400OnTheNote_isAnInvalidNote', async () => {
    server.use(
      http.post(MODIFY, () =>
        HttpResponse.json(
          {
            errorCode: 'validation_error',
            errors: { clinicalNote: ['Falta la nota clínica.'], title: ['Título largo.'] },
          },
          { status: 400 },
        ),
      ),
    );

    const error = await refusal(gateway.modify(PENDING_ID, modification, 'key-1'));

    expect(error.failure).toEqual({ kind: 'invalid-note', messages: ['Falta la nota clínica.'] });
  });

  it('modify_with400OnOtherFields_isInvalidContent', async () => {
    server.use(
      http.post(MODIFY, () =>
        HttpResponse.json(
          { errorCode: 'validation_error', errors: { 'items[0].foodId': ['Falta el alimento.'] } },
          { status: 400 },
        ),
      ),
    );

    const error = await refusal(gateway.modify(PENDING_ID, modification, 'key-1'));

    expect(error.failure).toEqual({ kind: 'invalid-content', messages: ['Falta el alimento.'] });
  });

  it('modify_withDomainRule_carriesItsDetail', async () => {
    const detail =
      'Alimento sustituto inválido: un ítem de sustitución requiere un alimento sustituto.';
    server.use(
      http.post(MODIFY, () =>
        HttpResponse.json({ errorCode: 'domain_rule_violation', detail }, { status: 400 }),
      ),
    );

    const error = await refusal(gateway.modify(PENDING_ID, modification, 'key-1'));

    expect(error.failure).toEqual({ kind: 'invalid-content', messages: [detail] });
  });

  it('modify_with400WithoutBody_hasNoMessages', async () => {
    server.use(http.post(MODIFY, () => new HttpResponse(null, { status: 400 })));

    const error = await refusal(gateway.modify(PENDING_ID, modification, 'key-1'));

    expect(error.failure).toEqual({ kind: 'invalid-content', messages: [] });
  });

  it('modify_with409Expired_isRefusedAsExpired', async () => {
    server.use(
      http.post(MODIFY, () =>
        HttpResponse.json({ errorCode: 'recommendation_expired' }, { status: 409 }),
      ),
    );

    const error = await refusal(gateway.modify(PENDING_ID, modification, 'key-1'));

    expect(error.failure).toEqual({ kind: 'expired' });
  });

  it('modify_withServerError_isUnavailable', async () => {
    server.use(http.post(MODIFY, () => new HttpResponse(null, { status: 500 })));

    await expect(gateway.modify(PENDING_ID, modification, 'key-1')).rejects.toBeInstanceOf(
      ServiceUnavailableError,
    );
  });
});
