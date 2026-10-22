import type { ModificationRequest } from '@/modules/recommendations/application/modifyRecommendation';
import type {
  PendingReviewPage,
  RecommendationDetail,
} from '@/modules/recommendations/domain/Recommendation';

// All methods throw ServiceUnavailableError or ContractViolationError; getDetail adds the 403 and 404
// errors, and the three decisions throw DecisionRefusedError when the server refuses them.
export interface RecommendationsGateway {
  listPendingReview(page: number, pageSize: number): Promise<PendingReviewPage>;
  getDetail(recommendationId: string): Promise<RecommendationDetail>;
  approve(recommendationId: string, note: string, idempotencyKey: string): Promise<void>;
  reject(recommendationId: string, reason: string, idempotencyKey: string): Promise<void>;
  modify(
    recommendationId: string,
    request: ModificationRequest,
    idempotencyKey: string,
  ): Promise<void>;
}
