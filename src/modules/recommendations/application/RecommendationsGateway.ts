import type { ModificationRequest } from '@/modules/recommendations/application/modifyRecommendation';
import type { ManualRequest } from '@/modules/recommendations/domain/manualRecommendation';
import type {
  ArchiveReason,
  PatientRecommendationsPage,
  PendingReviewPage,
  RecommendationDetail,
} from '@/modules/recommendations/domain/Recommendation';

// All methods throw ServiceUnavailableError or ContractViolationError; getDetail adds the 403 and 404
// errors, the decisions and archive throw DecisionRefusedError, and createManual ManualRefusedError.
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
  listForPatient(
    patientId: string,
    page: number,
    pageSize: number,
  ): Promise<PatientRecommendationsPage>;
  archive(recommendationId: string, reason: ArchiveReason): Promise<void>;
  // Resolves with the id of the new recommendation.
  createManual(request: ManualRequest): Promise<string>;
}
