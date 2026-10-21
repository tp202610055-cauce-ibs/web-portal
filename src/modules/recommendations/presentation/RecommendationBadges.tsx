import type { ConfidenceLevel } from '@/modules/recommendations/domain/confidenceLevel';
import type { RecommendationStatus } from '@/modules/recommendations/domain/Recommendation';
import { formatTwoDecimals } from '@/shared/presentation/format/numbers';
import { es } from '@/shared/presentation/i18n/es';

const STATUS_TONE: Record<RecommendationStatus, string> = {
  Generated: 'neutral',
  PendingReview: 'pending',
  Approved: 'approved',
  ModifiedApproved: 'approved',
  ManualApproved: 'approved',
  Rejected: 'rejected',
  Delivered: 'delivered',
  FeedbackReceived: 'delivered',
  Expired: 'neutral',
};

// The status as the server sent it; the colour only reinforces the text.
export function StatusBadge({ status }: { readonly status: RecommendationStatus }) {
  return (
    <span className={`badge badge--status-${STATUS_TONE[status]}`}>
      {es.recommendationStatus[status]}
    </span>
  );
}

interface ConfidenceBadgeProps {
  readonly level: ConfidenceLevel;
  readonly score: number;
}

export function ConfidenceBadge({ level, score }: ConfidenceBadgeProps) {
  return (
    <span className={`badge badge--confidence-${level.toLowerCase()}`}>
      {es.confidenceValue(es.confidence[level], formatTwoDecimals(score))}
    </span>
  );
}
