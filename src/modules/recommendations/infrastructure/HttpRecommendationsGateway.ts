import type { ModificationRequest } from '@/modules/recommendations/application/modifyRecommendation';
import { z } from 'zod';

import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import type { ManualRequest } from '@/modules/recommendations/domain/manualRecommendation';
import {
  DecisionRefusedError,
  ManualRefusedError,
  RecommendationAccessDeniedError,
  RecommendationNotFoundError,
  type ArchiveReason,
  type DecisionFailure,
  type ManualFailure,
  type ManualField,
  type PatientRecommendationsPage,
  type PendingReviewPage,
  type RecommendationDetail,
} from '@/modules/recommendations/domain/Recommendation';
import {
  toPatientRecommendationsPage,
  toPendingReviewPage,
  toRecommendationDetail,
} from '@/modules/recommendations/infrastructure/recommendationMapper';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';
import { toApiProblem, type ApiProblem } from '@/shared/infrastructure/problemReader';

interface ApiResult {
  readonly data?: unknown;
  readonly error?: unknown;
  readonly response: Response;
}

// Network failures, 401s that could not be renewed and 5xx are all the same "could not reach" state.
async function send<T extends ApiResult>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch {
    throw new ServiceUnavailableError();
  }
}

const created = z.object({ recommendationId: z.string().min(1) });

const CONFLICTS: Record<string, DecisionFailure> = {
  conflict_state: { kind: 'state-conflict' },
  recommendation_expired: { kind: 'expired' },
  idempotency_mismatch: { kind: 'idempotency-mismatch' },
  recommendation_not_archivable: { kind: 'not-archivable' },
};

const MANUAL_FIELDS: Record<string, ManualField> = {
  title: 'title',
  description: 'description',
  clinicalnote: 'note',
};

// Field errors go next to their field, whatever the casing of the key; the rest goes to the form.
function manualFailure(status: number, body: unknown): ManualFailure | null {
  if (status === 403) {
    return { kind: 'access-denied' };
  }
  if (status !== 400) {
    return null;
  }
  const fields: Partial<Record<ManualField, string[]>> = {};
  const other: string[] = [];
  for (const [key, messages] of Object.entries(toApiProblem(status, body).errors ?? {})) {
    const field = MANUAL_FIELDS[key.toLowerCase()];
    if (field === undefined) {
      other.push(...messages);
    } else {
      fields[field] = [...(fields[field] ?? []), ...messages];
    }
  }
  const detail = problemDetail(body);
  if (Object.keys(fields).length === 0 && other.length === 0 && detail !== null) {
    other.push(detail);
  }
  return { kind: 'invalid', fields, other };
}

type InvalidReader = (problem: ApiProblem, body: unknown) => DecisionFailure;

const invalidNote: InvalidReader = (problem) => ({
  kind: 'invalid-note',
  messages: Object.values(problem.errors ?? {}).flat(),
});

function problemDetail(body: unknown): string | null {
  const detail =
    typeof body === 'object' && body !== null && 'detail' in body ? body.detail : undefined;
  return typeof detail === 'string' && detail.trim() !== '' ? detail : null;
}

// Note errors go to the note field; other field errors, or a domain rule's detail, go to the form.
const invalidModification: InvalidReader = (problem, body) => {
  const { clinicalNote = [], ...rest } = problem.errors ?? {};
  if (clinicalNote.length > 0) {
    return { kind: 'invalid-note', messages: clinicalNote };
  }
  const messages = Object.values(rest).flat();
  const detail = problemDetail(body);
  return {
    kind: 'invalid-content',
    messages: messages.length > 0 || detail === null ? messages : [detail],
  };
};

