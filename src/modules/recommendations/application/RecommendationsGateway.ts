import type {
  PendingReviewPage,
  RecommendationDetail,
} from '@/modules/recommendations/domain/Recommendation';

// Every method throws ServiceUnavailableError when it cannot reach the server and ContractViolationError
// when a response does not match the contract. getDetail also throws RecommendationAccessDeniedError
// (403) and RecommendationNotFoundError (404); approve and reject throw DecisionRefusedError.
export interface RecommendationsGateway {
  listPendingReview(page: number, pageSize: number): Promise<PendingReviewPage>;
  getDetail(recommendationId: string): Promise<RecommendationDetail>;
  approve(recommendationId: string, note: string, idempotencyKey: string): Promise<void>;
  reject(recommendationId: string, reason: string, idempotencyKey: string): Promise<void>;
}
