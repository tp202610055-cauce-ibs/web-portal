import { Link, useNavigate, useParams } from 'react-router';

import { isRecommendationId } from '@/modules/recommendations/application/reviewRecommendations';
import {
  DecisionRefusedError,
  RecommendationAccessDeniedError,
  RecommendationNotFoundError,
  type RecommendationStatus,
} from '@/modules/recommendations/domain/Recommendation';
import { RecommendationContent } from '@/modules/recommendations/presentation/RecommendationContent';
import { ReviewDecisionPanel } from '@/modules/recommendations/presentation/ReviewDecisionPanel';
import { reviewOutcomeState } from '@/modules/recommendations/presentation/ReviewQueuePage';
import {
  useRecommendation,
  useReviewDecision,
  type DecisionInput,
} from '@/modules/recommendations/presentation/useRecommendationReview';
import { es } from '@/shared/presentation/i18n/es';

// The text follows the status the server sent; the buttons follow only allowedActions.
const STATE_NOTICE: Record<RecommendationStatus, string | null> = {
  Generated: null,
  PendingReview: null,
  Approved: es.recommendation.finalState,
  ModifiedApproved: es.recommendation.finalState,
  ManualApproved: es.recommendation.finalState,
  Delivered: es.recommendation.finalState,
  FeedbackReceived: es.recommendation.finalState,
  Rejected: es.recommendation.rejectedState,
  Expired: es.recommendation.expiredState,
};

// Refusals that change what the screen shows; the decision form reports the rest.
function decisionAlert(error: unknown): string | null {
  if (!(error instanceof DecisionRefusedError)) {
    return null;
  }
  switch (error.failure.kind) {
    case 'state-conflict':
      return es.decision.stateConflict;
    case 'expired':
      return es.decision.expired;
    case 'access-denied':
      return es.decision.accessDenied;
    case 'not-found':
      return es.decision.notFound;
    default:
      return null;
  }
}

// Review screen (/recomendaciones/:recommendationId). Only the UUID travels in the URL.
export function RecommendationReviewPage() {
  const { recommendationId } = useParams();
  if (!isRecommendationId(recommendationId)) {
    return (
      <section className="stack">
        <h1>{es.recommendation.notFound}</h1>
        <p>
          <Link to="/revisiones">{es.recommendation.backToReviews}</Link>
        </p>
      </section>
    );
  }
  return <RecommendationReview recommendationId={recommendationId} />;
}

function RecommendationReview({ recommendationId }: { readonly recommendationId: string }) {
  const detail = useRecommendation(recommendationId);
  const decision = useReviewDecision(recommendationId);
  const navigate = useNavigate();
  const alert = decisionAlert(decision.error);

  function submit(input: DecisionInput) {
    decision.mutate(input, {
      onSuccess: () =>
        void navigate('/revisiones', {
          state: reviewOutcomeState(input.decision === 'approve' ? 'approved' : 'rejected'),
        }),
    });
  }

  return (
    <section aria-labelledby="recommendation-title" className="stack">
      <p>
        <Link to="/revisiones">{es.recommendation.backToReviews}</Link>
      </p>
      <h1 id="recommendation-title">{detail.data?.title ?? es.recommendation.fallbackTitle}</h1>
      {alert !== null && (
        <p role="alert" className="notice notice--error">
          {alert}
        </p>
      )}
      {detail.isPending ? (
        <p role="status">{es.generic.loading}</p>
      ) : detail.isError ? (
        <LoadFailure error={detail.error} onRetry={() => void detail.refetch()} />
      ) : (
        <div className="review-layout">
          <RecommendationContent detail={detail.data} />
          <aside aria-labelledby="decision-title" className="card stack">
            <h2 id="decision-title">{es.decision.title}</h2>
            <StateNotice status={detail.data.status} alert={alert} />
            <ReviewDecisionPanel
              actions={detail.data.allowedActions}
              submitting={decision.isPending}
              error={decision.error}
              onSubmit={submit}
              onDismissError={decision.reset}
            />
          </aside>
        </div>
      )}
    </section>
  );
}

// Skipped when the alert already says the same, as after an expiry found while confirming.
function StateNotice({
  status,
  alert,
}: {
  readonly status: RecommendationStatus;
  readonly alert: string | null;
}) {
  const notice = STATE_NOTICE[status];
  if (notice === null || notice === alert) {
    return null;
  }
  return (
    <p role="status" className="notice notice--info">
      {notice}
    </p>
  );
}

// 403 and 404 are final and never reveal a cause; anything else offers a retry.
function LoadFailure({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  if (error instanceof RecommendationAccessDeniedError) {
    return (
      <p role="alert" className="notice notice--error">
        {es.recommendation.accessDenied}
      </p>
    );
  }
  if (error instanceof RecommendationNotFoundError) {
    return (
      <p role="alert" className="notice notice--error">
        {es.recommendation.notFound}
      </p>
    );
  }
  return (
    <div role="alert" className="notice notice--error stack">
      <p>{es.recommendation.loadError}</p>
      <div>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          {es.recommendation.retry}
        </button>
      </div>
    </div>
  );
}
