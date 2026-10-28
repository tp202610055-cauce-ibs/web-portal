import type {
  RecommendationDetail,
  RecommendationStatus,
} from '@/modules/recommendations/domain/Recommendation';

// Statuses with a final decision. Expired and archived ones are excluded on purpose.
const CLOSED: readonly RecommendationStatus[] = [
  'Approved',
  'ModifiedApproved',
  'ManualApproved',
  'Delivered',
  'FeedbackReceived',
  'Rejected',
];

// Exception to "only what allowedActions lists" (CP048): an edit attempt on a closed one is sent so
// the server refuses it and records the attempt. The client never decides the outcome.
export function canAttemptClosedEdit(
  detail: Pick<RecommendationDetail, 'status' | 'isActive' | 'allowedActions'>,
): boolean {
  return (
    detail.isActive && CLOSED.includes(detail.status) && !detail.allowedActions.includes('Modify')
  );
}
