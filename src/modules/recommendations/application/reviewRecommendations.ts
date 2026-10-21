import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import type {
  PendingReviewPage,
  RecommendationDetail,
} from '@/modules/recommendations/domain/Recommendation';

export const REVIEW_QUEUE_PAGE_SIZE = 20;

export type ReviewDecision = 'approve' | 'reject';

export interface DecisionRequest {
  readonly decision: ReviewDecision;
  readonly recommendationId: string;
  readonly note: string;
  readonly idempotencyKey: string;
}

// The route carries a UUID; anything else is not a recommendation and never reaches the server.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isRecommendationId(value: string | undefined): value is string {
  return value !== undefined && UUID.test(value);
}

// Pages start at 1, as the server counts them.
export function listPendingReview(
  gateway: RecommendationsGateway,
  page: number,
): Promise<PendingReviewPage> {
  return gateway.listPendingReview(page, REVIEW_QUEUE_PAGE_SIZE);
}

export function getRecommendation(
  gateway: RecommendationsGateway,
  recommendationId: string,
): Promise<RecommendationDetail> {
  return gateway.getDetail(recommendationId);
}

// The note travels trimmed, which is the text the server measures and stores.
export function submitDecision(
  gateway: RecommendationsGateway,
  { decision, recommendationId, note, idempotencyKey }: DecisionRequest,
): Promise<void> {
  const text = note.trim();
  return decision === 'approve'
    ? gateway.approve(recommendationId, text, idempotencyKey)
    : gateway.reject(recommendationId, text, idempotencyKey);
}