// A 409 without a known code is read as a state change: the screen reloads and shows the new state.
function decisionFailure(
  status: number,
  body: unknown,
  invalid: InvalidReader,
): DecisionFailure | null {
  const problem = toApiProblem(status, body);
  switch (status) {
    case 400:
      return invalid(problem, body);
    case 403:
      return { kind: 'access-denied' };
    case 404:
      return { kind: 'not-found' };
    case 409:
      return CONFLICTS[problem.errorCode ?? ''] ?? { kind: 'state-conflict' };
    default:
      return null;
  }
}

function decided({ error, response }: ApiResult, invalid: InvalidReader = invalidNote): void {
  if (response.ok) {
    return;
  }
  const failure = decisionFailure(response.status, error, invalid);
  throw failure === null ? new ServiceUnavailableError() : new DecisionRefusedError(failure);
}

export class HttpRecommendationsGateway implements RecommendationsGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async listPendingReview(page: number, pageSize: number): Promise<PendingReviewPage> {
    const { data, response } = await send(() =>
      this.api.GET('/api/v1/recommendations/pending-review', {
        params: { query: { page, pageSize } },
      }),
    );
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
    return toPendingReviewPage(data);
  }

  async getDetail(recommendationId: string): Promise<RecommendationDetail> {
    const { data, response } = await send(() =>
      this.api.GET('/api/v1/recommendations/{id}', {
        params: { path: { id: recommendationId } },
      }),
    );
    if (response.status === 403) {
      throw new RecommendationAccessDeniedError();
    }
    if (response.status === 404) {
      throw new RecommendationNotFoundError();
    }
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
    return toRecommendationDetail(data);
  }

  async approve(recommendationId: string, note: string, idempotencyKey: string): Promise<void> {
    decided(
      await send(() =>
        this.api.POST('/api/v1/recommendations/{id}/approve', {
          params: { path: { id: recommendationId }, header: { 'Idempotency-Key': idempotencyKey } },
          body: { note },
        }),
      ),
    );
  }

  async reject(recommendationId: string, reason: string, idempotencyKey: string): Promise<void> {
    decided(
      await send(() =>
        this.api.POST('/api/v1/recommendations/{id}/reject', {
          params: { path: { id: recommendationId }, header: { 'Idempotency-Key': idempotencyKey } },
          body: { reason },
        }),
      ),
    );
  }

  async modify(
    recommendationId: string,
    request: ModificationRequest,
    idempotencyKey: string,
  ): Promise<void> {
    decided(
      await send(() =>
        this.api.POST('/api/v1/recommendations/{id}/modify', {
          params: { path: { id: recommendationId }, header: { 'Idempotency-Key': idempotencyKey } },
          body: { ...request },
        }),
      ),
      invalidModification,
    );
  }

  // A 403 means the patient is not assigned to this nutritionist; like any failure, it cannot load.
  async listForPatient(
    patientId: string,
    page: number,
    pageSize: number,
  ): Promise<PatientRecommendationsPage> {
    const { data, response } = await send(() =>
      this.api.GET('/api/v1/nutritionists/me/patients/{patientId}/recommendations', {
        params: { path: { patientId }, query: { page, pageSize } },
      }),
    );
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
    return toPatientRecommendationsPage(data);
  }

  async archive(recommendationId: string, reason: ArchiveReason): Promise<void> {
    decided(
      await send(() =>
        this.api.POST('/api/v1/recommendations/{id}/archive', {
          params: { path: { id: recommendationId } },
          body: { reason },
        }),
      ),
    );
  }

  // The portal sets no end date (validUntil): the contract allows null and the CP do not ask for one.
  async createManual(request: ManualRequest): Promise<string> {
    const { data, error, response } = await send(() =>
      this.api.POST('/api/v1/recommendations/manual', { body: { ...request, validUntil: null } }),
    );
    if (response.ok) {
      const parsed = created.safeParse(data);
      if (!parsed.success) {
        throw new ContractViolationError('CreateManualRecommendationResult');
      }
      return parsed.data.recommendationId;
    }
    const failure = manualFailure(response.status, error);
    throw failure === null ? new ServiceUnavailableError() : new ManualRefusedError(failure);
  }
}
