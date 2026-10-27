import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { PatientDiary } from '@/modules/clinical-registry';

import {
  buildModification,
  hasChanges,
} from '@/modules/recommendations/application/modifyRecommendation';
import { isRecommendationId } from '@/modules/recommendations/application/reviewRecommendations';
import {
  DecisionRefusedError,
  RecommendationAccessDeniedError,
  RecommendationNotFoundError,
  type RecommendationDetail,
  type RecommendationStatus,
} from '@/modules/recommendations/domain/Recommendation';
import {
  checkDraft,
  draftFrom,
  hasProblems,
  type RecommendationDraft,
} from '@/modules/recommendations/domain/recommendationDraft';
import { ArchivePanel } from '@/modules/recommendations/presentation/ArchivePanel';
import { RecommendationContent } from '@/modules/recommendations/presentation/RecommendationContent';
import { RecommendationEditor } from '@/modules/recommendations/presentation/RecommendationEditor';
import {
  ReviewDecisionPanel,
  type PanelDecision,
  type PanelSubmission,
} from '@/modules/recommendations/presentation/ReviewDecisionPanel';
import {
  reviewOutcomeState,
  type ReviewOutcome,
} from '@/modules/recommendations/presentation/ReviewQueuePage';
import {
  useRecommendation,
  useReviewDecision,
  type DecisionInput,
} from '@/modules/recommendations/presentation/useRecommendationReview';
import { formatLimaDate } from '@/shared/presentation/format/limaTime';
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

const OUTCOME: Record<PanelDecision, ReviewOutcome> = {
  approve: 'approved',
  modify: 'modified',
  reject: 'rejected',
};

function RecommendationReview({ recommendationId }: { readonly recommendationId: string }) {
  const detail = useRecommendation(recommendationId);
  const decision = useReviewDecision(recommendationId);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RecommendationDraft | null>(null);
  const [showDraftProblems, setShowDraftProblems] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const alert = decisionAlert(decision.error);

  function send(input: DecisionInput) {
    decision.mutate(input, {
      onSuccess: () =>
        void navigate('/revisiones', { state: reviewOutcomeState(OUTCOME[input.decision]) }),
    });
  }

  // The draft is kept in memory while the screen stays open, also after cancelling or a failed attempt.
  function changeDecision(next: PanelDecision | null) {
    setEditing(next === 'modify');
    setBlocked(null);
    if (next === 'modify' && detail.data !== undefined) {
      const original = detail.data;
      setDraft((current) => current ?? draftFrom(original));
    }
  }

  function changeDraft(next: RecommendationDraft) {
    setDraft(next);
    setBlocked(null);
  }

  function dismissError() {
    decision.reset();
    setBlocked(null);
  }

  function submit({ decision: chosen, note }: PanelSubmission) {
    if (chosen !== 'modify') {
      send({ decision: chosen, note });
      return;
    }
    if (detail.data === undefined || draft === null) {
      return;
    }
    if (hasProblems(checkDraft(detail.data, draft))) {
      setShowDraftProblems(true);
      setBlocked(es.decision.reviewChanges);
      return;
    }
    const modification = buildModification(detail.data, draft, note);
    if (!hasChanges(modification)) {
      setBlocked(es.decision.noChanges);
      return;
    }
    send({ decision: 'modify', modification });
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
          {editing && draft !== null && detail.data.allowedActions.includes('Modify') ? (
            <RecommendationEditor
              original={detail.data}
              draft={draft}
              showProblems={showDraftProblems}
              onChange={changeDraft}
            />
          ) : (
            <div className="stack">
              <RecommendationContent detail={detail.data} />
              <PatientDiary
                patientId={detail.data.patientId}
                assignedAt={null}
                window={{
                  from: detail.data.supportingData.windowFrom,
                  to: detail.data.supportingData.windowTo,
                }}
                title={es.recommendation.historyTitle}
              />
            </div>
          )}
          <aside aria-labelledby="decision-title" className="card stack">
            <h2 id="decision-title">{es.decision.title}</h2>
            <StateNotice detail={detail.data} alert={alert} />
            <ReviewDecisionPanel
              actions={detail.data.allowedActions}
              submitting={decision.isPending}
              error={decision.error}
              blockedMessage={blocked}
              onSubmit={submit}
              onDismissError={dismissError}
              onDecisionChange={changeDecision}
            />
            {detail.data.allowedActions.includes('Archive') && (
              <ArchivePanel
                recommendationId={detail.data.recommendationId}
                patientId={detail.data.patientId}
              />
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

// Skipped when the alert already says the same, as after an expiry found while confirming. An
// archived one says when and why instead of its status text.
function StateNotice({
  detail,
  alert,
}: {
  readonly detail: RecommendationDetail;
  readonly alert: string | null;
}) {
  const notice =
    !detail.isActive && detail.archivedAt !== null && detail.archiveReason !== null
      ? es.archive.archivedState(
          formatLimaDate(detail.archivedAt),
          es.archiveReason[detail.archiveReason],
        )
      : STATE_NOTICE[detail.status];
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
