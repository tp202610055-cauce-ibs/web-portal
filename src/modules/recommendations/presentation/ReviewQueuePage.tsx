import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';

import { confidenceLevel } from '@/modules/recommendations/domain/confidenceLevel';
import type { PendingReviewPage } from '@/modules/recommendations/domain/Recommendation';
import { ConfidenceBadge } from '@/modules/recommendations/presentation/RecommendationBadges';
import { useReviewQueue } from '@/modules/recommendations/presentation/useReviewQueue';
import { formatLimaDate, formatLimaTime } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const SKELETON_ROWS = 3;

export type ReviewOutcome = 'approved' | 'rejected';

// The detail returns here with the outcome in the navigation state; it never carries clinical data.
export function reviewOutcomeState(outcome: ReviewOutcome) {
  return { reviewOutcome: outcome };
}

function outcomeOf(state: unknown): ReviewOutcome | null {
  if (typeof state !== 'object' || state === null || !('reviewOutcome' in state)) {
    return null;
  }
  const { reviewOutcome } = state;
  return reviewOutcome === 'approved' || reviewOutcome === 'rejected' ? reviewOutcome : null;
}

function formatInstant(value: Date): string {
  return `${formatLimaDate(value)} ${formatLimaTime(value)}`;
}

// Review queue (/revisiones): pending recommendations in the order the server sends, oldest first.
export function ReviewQueuePage() {
  const [page, setPage] = useState(1);
  const queue = useReviewQueue(page);
  const { refetch } = queue;
  const { key, state } = useLocation();
  const firstKey = useRef(key);
  const outcome = outcomeOf(state);

  // Choosing the menu entry again, even on this same route, reloads the queue.
  useEffect(() => {
    if (key !== firstKey.current) {
      void refetch();
    }
  }, [key, refetch]);

  return (
    <section aria-labelledby="reviews-title" className="stack">
      <h1 id="reviews-title">{es.reviews.title}</h1>
      {outcome !== null && (
        <p role="status" className="notice notice--success">
          {es.reviews[outcome]}
        </p>
      )}
      {queue.isPending ? (
        <QueueSkeleton />
      ) : queue.isError ? (
        <div role="alert" className="notice notice--error stack">
          <p>{es.reviews.loadError}</p>
          <div>
            <button type="button" className="btn-secondary" onClick={() => void refetch()}>
              {es.reviews.retry}
            </button>
          </div>
        </div>
      ) : queue.data.items.length === 0 && page === 1 ? (
        <div className="card">
          <p className="empty-title">{es.reviews.empty}</p>
        </div>
      ) : (
        <>
          <QueueTable queue={queue.data} />
          <Pager queue={queue.data} onPage={setPage} />
        </>
      )}
    </section>
  );
}

function QueueSkeleton() {
  return (
    <div aria-busy="true" className="stack">
      <p role="status" className="visually-hidden">
        {es.generic.loading}
      </p>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="skeleton-row" />
      ))}
    </div>
  );
}

function QueueTable({ queue }: { readonly queue: PendingReviewPage }) {
  const { columns } = es.reviews;
  return (
    <table className="data-table">
      <caption className="visually-hidden">{es.reviews.tableCaption}</caption>
      <thead>
        <tr>
          <th scope="col">{columns.patient}</th>
          <th scope="col">{columns.generatedAt}</th>
          <th scope="col">{columns.confidence}</th>
          <th scope="col">{columns.items}</th>
          <th scope="col">{columns.expiresAt}</th>
        </tr>
      </thead>
      <tbody>
        {queue.items.map((item) => (
          <tr key={item.recommendationId}>
            <th scope="row">
              <Link to={`/recomendaciones/${item.recommendationId}`}>
                {item.patientFullName ?? es.reviews.nameUnavailable}
              </Link>
            </th>
            <td>{formatInstant(item.generatedAt)}</td>
            <td>
              <ConfidenceBadge
                level={confidenceLevel(item.confidenceScore)}
                score={item.confidenceScore}
              />
            </td>
            <td>{item.itemsCount}</td>
            <td>{item.expiresAt === null ? es.reviews.noExpiry : formatInstant(item.expiresAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface PagerProps {
  readonly queue: PendingReviewPage;
  readonly onPage: (page: number) => void;
}

// Shown only when the queue does not fit in one page.
function Pager({ queue, onPage }: PagerProps) {
  const pages = Math.max(1, Math.ceil(queue.totalCount / queue.pageSize));
  if (pages === 1 && queue.page === 1) {
    return null;
  }
  return (
    <nav aria-label={es.reviews.pagerLabel} className="pager">
      <button
        type="button"
        className="btn-secondary"
        disabled={queue.page <= 1}
        onClick={() => onPage(queue.page - 1)}
      >
        {es.reviews.previous}
      </button>
      <span>{es.reviews.pageStatus(queue.page, pages)}</span>
      <button
        type="button"
        className="btn-secondary"
        disabled={queue.page >= pages}
        onClick={() => onPage(queue.page + 1)}
      >
        {es.reviews.next}
      </button>
    </nav>
  );
}
